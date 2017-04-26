'use strict';

const Queries = require('./Queries');
const logger  = require('log4js').getLogger('server');

module.exports = class BlogQueries extends Queries {
    add(blogPostData) {
        blogPostData.createdAt = Date.now();
        return super.add(blogPostData);
    }
};
