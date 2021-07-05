import { v1 as uuidv1 } from 'uuid';
import { default as Clockwork, types, redis } from '../src'; // eslint-disable-line import/no-named-default
import events from './events';
import { PayloadHTTP } from './types';

let cw: Clockwork;

beforeAll(async () => {
  const options: types.Options = {
    events,
    datalake: {
      s3: {
        bucket: 'minio',
        accessKeyId: 'minio',
        secretAccessKey: 'minio123'
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
      getCurrentEventRecordName: async () => '0',
      setCurrentEventRecordName: async (_name: string) => {}, // eslint-disable-line
    },
  };
  cw = new Clockwork(options);
  redis.flushall();
});
afterAll(async () => {
  cw.destroy();
});

test('Initialize Queues', async () => {
  cw.initializeQueues();
});
test('Sync State', async () => {
  cw.syncState();
});
test('Subscribe Queues', async () => {
  cw.subscribeToQueues();
});
test('Emit Event', async () => {
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
  cw.send(event);
});
