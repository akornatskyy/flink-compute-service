import {NextFunction, Request, Response} from 'express';
import {Authorizer} from './types';

const TOKEN_REGEX = /bearer (\w+)/i;

export function authorization(authorizer: Authorizer) {
  return async function (
    request: Request,
    response: Response,
    next: NextFunction,
  ) {
    const s = request.headers['authorization'];
    if (!s) {
      return response.status(401).json(HTTP401);
    }

    const m = s.match(TOKEN_REGEX);
    if (!m) {
      return response.status(401).json(HTTP401);
    }

    const token = m[1];
    const ok = await authorizer.authorize(token);
    if (!ok) {
      return response.status(404).json(HTTP404);
    }

    return next();
  };
}

const HTTP401 = {
  message: 'The server requires authorization.',
};
const HTTP404 = {
  message: 'The server has not found anything matching the request URI.',
};
