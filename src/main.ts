import http from 'node:http';
import * as app from './app';
import {getConfig} from './config';
import {Factory} from './factory';

export async function main() {
  const config = getConfig(process.env);
  const factory = new Factory(config);
  const httpServer = http.createServer(app.create(factory));
  httpServer.listen(4000, () => console.log('http listening on port 4000'));
}
