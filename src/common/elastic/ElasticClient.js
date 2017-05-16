'use strict';

const elasticsearch  = require('elasticsearch');
const logger         = require('log4js').getLogger('server');
const AgentKeepAlive = require('agentkeepalive');

module.exports = class Database {
    constructor(config) {
        this.client = new elasticsearch.Client({
            host           : `${config.host}:${config.port}`,
            log            : config.log,
            createNodeAgent: (connection, config) => {
                return new AgentKeepAlive(connection.makeAgentConfig(config));
            }
        });
    }
    
    ping() {
        return this.client.ping({
            requestTimeout: 1000
        });
    }
    
    getAll(index, type, mappingFunc) {
        mappingFunc   = mappingFunc || ((item) => item);
        const results = [];
        
        const getMoreUntilDone = (response) => {
            // collect data from response
            response.hits.hits.forEach((hit) => {
                results.push(mappingFunc(hit._source));
            });
            
            if (response.hits.total > results.length) {
                return this.client.scroll({
                    scrollId: response._scroll_id,
                    scroll  : '5s'
                }).then(getMoreUntilDone);
            } else {
                return Promise.resolve(results);
            }
        };
        
        return this.client.search({
            index,
            type,
            scroll: '5s',
            body  : {
                query: {
                    match_all: []
                }
            }
        }).then(getMoreUntilDone);
    }
    
    search(index, type, query) {
        return this.client.search({
            index,
            type,
            body: {
                query: {
                    match: {
                        text: query
                    }
                }
            }
        });
    }
    
    
    bulkPrice(type, items) {
        
        const records = [];
        items.forEach(item => {
            records.push({index: {_index: 'chart_data', _type: type, _id: item.date}});
            records.push(item);
        });
        
        // logger.info(`${items.length} items, ${records.length} records`);
        
        return this.client.bulk({
            body: records
        });
    }
    
    indexPrice(type, record) {
        return this.client.index({
            index: 'chart_data',
            type,
            body : record
        });
    }
    
    index(index, type, record) {
        return this.client.index({
            index,
            type,
            id  : record.id,
            body: record
        });
    }
    
    connect() {
    }
    
    disconnect() {
    }
    
    cleanUp() {
    }
};
