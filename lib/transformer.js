import * as _ from 'lodash';

const GROUP_KEY = 'section';

export default function transform(array) {
  return array.reduce(function(target, source) {
    if(keysContain(source, GROUP_KEY)) {
      const groupValue = source[GROUP_KEY];
      return _.set(target, groupValue, source);
    }

    return _.transform(source, merge, target);
  }, {});
}

function merge(target, value, key, object) {
  if(target[key]) {
    throw new Error(`Duplicated key in markup: ${key}`)
  }

  target[key] = value;
  return target;
}

function keysContain(obj, key) {
  return _.includes(Object.keys(obj), key);
}
