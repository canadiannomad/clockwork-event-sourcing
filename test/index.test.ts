import { promisify } from 'util';
import { v1 as uuidv1 } from 'uuid';
import { default as Clockwork, types, redis, s3 } from '../src'; // eslint-disable-line import/no-named-default
import events from './events';
import { PayloadHTTP } from './types';

const sleep = promisify(setTimeout);

let cw: Clockwork;

beforeAll(async () => {
  const options: types.Options = {
    events,
    datalake: {
      s3: {
        bucket: 'yourbucket',
        endpoint: 'http://minio:9000',
        accessKeyId: 'minio',
        secretAccessKey: 'minio123',
        s3ForcePathStyle: true,
        signatureVersion: 'v4',
        path: 'tests'
      },
    },
    streams: {
      redis: {
        host: 'redis',
        port: 6379,
        tls: false,
        prefix: 'test',
      },
    },
    state: {
      getCurrentEventRecordName: async () => redis.get('test-exampleStatePosition'),
      setCurrentEventRecordName: async (name: string) => redis.set('test-exampleStatePosition', name),
    },
  };
  cw = new Clockwork(options);
  await s3.flushEvents();
  await redis.flushall();
});
afterAll(async () => {
  await cw.destroy();
});

test('Initialize Queues', async () => {
  await cw.initializeQueues();
  const streamTest = await redis.xinfo('STREAM', 'test-stream-PayloadHTTP');
  expect(streamTest).toHaveProperty([9], 1);
});

test('Initial Ping State is null', async () => {
  await cw.syncState();
  const pingState = await redis.get('test-ping-state');
  expect(pingState).toBeNull();
});

test('Subscribe & Emit Event', async () => {
  await cw.subscribeToQueues();

  const payload: PayloadHTTP = {
    method: 'GET',
    path: '/ping',
    call: 'ping',
    headers: {},
    body: '',
  };
  const event: types.Event<PayloadHTTP> = {
    requestId: uuidv1(),
    date: new Date().toJSON(),
    payloadType: 'PayloadHTTP',
    payloadVersion: '0.0.1',
    payload,
  };
  await cw.send(event);
  await sleep(500);
  const pingState = await redis.get('test-ping-state');
  expect(pingState).toEqual('1');
});

test('Emit Filtered Event', async () => {
  await cw.subscribeToQueues();

  const payload: PayloadHTTP = {
    method: 'GET',
    path: '/ping',
    call: 'ping',
    headers: {},
    body: '',
  };
  const event: types.Event<PayloadHTTP> = {
    requestId: uuidv1(),
    date: new Date().toJSON(),
    payloadType: 'PayloadHTTP',
    payloadVersion: '0.0.2',
    payload,
  };
  await cw.send(event);
  await sleep(400);
  const pingState = await redis.get('test-ping-state');
  expect(pingState).toEqual('1');
});
