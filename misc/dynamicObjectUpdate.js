// This module performs any typeof nested updates efficiently. uses multiple recursive algorithms perform the updates

function recursiveSealer(obj) {
  Object.seal(obj);
  for (const key in obj) {
    if (
      obj.hasOwnProperty(key) &&
      typeof obj[key] === "object" &&
      obj[key] !== null
    ) {
      recursiveSealer(obj[key]);
    }
  }
}

function recursiveFlatter(update) {
  let flattenedObj = {};
  flatterHelper(flattenedObj, update);
  return flattenedObj;
}

function flatterHelper(obj, update) {
  Object.keys(update).forEach((key) => {
    if (typeof update[key] === "object") {
      flatterHelper(obj, update[key]);
    } else {
      obj[key] = update[key];
    }
  });
}

function recursiveAssigner(obj, update) {
  Object.assign(
    obj,
    Object.keys(update).reduce((acc, key) => {
      if (obj.hasOwnProperty(key)) {
        acc[key] = update[key];
      }
      return acc;
    }, {})
  );
  Object.keys(obj).forEach((key) => {
    if (
      obj.hasOwnProperty(key) &&
      typeof obj[key] === "object" &&
      obj[key] !== null
    ) {
      recursiveAssigner(obj[key], update);
    }
  });
  return obj;
}

let dynamicObjectUpdate = function (obj, update) {
  let newUpdate = recursiveFlatter(update);
  recursiveSealer(obj);
  return recursiveAssigner(obj, newUpdate);
};

module.exports = dynamicObjectUpdate;
