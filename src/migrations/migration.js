const Database = require('../common/Database');
const db       = new Database();

db.connect();
db.cleanUp();
db.createUser({
    name    : 'admin',
    email   : 'admin@admins.de',
    password: 'admin'
});
