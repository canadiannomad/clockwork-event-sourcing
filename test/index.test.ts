import { promisify } from 'util';
import { v1 as uuidv1 } from 'uuid';
import * as cw from '../src'; // eslint-disable-line import/no-named-default
import events from './events';
import { PayloadHTTP } from './types';

const sleep = promisify(setTimeout);

beforeAll(async () => {
  const options: cw.types.Options = {
    events,
    datalake: {
      s3: {
        bucket: 'yourbucket',
        endpoint: 'http://minio:9000',
        accessKeyId: 'minio',
        secretAccessKey: 'minio123',
        s3ForcePathStyle: true,
        signatureVersion: 'v4',
        path: 'events',
      },
    },
    streams: {
      redis: {
        host: 'redis',
        port: 6379,
        tls: false,
        prefix: 'cwesf',
      },
    },
    state: {
      getCurrentEventRecordName: async () => cw.redis.get(cw.redis.withPrefix('exampleStatePosition')),
      setCurrentEventRecordName: async (name: string) =>
        cw.redis.set(cw.redis.withPrefix('exampleStatePosition'), name),
    },
  };
  cw.config.set(options);
  await cw.s3.flushEvents();
  await cw.redis.flushall();
});
afterAll(async () => {
  await cw.stop();
  await sleep(1000);
});

test('Initialize Queues', async () => {
  await cw.eventqueue.initializeQueues();
  const streamTest = await cw.redis.xinfo('STREAM', cw.redis.withPrefix('stream-PayloadHTTP'));
  expect(streamTest).toHaveProperty([9], 1);
});

test('Initial Ping State is null', async () => {
  await cw.eventqueue.syncState();
  const pingState = await cw.redis.get(cw.redis.withPrefix('ping-state'));
  expect(pingState).toBeNull();
});

test('Subscribe & Emit Event', async () => {
  await cw.eventqueue.subscribeToQueues();

  const payload: PayloadHTTP = {
    method: 'GET',
    path: '/ping',
    call: 'ping',
    headers: {},
    body: '',
  };
  const event: cw.types.Event<PayloadHTTP> = {
    requestId: uuidv1(),
    date: new Date().toJSON(),
    payloadType: 'PayloadHTTP',
    payloadVersion: '0.0.1',
    payload,
  };
  await cw.eventqueue.send(event);
  await sleep(500);
  const pingState = await cw.redis.get(cw.redis.withPrefix('ping-state'));
  expect(pingState).toEqual('1');
});

test('Emit Filtered Event', async () => {
  await cw.eventqueue.subscribeToQueues();

  const payload: PayloadHTTP = {
    method: 'GET',
    path: '/ping',
    call: 'ping',
    headers: {},
    body: '',
  };
  const event: cw.types.Event<PayloadHTTP> = {
    requestId: uuidv1(),
    date: new Date().toJSON(),
    payloadType: 'PayloadHTTP',
    payloadVersion: '0.0.2',
    payload,
  };
  await cw.eventqueue.send(event);
  await sleep(400);
  const pingState = await cw.redis.get(cw.redis.withPrefix('ping-state'));
  expect(pingState).toEqual('1');
});
