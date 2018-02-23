const mysql    = require('mysql'),
      dbconfig = require('./config/database.js')

let connection = mysql.createConnection(dbconfig.connection)
connection.query('DROP DATABASE IF EXISTS ' + dbconfig.database)
connection.query('CREATE DATABASE ' + dbconfig.database)

// User table
connection.query(`
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

// Evaluations / Classifications
connection.query(`
  CREATE TABLE ${dbconfig.database}.${dbconfig.classification_table} (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    sample_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL,
    notes TEXT,
    type_of_post VARCHAR(25),
    last_edited TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT UNIQUE (sample_id, user_id),
    UNIQUE INDEX id_UNIQUE2 (id ASC)
    )
  `)

  // Bins to assign samples to users
  connection.query(`
    CREATE TABLE  ${dbconfig.database}.${dbconfig.bin_table} (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id INT NOT NULL,
      sample_id INT NOT NULL,
      assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_edited DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE INDEX id_UNIQUE (id, user_id, sample_id)
    )
    `)

console.log('Success: Database created!')

connection.end()
