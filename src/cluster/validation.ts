import {Rule, compile} from 'check-compiler';
import {architecture, name, nextToken} from '../shared/rules';
import {makeAssetValid} from '../shared/validation';
import {
  BlockDeviceMapping,
  CreateClusterRequest,
  InstanceProfileSpecification,
  ListClusterInstancesRequest,
  ListClustersRequest,
} from './types';

const instanceType: Rule<string> = {type: 'string', min: 5, max: 20};

const namespace: Rule<string> = {
  type: 'string',
  min: 1,
  max: 50,
  pattern: /^[a-z]([\da-z-]*[a-z])?$/,
  messages: {
    'string pattern':
      "Required to contain only lowercase alphanumeric characters or '-'.",
  },
};

const id: Rule<string> = {
  type: 'string',
  min: 1,
  max: 50,
  pattern: /^[\dA-Za-z]([\dA-Za-z-]*[\dA-Za-z])?$/,
  messages: {
    'string pattern':
      "Required to contain only alphanumeric characters or '-'.",
  },
};

const marketType: Rule<string> = {
  type: 'string',
  min: 4,
  max: 4,
  pattern: /^SPOT$/,
  messages: {
    'string pattern': 'Required to be SPOT only.',
  },
};

const instanceProfile: Rule<InstanceProfileSpecification> = {
  type: 'object',
  properties: {
    arn: {
      type: 'string',
      min: 30,
      max: 255,
      pattern: /^arn:aws:iam:.*?:\d{12}:.+$/,
      messages: {
        'string pattern': 'Required to be IAM ARN.',
      },
    },
    name: {type: 'string', min: 1, max: 255},
  },
};

const blockDeviceMapping: Rule<BlockDeviceMapping> = {
  type: 'object',
  properties: {
    deviceName: {type: 'string', min: 8, max: 250},
    ebs: {
      type: 'object',
      properties: {
        deleteOnTermination: {type: 'boolean'},
        iops: {type: 'integer', min: 100, max: 256_000},
        throughput: {type: 'integer', min: 125, max: 1000},
        volumeSize: {type: 'integer', min: 1, max: 16_384},
        volumeType: {type: 'string'},
      },
      additionalProperties: false,
    },
  },
  additionalProperties: false,
};

const blockDeviceMappings: Rule<BlockDeviceMapping[]> = {
  type: 'array',
  items: blockDeviceMapping,
  min: 1,
  max: 4,
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
          instanceProfile,
          marketType,
          blockDeviceMappings,
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
          instanceProfile,
          marketType,
          blockDeviceMappings,
          count: {type: 'integer', min: 0, max: 100},
          config: {type: 'object', maxProperties: 50},
        },
        required: ['instanceType', 'count'],
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
