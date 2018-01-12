const mysql    = require('mysql'),
      dbconfig = require('./config/database.js')

let connection = mysql.createConnection(dbconfig.connection)

try {
  let query = 'CREATE DATABASE ' + dbconfig.database
  connection.query(query, (err, rows) => {
    if (err) throw err
  })

  // User table
  query = `
    CREATE TABLE  ${dbconfig.database}.${dbconfig.user_table} (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      alias VARCHAR(120),
      email VARCHAR(120) NOT NULL,
      password CHAR(60) NOT NULL,
      PRIMARY KEY (id),
      UNIQUE INDEX id_UNIQUE (id ASC),
      UNIQUE INDEX email_UNIQUE (email ASC)
      )
    `
  connection.query(query, (err, rows) => {
    if (err) throw err
  })

  // Samples / Observations
  query = `
    CREATE TABLE ${dbconfig.database}.${dbconfig.classification_table} (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      sample_id INT NOT NULL,
      user_id INT NOT NULL,
      rating INT NOT NULL,
      notes TEXT,
      type_of_post VARCHAR(25) NOT NULL,
      PRIMARY KEY (id),
      UNIQUE INDEX id_UNIQUE2 (id ASC)
      )
    `
  connection.query(query, (err, rows) => {
    if (err) throw err
  })
  console.log('Success: Database created!')
} catch (e) {
  console.log('Failed: Database was NOT created.')
} finally {
  connection.end()
}
