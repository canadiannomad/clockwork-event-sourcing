import 'source-map-support/register';
import eventqueue from './lib/eventqueue';
import * as events from '../example/events';
import logger from './lib/logger';

const log = logger('Runtime Route');

process.on('unhandledRejection', (err) => {
  try {
    (log.error || console.error)(err); // tslint:disable-line no-console
  } catch (e) {
    console.log('Double uncaught:', e, err); // tslint:disable-line no-console
  }
  process.exit(1); // tslint:disable-line no-process-exit
});

const init = async () => {
  await eventqueue.initializeQueues(events);
};

init();
