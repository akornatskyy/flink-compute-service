import {NextFunction, Request, Response} from 'express';
import {ValidationError} from './shared/validation';

export function errors() {
  return function (
    error: Error & {code?: string; $metadata?: {httpStatusCode: number}},
    request: Request,
    response: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction,
  ) {
    switch (error.code) {
      case 'EINVAL': {
        response.statusCode = 400;
        if (error instanceof ValidationError && error.details) {
          return response.json({
            message: error.message,
            details: error.details,
          });
        }

        return response.json({message: error.message});
      }

      case 'ENOENT': {
        return response.status(404).json({message: error.message});
      }

      case 'ECONNREFUSED':
      case 'ETIMEDOUT': {
        return response.status(504).json(HTTP504);
      }
    }

    console.error(new Date(), error);
    return response
      .status(error.$metadata?.httpStatusCode ?? 500)
      .json({message: error.message});
  };
}

const HTTP504 = {
  message:
    'The server did not receive a timely response ' +
    'from the upstream server.',
};
