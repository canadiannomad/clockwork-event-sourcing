import { StateTelegramUser, StateValidatedAnswer } from './types';
import redis from './redis';

// Telegram User State
const getTgUserState = async (tgUserId: string): Promise<StateTelegramUser> => {
  if (!tgUserId) {
    throw new Error(`getTgUserState failed, tgUserId: '${tgUserId}' is undefined.`);
  }
  return JSON.parse(await redis.get(`minevtsrc-state-tguser-${tgUserId}`)) as StateTelegramUser;
};
const setTgUserState = async (tgUserId: string, userState: StateTelegramUser): Promise<void> => {
  if (!tgUserId) {
    throw new Error(`setTgUserState failed, tgUserId: '${tgUserId}' is undefined.`);
  }
  await redis.set(`minevtsrc-state-tguser-${tgUserId}`, JSON.stringify(userState), 'EX', 600);
};

// Validated Answer State
const getValidatedAnswerState = async (vAnswerId: string): Promise<StateValidatedAnswer> => {
  if (!vAnswerId) {
    throw new Error(`getValidatedAnswerState failed, vAnswerId: '${vAnswerId}' is undefined.`);
  }
  return JSON.parse(await redis.get(`minevtsrc-state-vanswer-${vAnswerId}`)) as StateValidatedAnswer;
};
const setValidatedAnswerState = async (vAnswerId: string, vAnswerState: StateValidatedAnswer): Promise<void> => {
  if (!vAnswerId) {
    throw new Error(`setValidatedAnswerState failed, vAnswerId: '${vAnswerId}' is undefined.`);
  }
  await redis.set(`minevtsrc-state-vanswer-${vAnswerId}`, JSON.stringify(vAnswerState), 'EX', 600);
};
const delValidatedAnswerState = async (vAnswerId: string): Promise<void> => {
  if (!vAnswerId) {
    throw new Error(`delValidatedAnswerState failed, vAnswerId: '${vAnswerId}' is undefined.`);
  }
  await redis.del(`minevtsrc-state-vanswer-${vAnswerId}`);
};

// MTurk HIT to Validated Answer lookup
const getValidatedAnswerIdFromHitId = async (hitId: string): Promise<string> => {
  if (!hitId) {
    throw new Error(`getValidatedAnswerIdFromHitId failed, hitId: '${hitId}' is undefined.`);
  }
  return await redis.get(`minevtsrc-lookup-hitid-vanswerid-${hitId}`);
};
const setValidatedAnswerIdFromHitId = async (hitId: string, vAnswerId: string): Promise<void> => {
  if (!hitId) {
    throw new Error(`setValidatedAnswerIdFromHitId failed, hitId: '${hitId}' is undefined.`);
  }
  await redis.set(`minevtsrc-lookup-hitid-vanswerid-${hitId}`, vAnswerId, 'EX', 600);
};

// Validated Answer to TG User lookup
const getTGUserIdFromValidatedAnswerId = async (vAnswerId: string): Promise<string> => {
  if (!vAnswerId) {
    throw new Error(`getTGUserIdFromValidatedAnswerId failed, vAnswerId: '${vAnswerId}' is undefined.`);
  }
  return await redis.get(`minevtsrc-lookup-vanswerid-tguserid-${vAnswerId}`);
};
const setTGUserIDFromValidatedAnswerId = async (vAnswerId: string, tgUserId: string): Promise<void> => {
  if (!vAnswerId) {
    throw new Error(`setTGUserIdFromValidatedAnswerId failed, vAnswerId: '${vAnswerId}' is undefined.`);
  }
  await redis.set(`minevtsrc-lookup-vanswerid-tguserid-${vAnswerId}`, tgUserId, 'EX', 600);
};

export {
  delValidatedAnswerState,
  getValidatedAnswerState,
  setValidatedAnswerState,
  getTgUserState,
  setTgUserState,
  getValidatedAnswerIdFromHitId,
  setValidatedAnswerIdFromHitId,
  getTGUserIdFromValidatedAnswerId,
  setTGUserIDFromValidatedAnswerId,
};
