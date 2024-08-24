import type {
  APIGatewayProxyEvent,
  APIGatewayProxyEventHeaders,
  APIGatewayProxyEventV2,
  APIGatewayProxyResult,
  Handler,
} from 'aws-lambda';
import http from 'node:http';
import type {Socket} from 'node:net';
import url from 'node:url';

type ProxyEvent =
  | (APIGatewayProxyEvent & {version?: undefined})
  | APIGatewayProxyEventV2;
type APIGatewayProxyResultHeaders = APIGatewayProxyResult['headers'];

export type CreateHandlerOptions = {
  isBase64Encoded: (headers: http.OutgoingHttpHeaders) => boolean | undefined;
};

export function createHandler(
  app: (request: http.IncomingMessage, response: http.ServerResponse) => void,
  options: CreateHandlerOptions,
): Handler<ProxyEvent, APIGatewayProxyResult> {
  return async (event) => {
    const request =
      event.version === undefined
        ? new MockRequestV1(event)
        : new MockRequestV2(event);
    const response = new MockRespose(request);
    app(request, response);
    if (!response.writableEnded) {
      await waitToSettle(response);
    }

    const headers = response.getHeaders();
    const isBase64Encoded = options.isBase64Encoded(headers);
    return {
      statusCode: response.statusCode,
      headers: fromOutgoingHttpHeaders(headers),
      body: Buffer.concat(response.chunks).toString(
        isBase64Encoded ? 'base64' : 'utf8',
      ),
      isBase64Encoded,
    };
  };
}

class MockRequestV1 extends http.IncomingMessage {
  complete = true;
  httpVersion = '1.1';
  httpVersionMajor = 1;
  httpVersionMinor = 1;

  constructor(event: APIGatewayProxyEvent) {
    super({} as Socket);
    const headers = fromAPIGatewayProxyEventHeaders(event.headers);
    if (event.body) {
      headers['content-length'] = Buffer.byteLength(
        event.body,
        'utf8',
      ).toString();
    }

    Object.assign(this, {
      baseUrl: getBaseUrl(event.path, event.requestContext.path),
      headers,
      ip: event.requestContext.identity.sourceIp,
      method: event.httpMethod,
      url: url.format({
        pathname: event.path,
        query: event.multiValueQueryStringParameters,
      }),
      _read: () => {
        this.push(event.body);
        // eslint-disable-next-line unicorn/no-null
        this.push(null);
      },
    });
  }
}

class MockRequestV2 extends http.IncomingMessage {
  complete = true;
  httpVersion = '1.1';
  httpVersionMajor = 1;
  httpVersionMinor = 1;

  constructor(event: APIGatewayProxyEventV2) {
    super({} as Socket);
    Object.assign(this, {
      headers: event.headers,
      ip: event.requestContext.http.sourceIp,
      method: event.requestContext.http.method,
      url:
        event.rawQueryString.length > 0
          ? event.rawPath + '?' + event.rawQueryString
          : event.rawPath,
      _read: () => {
        this.push(event.body);
        // eslint-disable-next-line unicorn/no-null
        this.push(null);
      },
    });
  }
}

class MockRespose extends http.ServerResponse {
  readonly chunks: Uint8Array[] = [];

  constructor(req: http.IncomingMessage) {
    super(req);
    this.assignSocket({
      _writableState: {},
      cork: Function.prototype,
      destroy: Function.prototype,
      on: Function.prototype,
      removeListener: Function.prototype,
      uncork: Function.prototype,
      writable: true,
      write: (
        data: Uint8Array | string,
        encoding?: BufferEncoding,
        cb?: () => void,
      ) => {
        if (data instanceof Uint8Array) {
          this.chunks.push(data);
        } else {
          const index = data.indexOf('\r\n\r\n');
          if (index !== -1 && index + 4 < data.length) {
            this.chunks.push(Buffer.from(data.slice(index + 4)));
          }
        }

        cb?.();
        return true;
      },
    } as unknown as Socket);
  }
}

function waitToSettle(response: http.ServerResponse): Promise<void> {
  return new Promise((resolve, reject) => {
    let done = false;

    function listener(err?: Error) {
      if (done) {
        return;
      }

      done = true;

      response.off('error', listener);
      response.off('end', listener);
      response.off('finish', listener);

      if (err) {
        reject(err);
        return;
      }

      resolve();
    }

    response.on('error', listener);
    response.on('end', listener);
    response.on('finish', listener);
  });
}

function fromOutgoingHttpHeaders(
  input: http.OutgoingHttpHeaders,
): APIGatewayProxyResultHeaders {
  const r: APIGatewayProxyResultHeaders = {};
  for (const [name, value] of Object.entries(input)) {
    if (value !== undefined) {
      r[name] = Array.isArray(value) ? value.join(',') : value;
    }
  }

  return r;
}

function fromAPIGatewayProxyEventHeaders(
  input: APIGatewayProxyEventHeaders,
): http.IncomingHttpHeaders {
  const r: http.IncomingHttpHeaders = {};
  for (const [name, value] of Object.entries(input)) {
    r[name.toLowerCase()] = value;
  }

  return r;
}

function getBaseUrl(path: string, fullpath: string) {
  return path === '/'
    ? fullpath.endsWith('/')
      ? fullpath.slice(0, -1)
      : fullpath
    : fullpath.slice(0, fullpath.lastIndexOf(path));
}
