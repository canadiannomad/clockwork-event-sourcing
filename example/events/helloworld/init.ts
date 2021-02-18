/*
 * Event: HelloWorld
 * Description: Returns Hello World to an ASync Request
 * Input Payload: PayloadHTTP
 * Output Payload: null
 * Side Effects: None
 * State Changes: Updates Async Request with Output
 * Next: None
 */
import { Event } from '../../../src/lib/types';
import redis from '../../../src/redis';
import s3 from '../../../src/s3';
import {PayloadHTTP, Request} from '../../types';
import ping from '../../states/ping';

/**
  This array contains the type of events we are listening for
*/
const listenFor = ['PayloadHTTP'];

/**
 * This function process a hello world event
 * @param {string}  evt - The event data.
 * @return {Promise<any>} Promise.
 */
const handler = async (evt: Event<PayloadHTTP>): Promise<any> => {
  const input = evt.payload as PayloadHTTP;
  if (input.call != 'helloworld') {
    return;
  }
  const requestId = input.requestId;
  const requestKey = `minevtsrc-async-${requestId}`;
  let request = JSON.parse(await redis.get(requestKey)) || ({} as Request);

  request.output = {
    body: 'Hello World',
    headers: {
      'Content-Type': 'text/html',
    },
    statusCode: 200,
  };
  await redis.set(`${requestKey}`, JSON.stringify(request), 'EX', 20);
  await s3.saveJsonFile(requestKey, request);

  return Promise.resolve();
};

const outputPayloadType = ['PayloadHTTP'];
const stateChange = () => {
  ping.counter += 1;
};

/**
 * This function gets the allowed functions
 * @param {string}  evt - The event data.
 * @return {Record<unknown>} Record.
 */
const allowedFunctions = (): Record<string, unknown> => {
  return {
    helloworld: { listenFor, handler },
  };
};

export { allowedFunctions };
