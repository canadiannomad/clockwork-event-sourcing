import { EventEmitter } from 'events';
import { hostname } from 'os';
import { Event, QueueOptions } from './types';
import redis from './redis';
import logger from './logger';
import config from './config';

const hn = hostname();
const log = logger('Lib Event Queue');
const queues = {};
let allowedEvents = {};
interface objToKVArrayCB {
  (arg: any): any;
}
interface kvArrayToObjCB {
  (arg: any, key?: string): any;
}

const setup = (options: QueueOptions): void => {
  config.setConfiguration(options);
};

/**
 * This function recieves an object and transform it into a key value object.
 * @param {Record<string, any>}  obj - The object to transform.
 * @param {objToKVArrayCB} callback - The callback function.
 * @return {Array<any>} The key value array.
 */
const objectToKVArray = (obj: Record<string, any>, callback: objToKVArrayCB | null = null): Array<any> => {
  if (!callback) {
    callback = (a) => a;
  }
  const kvObj: string[] = [];
  const objKeys = Object.keys(obj);
  for (let k = 0; k < objKeys.length; k += 1) {
    const key = objKeys[k];
    kvObj.push(key);
    kvObj.push(callback(obj[key]));
  }
  return kvObj;
};

/**
 * This function receives a key value object and transforms it into an object.
 * @param {Array<any>}  kvArray - The key value to transform.
 * @param {kvArrayToObjCB} callback - The callback function.
 * @return {Record<string, any>} The transformed object.
 */
const kvArrayToObject = (kvArray: Array<any>, callback: kvArrayToObjCB | null = null): Record<string, any> => {
  if (kvArray.length % 2 != 0) {
    throw new Error('Array must have an even number of elements.');
  }
  if (!callback) {
    callback = (a) => a;
  }
  const newObj: Record<string, any> = {};
  let key = '';
  for (let fieldId = 0; fieldId < kvArray.length; fieldId += 1) {
    if (key == '') {
      key = kvArray[fieldId];
    } else {
      newObj[key] = callback(kvArray[fieldId], key);
      key = '';
    }
  }
  return newObj;
};

/**
 * This function gets a list of events and return the allowed functions
 * @param {any}  events - The events array.
 * @return {any} The transformed object
 */
const getAllowedEvents = (events) => {
  let eventList = {};
  for (const eventName in events) {
    if (events.hasOwnProperty(eventName)) {
      log.info(`Adding Event ${eventName}`);
      log.info(`Property names`, Object.keys(events[eventName]).toString());
      Object.keys(events[eventName]).forEach((fileName) => {
        if (events[eventName][fileName] && events[eventName][fileName].allowedFunctions) {
          const funcs = events[eventName][fileName].allowedFunctions();
          const funcNames = Object.keys(funcs);
          log.info(`Adding Functions ${eventName}`, funcNames);
          if (funcNames) {
            eventList = Object.assign(eventList, funcs);
          }
        }
      });
    }
  }
  log.info('Allowed Events:', Object.keys(eventList).toString());
  return eventList;
};

/**
 * This function initializes the event queues.
 * Each second will be reading events from the stream group if any.
 * Will be limited to get up to five events each time.
 * @param {any}  events - The events array.
 */
