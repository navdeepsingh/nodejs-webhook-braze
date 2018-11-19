/*
 *
 * Helpers File
 * 
 */

const helpers = {};

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = (str) => {
  try {
    var obj = JSON.parse(str);
    return obj;
  } catch (e) {
    return {};
  }
};

module.exports = helpers;
