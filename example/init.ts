import eventqueue from '../src/lib/eventqueue';
import * as events from './events';
import logger from '../src/lib/logger';
import { QueueOptions } from '../src/lib/types';

/* Logger */
const log = logger('Runtime Route');

/* Listener that catch exceptions and log */
process.on('unhandledRejection', (err) => {
  try {
    (log.error || console.error)(err); // tslint:disable-line no-console
  } catch (e) {
    console.log('Double uncaught:', e, err); // tslint:disable-line no-console
  }
  process.exit(1); // tslint:disable-line no-process-exit
});

/* Queue initializer */
const init = async () => {
  
  const options: QueueOptions = {
    s3Bucket: 'yourbucket'
  };

  eventqueue.setup(options);

  await eventqueue.initializeQueues(events);
};

init();
