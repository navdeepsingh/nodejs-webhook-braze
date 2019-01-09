/*
 *
 * Handlers File
 *
 */
const http = require('https');
const helpers = require('./helpers');

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

  payload.external_id = helpers.hash(payload.email);
  delete payload.id;

  // In case to update the user
  if (typeof(queryStringObject.update) == 'string') {
    payload._update_existing_only = true;
  }
  const postData = {
      "api_key": process.env.BRAZE_API_KEY,
      "attributes": [
        payload
      ]
    }
  const stringPostData = JSON.stringify(postData);

  // // An object of options to indicate where to post to
  var postOptions = {
    "method": "POST",
    "hostname": process.env.BRAZE_INSTANCE_URL,
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
  const customerEmail = payload.customer !== 'undefined' ? helpers.hash(payload.customer.email) : null;

  // Update required data
  purchaseItems.forEach(itemDetail => {
      itemDetail.product_id = itemDetail.name;
      itemDetail.time = payload.updated_at;
      itemDetail.external_id = customerEmail;
      itemDetail.discounted_price = parseFloat(itemDetail.discounted_price);
      itemDetail.line_price = parseFloat(itemDetail.line_price);
      itemDetail.original_line_price = parseFloat(itemDetail.original_line_price);
      itemDetail.original_price = parseFloat(itemDetail.original_price);
      itemDetail.price = parseFloat(itemDetail.price);
      itemDetail.currency = 'SGD';
      itemDetail.properties = {};
  });

  const postData = {
      "api_key": process.env.BRAZE_API_KEY,
      "purchases": payload.line_items
    }
  const stringPostData = JSON.stringify(postData);

  // // An object of options to indicate where to post to
  var postOptions = {
    "method": "POST",
    "hostname": process.env.BRAZE_INSTANCE_URL,
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


handlers.get_omnisend_subscribers = (data, callback) => {
  // // An object of options to indicate where to post to
  var getOptions = {
    "method": "GET",
    "protocol": 'https:',
    "hostname": 'api.omnisend.com',
    "path": '/v3/contacts?limit=320&offset=0',
    "headers": {
      "Content-Type": "application/json",
      "X-API-KEY": process.env.OMNISEND_API_KEY
    }
  };

  //Send get request to omnisend
  var req = http.request(getOptions, function (res) {
    console.log("response: ", res.statusCode);
    var chunks = [];

    res.on("data", function (chunk) {
      chunks.push(chunk);
    });

    res.on("end", function () {
      var body = Buffer.concat(chunks);
      // Process response back
      const response = body.toString();
      const jsonResponse = JSON.parse(response);
      jsonResponse.contacts.forEach(subscriber => {
        let subscriberEmail = subscriber.email;
        let hashedSubscriberEmail = helpers.hash(subscriberEmail);
        let subscriberCreatedAt = subscriber.createdAt;

        // Send post request to braze
        const subscriberPayload = {
          'external_id': hashedSubscriberEmail,
          'email': subscriberEmail,
          'createdAt': subscriberCreatedAt
        }

        const postData = {
          "api_key": process.env.BRAZE_API_KEY,
          "attributes": [
            subscriberPayload
          ]
        }
        const stringPostData = JSON.stringify(postData);

        // // An object of options to indicate where to post to
        var postOptions = {
          "method": "POST",
          "hostname": process.env.BRAZE_INSTANCE_URL,
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
      });
    });
  });

  req.on('error', function (e) {
    console.log('problem with request: ' + e.message);
  });

  req.on('timeout', function (e) {
    console.log('timout with request: ' + e.message);
  });
  req.end();
  callback(null, {'Success' : 'Fetched all subscribers'});
}


handlers.post_subscribers_braze = (data, callback) => {
  const subscribers = [
    'rozitajerry1972@gmail.com',
    'allynechee@outlook.sg',
    'c_alystaaw94@hotmail.com',
    'brontechua@live.com',
    'shermaine_wong@yahoo.com',
    'suzannaling.lim@yahoo.com',
    'connielml@gmail.com',
    'joycelyn_pangte@yahoo.com',
    'patricea@patricea.com'
  ];

  subscribers.forEach(subscriberEmail => {
    let hashedSubscriberEmail = helpers.hash(subscriberEmail);
    let subscriberCreatedAt = '2018-12-12T00:00:00Z';

    // Send post request to braze
    const subscriberPayload = {
      'external_id': hashedSubscriberEmail,
      'email': subscriberEmail,
      'createdAt': subscriberCreatedAt
    }

    const postData = {
      "api_key": process.env.BRAZE_API_KEY,
      "attributes": [
        subscriberPayload
      ]
    }
    const stringPostData = JSON.stringify(postData);

    // // An object of options to indicate where to post to
    var postOptions = {
      "method": "POST",
      "hostname": process.env.BRAZE_INSTANCE_URL,
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
  });      
}
// Define Purchase Handler
handlers.omnisend = (data, callback) => {
  const acceptableMethods = ['get'];
  const dataMethod = data.method;
  if (acceptableMethods.indexOf(dataMethod) > -1) {
    handlers._omnisend[dataMethod](data, callback);
  } else {
    callback(405);
  }
}

handlers._omnisend = {};

handlers._omnisend.get = (data, callback) => {
  EMAIL_ADDRESS_REGEX = new RegExp("(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|\"(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21\\x23-\\x5b\\x5d-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])*\")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21-\\x5a\\x53-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])+)\\])");
  const email = typeof (data.queryStringObject.email) == 'string' && data.queryStringObject.email.match(EMAIL_ADDRESS_REGEX) !== null ? data.queryStringObject.email.trim() : false;

  
  if (email) {
    /*****************/ 
    //@TODO Update Omnisend separately with list id
    /*****************/

    // An object of options to indicate where to post to
    var options = {
      "method": "POST",
      "protocol": 'https:',
      "hostname": 'api.omnisend.com',
      "path": '/v3/contacts',
      "headers": {
        "Content-Type": "application/json",
        "X-API-KEY": process.env.OMNISEND_API_KEY
      }
    };

    let postData = {
      email: email,
      lists: [{ listID: process.env.OMNISEND_LIST_ID }],
      status: 'subscribed',
      statusDate: new Date().toISOString()
    }

    let stringPostData = JSON.stringify(postData);
    console.log(stringPostData);    
  
    //Send post request to omnisend
    var req = http.request(options, function (res) {
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

    /*****************/
    //@TODO Add subscriber to Braze too
    /*****************/

    const external_id = helpers.hash(email);
    postData = {
      "api_key": process.env.BRAZE_API_KEY,
      "attributes": [
        {
          "email": email,
          "external_id": external_id
        }
      ]
    }
    stringPostData = JSON.stringify(postData);

    // // An object of options to indicate where to post to
    var postOptions = {
      "method": "POST",
      "hostname": process.env.BRAZE_INSTANCE_URL,
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

    callback(200, stringPostData);
  }
}

handlers.sha1 = (data, callback) => {
  const queryStringObject = data.queryStringObject;
  const hashedEmail  = helpers.hash(queryStringObject.email);
  callback(null, { 'hashedEmail': hashedEmail});
}

handlers.notFound = (data, callback) => {
  callback(404);
}

module.exports = handlers;
