/*
 *
 * Handlers File
 *
 */
const http = require('https');
const config = require('./config');

const handlers = {};

// Define Users Handler
handlers.test = (data, callback) => {
  const acceptableMethods = ['post', 'get'];
  const dataMethod = data.method;
  if (acceptableMethods.indexOf(dataMethod) > -1) {
    handlers._test[dataMethod](data, callback);
  } else {
    callback(405);
  }
}

handlers._test = {};

  // post
  // Requred data: firstName, lastName, phone, password, tosAgreement
  // Optional data: none
handlers._test.post = (data, callback) => {
  //console.log(data.payload);
  const payload = data.payload;
  payload.external_id = payload.id;
  delete payload.id;
  const postData = {
      "api_key": config.api_key,
        "attributes": [
          payload
        ]
      }
  const stringPostData = JSON.stringify(postData);

  // // An object of options to indicate where to post to
  var postOptions = {
    "method": "POST",
    "hostname": config.instance_url,
    "path": '/users/track',
    "headers": {
      "Content-Type": "application/json",
      "cache-control": "no-cache"
    }
  };

  //parses response to JSON
  var req = http.request(postOptions, function (res) {
    console.log("response statusCode: ", res.statusCode);
    // Returning 301
    var chunks = [];

    res.on("data", function (chunk) {
      chunks.push(chunk);
    });

    res.on("end", function () {
      var body = Buffer.concat(chunks);
      console.log('response end: ', body.toString());
    });
  });

  req.on('error', function (e) {
    console.log('problem with request: ' + e.message);
  });

  // write data to request body
  req.write(stringPostData);
  req.end();
  callback(null, postData);
}


handlers.notFound = (data, callback) => {
  callback(404);
}

module.exports = handlers;
