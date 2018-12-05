/*
 *
 * Handlers File
 *
 */
const http = require('https');
const config = require('./config');

const handlers = {};

// Define Test Handler
handlers.test = (data, callback) => {
  const acceptableMethods = ['post'];
  const dataMethod = data.method;
  if (acceptableMethods.indexOf(dataMethod) > -1) {
    handlers._test[dataMethod](data, callback);
  } else {
    callback(405);
  }
}

handlers._test = {};

handlers._test.post = (data, callback) => {
  console.log('Test Data:', data.payload);
}

// Define User Handler
handlers.user = (data, callback) => {
  const acceptableMethods = ['post'];
  const dataMethod = data.method;
  if (acceptableMethods.indexOf(dataMethod) > -1) {
    handlers._user[dataMethod](data, callback);
  } else {
    callback(405);
  }
}

// Define Sub user handler method
handlers._user = {}

handlers._user.post = (data, callback) => {
  const payload = data.payload;
  const queryStringObject = data.queryStringObject;

  //payload.external_id = payload.id;
  payload.user_alias = { "alias_name" : "user_id", "alias_label" : "user_" + payload.id};
  //delete payload.id;

  // In case to update the user
  if (typeof(queryStringObject.update) == 'string') {
    payload._update_existing_only = true;
  }
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

  //Send post request to braze
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

// Define Purchase Handler
handlers.purchase = (data, callback) => {
  const acceptableMethods = ['post'];
  const dataMethod = data.method;
  if (acceptableMethods.indexOf(dataMethod) > -1) {
    handlers._purchase[dataMethod](data, callback);
  } else {
    callback(405);
  }
}

// Define Sub user handler method
handlers._purchase = {}

handlers._purchase.post = (data, callback) => {
  const payload = data.payload;

  // Grab purchase items
  const purchaseItems = payload.line_items;

  // Customer id
  const customerId = payload.customer !== 'undefined' ? payload.customer.id : null;

  // Update required data
  purchaseItems.forEach(itemDetail => {
      itemDetail.product_id = itemDetail.name;
      itemDetail.time = payload.updated_at;
      itemDetail.external_id = customerId;
      itemDetail.discounted_price = parseFloat(itemDetail.discounted_price);
      itemDetail.line_price = parseFloat(itemDetail.line_price);
      itemDetail.original_line_price = parseFloat(itemDetail.original_line_price);
      itemDetail.original_price = parseFloat(itemDetail.original_price);
      itemDetail.price = parseFloat(itemDetail.price);
      itemDetail.currency = 'SGD';
      itemDetail.properties = {};
  });

  const postData = {
      "api_key": config.api_key,
      "purchases": payload.line_items
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

  //Send post request to braze
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
