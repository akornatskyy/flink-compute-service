import {Router} from 'express';
import {ClusterService} from './types';

export function createClustersRoutes(service: ClusterService): Router {
  // eslint-disable-next-line new-cap
  const router = Router({strict: true});

  router
    .route('/namespaces/:namespace/clusters')
    .get((request, response, next) =>
      service.listClusters(request.params).then((r) => response.json(r), next),
    )
    .post((request, response, next) =>
      service
        .createCluster({...request.params, ...request.body})
        .then((r) => response.status(201).json(r), next),
    );

  router
    .route('/namespaces/:namespace/clusters/:id/instances')
    .get((request, response, next) =>
      service
        .listClusterInstances(request.params)
        .then((r) => response.json(r), next),
    );

  return router;
}
