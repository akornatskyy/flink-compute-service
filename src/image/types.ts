export type Image = {
  id: string;
  name: string;
  createTime?: Date;
  architecture?: string;
};

export type ImageFilter = {
  name?: string;
  architecture?: string;
};

export type ListImagesRequest = ImageFilter & {
  nextToken?: string;
};

export type ListImagesResponse = {
  images: Image[];
  nextToken?: string;
};

export interface ImageService {
  listImages(req: ListImagesRequest): Promise<ListImagesResponse>;
  findRecentImage(filter?: ImageFilter): Promise<string | undefined>;
}
