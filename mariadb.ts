import mariadb, { ConnectionOptions } from 'mysql2';
import 'dotenv/config';

const access: ConnectionOptions = {
    host: process.env.HOSTNAME,
    user: process.env.USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DEFAULT_SCHEMA,
    port: 31901,
    dateStrings: true
  };

const conn = mariadb.createConnection(access);

export default conn;