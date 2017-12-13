const env = require('dotenv')

env.load()

module.exports = {
  'connection' : {
    'host': process.env.DBHOST,
    'user': process.env.DBUSER,
    'password': process.env.DBPASS
  },
    'database': process.env.DBNAME,
    'user_table': process.env.USERTABLE,
    'classification_table': process.env.CLASSIFICATIONTABLE
}
