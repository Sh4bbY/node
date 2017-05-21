'use strict';

const mysql  = require('mysql');
const logger = require('log4js').getLogger('server');

module.exports = class MysqlClient {
    constructor(config) {
        this.connection = mysql.createConnection(config);
    }
    
    query(query, values) {
        return new Promise((resolve, reject) => {
            this.connection.query(query, values, (err, results) => {
                if (err) {
                    logger.error('mysql query error:', err);
                    return reject(err);
                }
                return resolve(results);
            });
        });
    }
    
    connect() {
        /*
         return new Promise((resolve, reject) => {
         this.connection.connect((err) => {
         if (err) {
         if (err.code === 'ECONNREFUSED' && this.connectionFailures < 3) {
         this.connectionFailures++;
         logger.warn(this.connectionFailures + '. mysql attempt to connect failed, retrying in 2sek:');
         return new Promise(resolve => setTimeout(resolve, 2000)).then(() => this.connect());
         } else {
         logger.error('mysql connect error:', err);
         return reject(err);
         }
         }
         return resolve();
         });
         });
         */
    }
    
    disconnect() {
        return new Promise((resolve, reject) => {
            this.connection.end((err) => {
                if (err) {
                    logger.error('mysql disconnect error:', err);
                    return reject(err);
                }
                return resolve();
            });
        });
    }
};
