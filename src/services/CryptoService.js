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
        this.db     = server.db;
        
        this.router.get('/api/chart_data/:type', handleChartDataRequest.bind(this));
    }
};

function handleChartDataRequest(req, res) {
    const index = 'chart_data';
    const type  = req.params.type;
    
    this.db.elasticSearch.getAll(index, type, item => ([item.date * 1000, item.close]))
        .then(results => {
            res.json(results);
        })
        .catch(err => logger.error(err));
}

