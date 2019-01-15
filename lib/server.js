/*
*
* Server related tasks
*
*/

// Dependancies
const http = require('http');
const url = require('url');
const path = require('path');
const StringDecoder = require('string_decoder').StringDecoder;
const handlers = require('./handlers');
const helpers = require('./helpers');
const { parse } = require('querystring');

const server = {};

server.http = http.createServer((req, res) => {
  // Get Basic Stuff
  const parsedUrl = url.parse(req.url, true);
  const queryStringObject = parsedUrl.query;
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/$/g, '');
  const method = req.method.toLowerCase();
  const headers = req.headers;

  // Get Payload (if any)
  let buffer = '';
  const decoder = new StringDecoder('utf-8');
  req.on('data', (data) => {
    buffer += decoder.write(data);
  });
  req.on('end', () => {
    buffer += decoder.end();
    const parseBuffer = parse(buffer);
    console.log(parseBuffer[0]);
    
    const data = {
      'trimmedPath': trimmedPath,
      'queryStringObject': queryStringObject,
      'method': method,
      'headers': headers,
      'payload': helpers.parseJsonToObject(buffer) == {} ? parse(buffer) : helpers.parseJsonToObject(buffer)
    }

    // Choose Handler
    const chosenHandler = typeof (server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

    chosenHandler(data, (statusCode, payload) => {
      statusCode = typeof (statusCode) == 'number' ? statusCode : 200;
      payload = typeof (payload) == 'object' ? payload : {};

      const payloadString = JSON.stringify(payload);

      res.writeHead(statusCode, {
        'Content-Type': 'application/json'
      });
      res.end(payloadString);

      console.log('Returning the response: ' + payloadString + ' with method ' + method);
    });
  });
});


server.router = {
  'test': handlers.test,
  'user': handlers.user,
  'purchase': handlers.purchase,
  'get_omnisend_subscribers': handlers.get_omnisend_subscribers,
  'post_subscribers_braze': handlers.post_subscribers_braze,
  'omnisend': handlers.omnisend,
  'sha1': handlers.sha1,
  'fb_leadgen_webhook': handlers.fb_leadgen_webhook
}

server.init = () => {
  server.http.listen(process.env.PORT, () => {
    console.log(`Server started at port ${process.env.PORT}`);
  })
}

module.exports = server;
