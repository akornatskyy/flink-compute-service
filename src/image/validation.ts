import {compile} from 'check-compiler';
import {architecture, name, nextToken} from '../shared/rules';
import {makeAssetValid} from '../shared/validation';
import {ListImagesRequest} from './types';

export const assertListImagesRequest = makeAssetValid(
  compile<ListImagesRequest>({
    type: 'object',
    properties: {architecture, name, nextToken},
    additionalProperties: false,
  }),
);
