'use strict';

const Server          = require('./src/Server');
const SecurityService = require('./src/services/AuthService');
const config          = require('./config.json');

const server          = new Server(config.server);

server.registerService(SecurityService);
server.start();

