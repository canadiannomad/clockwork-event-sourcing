/*
 * Event: Ping
 * Description: Returns Pong++ to an Async Request
 * Input Payload: PayloadHTTP
 * Output Payload: null
 * State Changes: Increase Ping State
 * Side Effects: Updates Async Request with Output
 * Next: None
 */
import { config, redis, types } from '../../../src';
import { Request, PayloadHTTP, SimpleResponse } from '../../types';

export default class implements types.EventObject {
  listenFor: string[] = ['PayloadHTTP'];

  stateKey = 'ping-state';

  filterEvent = (event: types.Event<PayloadHTTP>): Promise<boolean> => {
    const input = event.payload;
    return Promise.resolve(input.call === 'ping' && event.payloadVersion === '0.0.1');
  };

  handleStateChange = async (_event: types.Event<PayloadHTTP>): Promise<void> => {
    const prefix = config.get().streams?.redis.prefix || 'test';
    const pingState = parseInt((await redis.get(`${prefix}-${this.stateKey}`)) || '0', 10) + 1;
    await redis.set(this.stateKey, pingState.toString());
  };

  handleSideEffects = async (event: types.Event<PayloadHTTP>): Promise<null> => {
    const prefix = config.get().streams?.redis.prefix || 'test';
    const { requestId } = event;

    const requestKey = `${prefix}-response-${requestId}`;
    const request = {} as Request;
    const pingState = parseInt((await redis.get(`${prefix}-${this.stateKey}`)) || '0', 10);

    const output: SimpleResponse = {
      body: JSON.stringify({
        message: 'Pong',
        pingState,
      }),
      headers: {
        'Content-Type': 'text/json',
      },
      statusCode: 200,
    };
    request.output = output;
    await redis.set(requestKey, JSON.stringify(request), 'EX', '20');
    return null;
  };
}
