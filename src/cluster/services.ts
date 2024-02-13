import {
  DescribeInstancesCommand,
  DescribeSpotPriceHistoryCommand,
  EC2Client,
  HttpTokensState,
  RunInstancesCommand,
  RunInstancesCommandInput,
  SpotPrice,
  Tag,
  _InstanceType,
} from '@aws-sdk/client-ec2';
import {ImageService} from '../image/types';
import {NotFoundError} from '../shared/validation';
import {makePrimaryNodeScript, makeSecondaryNodeScript} from './scripts';
import {
  ClusterInstancesTranslator,
  ClustersTranslator,
  Ec2BlockDeviceMappingsTranslator,
} from './translators';
import {
  ClusterRole,
  ClusterService,
  ClusterTagName,
  CreateClusterRequest,
  CreateClusterResponse,
  ListClusterInstancesRequest,
  ListClusterInstancesResponse,
  ListClustersRequest,
  ListClustersResponse,
} from './types';
import * as validation from './validation';

export class DefaultClusterService implements ClusterService {
  constructor(
    private readonly imageService: ImageService,
    private readonly client: EC2Client,
  ) {}

  async listClusters(req: ListClustersRequest): Promise<ListClustersResponse> {
    validation.assertListClustersRequest(req);
    const r = await this.client.send(
      new DescribeInstancesCommand({
        Filters: [
          {
            Name: `tag:${ClusterTagName.NAMESPACE}`,
            Values: [req.namespace],
          },
          {Name: 'instance-state-code', Values: ['0', '16', '64']},
        ],
        NextToken: req.nextToken,
      }),
    );

    return {
      clusters: ClustersTranslator.fromReservations(r.Reservations),
      nextToken: r.NextToken,
    };
  }

  async listClusterInstances(
    req: ListClusterInstancesRequest,
  ): Promise<ListClusterInstancesResponse> {
    validation.assertListClusterInstancesRequest(req);
    const r = await this.client.send(
      new DescribeInstancesCommand({
        Filters: [
          {
            Name: `tag:${ClusterTagName.NAMESPACE}`,
            Values: [req.namespace],
          },
          {Name: 'instance-state-code', Values: ['0', '16', '64']},
          {Name: `tag:${ClusterTagName.CLUSTER_ID}`, Values: [req.id]},
        ],
        NextToken: req.nextToken,
      }),
    );

    return {
      instances: ClusterInstancesTranslator.fromReservations(r.Reservations),
      nextToken: r.NextToken,
    };
  }

