/*
 * Event: Hello World
 * Description: Returns HelloWorld++ to an Async Request
 * Input Payload: PayloadHTTP
 * Output Payload: any
 * Side Effects: Increase HelloWorld State
 * State Changes: Updates Async Request with Output
 * Next: None
 */
import { redis, types } from '../../../src';
import { Request, PayloadHTTP, RequestObject, SimpleResponse } from '../../types';

export default class Ping implements types.ClockWorkEvent<PayloadHTTP> {
  listenFor: string[] = ['PayloadHTTP'];

  stateKey = 'helloworld-state';

  filterEvent = (event: types.Event<PayloadHTTP>): boolean => {
    const input = event.payload;
    return input.call === 'helloworld' && event.sourceVersion === '0.0.1';
  };

  handleStateChange = async (_event: types.Event<PayloadHTTP>): Promise<RequestObject> => {
    const pingState = parseInt((await redis.get(this.stateKey)) || '0', 10) + 1;
    await redis.set(this.stateKey, pingState);
    return { pingState };
  };

  handleSideEffects = async (event: types.Event<PayloadHTTP>): Promise<void> => {
    const input = event.payload;
    const { requestId } = input;

    const requestKey = `${process.env.REDIS_PREFIX}-response-${requestId}`;
    const request = {} as Request;
    const pingState = parseInt((await redis.get(this.stateKey)) || '0', 10);

    const output: SimpleResponse = {
      body: JSON.stringify({
        message: 'Hello World',
        pingState,
      }),
      customHeaders: {
        'Content-Type': 'text/json',
      },
      statusCode: 200,
    };
    request.output = output;
    await redis.set(requestKey, JSON.stringify(request), 'EX', 20);
  };
}
