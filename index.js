'use strict';

const Server = require('./src/Server');
const config = require('./config.json');

const server = new Server(config.server);

server.start();

