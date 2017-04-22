'use strict';

const assert      = require('chai').assert;
const sinon       = require('sinon');
const mockRequire = require('mock-require');
const logger      = require('log4js').getLogger('server');

const mock = {
          mongoose: {
              Schema : class Schema {
                  save(cb) {
                      cb();
                  }
              },
              connection: {},
              connect: sinon.spy(),
              model  : () => class Model {
                  save(cb) {
                      cb('some error');
                  }
            
                  static get collection() {
                      return {drop: sinon.spy()};
                  };
            
                  static findOne() {
                  };
              }
          },
          brcrypt : {
              hash: () => Promise.resolve('generated mock-hash')
          }
      }
;
let Database;
logger.setLevel('off');

describe('Database', () => {
    
    before(() => {
        mockRequire('mongoose', mock.mongoose);
        mockRequire('bcrypt', mock.brcrypt);
        Database = mockRequire.reRequire('./Database');
    });
    
    after(() => {
        mockRequire.stop('mongoose');
    });
    
    describe('connect', () => {
        it('should connect', () => {
            const db = new Database();
            db.connect();
            assert.equal(mock.mongoose.connect.callCount, 1);
        });
    });
    
    describe('findUserByName', () => {
        it('findUserByName', () => {
            const db = new Database();
            db.findUserByName();
        });
    });
    
    describe('cleanUp', () => {
        it('cleans Up', () => {
            const db = new Database();
            db.cleanUp();
        });
    });
    
    describe('createUser', () => {
        it('creates a User', () => {
            const db = new Database();
            db.connect();
            const user = {
                name    : 'dummy',
                email   : 'someEmail',
                password: 'somePw'
            };
            db.createUser(user);
        });
    });
});
