/*
 *
 * Helpers File
 * 
 */
const crypto = require('crypto');

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

// Create a SHA256 hash
helpers.hash = (str) => {
  if (typeof (str) == 'string' && str.length > 0) {
    const hash = crypto.createHmac('sha1', process.env.HASHING_SECRET).update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
}

module.exports = helpers;
