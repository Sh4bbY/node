'use strict';

const io     = require('socket.io');
const logger = require('log4js').getLogger('server');

module.exports = class SocketService {
    constructor(server) {
        this.server     = server;
        this.router     = server.router;
        this.db         = server.db.mongo;
        this.allClients = [];
        
        this.server.onConnection(openSocket.bind(this));
        this.router.post('/api/chat-msg', storeChatMsg.bind(this));
    }
};

function storeChatMsg(req, res) {
    this.db.query.chat.add(req.body);
    res.sendStatus(200);
}

function openSocket() {
    const namespace = '/api/chat';
    this.io         = io.listen(this.server.server, {path: namespace});
    this.nsp        = this.io.of(namespace);
    this.nsp.on('connection', (socket) => {
        logger.debug(`new client connected to socket namespace ${namespace}`);
        
        const msg = {author: 'System', message: 'someone joined the chat', createdAt: new Date()};
        this.allClients.forEach(client => client.send({data: msg}));
        this.allClients.push(socket);
        
        socket.on('chat-message', (msg) => {
            this.allClients.forEach(client => client.send({data: msg}));
        });
        
        socket.on('disconnect', () => {
            logger.debug(`a client disconnected from socket namespace ${namespace}`);
            const i = this.allClients.indexOf(socket);
            this.allClients.splice(i, 1);
            const msg = {author: 'System', message: 'someone left the chat', createdAt: new Date()};
            this.allClients.forEach(client => client.send({data: msg}));
        });
    });
}
