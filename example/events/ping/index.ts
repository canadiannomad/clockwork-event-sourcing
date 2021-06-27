/*
 * Event: Ping
 * Description: Returns Pong++ to an Async Request
 * Input Payload: PayloadHTTP
 * Output Payload: any
 * Side Effects: Increase Ping State
 * State Changes: Updates Async Request with Output
 * Next: None
 */
import { redis, types } from '../../../src';
import { PayloadHTTP, Request } from '../../types';

export default class Ping implements types.ClockWorkEvent<PayloadHTTP> {
  listenFor: string[] = ['PayloadHTTP'];

  stateKey = 'ping-state';

  filterEvent = (event: types.Event<PayloadHTTP>): boolean => {
    const input = event.payload;
    return input.call === 'ping';
  };

  handleStateChange = async (event: types.Event<PayloadHTTP>): Promise<any> => {
    const input = event.payload;
    const { requestId } = input;

    const requestKey = `${input.call}-${requestId}`;
    const request = {} as Request;
    const pingState = (await redis.get(this.stateKey)) || 0;

    request.output = {
      body: {
        message: 'Pong',
        pingState,
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
