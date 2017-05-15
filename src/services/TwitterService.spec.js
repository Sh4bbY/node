'use strict';

const assert    = require('assert');
const logger    = require('log4js').getLogger('server');
const mongoose  = require('mongoose');
const chai      = require('chai');
const chaiHttp  = require('chai-http');
const Mockgoose = require('mockgoose').Mockgoose;

chai.use(chaiHttp);

const config         = require('../../config.json');
const Server         = require('../Server');
const Database       = require('../common/mongo/Database');
const TwitterService = require('./TwitterService');

logger.setLevel('off');


describe('TwitterService', () => {
    let server;
    let service;
    let validToken;
    
    before(() => {
        const mockgoose = new Mockgoose(mongoose);
        
        return mockgoose.prepareStorage().then(() => {
            server  = new Server(config.server);
            service = new TwitterService(server);
            server.registerService(service);
            server.start();
        });
    });
    
    after(() => {
        return server.stop();
    });
});
