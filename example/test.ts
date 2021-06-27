import { v1 as uuidv1 } from 'uuid';
import { PayloadHTTP } from './types';
import { eventqueue, types } from '../src';
import * as events from './events';

const options: types.ClockWorkOptions = {
  s3: {
    bucket: 'yourbuckettest',
    accessKeyId: 'minio',
    secretAccessKey: 'minio123',
    endpoint: 'http://minio:9000',
    s3ForcePathStyle: true,
    signatureVersion: 'v4',
  },
  testMode: true,
  events,
  redisConfig: {
    host: '127.0.0.1',
    prefix: 'test-clockwork',
  },
};
const cw = eventqueue(options);

process.on('warning', (e) => console.error('Example', e.stack));
process.on('unhandledRejection', (err) => {
  try {
    console.error('Uncaught', err); // tslint:disable-line no-console
  } catch (e) {
    console.error('Double uncaught:', e, err); // tslint:disable-line no-console
  }
  process.exit(1); // tslint:disable-line no-process-exit
});

const testHTTPRequest = async () => {
  const payload: PayloadHTTP = {
    payloadType: 'HTTP',
    payloadVersion: '0.0.1',
    requestId: uuidv1(),
    method: types.PayloadHTTPMethod.Get,
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

  const evt: types.Event<PayloadHTTP> = {
    direction: types.EventDirection.Incoming,
    source: 'HTTP',
    sourceVersion: '0.0.1',
    date: new Date().toJSON(),
    hops: 1,
    cost: '0.00',
    rawPayload: {},
    payload,
  };

  await cw.send(payload.call, evt);
  console.log(`send event`, evt);
};

const init = async () => {
  await cw.initializeQueues(events);
  console.log('Done initiate queues');
  await testHTTPRequest();
};

init();
