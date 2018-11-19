/*
 *
 * Nodejs Server
 * 
 */

const http = require('http');
const url = require('url');
const path = require('path');
const StringDecoder = require('string_decoder').StringDecoder;
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');
const config = require('./lib/config');

const server = http.createServer((req, res) => {
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

    const data = {
      'trimmedPath': trimmedPath,
      'queryStringObject': queryStringObject,
      'method': method,
      'headers': headers,
      'payload': helpers.parseJsonToObject(buffer)
    }

    // Choose Handler
    const chosenHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

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

server.listen(config.port, () => {
  console.log(`Server started at port ${config.port}`);  
})

const router = {
  'test': handlers.test
}


