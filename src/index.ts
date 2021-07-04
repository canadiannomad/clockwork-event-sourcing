import * as types from './types';
import { config, eventqueue, redis, s3 } from './lib';

export { config, types, redis };

export default class {
  constructor(options: types.Options | null = null) {
    if (options) {
      config.set(options);
    } else if (!config.get()) {
      throw new Error('Configuration not set.');
    }
  }

  public static config = config;

  public static types = types;

  public static redis = redis;

  /**
   * This function initializes the event queues.
   */
  public initializeQueues = eventqueue.initializeQueues;

  /**
   * This function calls `handleStateChange` for every event after `getCurrentEventRecordName()`
   */
  public syncState = eventqueue.syncState;

  /**
   * This function creates the subscriptions to the streams and starts loops to make sure events are processed.
   */
  public subscribeToQueues = eventqueue.subscribeToQueues;

  /**
   * This function adds an event to the stream.
   */
  public send = eventqueue.send;

  /**
   * This function stops all connections and listeners
   */
  public destroy = async (): Promise<void> => {
    s3.stop();
    redis.stop();
  };
}
