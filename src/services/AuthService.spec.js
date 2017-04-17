'use strict';

const assert = require('chai').assert;
const sinon  = require('sinon');
const logger = require('log4js').getLogger('server');

const AuthService = require('./AuthService');

const spy  = {
    exit: sinon.spy()
};
const mock = {
    server: {
        config: {
            secret: 'fakeSecret'
        },
        router: {
            get : sinon.spy(),
            post: sinon.spy()
        }
    },
    req   : {
        body: {}
    },
    res   : {
        status: (code) => mock.res,
        send  : sinon.spy(),
        json  : sinon.spy()
    }
};

logger.setLevel('off');

describe('AuthService', () => {
    describe('constructor', () => {
        it('should create a new Service instance without an error', () => {
            const service = new AuthService(mock.server);
            assert.instanceOf(service, AuthService);
        });
    });
    
    describe('_handleLoginByToken', () => {
        it('should start and then stop Server without an error', () => {
            AuthService._handleLoginByToken(mock.req, mock.res);
        });
    });
    
    describe('_handleLogin', () => {
        it('should throw an error if parameters are not valid', () => {
            assert.throws(() => {
                AuthService._handleLogin(mock.req, mock.res);
            });
        });
    
        it('rejected findByEmail Promise', () => {
            mock.req.body = {
                email   : 'someEmail@address.com',
                password: 'somePlainTextPw'
            };
            const mockContext = {db: {findUserByEmail: () => Promise.reject()}};
            AuthService._handleLogin.bind(mockContext)(mock.req, mock.res);
        });
    
        it('user not found', () => {
            mock.req.body = {
                email   : 'someEmail@address.com',
                password: 'somePlainTextPw'
            };
            const user = null;
            const mockContext = {db: {findUserByEmail: () => Promise.resolve(user)}};
            AuthService._handleLogin.bind(mockContext)(mock.req, mock.res);
        });
    
        it('user not found', () => {
            mock.req.body = {
                email   : 'someEmail@address.com',
                password: 'admin'
            };
            const user = {
                password: '$2a$10$cvqxqgS4Z8KayUoykpkAc.TH6zFORu5M4jxB7.yUV.DjgP3a/H1hy'
            };
            const mockContext = {db: {findUserByEmail: () => Promise.resolve(user)}};
            AuthService._handleLogin.bind(mockContext)(mock.req, mock.res);
        });
    });
    
    describe('_handleRegistration', () => {
        it('should start and then stop Server without an error', () => {
            AuthService._handleRegistration(mock.req, mock.res);
        });
    });
    
});
