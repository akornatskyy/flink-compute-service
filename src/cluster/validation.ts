import {Rule, compile} from 'check-compiler';
import {architecture, name, nextToken} from '../shared/rules';
import {makeAssetValid} from '../shared/validation';
import {
  CreateClusterRequest,
  ListClusterInstancesRequest,
  ListClustersRequest,
} from './types';

const namespace: Rule<string> = {type: 'string', min: 1, max: 50};
const instanceType: Rule<string> = {type: 'string', min: 5, max: 20};

const id: Rule<string> = {
  type: 'string',
  min: 1,
  max: 50,
  pattern: /^[\dA-Za-z]([\dA-Za-z-]*[\dA-Za-z])?$/,
};

const marketType: Rule<string> = {
  type: 'string',
  min: 4,
  max: 4,
  pattern: /^SPOT$/,
};

export const assertListClustersRequest = makeAssetValid(
  compile<ListClustersRequest>({
    type: 'object',
    properties: {namespace, nextToken},
    required: ['namespace'],
    additionalProperties: false,
  }),
);

export const assertListClusterInstancesRequest = makeAssetValid(
  compile<ListClusterInstancesRequest>({
    type: 'object',
    properties: {namespace, id, nextToken},
    required: ['namespace', 'id'],
    additionalProperties: false,
  }),
);

export const assertCreateClusterRequest = makeAssetValid(
  compile<CreateClusterRequest>({
    type: 'object',
    properties: {
      namespace,
      id,
      imageFilter: {
        type: 'object',
        properties: {architecture, name},
        additionalProperties: false,
      },
      imageId: {type: 'string', min: 21, max: 21, pattern: /^ami-[\da-f]+$/},
      entrypoint: {type: 'string', min: 1, max: 200},
      sourceUrl: {type: 'string', min: 1, max: 2000},
      lifetimeSeconds: {type: 'integer', min: 15},
      jobManager: {
        type: 'object',
        properties: {
          instanceType,
          marketType,
          startTaskManager: {type: 'boolean'},
          config: {type: 'object', maxProperties: 50},
        },
        required: ['instanceType'],
        additionalProperties: false,
      },
      taskManager: {
        type: 'object',
        properties: {
          instanceType,
          marketType,
          count: {type: 'integer', min: 0, max: 100},
          config: {type: 'object', maxProperties: 50},
        },
        required: ['instanceType'],
        additionalProperties: false,
      },
      tags: {
        type: 'object',
        maxProperties: 20,
      },
    },
    required: [
      'namespace',
      'entrypoint',
      'sourceUrl',
      'lifetimeSeconds',
      'jobManager',
    ],
    additionalProperties: false,
  }),
);
