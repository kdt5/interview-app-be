const mariadb = require('mysql2');
const dotenv = require('dotenv').config();

const conn = mariadb.createConnection({
    host: process.env.HOSTNAME,
    user: process.env.USERNAME,
    password: process.env.PASSWORD,
    database: DEFAULT_SCHEMA,
    port: process.env.DB_PORT,
    dateStrings: true
});

module.exports = conn;