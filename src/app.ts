import express from 'express';
import {authorization} from './authorizer/middlewares';
import {Authorizer} from './authorizer/types';
import {createClustersRoutes} from './cluster/routes';
import {ClusterService} from './cluster/types';
import {createImagesRoutes} from './image/routes';
import {ImageService} from './image/types';
import {errors} from './middlewares';

type Options = {
  authorizer: Authorizer;
  imageService: ImageService;
  clusterService: ClusterService;
};

export function create(options: Options) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json());
  app.get('/', (_, response) => response.json({status: 'UP'}));
  app.use(authorization(options.authorizer));
  app.use('/', createImagesRoutes(options.imageService));
  app.use('/', createClustersRoutes(options.clusterService));
  app.use(errors());
  return app;
}
