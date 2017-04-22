'use strict';

const rewire = require('rewire');
const assert = require('chai').assert;
const sinon  = require('sinon');
const logger = require('log4js').getLogger('server');

const spy  = {
    status: sinon.spy()
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
        status: (code) => {
            spy.status(code);
            return mock.res;
        },
        send: sinon.spy(),
        json  : sinon.spy()
    }
};

const AuthService = rewire('./AuthService');

logger.setLevel('off');

describe('AuthService', () => {
    describe('constructor', () => {
        it('should create a new Service instance without an error', () => {
            const service = new AuthService(mock.server);
            assert.instanceOf(service, AuthService);
        });
    });
    
    describe('handleLoginByToken', () => {
        it('should start and then stop Server without an error', () => {
            const handleLoginByToken = AuthService.__get__('handleLoginByToken');
            handleLoginByToken(mock.req, mock.res);
        });
    });
    
    describe('handleLogin', () => {
        it('should throw an error if parameters are not valid', () => {
            const handleLogin = AuthService.__get__('handleLogin');
            handleLogin(mock.req, mock.res);
            assert.isTrue(spy.status.calledWith(403));
        });
        
        it('rejected findByEmail Promise', () => {
            mock.req.body     = {
                email   : 'someEmail@address.com',
                password: 'somePlainTextPw'
            };
            const mockContext = {db: {findUserByEmail: () => Promise.reject()}};
            const handleLogin = AuthService.__get__('handleLogin');
            handleLogin.bind(mockContext)(mock.req, mock.res);
            
        });
        
        it('user not found', () => {
            mock.req.body     = {
                email   : 'someEmail@address.com',
                password: 'somePlainTextPw'
            };
            const user        = null;
            const mockContext = {db: {findUserByEmail: () => Promise.resolve(user)}};
            const handleLogin = AuthService.__get__('handleLogin');
            handleLogin.bind(mockContext)(mock.req, mock.res);
        });
        
        it('user not found', () => {
            mock.req.body     = {
                email   : 'someEmail@address.com',
                password: 'admin'
            };
            const user        = {
                password: '$2a$10$cvqxqgS4Z8KayUoykpkAc.TH6zFORu5M4jxB7.yUV.DjgP3a/H1hy'
            };
            const mockContext = {db: {findUserByEmail: () => Promise.resolve(user)}};
            const handleLogin = AuthService.__get__('handleLogin');
            handleLogin.bind(mockContext)(mock.req, mock.res);
        });
    });
    
    describe('handleRegistration', () => {
        it('should handle user registration', () => {
            const handleRegistration = AuthService.__get__('handleRegistration');
            const req                = {
                body: {
                    name          : 'test-username',
                    email         : 'test@test.de',
                    password      : 'test-password',
                    password_check: 'test-password'
                }
            };
            const context            = {
                db: {
                    findUserByNameOrEmail: () => {
                        return Promise.resolve({});
                    }
                }
            };
            handleRegistration.bind(context)(req, mock.res);
        });
    });
});
