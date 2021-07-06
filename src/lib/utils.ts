interface objToKVArrayCB {
  (arg: any): any;
}
interface kvArrayToObjCB {
  (arg: any, key: string): any;
}

/**
 * This function recieves an object and transform it into a key value object.
 * @param {Record<string, any>}  obj - The object to transform.
 * @param {objToKVArrayCB} callback - The callback function.
 * @return {Array<any>} The key value array.
 */
const objectToKVArray = (obj: Record<string, any>, callback: objToKVArrayCB | null = null): Array<any> => {
  if (!callback) {
    callback = (a) => a; // eslint-disable-line no-param-reassign
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
  if (kvArray.length % 2 !== 0) {
    throw new Error('Array must have an even number of elements.');
  }
  if (!callback) {
    callback = (a) => a; // eslint-disable-line no-param-reassign
  }
  const newObj: Record<string, any> = {};
  let key = '';
  for (let fieldId = 0; fieldId < kvArray.length; fieldId += 1) {
    if (key === '') {
      key = kvArray[fieldId];
    } else {
      newObj[key] = callback(kvArray[fieldId], key);
      key = '';
    }
  }
  return newObj;
};

export default {
  objectToKVArray,
  kvArrayToObject,
};
