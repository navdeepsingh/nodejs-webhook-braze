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

  //@TODO Parse Address and add
  //"default_address":{"id":1529909870665,"customer_id":1382692192329,"first_name":"Adna","last_name":"Purnomo","company":null,"address1":"47 Scotts Road #13-00 Goldbell Towers","address2":"Office building","city":"Singapore","province":null,"country":"Singapore","zip":"228233","phone":"9296 3507","name":"Adna Purnomo","province_code":null,"country_code":"SG","country_name":"Singapore","default":true}

  if (payload.default_address !== undefined) {
    payload.address1 = payload.default_address.address1;
    payload.address2 = payload.default_address.address2;
    payload.zip = payload.default_address.zip;
    payload.phone = payload.default_address.phone;
    payload.country = payload.default_address.country;
  }

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

// Define Purchase Handler
handlers.fulfillment = (data, callback) => {
  const acceptableMethods = ['post'];
  const dataMethod = data.method;
  if (acceptableMethods.indexOf(dataMethod) > -1) {
    handlers._fulfillment[dataMethod](data, callback);
  } else {
    callback(405);
  }
}

// Define Sub handler method
handlers._fulfillment = {}

handlers._fulfillment.post = (data, callback) => {
  const payload = data.payload;

  // Grab purchase items
  const orderItems = payload.line_items;

  // Customer id
  const customerEmail = payload.customer !== 'undefined' ? helpers.hash(payload.customer.email) : null;

  // Update required data
  orderItems.forEach(itemDetail => {
    itemDetail.product_id = itemDetail.name;
    itemDetail.time = payload.updated_at;
    itemDetail.external_id = customerEmail;
    itemDetail.discounted_price = parseFloat(itemDetail.discounted_price);
    itemDetail.line_price = parseFloat(itemDetail.line_price);
    itemDetail.original_line_price = parseFloat(itemDetail.original_line_price);
    itemDetail.original_price = parseFloat(itemDetail.original_price);
    itemDetail.price = parseFloat(itemDetail.price);
    itemDetail.currency = 'SGD';
    itemDetail.properties = { 'fulfillment_status': itemDetail.fulfillment_status };
    itemDetail._update_existing_only = true;
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

// Define Purchase Handler
handlers.cancel = (data, callback) => {
  const acceptableMethods = ['post'];
  const dataMethod = data.method;
  if (acceptableMethods.indexOf(dataMethod) > -1) {
    handlers._cancel[dataMethod](data, callback);
  } else {
    callback(405);
  }
}

// Define Sub handler method
handlers._cancel = {}

handlers._cancel.post = (data, callback) => {
  const payload = data.payload;

  // Customer id
  const customerEmail = payload.customer !== 'undefined' ? helpers.hash(payload.customer.email) : null;  

  const eventData = {
    'external_id': customerEmail,
    'name': 'Order Cancelled',
    'time': payload.cancelled_at
  }

  const postData = {
    "api_key": process.env.BRAZE_API_KEY,
    "events": [eventData]
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

handlers.post_subscribers_braze = (data, callback) => {
  const subscribers = [
  ];

  subscribers.forEach(subscriberEmail => {
    let hashedSubscriberEmail = helpers.hash(subscriberEmail);
    let subscriberCreatedAt = '2019-01-10T00:00:00Z';

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
handlers.braze = (data, callback) => {
  const acceptableMethods = ['get'];
  const dataMethod = data.method;
  if (acceptableMethods.indexOf(dataMethod) > -1) {
    handlers._braze[dataMethod](data, callback);
  } else {
    callback(405);
  }
}

handlers._braze = {};

handlers._braze.get = (data, callback) => {
  EMAIL_ADDRESS_REGEX = new RegExp("(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|\"(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21\\x23-\\x5b\\x5d-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])*\")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21-\\x5a\\x53-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])+)\\])");
  const email = typeof (data.queryStringObject.email) == 'string' && data.queryStringObject.email.match(EMAIL_ADDRESS_REGEX) !== null ? data.queryStringObject.email.trim() : false;

  
  if (email) {
    // Send this email to Braze
    const postData = postToBraze(email);
    console.log(postData);
    callback(200, postData);
  }
}

handlers.sha1 = (data, callback) => {
  const queryStringObject = data.queryStringObject;
  const hashedEmail  = helpers.hash(queryStringObject.email);
  callback(null, { 'hashedEmail': hashedEmail} );
}

handlers.fb_leadgen_webhook = (data, callback) => {
  const queryStringObject = data.queryStringObject;  

  // For Verification of Subscription
  let result = '';
  if (queryStringObject["hub.verify_token"] == 'falconagencyrocking123') {
    result = queryStringObject["hub.challenge"] ;
  }

  //Get post data
  payload = data.payload;
  formId = payload.entry[0].changes[0].value.form_id;

  console.log('LeadGen ID ', formId);

  //An object of options to indicate where to send request
  var getOptions = {
    "method": "GET",
    "protocol": 'https:',
    "hostname": 'graph.facebook.com',
    "path": `/v3.2/${formId}/leads?access_token=${process.env.FB_USER_ACCESS_TOKEN}`
  };

  //Send get request to fb graph url
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
      if(jsonResponse.data) {
        const leadGenEmail = jsonResponse.data[0].field_data[0].values[0];

        console.log(jsonResponse.data);
        console.log('Email : ', leadGenEmail);


        //@TODO Send this email to Braze
        const postData = postToBraze(leadGenEmail);
        console.log(postData);
      }
    });
  });

  req.on('error', function (e) {
    console.log('problem with request: ' + e.message);
  });

  req.on('timeout', function (e) {
    console.log('timout with request: ' + e.message);
  });
  req.end();
  callback(null, { 'Success': 'Fetched Lead Gen Data' });
  
}

handlers.notFound = (data, callback) => {
  callback(404);
}

postToBraze = (email) => {
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

  // An object of options to indicate where to post to
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

  return stringPostData;
}

module.exports = handlers;
