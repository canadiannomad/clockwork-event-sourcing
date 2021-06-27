import { EventEmitter } from 'events';
import { hostname } from 'os';
import { ClockWorkOptions, Event, ClockWorkObject } from './types';
import redis from './redis';
import config from './config';
import utils from './utils';
import storage from './storage';

export default (options: ClockWorkOptions | null = null): ClockWorkObject => {
  const hn = hostname();
  let allowedEvents = {};

  if (options) {
    config.setConfiguration(options);
  }

  /**
   * This function process an incoming event.
   * Will increase the event hops each time the event is processed.
   * @param {string}  funcName - The function name.
   * @param {Event<any>}  evt - The incoming event.
   */
  const processEvent = async (funcName: string, evt: Event<any>) => {
    try {
      console.log('Lib Event Queue', `Received message on queue '${funcName}'`);
      evt.hops += 1; // eslint-disable-line no-param-reassign

      const canHandle = allowedEvents[funcName].filterEvent(evt);

      if (canHandle) {
        console.log('Lib Event Queue', `Executing ${funcName} state change`);
        await allowedEvents[funcName].handleStateChange(evt);

        console.log('Lib Event Queue', `Executing ${funcName} side effects`);
        await allowedEvents[funcName].handleSideEffects(evt);
      }
    } catch (e) {
      console.error('Lib Event Queue', 'Error processing Event', e);
    }
  };

  /**
   * This function gets a list of events and return the allowed functions
   * @param events - The events array.
   * @return The transformed object
   */
  const getAllowedEvents = (events: Record<string, unknown>) => {
    let eventList = {};
    Object.keys(events).forEach((eventName) => {
      console.log('Lib Event Queue', `Adding Event ${eventName}`);
      console.log('Lib Event Queue', `Property names`, Object.keys(events[eventName]).toString());

      const eventObj: Record<string, unknown> = {};
      eventObj[eventName] = events[eventName];

      eventList = Object.assign(eventList, eventObj);
    });
    console.log('Lib Event Queue', 'Allowed Events:', Object.keys(eventList).toString());
    return eventList;
  };

  /**
   * This function initializes the event queue storage.
   * Gets events from S3 and cache them in Redis stream.
   * @param stream - The events array.
   */
  const initializeStorage = async (stream: any): Promise<void> => {
    await storage.getEvents(stream);
  };

  /**
   * This function initializes the event queues.
   * Each second will be reading events from the stream group if any.
   * @param events - The events array.
   */
  const initializeQueues = async (evts: any): Promise<void> => {
    allowedEvents = getAllowedEvents(evts);
    const allowedEventsNames = Object.keys(allowedEvents);
    for (let i = 0; i < allowedEventsNames.length; i += 1) {
      const funcName = allowedEventsNames[i];
      const evtListeners: EventEmitter[] = [];

      if (allowedEvents[funcName].listenFor) {
        console.log('Lib Event Queue', 'Allowed Events ListenFor', { listenFor: allowedEvents[funcName].listenFor });
        for (let j = 0; j < allowedEvents[funcName].listenFor.length; j += 1) {
          try {
            console.log('Lib Event Queue', `Listening for ${allowedEvents[funcName].listenFor[j]} to call ${funcName}`);
            await redis.xgroup(
              'CREATE',
              `${options.redisConfig.prefix}-stream-${funcName}`,
              `${options.redisConfig.prefix}-cg-${allowedEvents[funcName].listenFor[j]}`,
              '$',
              'MKSTREAM',
            );
          } catch (e) {
            // console.log('Lib Event Queue', `Failed add ${allowedEvents[funcName].listenFor[j]}`, e);
            // Do nothing.  Group already exists.
          }
          await initializeStorage(`${options.redisConfig.prefix}-stream-${funcName}`);
        }
        for (let j = 0; j < allowedEvents[funcName].listenFor.length; j += 1) {
          const evtListener = new EventEmitter();
          setInterval(async () => {
            let response = [];
            const streamName = `${options.redisConfig.prefix}-stream-${funcName}`;
            try {
              response = await redis.xreadgroup(
                'GROUP',
                `${options.redisConfig.prefix}-cg-${allowedEvents[funcName].listenFor[j]}`,
                `${hn}-${funcName}-${funcName}`,
                // 'BLOCK',
                // '0',
                'COUNT',
                '1',
                'STREAMS',
                streamName,
                '>',
              );
            } catch (e) {
              console.error('Lib Event Queue', 'XReadGroup Error', e);
            }
            if (response) {
              for (let entry = 0; entry < response.length; entry += 1) {
                utils.kvArrayToObject(response[entry], (arg: Array<Array<any>>[]): Record<string, Array<any>>[] => {
                  const newArray: Record<string, Array<any>>[] = [];
                  for (let evtPos = 0; evtPos < arg.length; evtPos += 1) {
                    newArray.push(
                      utils.kvArrayToObject(arg[evtPos], (aarg: Array<string>, key: string): Record<string, any> => {
                        const evtObj = utils.kvArrayToObject(aarg, (a) => JSON.parse(a));
                        console.log('Lib Event Queue', 'Got Event', { key, evtObj });
                        evtListener.emit('process', key, evtObj);
                        return evtObj;
                      }),
                    );
                  }
                  return newArray;
                });
              }
            }
          }, 1000);
          evtListener.on('process', async (evtId: string, evt: Event<any>) => {
            try {
              console.log('Lib Event Queue', 'Processing Queue');
              await processEvent(funcName, evt);
              await redis.xack(
                `${options.redisConfig.prefix}-stream-${funcName}`,
                `${options.redisConfig.prefix}-cg-${allowedEvents[funcName].listenFor[j]}`,
                evtId,
              );
            } catch (e) {
              // Do nothing
              console.error('Lib Event Queue', 'Error processing Event', e);
            }
          });
          evtListeners.push(evtListener);
        }
      }
    }
  };

  /**
   * This function sends event data to the events queue.
   * @param {string}  funcName - The function name.
   * @param {Event<any>}  event - The event.
   * @return {Promise<any>} A promise.
   */
  const send = async (funcName: string, event: Event<any>): Promise<any> =>
    storage.addEvent(`${options.redisConfig.prefix}-stream-${funcName}`, event);

  const clockworkObj: ClockWorkObject = {
    initializeQueues,
    send,
  };
  return clockworkObj;
};