  async createCluster(
    req: CreateClusterRequest,
  ): Promise<CreateClusterResponse> {
    validation.assertCreateClusterRequest(req);
    const id = req.id ?? nextId();
    let imageId = req.imageId;
    if (!imageId) {
      imageId = await this.imageService.findRecentImage(req.imageFilter);
      if (!imageId) {
        throw new NotFoundError('Unable to find the most recent image.');
      }
    }

    const tags: Tag[] = [
      {Key: ClusterTagName.NAMESPACE, Value: req.namespace},
      {Key: ClusterTagName.CLUSTER_ID, Value: id},
    ];
    if (req.tags) {
      tags.push(
        ...Object.entries(req.tags).map(([Key, Value]) => ({Key, Value})),
      );
    }

    const jobManager = req.jobManager;
    let runCommandInput: RunInstancesCommandInput = {
      MinCount: 1,
      MaxCount: 1,
      ImageId: imageId,
      InstanceType: jobManager.instanceType as _InstanceType,
      IamInstanceProfile: jobManager.instanceProfile
        ? {
            Arn: jobManager.instanceProfile.arn,
            Name: jobManager.instanceProfile.name,
          }
        : undefined,
      BlockDeviceMappings:
        Ec2BlockDeviceMappingsTranslator.fromBlockDeviceMappings(
          jobManager.blockDeviceMappings,
        ),
      InstanceInitiatedShutdownBehavior: 'terminate',
      TagSpecifications: [
        {
          ResourceType: 'instance',
          Tags: [
            ...tags,
            {Key: ClusterTagName.ROLE, Value: ClusterRole.PRIMARY},
          ],
        },
      ],
      MetadataOptions: {HttpTokens: HttpTokensState.required},
      UserData: Buffer.from(makePrimaryNodeScript(req)).toString('base64'),
    };

    let spotPrice: SpotPrice | undefined = undefined;
    if (jobManager.marketType === 'SPOT') {
      spotPrice = await this.minSpotPrice(jobManager.instanceType);
      runCommandInput.InstanceMarketOptions = {
        MarketType: 'spot',
        SpotOptions: {MaxPrice: spotPrice.SpotPrice},
      };
      runCommandInput.Placement = {
        AvailabilityZone: spotPrice.AvailabilityZone,
      };
    }

    const r = await this.client.send(new RunInstancesCommand(runCommandInput));

    const instance = r.Instances?.[0];
    const privateIpAddress = instance?.PrivateIpAddress;
    const availabilityZone = instance?.Placement?.AvailabilityZone;
    const taskManager = req.taskManager;
    if (privateIpAddress && taskManager && taskManager.count > 0) {
      const count = taskManager.count;
      runCommandInput = {
        MinCount: count,
        MaxCount: count,
        ImageId: imageId,
        InstanceType: taskManager.instanceType as _InstanceType,
        IamInstanceProfile: taskManager.instanceProfile
          ? {
              Arn: taskManager.instanceProfile.arn,
              Name: taskManager.instanceProfile.name,
            }
          : undefined,
        BlockDeviceMappings:
          Ec2BlockDeviceMappingsTranslator.fromBlockDeviceMappings(
            taskManager.blockDeviceMappings,
          ),
        InstanceInitiatedShutdownBehavior: 'terminate',
        Placement: {AvailabilityZone: availabilityZone},
        TagSpecifications: [
          {
            ResourceType: 'instance',
            Tags: [
              ...tags,
              {Key: ClusterTagName.ROLE, Value: ClusterRole.SECONDARY},
            ],
          },
        ],
        MetadataOptions: {HttpTokens: HttpTokensState.required},
        UserData: Buffer.from(
          makeSecondaryNodeScript(req, privateIpAddress),
        ).toString('base64'),
      };
      if (taskManager.marketType === 'SPOT') {
        if (
          !spotPrice ||
          jobManager.instanceType !== taskManager.instanceType
        ) {
          spotPrice = await this.minSpotPrice(
            taskManager.instanceType,
            availabilityZone,
          );
        }

        runCommandInput.InstanceMarketOptions = {
          MarketType: 'spot',
          SpotOptions: {MaxPrice: spotPrice?.SpotPrice},
        };
      }

      await this.client.send(new RunInstancesCommand(runCommandInput));
    }

    return {id};
  }

  private async minSpotPrice(
    instanceType: string,
    availabilityZone?: string,
  ): Promise<SpotPrice> {
    const r = await this.client.send(
      new DescribeSpotPriceHistoryCommand({
        AvailabilityZone: availabilityZone,
        InstanceTypes: [instanceType as _InstanceType],
        ProductDescriptions: ['Linux/UNIX'],
        StartTime: new Date(),
      }),
    );
    const history = r.SpotPriceHistory;
    if (!history || history.length === 0) {
      throw new NotFoundError('No spot price history.');
    }

    let count = 1;
    let selected = history[0];
    for (let i = 1; i < history.length; i++) {
      const c = history[i];
      if (c.SpotPrice! < selected.SpotPrice!) {
        count = 1;
        selected = c;
      } else if (c.SpotPrice === selected.SpotPrice) {
        count++;
        if (Math.trunc(Math.random() * count) === 0) {
          // replace candidate with probability 1 / count
          selected = c;
        }
      }
    }

    return selected;
  }
}

function nextId(): string {
  return Math.random().toString(16).slice(2, 12);
}
