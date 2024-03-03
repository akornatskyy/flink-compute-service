import express from 'express';
import request from 'supertest';
import {createClustersRoutes} from '../routes';
import {
  ClusterService,
  CreateClusterResponse,
  ListClusterInstancesResponse,
  ListClustersResponse,
} from '../types';

describe('image routes', () => {
  const service = {} as ClusterService;

  const app = express();
  app.use(express.json());
  app.use('/', createClustersRoutes(service));

  describe('GET /namespaces/:namespace/clusters', () => {
    const response: ListClustersResponse = {clusters: []};

    it('list clusters', async () => {
      service.listClusters = jest.fn().mockResolvedValue(response);

      await request(app)
        .get('/namespaces/default/clusters')
        .expect(response)
        .expect(200);

      expect(service.listClusters).toHaveBeenCalledWith({
        namespace: 'default',
      });
    });

    it('list clusters with next token', async () => {
      service.listClusters = jest.fn().mockResolvedValue(response);

      await request(app)
        .get('/namespaces/default/clusters?nextToken=abc')
        .expect(response)
        .expect(200);

      expect(service.listClusters).toHaveBeenCalledWith({
        namespace: 'default',
        nextToken: 'abc',
      });
    });
  });

  describe('POST /namespaces/:namespace/clusters', () => {
    const response: CreateClusterResponse = {id: '100'};

    it('create cluster', async () => {
      service.createCluster = jest.fn().mockResolvedValue(response);

      await request(app)
        .post('/namespaces/default/clusters')
        .send({lifetimeSeconds: 900})
        .expect(response)
        .expect(201);

      expect(service.createCluster).toHaveBeenCalledWith({
        namespace: 'default',
        lifetimeSeconds: 900,
      });
    });
  });

  describe('GET /namespaces/:namespace/clusters/:id/instances', () => {
    const response: ListClusterInstancesResponse = {instances: []};

    it('list instances', async () => {
      service.listClusterInstances = jest.fn().mockResolvedValue(response);

      await request(app)
        .get('/namespaces/default/clusters/100/instances')
        .expect(response)
        .expect(200);

      expect(service.listClusterInstances).toHaveBeenCalledWith({
        namespace: 'default',
        id: '100',
      });
    });

    it('list instances with next token', async () => {
      service.listClusterInstances = jest.fn().mockResolvedValue(response);

      await request(app)
        .get('/namespaces/default/clusters/100/instances?nextToken=abc')
        .expect(response)
        .expect(200);

      expect(service.listClusterInstances).toHaveBeenCalledWith({
        namespace: 'default',
        id: '100',
        nextToken: 'abc',
      });
    });
  });
});
