'use strict';

const Server          = require('./src/Server');
const MongoDb         = require('./src/common/mongo/Database');
const ElasticSearch   = require('./src/common/elasticsearch/Database');
const AuthService     = require('./src/services/AuthService');
const BlogService     = require('./src/services/BlogService');
const SocketService   = require('./src/services/SocketService');
const FeedbackService = require('./src/services/FeedbackService');
const TodoService     = require('./src/services/TodoService');
const TwitterService  = require('./src/services/TwitterService');
const CryptoService   = require('./src/services/CryptoService');
const config          = require('./config.json');

const server        = new Server(config.server);
const mongo         = new MongoDb(config.mongodb);
const elasticSearch = new ElasticSearch(config.elasticsearch);

server.registerDb('mongo', mongo);
server.registerDb('elasticSearch', elasticSearch);

const authService     = new AuthService(server);
const blogService     = new BlogService(server);
const socketService   = new SocketService(server);
const feedbackService = new FeedbackService(server);
const todoService     = new TodoService(server);
const twitterService  = new TwitterService(server);
const cryptoService   = new CryptoService(server);

server.registerService(authService);
server.registerService(blogService);
server.registerService(socketService);
server.registerService(feedbackService);
server.registerService(todoService);
server.registerService(twitterService);
server.registerService(cryptoService);

server.start();

