/*
 *
 * Main File
 *
 */

const server = require('./lib/server');

const app = {};

app.init = () => {
  // Initiate the server
  server.init();
}

app.init();
