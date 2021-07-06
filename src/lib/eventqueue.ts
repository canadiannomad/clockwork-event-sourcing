import { hostname } from 'os';

import * as types from '../types';
import { config, redis, s3, utils } from '.';

const hn = hostname();

const getPayloadsTypes = (): Record<string, string[]> => {
  const conf = config.get();
  const reverseListenFor: Record<string, string[]> = {};

  const eventNames = Object.keys(conf.events);
  for (const eventName of eventNames) {
    if (conf.events[eventName].listenFor) {
      for (const listenFor of conf.events[eventName].listenFor) {
        if (!reverseListenFor[listenFor]) reverseListenFor[listenFor] = [];
        reverseListenFor[listenFor].push(eventName);
      }
    }
  }
  return reverseListenFor;
};

/**
 * This function initializes the event queues.
 */
const initializeQueues = async (): Promise<void> => {
  const conf = config.get();
  const redisPrefix = conf.streams?.redis?.prefix || 'cwesf';

  const reverseListenFor = getPayloadsTypes();

  const payloadTypes: string[] = Object.keys(reverseListenFor);
  for (const payloadType of payloadTypes) {
    for (const eventName of reverseListenFor[payloadType]) {
      try {
        console.log('Lib Event Queue', `Listening for ${payloadType} to call ${eventName}`);

        await redis.xgroup(
          'CREATE',
          `${redisPrefix}-stream-${payloadType}`,
          `${redisPrefix}-cg-${eventName}`,
          '$',
          'MKSTREAM',
        );
      } catch (e) {
        // console.log('Lib Event Queue', `Failed add ${listenFor}`, e);
        // Do nothing.  Group already exists.
      }
    }
  }
};

/**
 * This function calls `handleStateChange` for every event after `getCurrentEventRecordName()`
 */
const syncState = async (): Promise<void> => {
  const conf = config.get();
  const reverseListenFor = getPayloadsTypes();

  let currentState: string = await conf.state.getCurrentEventRecordName();
  let nextItem: types.EventRecord | null = currentState
    ? await s3.getNextEventRecordAfter(currentState)
    : await s3.getFirstEventRecord();
  if (!nextItem) return;
  do {
    for (const runEventName of reverseListenFor[nextItem.event.payloadType]) {
      if (await conf.events[runEventName].filterEvent(nextItem.event)) {
        await conf.events[runEventName].handleStateChange(nextItem.event);
      }
    }
    await conf.state.setCurrentEventRecordName(nextItem.name);
    currentState = await conf.state.getCurrentEventRecordName();
    nextItem = await s3.getNextEventRecordAfter(currentState);
  } while (nextItem);
};

const processEvent = async (funcName: string, eventType: string, eventId: string, event: types.Event<any>) => {
  const conf = config.get();
  const redisConf = conf.streams.redis;
  if (!redisConf) throw new Error('Redis not configured.');
  try {
    if (await conf.events[funcName].filterEvent(event)) {
      await conf.events[funcName].handleStateChange(event);
      await conf.events[funcName].handleSideEffects(event);
    } else {
      const pubMessage: types.RedisMessage = {
        command: 'FilteredEvent',
        parameters: [funcName, eventType, eventId],
      };
      redis.publish(`${redisConf.prefix}-channel`, JSON.stringify(pubMessage));
    }
    await redis.xack(`${redisConf.prefix}-stream-${eventType}`, `${redisConf.prefix}-cg-${funcName}`, eventId);
  } catch (_e) {
    const pubMessage: types.RedisMessage = {
      command: 'FailedEvent',
      parameters: [funcName, eventType, eventId],
    };
    redis.publish(`${redisConf.prefix}-channel`, JSON.stringify(pubMessage));
  }
};

const processResponse = (funcName: string, eventType: string, response: Array<any>) => {
  for (let entry = 0; entry < response.length; entry += 1) {
    utils.kvArrayToObject(response[entry], (arg: Array<Array<any>>[]): Record<string, Array<any>>[] => {
      const newArray: Record<string, Array<any>>[] = [];
      for (let evtPos = 0; evtPos < arg.length; evtPos += 1) {
        newArray.push(
          utils.kvArrayToObject(arg[evtPos], (aarg: Array<string>, key: string): Record<string, any> => {
            const evtObj = utils.kvArrayToObject(aarg, (a) => JSON.parse(a)) as types.Event<any>;
            console.log('Lib Event Queue', 'Got Event', { key, evtObj });
            processEvent(funcName, eventType, key, evtObj);
            return evtObj;
          }),
        );
      }
      return newArray;
    });
  }
};

const subscribeToQueues = async (): Promise<void> => {
  const conf = config.get();
  const redisConf = conf.streams.redis;
  if (!redisConf) throw new Error('Redis not configured.');

  const reverseListenFor = getPayloadsTypes();

  await redis.subscribe(async (message: string) => {
    const msg = JSON.parse(message) as types.RedisMessage;
    console.log('Event Queue Received Message:', message);
    if (msg.command === 'NewEvent') {
      const eventType = msg.parameters[0];
      for (const funcName of reverseListenFor[eventType]) {
        const streamName = `${redisConf.prefix}-stream-${eventType}`;
        const response = await redis.xreadgroup(
          'GROUP',
          `${redisConf.prefix}-cg-${funcName}`,
          `${hn}-${funcName}-${eventType}`,
          // 'BLOCK',
          // '0',
          'COUNT',
          '1',
          'STREAMS',
          streamName,
          '>',
        );
        if (response) processResponse(funcName, eventType, response);
      }
    }
    if (msg.command === 'FilteredEvent' || msg.command === 'FailedEvent') {
      const [funcName, eventType, eventId] = msg.parameters;
      const streamName = `${redisConf.prefix}-stream-${eventType}`;
      const response = await redis.xclaim(
        streamName,
        `${redisConf.prefix}-cg-${funcName}`,
        `${hn}-${funcName}-${eventType}`,
        '0',
        eventId,
      );
      if (response) processResponse(funcName, eventType, response);
    }
  });
};

const send = async (event: types.Event<any>): Promise<void> => {
  const conf = config.get();
  const redisConf = conf.streams.redis;
  if (!redisConf) throw new Error('Redis not configured.');

  const stream = `${redisConf.prefix}-stream-${event.payloadType}`;
  console.log('Lib Storage', `Adding event to redis ${stream}`);
  const eventId = await s3.saveEvent(event);
  const kvObj: string[] = utils.objectToKVArray(event, JSON.stringify);
  await redis.xadd(stream, eventId, ...kvObj);
  const pubMessage: types.RedisMessage = {
    command: 'NewEvent',
    parameters: [event.payloadType],
  };
  redis.publish(`${redisConf.prefix}-channel`, JSON.stringify(pubMessage));
};
export default {
  initializeQueues,
  syncState,
  subscribeToQueues,
  send,
};