const initializeQueues = async (evts): Promise<void> => {
  allowedEvents = getAllowedEvents(evts);
  const allowedEventsNames = Object.keys(allowedEvents);
  for (let i = 0; i < allowedEventsNames.length; i += 1) {
    const funcName = allowedEventsNames[i];
    const evtListeners: EventEmitter[] = [];
    if (allowedEvents[funcName].listenFor) {
      log.info('Allowed Events ListenFor', { listenFor: allowedEvents[funcName].listenFor });
      for (let j = 0; j < allowedEvents[funcName].listenFor.length; j += 1) {
        try {
          log.info(`Listening for ${allowedEvents[funcName].listenFor[j]} to call ${funcName}`);
          await redis.xgroup(
            'CREATE',
            `minevtsrc-stream-${allowedEvents[funcName].listenFor[j]}`,
            `minevtsrc-cg-${funcName}`,
            '$',
            'MKSTREAM',
          );
        } catch (e) {
          // log.info(`Failed add ${allowedEvents[funcName].listenFor[j]}`, e);
          // Do nothing.  Group already exists.
        }
      }
      for (let j = 0; j < allowedEvents[funcName].listenFor.length; j += 1) {
        const evtListener = new EventEmitter();
        setInterval(async () => {
          let response = [];
          try {
            response = await redis.xreadgroup(
              'GROUP',
              `minevtsrc-cg-${funcName}`,
              `${hn}-${funcName}-${allowedEvents[funcName].listenFor[j]}`,
              //'BLOCK',
              //'0',
              'COUNT',
              '5',
              'STREAMS',
              `minevtsrc-stream-${allowedEvents[funcName].listenFor[j]}`,
              '>',
            );
          } catch (e) {
            log.error('XReadGroup Error', e);
          }
          if (response) {
            for (let entry = 0; entry < response.length; entry += 1) {
              kvArrayToObject(response[entry], (arg: Array<Array<any>>[]): Record<string, Array<any>>[] => {
                const newArray: Record<string, Array<any>>[] = [];
                for (let evtPos = 0; evtPos < arg.length; evtPos += 1) {
                  newArray.push(
                    kvArrayToObject(
                      arg[evtPos],
                      (arg: Array<string>, key: string): Record<string, any> => {
                        const evtObj = kvArrayToObject(arg, (a) => {
                          return JSON.parse(a);
                        }) as Event<any>;
                        log.info('Got Event', { key, evtObj });
                        evtListener.emit('process', key, evtObj);
                        return evtObj;
                      },
                    ),
                  );
                }
                return newArray;
              });
            }
          }
        }, 1000);
        evtListener.on('process', async (evtId: string, evt: Event<any>) => {
          try {
            log.info('Processing Queue');
            await processEvent(funcName, evt);
            await redis.xack(
              `minevtsrc-stream-${allowedEvents[funcName].listenFor[j]}`,
              `minevtsrc-cg-${funcName}`,
              evtId,
            );
          } catch (e) {
            // Do nothing
            log.error('Error processing Event', e);
          }
        });
        evtListeners.push(evtListener);
      }
    }
    queues[funcName] = { listeners: evtListeners };
  }
};

/**
 * This function sends event data to the events queue.
 * @param {string}  outputPayloadType - The output payload type.
 * @param {Event<any>}  event - The event.
 * @return {Promise<any>} A redis promise.
 */
const send = async (outputPayloadType: string, event: Event<any>): Promise<string> => {
  const kvObj: string[] = objectToKVArray(event, JSON.stringify);
  log.info(`Sending to queue minevtsrc-stream-${outputPayloadType}`);
  return await redis.xadd(`minevtsrc-stream-${outputPayloadType}`, '*', ...kvObj);
};

/**
 * This function process an incoming event.
 * Will increase the event hops each time the event is processed.
 * @param {string}  funcName - The function name.
 * @param {Event<any>}  evt - The incoming event.
 */
const processEvent = async (funcName: string, evt: Event<any>) => {
  try {
    log.info(`Received message on queue '${funcName}'`);
    evt.hops += 1;
    const evtRequest: Event<any> | null = await allowedEvents[funcName].handler(evt);
    if (evtRequest && allowedEvents[funcName].outputPayloadType) {
      log.info('Storing Event To Redis', { evtRequest });
      await send(allowedEvents[funcName].outputPayloadType, evtRequest);
      if (allowedEvents[funcName].stateChange) {
        await allowedEvents[funcName].stateChange(evtRequest);
      }
    }
  } catch (e) {
    log.error('Error in process', e);
    if (globalThis.testMode) {
      process.exit(1);
    }
  }
};

export default {
  setup,
  initializeQueues,
  send
};
