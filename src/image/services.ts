import {DescribeImagesCommand, EC2Client, Filter} from '@aws-sdk/client-ec2';
import {ImagesTranslator} from './translators';
import {
  ImageFilter,
  ImageService,
  ListImagesRequest,
  ListImagesResponse,
} from './types';
import * as validation from './validation';

export type DefaultImagesServiceOptions = {
  owner: string;
};

export class DefaultImageService implements ImageService {
  constructor(
    private readonly client: EC2Client,
    private readonly options: DefaultImagesServiceOptions,
  ) {}

  async listImages(req: ListImagesRequest): Promise<ListImagesResponse> {
    validation.assertListImagesRequest(req);
    const filters: Filter[] = [{Name: 'state', Values: ['available']}];

    if (req.architecture) {
      filters.push({Name: 'architecture', Values: [req.architecture]});
    }

    if (req.name) {
      filters.push({Name: 'name', Values: [req.name]});
    }

    const r = await this.client.send(
      new DescribeImagesCommand({
        Filters: filters,
        Owners: [this.options.owner],
        NextToken: req.nextToken,
      }),
    );

    return {
      images: ImagesTranslator.fromImages(r.Images),
      nextToken: r.NextToken,
    };
  }

  async findRecentImage(filter?: ImageFilter): Promise<string | undefined> {
    let id: string | undefined;
    let createTime = 0;
    let nextToken: string | undefined = undefined;
    for (;;) {
      const r = await this.listImages({
        architecture: filter?.architecture,
        name: filter?.name,
        nextToken,
      });
      for (const image of r.images) {
        const t = image.createTime?.getTime() ?? 0;
        if (t > createTime) {
          createTime = t;
          id = image.id;
        }
      }

      if (!r.nextToken) {
        break;
      }

      nextToken = r.nextToken;
    }

    return id;
  }
}
