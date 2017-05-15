'use strict';

const axios      = require('axios');
const Joi        = require('joi');
const expressJwt = require('express-jwt');
const jwt        = require('jsonwebtoken');
const logger     = require('log4js').getLogger('server');


module.exports = class CryptoService {
    constructor(server) {
        this.server = server;
        this.router = server.router;
        this.db     = server.db.elasticSearch;
    }
    
    importData() {
        const currencyPair = 'BTC_ETH';
        const start        = '1405699200';
        const end          = '9999999999';
        
        return axios.get(`https://poloniex.com/public?command=returnChartData&currencyPair=${currencyPair}&start=${start}&end=${end}&period=14400`)
            .then((res) => this.saveData(currencyPair, res.data));
    }
    
    saveData(type, items) {
        return this.db.bulkPrice(type, items).then((status) => {
            logger.debug(`imported ${items.length} items. took ${status.took}ms`);
        }).catch(err => {
            logger.error(err);
        });
    }
};
