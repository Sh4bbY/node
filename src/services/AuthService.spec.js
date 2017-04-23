'use strict';

const logger    = require('log4js').getLogger('server');
const mongoose  = require('mongoose');
const chai      = require('chai');
const chaiHttp  = require('chai-http');
const Mockgoose = require('mockgoose').Mockgoose;
const assert    = chai.assert;

chai.use(chaiHttp);

const Server      = require('../Server');
const AuthService = require('./AuthService');

logger.setLevel('off');

const validUser = {
    name    : 'test-user',
    email   : 'test@user.de',
    password: 'test-password'
};

describe('AuthService', () => {
    let server;
    let service;
    let validToken;
    
    before((done) => {
        const mockgoose = new Mockgoose(mongoose);
        const config = {
            'protocol': 'http',
            'port'    : 8101,
            'secret'  : 'LPjNP5H0#o1R(5}5r{8Iet5Bf8'
        };
        validToken   = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU4Zjk0NjY3ODdmOTAzNmZkZjQxM2YyZCIsIm5hbWUiOiJzaGFiYnkiLCJlbWFpbCI6ImFzZEBhc2QuZGUiLCJpYXQiOjE0OTI5MDIwOTJ9.J-OO_LX1NplMfKn4yyY17f796smBVVGSLuYOtntug8s';
        
        mockgoose.prepareStorage().then(() => {
            server  = new Server(config);
            service = new AuthService(server);
            server.registerService(service);
            server.start();
            done();
        });
    });
    
    after((done) => {
        server.stop().then(() => done());
    });
    
    describe('handleRegistration', () => {
        
        it('should return status 400 if the request was invalid', (done) => {
            const body = {};
            chai.request(server.app)
                .post('/api/registration')
                .send(body)
                .end((err, res) => {
                    assert.equal(res.status, 400);
                    done();
                });
        });
        
        it('should return status 400 if passwords do not match', (done) => {
            const body = {
                name          : validUser.name,
                email         : validUser.email,
                password      : 'passwordA',
                password_check: 'passwordB'
            };
            chai.request(server.app)
                .post('/api/registration')
                .send(body)
                .end((err, res) => {
                    assert.equal(res.status, 400);
                    done();
                });
        });
        
        it('should return status 400 if user name or email is already registered', (done) => {
            const body = {
                name          : 'dummy',
                email         : validUser.email,
                password      : 'passwordA',
                password_check: 'passwordA'
            };
            chai.request(server.app)
                .post('/api/registration')
                .send(body)
                .end((err, res) => {
                    assert.equal(res.status, 400);
                    done();
                });
        });
        
        it('should return status 200 if request was valid', (done) => {
            const body = {
                name          : validUser.name,
                email         : validUser.email,
                password      : validUser.password,
                password_check: validUser.password
            };
            chai.request(server.app)
                .post('/api/registration')
                .send(body)
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    done();
                });
        });
    });
    
    describe('handleLogin', () => {
        it('should return status 400 if the request was invalid', (done) => {
            const body = {};
            chai.request(server.app)
                .post('/api/login')
                .send(body)
                .end((err, res) => {
                    assert.equal(res.status, 400);
                    done();
                })
        });
        
        it('should return status 400 if the name could not be found', (done) => {
            const body = {name: 'non-existing-user', password: 'invalid-pasword'};
            chai.request(server.app)
                .post('/api/login')
                .send(body)
                .end((err, res) => {
                    assert.equal(res.status, 400);
                    done();
                })
        });
        
        it('should return status 400 if the password was not valid', (done) => {
            const body = {
                name    : validUser.name,
                password: 'invalid-password'
            };
            chai.request(server.app)
                .post('/api/login')
                .send(body)
                .end((err, res) => {
                    assert.equal(res.status, 400);
                    done();
                })
        });
        
        it('should return status 200 if login credentials are valid', (done) => {
            const body = {
                name    : validUser.name,
                password: validUser.password
            };
            chai.request(server.app)
                .post('/api/login')
                .send(body)
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    done();
                });
        });
    });
    
    describe('handleLoginByToken', () => {
        it('should return status 400 if an invalid token was sent', (done) => {
            const body = {token: 'someInvalidToken'};
            chai.request(server.app)
                .post('/api/loginByToken')
                .send(body)
                .end((err, res) => {
                    assert.equal(res.status, 400);
                    done();
                })
        });
        
        it('should return status 200 if an valid token was sent', (done) => {
            const body = {token: validToken};
            chai.request(server.app)
                .post('/api/loginByToken')
                .send(body)
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    done();
                })
        });
    });
    
    describe('logout', () => {
        it('should return status 200 if the request was valid', (done) => {
            chai.request(server.app)
                .get('/api/logout')
                .set('Authorization', 'Bearer ' + validToken)
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    done();
                })
        });
    });
});
