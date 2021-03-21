import { v1 as uuidv1 } from 'uuid';
import { Event, EventDirection, ClockWorkOptions, PayloadHTTPMethod } from '../src/lib/types';
import { PayloadHTTP, Request } from './types';
import { eventqueue } from '../src';
import logger from '../src/logger';
import * as events from './events';
const log = logger('Integration Tests');
const options: ClockWorkOptions = {
  s3Bucket: 'mapreducelambda',
  testMode: true,
  events,
  redisConfig: {
    host: '127.0.0.1',
    prefix: 'test-clockwork',
  },
};
const cw = eventqueue.default(options);

process.on('warning', (e) => log.warn(e.stack));
process.on('unhandledRejection', (err) => {
  try {
    (log.error || console.error)(err); // tslint:disable-line no-console
  } catch (e) {
    console.log('Double uncaught:', e, err); // tslint:disable-line no-console
  }
  process.exit(1); // tslint:disable-line no-process-exit
});

const init = async () => {
  await cw.initializeQueues(events);
  log.info('Done initiate queues');
  await testHTTPRequest();
};

const testHTTPRequest = async () => {
  const payload: PayloadHTTP = {
    payloadType: 'HTTP',
    payloadVersion: '0.0.1',
    requestId: uuidv1(),
    method: PayloadHTTPMethod.Get,
    path: '/',
    call: 'helloworld',
    parameters: {},
    body: {
      event: {
        body: {
          message: {
            chat: { id: 1 },
            from: {
              first_name: 'Test',
              language_code: 'en',
            },
            text: 'This is a test',
          },
        },
      },
    },
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

  var response = await cw.send('PayloadHTTP', evt);
  console.log(`send event`, evt);
};

init();
