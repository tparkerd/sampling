const mysql = require('mysql'),
  dbconfig = require('./database.js')

let pool = mysql.createPool(dbconfig.connection)

module.exports = pool
