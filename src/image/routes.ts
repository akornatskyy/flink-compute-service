import {Router} from 'express';
import {ImageService} from './types';

export function createImagesRoutes(service: ImageService): Router {
  // eslint-disable-next-line new-cap
  const router = Router({strict: true});

  router
    .route('/images')
    .get((request, response, next) =>
      service.listImages(request.query).then((r) => response.json(r), next),
    );

  return router;
}
