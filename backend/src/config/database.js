const mysql = require("mysql2/promise");

const createPool = (config) => {
    return mysql.createPool({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        charset: "utf8mb4"
    });
};

const webDB = createPool({
    host: process.env.WEB_DB_HOST,
    port: process.env.WEB_DB_PORT,
    user: process.env.WEB_DB_USER,
    password: process.env.WEB_DB_PASSWORD,
    database: process.env.WEB_DB_NAME
});

const lsDB = createPool({
    host: process.env.LS_DB_HOST,
    port: process.env.LS_DB_PORT,
    user: process.env.LS_DB_USER,
    password: process.env.LS_DB_PASSWORD,
    database: process.env.LS_DB_NAME
});

const gsDB = createPool({
    host: process.env.GS_DB_HOST,
    port: process.env.GS_DB_PORT,
    user: process.env.GS_DB_USER,
    password: process.env.GS_DB_PASSWORD,
    database: process.env.GS_DB_NAME
});

module.exports = {
    webDB,
    lsDB,
    gsDB
};