'use strict';

const Server          = require('./src/Server');
const MongoClient     = require('./src/common/mongo/MongoClient');
const ElasticClient   = require('./src/common/elastic/ElasticClient');
const MysqlClient     = require('./src/common/mysql/MysqlClient');
const AuthService     = require('./src/services/AuthService');
const BlogService     = require('./src/services/BlogService');
const SocketService   = require('./src/services/SocketService');
const FeedbackService = require('./src/services/FeedbackService');
const TodoService     = require('./src/services/TodoService');
const TwitterService  = require('./src/services/TwitterService');
const CryptoService   = require('./src/services/CryptoService');
const config          = require('./config.json');
const secrets         = require('./secrets.json');

/** assign secrets to config */
Object.keys(config).forEach(key => Object.assign(config[key], secrets[key]));

const mongo   = new MongoClient(config.mongodb);
const elastic = new ElasticClient(config.elasticsearch);
const mysql   = new MysqlClient(config.mysql);
const server  = new Server(config.express);

server.registerDb('mongo', mongo);
server.registerDb('elastic', elastic);
server.registerDb('mysql', mysql);

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

