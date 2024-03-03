import express from 'express';
import request from 'supertest';
import {createImagesRoutes} from '../routes';
import {ImageService, ListImagesResponse} from '../types';

describe('image routes', () => {
  const service = {} as ImageService;

  const app = express();
  app.use(express.json());
  app.use('/', createImagesRoutes(service));

  describe('GET /images', () => {
    const response: ListImagesResponse = {images: []};

    it('list images', async () => {
      service.listImages = jest.fn().mockResolvedValue(response);

      await request(app).get('/images').expect(response).expect(200);

      expect(service.listImages).toHaveBeenCalledWith({});
    });

    it('list images with filter', async () => {
      service.listImages = jest.fn().mockResolvedValue(response);

      await request(app)
        .get('/images?name=flink-1.18.*&architecture=arm64')
        .expect(response)
        .expect(200);

      expect(service.listImages).toHaveBeenCalledWith({
        name: 'flink-1.18.*',
        architecture: 'arm64',
      });
    });

    it('list images with next token', async () => {
      service.listImages = jest.fn().mockResolvedValue(response);

      await request(app)
        .get('/images?nextToken=abc')
        .expect(response)
        .expect(200);

      expect(service.listImages).toHaveBeenCalledWith({
        nextToken: 'abc',
      });
    });
  });
});
