/*
 * Event: HelloWorld
 * Description: Returns Hello World to an Async Request
 * Input Payload: PayloadHTTP
 * Output Payload: Any
 * Side Effects: Increase HelloWorld State
 * State Changes: Updates Async Request with Output
 * Next: None
 */
import { redis, types } from '../../../src';
import { PayloadHTTP, Request } from '../../types';

export default class HelloWorld implements types.ClockWorkEvent<PayloadHTTP> {
  listenFor: string[] = ['PayloadHTTP'];

  stateKey = 'hello-world-state';

  filterEvent = (event: types.Event<PayloadHTTP>): boolean => {
    const input = event.payload;
    return input.call === 'helloworld';
  };

  handleStateChange = async (event: types.Event<PayloadHTTP>): Promise<any> => {
    const input = event.payload;
    const { requestId } = input;

    const requestKey = `${input.call}-${requestId}`;
    const request = {} as Request;
    const helloWorldState = (await redis.get(this.stateKey)) || 0;

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

  handleSideEffects = async (_event: types.Event<PayloadHTTP>): Promise<any> => {
    const state = await redis.get(this.stateKey);
    if (state != null) {
      await redis.incr(this.stateKey);
    } else {
      await redis.set(this.stateKey, 1);
    }
  };
}
