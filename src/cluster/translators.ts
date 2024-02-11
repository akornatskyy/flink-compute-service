import * as ec2 from '@aws-sdk/client-ec2';
import {Cluster, ClusterInstance, ClusterTagName} from './types';

export const ClustersTranslator = {
  fromReservations(reservations: ec2.Reservation[] | undefined): Cluster[] {
    if (!reservations) {
      return [];
    }

    const ids = new Set(
      reservations.flatMap(
        (r) =>
          r.Instances?.flatMap(
            (i) =>
              i.Tags?.filter(
                (t) =>
                  t.Key === ClusterTagName.CLUSTER_ID &&
                  t.Value &&
                  t.Value.length > 0,
              ).map((t) => t.Value!) ?? [],
          ) ?? [],
      ),
    );
    return [...ids].map((id) => ({id}));
  },
};

export const ClusterInstancesTranslator = {
  fromReservations(
    reservations: ec2.Reservation[] | undefined,
  ): ClusterInstance[] {
    return (
      reservations?.flatMap(
        (r) => r.Instances?.map(clusterInstanceFromInstance) ?? [],
      ) ?? []
    );
  },
};

function clusterInstanceFromInstance(i: ec2.Instance): ClusterInstance {
  return {
    id: i.InstanceId ?? '',
    role: i.Tags?.find(
      (t) => t.Key === ClusterTagName.ROLE,
    )?.Value?.toUpperCase(),
    imageId: i.ImageId,
    instanceType: i.InstanceType,
    launchTime: i.LaunchTime,
    privateIpAddress: i.PrivateIpAddress,
    state: i.State?.Name?.toUpperCase(),
    architecture: i.Architecture,
    lifecycle: i.InstanceLifecycle?.toUpperCase(),
  };
}
