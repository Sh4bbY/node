'use strict';

const assert    = require('assert');
const logger    = require('log4js').getLogger('server');

const Server         = require('../Server');
const TwitterService = require('./TwitterService');

const config = {
    express      : {
        protocol: 'http',
        port    : 8888,
        jwtSecret  : 'test-secret-1234567890'
    }
};

logger.setLevel('off');

describe('TwitterService', () => {
    let server;
    let service;
    
    before(() => {
        return mockgoose.prepareStorage().then(() => {
            server  = new Server(config.express);
            service = new TwitterService(server);
            server.registerService(service);
            server.start();
        });
    });
    
    after(() => {
        return server.stop();
    });
});
