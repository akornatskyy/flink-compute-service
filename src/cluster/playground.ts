import {EC2Client} from '@aws-sdk/client-ec2';
import {DefaultImageService} from '../image/services';
import {DefaultClusterService} from './services';
import {ClusterService} from './types';

const client = new EC2Client();
const service: ClusterService = new DefaultClusterService(
  new DefaultImageService(client, {owner: 'self'}),
  client,
);

export async function listClusters() {
  const r = await service.listClusters({namespace: 'default'});
  console.dir(r);
}

export async function listClusterInstances() {
  const r = await service.listClusterInstances({
    namespace: 'default',
    id: '85d455dbe2',
  });
  console.dir(r);
}

export async function createCluster() {
  const r = await service.createCluster({
    namespace: 'default',
    imageFilter: {
      architecture: 'arm64',
      // architecture: 'x86_64',
      name: 'flink-1.17*-debian-*',
    },
    entrypoint: 'org.apache.flink.streaming.examples.wordcount.WordCount',
    // 'org.apache.flink.streaming.examples.windowing.TopSpeedWindowing',
    sourceUrl: '...',
    lifetimeSeconds: 90,
    tags: {team: 'eagle'},
    jobManager: {
      instanceType: 't4g.micro',
      marketType: 'SPOT',
      // startTaskManager: true,
      config: {
        'parallelism.default': 2,
        // 'taskmanager.numberOfTaskSlots': 2,
      },
    },
    taskManager: {
      instanceType: 't4g.small',
      marketType: 'SPOT',
      count: 1,
      config: {
        'taskmanager.numberOfTaskSlots': 2,
      },
    },
  });
  console.dir(r);
}

async function main() {
  // await listClusters();
  // await listClusterInstances();
  await createCluster();
}

// eslint-disable-next-line unicorn/prefer-top-level-await
main().catch(console.error);
