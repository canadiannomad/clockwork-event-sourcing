/*
 * Event: HelloWorld
 * Description: Returns Hello World to an ASync Request
 * Input Payload: PayloadHTTP
 * Output Payload: null
 * Side Effects: None
 * State Changes: Updates Async Request with Output
 * Next: None
 */
import { Event, PayloadHTTP, Request } from '../../lib/types';
import redis from '../../lib/redis';
import 'source-map-support/register';

let exportThis = {};

const listenFor = ['PayloadHTTP'];

const handler = async (evt: Event<PayloadHTTP>): Promise<null> => {
  const input = evt.payload as PayloadHTTP;
  if (input.call != 'helloworld') {
    return;
  }
  const requestId = input.requestId;
  const request = JSON.parse(await redis.get(`minevtsrc-async-${requestId}`)) as Request;
  request.output = {
    body: 'Hello World',
    headers: {
      'Content-Type': 'text/html',
    },
    statusCode: 200,
  };
  await redis.set(`minevtsrc-async-${requestId}`, JSON.stringify(request), 'EX', 20);

  return null;
};

const allowedFunctions = (): Record<string, unknown> => {
  return {
    helloworld: exportThis,
  };
};

exportThis = { listenFor, allowedFunctions, handler };

export { listenFor, allowedFunctions, handler };
