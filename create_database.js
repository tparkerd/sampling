const mysql    = require('mysql'),
      dbconfig = require('./config/database.js')

let connection = mysql.createConnection(dbconfig.connection)
connection.query('DROP DATABASE IF EXISTS ' + dbconfig.database)
connection.query('CREATE DATABASE ' + dbconfig.database)

connection.query(`\
  CREATE TABLE  ${dbconfig.database}.${dbconfig.user_table} (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    alias VARCHAR(120),
    email VARCHAR(120) NOT NULL,
    password CHAR(60) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE INDEX id_UNIQUE (id ASC),
    UNIQUE INDEX email_UNIQUE (email ASC)
    )
  `)

console.log('Success: Database created!')

connection.end()
