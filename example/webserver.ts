import { v1 as uuidv1 } from 'uuid';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { Event, EventDirection, PayloadHTTPMethod } from '../src/lib/types';
import {redis, logger} from '../src/';

const sleep = require('util').promisify(setTimeout);
const log = logger('CW Web Server');
let clockWork;

const init = async (cw) => {
  clockWork = cw;
  const port = 5000;
  log.info(`Starting web server on port ${port}`);
  const server = createServer(async (request: IncomingMessage, response: ServerResponse) => {
    let eventName = request.url.replace('/', '');
    if (eventName != '' && eventName != 'favicon.ico') {
      log.info(`Request /${eventName}`);
      var responseData = await sendEvent(eventName);
      var httpResponse = await getEventResponse(`${responseData.payload.call}-${responseData.payload.requestId}`);
      if (!httpResponse) {
        log.info(`Request id ${responseData.payload.call}-${responseData.payload.requestId} Not found`);
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

const getEventResponse = async (key, retry = 0) => {
  var response = await redis.get(key);
  if (!response && retry < 3) {
    await sleep(800);
    return await getEventResponse(key, retry + 1);
  } else {
    return response;
  }
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
  return await clockWork.send(payload.call, evt);
};

export default { init };
