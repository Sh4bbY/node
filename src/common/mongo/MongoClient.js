'use strict';

const mongoose    = require('mongoose');
const logger      = require('log4js').getLogger('server');
const schemata    = require('./schemata');
const Queries     = require('./queries/Queries');
const BlogQueries = require('./queries/BlogQueries');
const UserQueries = require('./queries/UserQueries');
const TodoQueries = require('./queries/TodoQueries');
mongoose.Promise  = Promise;

module.exports = class MongoClient {
    constructor(config) {
        this.config        = config;
        this.connectionUrl = `mongodb://${this.config.host}:${this.config.port}/${this.config.database}`;
        this.model         = {};
        
        Object.keys(schemata).forEach(key => {
            if (mongoose.models[key]) {
                this.model[key] = mongoose.model(key);
                return;
            }
            const schema    = new mongoose.Schema(schemata[key]);
            this.model[key] = mongoose.model(key, schema);
        });
        
        this.query = {
            blog    : new BlogQueries(this.model.Post),
            user    : new UserQueries(this.model.User),
            todo    : new TodoQueries(this.model.Todo),
            feedback: new Queries(this.model.Feedback),
            chat    : new Queries(this.model.Chat),
            revoked : new Queries(this.model.RevokedToken),
            tweet   : new Queries(this.model.Tweet)
        };
        
        const db = mongoose.connection;
        
        db.on('connecting', () => {
            logger.info('connecting to MongoDB...');
        });
        db.on('error', (error) => {
            logger.error('Error in MongoDb connection: ' + error);
            logger.error(' trying to reconnect');
            this.disconnect();
            this.connect();
        });
        db.on('connected', () => {
            logger.info('MongoDB connected!');
        });
        db.once('open', () => {
            logger.info('MongoDB connection opened!');
        });
        db.on('reconnected', () => {
            logger.info('MongoDB reconnected!');
        });
        db.on('disconnected', () => {
            logger.info('MongoDB disconnected!');
        });
    }
    
    connect() {
        if (!mongoose.connection.readyState) {
            return mongoose.connect(this.connectionUrl, {server: {auto_reconnect: true}});
        }
    }
    
    disconnect() {
        return mongoose.connection.close();
    }
    
    cleanUp() {
        const removePromises = Object.keys(this.model).map(key => this.model[key].collection.remove({}));
        return Promise.all(removePromises);
    }
};
