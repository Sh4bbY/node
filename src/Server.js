'use strict';

const express     = require('express');
const compression = require('compression');
const bodyParser  = require('body-parser');
const bearerToken = require('express-bearer-token');
const logger      = require('log4js').getLogger('server');
const Joi         = require('joi');

const configSchema = Joi.object().keys({
    protocol: Joi.string().valid('http', 'https').required(),
    port    : Joi.number().min(1).max(99999).required(),
    secret  : Joi.string().min(20).max(40).required()
}).required().options({abortEarly: false});

class Server {
    constructor(config) {
        const validationResult = Joi.validate(config, configSchema);
        if (!!validationResult.error) {
            validationResult.error.details.forEach(err => logger.error(err.message));
            throw new Error('Invalid Configuration', validationResult.error);
        }
        this.config   = config;
        this.app      = express();
        this.router   = express.Router();
        this.services = [];
        this.db       = {};
    }
    
    /**
     * starts the server
     * @return Promise
     */
    start() {
        return new Promise((resolve, reject) => {
            this._registerMiddleware();
            
            Object.keys(this.db).forEach(key => this.db[key].connect());
            this.server = require(this.config.protocol).createServer(this.app);
            this.server.listen(this.config.port, () => {
                logger.info(`Server is started and listening on port ${this.config.port}`);
                return resolve(this.server);
            });
            this.server.on('error', err => {
                logger.error('Server Error: ', err.message);
                return reject(err.message);
            });
            
            process.on('SIGTERM', this.stop.bind(this, true));   // listen for TERM signal .e.g. kill
            process.on('SIGINT', this.stop.bind(this));    // listen for INT signal e.g. Ctrl-C
        });
    }
    
    /**
     * stops the server
     * @param force Boolean
     * @return Promise
     */
    stop(force) {
        if (force) {
            logger.warn('Forced stop');
            process.exit(0);
        }
        
        return new Promise((resolve, reject) => {
            if (!this.server) {
                return reject('Server has not yet been started');
            }
            
            Object.keys(this.db).forEach(key => this.db[key].disconnect());
            this.server.close(() => {
                logger.info('Closed all remaining connections.');
                return resolve();
            });
        });
    }
    
    /**
     * registers a new database instance to the server.
     * @param name  the name of the database
     * @param database  the database Instance
     */
    registerDb(name, database) {
        this.db[name] = database;
    }
    
    /**
     * registers a new service to the server.
     * @param service  An Instance of an service
     */
    registerService(service) {
        this.services.push(service);
    }
    
    _registerMiddleware() {
        this.app.use(bearerToken());
        this.app.use(compression());                                    // use gzip compression for the response body
        this.app.use(bodyParser.urlencoded({extended: false}));         // parse application/x-www-form-urlencoded
        this.app.use(bodyParser.json());                                // parse application/json
        //this.app.use(bearerToken());
        
        this.app.use(this.router);
        
        this.app.use(Server._errorHandler);
    }
    
    static _errorHandler(err, req, res, next) {
        let status = 500;
        //if error was thrown form express-jwt middleware
        if (err.name === 'UnauthorizedError') {
            status = 401;
        }
        logger.error('Express Error Handler: ', err.message);
        return res.status(status).send(err.message);
    }
}

module.exports = Server;
