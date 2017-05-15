'use strict';

const Queries = require('./Queries');;

module.exports = class BlogQueries extends Queries {
    add(blogPostData) {
        blogPostData.createdAt = Date.now();
        return super.add(blogPostData);
    }
    
    get(settings) {
        if (!settings.hasOwnProperty('sort')) {
            settings.sort = {createdAt: 'desc'};
        }
        return super.get(settings);
    }
};
