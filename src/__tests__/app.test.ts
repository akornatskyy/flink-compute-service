import request from 'supertest';
import {create} from '../app';
import {Authorizer} from '../authorizer/types';
import {ClusterService} from '../cluster/types';
import {ImageService} from '../image/types';

describe('image routes', () => {
  const authorizer = {} as Authorizer;
  const imageService = {} as ImageService;
  const clusterService = {} as ClusterService;

  const app = create({authorizer, imageService, clusterService});

  describe('GET /', () => {
    it('redirects to health', async () => {
      await request(app)
        .get('/')
        .expect(302)
        .expect('location', '/api/v1alpha1/health');
    });
  });

  describe('GET /health', () => {
    it('get health', async () => {
      await request(app)
        .get('/api/v1alpha1/health')
        .expect({status: 'UP'})
        .expect(200);
    });
  });

  describe('GET /unknown', () => {
    it('unauthorized', async () => {
      await request(app)
        .get('/unknown')
        .expect({message: 'The server requires authorization.'})
        .expect(401);
    });

    it('not found', async () => {
      authorizer.authorize = jest.fn().mockResolvedValue(true);

      await request(app)
        .get('/unknown')
        .auth('123', {type: 'bearer'})
        .expect(404);

      expect(authorizer.authorize).toHaveBeenCalledWith('123');
    });
  });
});
