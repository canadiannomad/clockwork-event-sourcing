/*
 * Event: HelloWorld
 * Description: Returns Hello World to an ASync Request
 * Input Payload: PayloadHTTP
 * Output Payload: null
 * Side Effects: None
 * State Changes: Updates Async Request with Output
 * Next: None
 */
import { eventqueue, redis, types } from '../../../src';
import { PayloadHTTP, Request } from '../../types';

const stateKey = `hello-world-state`;

/**
  This array contains the type of events we are listening for
*/
const listenFor = ['PayloadHTTP'];


/**
 * This function returns weather or not the funcion can be processed
 * @param {string}  evt - The event data.
 * @return {boolean} Boolean.
 */
const filter = (evt: types.Event<PayloadHTTP>): boolean => {
  const input = evt.payload as PayloadHTTP;
  return input.call == 'helloworld';
};

/**
 * This function process a hello world event
 * @param {string}  evt - The event data.
 * @return {Promise<any>} Promise.
 */
const handler = async (evt: types.Event<PayloadHTTP>): Promise<any> => {
  const input = evt.payload as PayloadHTTP;
  const requestId = input.requestId;
  const requestKey = `${input.call}-${requestId}`;
  let request = JSON.parse(await redis.get(requestKey)) || ({} as Request);
  let helloWorldState = (await redis.get(stateKey)) || 0;

  request.output = {
    body: {
      message: 'Hello World',
      helloWorldState,
    },
    headers: {
      'Content-Type': 'text/json',
    },
    statusCode: 200,
  };
  await redis.set(`${requestKey}`, JSON.stringify(request), 'EX', 20);

  return request.output;
};

const outputPayloadType = ['PayloadHTTP'];

const stateChange = async () => {
  let state = await redis.get(stateKey);
  if (state != null) {
    await redis.incr(stateKey);
  } else {
    await redis.set(stateKey, 1);
  }
};

/**
 * This function gets the allowed functions
 * @param {string}  evt - The event data.
 * @return {Record<unknown>} Record.
 */
const allowedFunctions = (): Record<string, unknown> => {
  return {
    helloworld: { listenFor, handler, outputPayloadType, stateChange, filter},
  };
};

export { allowedFunctions };
