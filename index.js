'use strict';

const Server          = require('./src/Server');
const Database        = require('./src/common/Database');
const AuthService     = require('./src/services/AuthService');
const BlogService     = require('./src/services/BlogService');
const SocketService   = require('./src/services/SocketService');
const FeedbackService = require('./src/services/FeedbackService');
const TodoService     = require('./src/services/TodoService');
const config          = require('./config.json');

const server   = new Server(config.server);
const database = new Database(config.mongodb);

server.registerDb('mongo', database);

const authService     = new AuthService(server);
const blogService     = new BlogService(server);
const socketService   = new SocketService(server);
const feedbackService = new FeedbackService(server);
const todoService     = new TodoService(server);

server.registerService(authService);
server.registerService(blogService);
server.registerService(socketService);
server.registerService(feedbackService);
server.registerService(todoService);

server.start();

