/*
 *
 * Handlers File
 *
 */
const http = require('http');
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

handlers._test = {}

handlers._test.post = (data, callback) => {
  // post
  // Requred data: firstName, lastName, phone, password, tosAgreement
  // Optional data: none
handlers._users.post = (data, callback) => {
  console.log(data.payload);
  callback(200);
}


handlers.test = (data, callback) => {

  const postData = {
    "api_key": config.api_key,
      "attributes": [
        {
          "external_id": "navdeep.er@gmail.com",
          "email": "navdeep.er@gmail.com",
          "first_name": "Navdeep",
          "last_name": "Singh",
          "gender": "M",
          "has_profile_picture": true,
          "dob": "1985-03-19",
          "string_attribute": "navdeep",
          "boolean_attribute_1": true,
          "integer_attribute": 25,
          "array_attribute": ["sen", "natural"]
        }
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
    console.log("response statusCode: ", res);
    var chunks = [];

    res.on("data", function (chunk) {
      chunks.push(chunk);
    });

    res.on("end", function () {
      var body = Buffer.concat(chunks);
      console.log(body.toString());
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
