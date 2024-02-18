import * as app from './app';
import {getConfig} from './config';
import {Factory} from './factory';
import {createHandler} from './shared/lambda-proxy';

const config = getConfig(process.env);
const factory = new Factory(config);

export const handler = createHandler(app.create(factory), {
  isBase64Encoded: () => false,
});
