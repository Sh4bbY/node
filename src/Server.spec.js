'use strict';

const assert = require('chai').assert;
const sinon  = require('sinon');
const logger = require('log4js').getLogger('server');

const Server = require('./Server');

const spy = {
    exit: sinon.spy()
};

logger.setLevel('off');

describe('Server', () => {

    const config = {
        port    : 8888,
        protocol: 'http',
    };

    before(() => {
        this.processExit = process.exit;
        Object.defineProperty(process, 'exit', {value: spy.exit});
    });

    after(() => {
        Object.defineProperty(process, 'exit', {value: this.processExit});
    });

    describe('constructor', () => {
        it('should create a new Server instance without an error', () => {
            const server = new Server(config);
            assert.instanceOf(server, Server);
        });

        it('should thorw an Error if invalid config is passed to the constructor', () => {
            assert.throws(() => {
                new Server({protocol: 'tcp'});
            }, /Invalid Configuration/);
        });
    });

    describe('start', () => {
        it('should start and then stop Server without an error', done => {
            const server = new Server(config);
            server.start().then(() => {
                server.stop().then(() => done());
            });
        });

        it('should return a rejected Promise if the port is in use', done => {
            const serverA = new Server(config);
            const serverB = new Server(config);
            serverA.start().then(() => {
                serverB.start().catch(err => {
                    serverA.stop().then(() => done());
                });
            });
        });
    });

    describe('stop', () => {
        it('should return a rejected Promise if the server has not been yet started', done => {
            const server = new Server(config);
            server.stop().catch(err => {
                assert.equal(err, 'Server has not yet been started');
                done();
            })
        });

        it('should execute process.exit in case of forced stop', done => {
            const server = new Server(config);
            server.start().then(() => {
                server.stop(true);
                assert.isTrue(spy.exit.calledOnce);
                done();
            });
        });
    });
});
