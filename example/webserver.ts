import { v1 as uuidv1 } from 'uuid';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { promisify } from 'util';
import { EventDirection, PayloadHTTPMethod } from '../src/lib/types';
import { redis, types } from '../src';

const sleep = promisify(setTimeout);

let clockWork: types.ClockWorkObject;

const getEventResponse = async (key: string, retry = 0) => {
  const response = await redis.get(key);
  if (!response && retry < 3) {
    await sleep(800);
    return getEventResponse(key, retry + 1);
  }
  return response;
};

const sendEvent = async (url, parameters = {}, body = {}): Promise<any> => {
  const payload = {
    payloadType: 'HTTP',
    payloadVersion: '0.0.1',
    requestId: uuidv1(),
    method: PayloadHTTPMethod.Get,
    path: '/',
    call: url,
    parameters,
    body,
  };
  const evt = {
    direction: EventDirection.Incoming,
    source: 'HTTP',
    sourceVersion: '0.0.1',
    date: new Date().toJSON(),
    hops: 1,
    cost: '0.00',
    rawPayload: {},
    payload,
  };
  return clockWork.send(payload.call, evt);
};

const init = async (cw: types.ClockWorkObject): Promise<void> => {
  clockWork = cw;
  const port = 5000;
  console.log('CW Web Server', `Starting web server on port ${port}`);
  const server = createServer(async (request: IncomingMessage, response: ServerResponse) => {
    const eventName = request.url.replace('/', '');
    if (eventName !== '' && eventName !== 'favicon.ico') {
      console.log('CW Web Server', `Request /${eventName}`);
      const responseData = await sendEvent(eventName);
      const httpResponse = await getEventResponse(`${responseData.payload.call}-${responseData.payload.requestId}`);
      if (!httpResponse) {
        console.log(
          'CW Web Server',
          `Request id ${responseData.payload.call}-${responseData.payload.requestId} Not found`,
        );
        response.end(`${responseData.payload.call}-${responseData.payload.requestId} Not found`);
      } else {
        response.end(httpResponse);
      }
    } else {
      response.end('ClockWork Running at port 5000');
    }
  });
  server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
};

export default { init };
