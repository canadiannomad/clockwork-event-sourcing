import ClockWork from '../src';
import * as events from './events';
import { ClockWorkOptions } from '../src/lib/types';

const options: ClockWorkOptions = {
  s3Bucket: 'yourbucket',
  events: events,
  redisConfig: {
    host: '127.0.0.1',
    password: '',
    port: 6379,
    prefix: "clockwork"
  }
};

const cw = ClockWork(options);

const init = async () => {
  await cw.initializeQueues(events);
};

init();
