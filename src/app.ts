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

const API_V1_ALPHA1 = '/api/v1alpha1';

export function create(options: Options) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json());
  app.get('/', (request, response) =>
    response.redirect(request.baseUrl + API_V1_ALPHA1 + '/health'),
  );
  app.get(API_V1_ALPHA1 + '/health', (_, response) =>
    response.json({status: 'UP'}),
  );
  app.use(authorization(options.authorizer));
  app.use(API_V1_ALPHA1, createImagesRoutes(options.imageService));
  app.use(API_V1_ALPHA1, createClustersRoutes(options.clusterService));
  app.use(errors());
  return app;
}
