import {EC2Client} from '@aws-sdk/client-ec2';
import {DefaultImageService} from './services';
import {ImageService} from './types';

const service: ImageService = new DefaultImageService(new EC2Client(), {
  owner: 'self',
});

export async function listImages() {
  const r = await service.listImages({name: 'flink-1.17*-debian-*-arm64-*'});
  console.dir(r);
}

async function main() {
  await listImages();
}

// eslint-disable-next-line unicorn/prefer-top-level-await
main().catch(console.error);
