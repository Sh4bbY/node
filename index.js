'use strict';

const Server      = require('./src/Server');
const AuthService = require('./src/services/AuthService');
const BlogService = require('./src/services/BlogService');
const config      = require('./config.json');

const server      = new Server(config.server);
const authService = new AuthService(server);
const blogService = new BlogService(server);

server.registerService(authService);
server.registerService(blogService);

server.start();

