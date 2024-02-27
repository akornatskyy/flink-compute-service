import * as ec2 from '@aws-sdk/client-ec2';
import {Image} from './types';

export const ImagesTranslator = {
  fromImages(images: ec2.Image[] | undefined): Image[] {
    return images?.map(imageFromImage) ?? [];
  },
};

function imageFromImage(i: ec2.Image): Image {
  return {
    id: i.ImageId!,
    name: i.Name ?? '',
    createTime: i.CreationDate ? new Date(i.CreationDate) : undefined,
    deprecateTime: i.DeprecationTime ? new Date(i.DeprecationTime) : undefined,
    architecture: i.Architecture,
  };
}
