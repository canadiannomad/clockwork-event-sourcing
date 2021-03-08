import ClockWork from '../src';
import * as events from './events';
import { Event, EventDirection, ClockWorkOptions } from '../src/lib/types';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { v1 as uuidv1 } from 'uuid';
import { PayloadHTTP, Request, PayloadHTTPMethod } from './types';

const options: ClockWorkOptions = {
  s3Bucket: 'yourbucket',
  events: events,
  redisConfig: {
    host: '127.0.0.1',
    password: '',
    port: 6379,
    prefix: 'cw',
  },
};

const cw = ClockWork(options);

const init = async () => {
  await cw.initializeQueues(events);
  initWebServer();
};

const initWebServer = async () => {
  const port = 5000;
  const server = createServer(async (request: IncomingMessage, response: ServerResponse) => {
    let eventName = request.url.replace('/', '');
    if (eventName != '' && eventName != 'favicon.ico') {
      var responseData = await sendEvent(eventName);
      response.end(responseData);
    } else {
      response.end('ClockWork Running at port 5000');
    }
  });
  server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
};

const sendEvent = async (url, parameters = {}, body = {}): Promise<any> => {
  const payload: PayloadHTTP = {
    payloadType: 'HTTP',
    payloadVersion: '0.0.1',
    requestId: uuidv1(),
    method: PayloadHTTPMethod.Get,
    path: '/',
    call: url,
    parameters,
    body,
  };
  const evt: Event<PayloadHTTP> = {
    direction: EventDirection.Incoming,
    source: 'HTTP',
    sourceVersion: '0.0.1',
    date: new Date().toJSON(),
    hops: 1,
    cost: '0.00',
    rawPayload: {},
    payload,
  };
  await cw.send('PayloadHTTP', evt);
};

init();
