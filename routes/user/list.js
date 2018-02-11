'use strict'
const router     = require('express').Router(),
      path       = require('path'),
      mysql      = require('mysql'),
      dbconfig   = require('../../config/database.js')

router.get('/', (req, res) => {
  // Connect and set database
  let connection = mysql.createConnection(dbconfig.connection)
  connection.query('USE ' + dbconfig.database)

  let query = `
              SELECT u.id, u.alias, count(c.id) as observationCount
              FROM classifier.users u
              LEFT JOIN classifier.classifications c
                ON u.id = c.user_id
              GROUP BY u.id
              `
  connection.query(query, (err, rows) => {
    if (err) return req.flash('error', err)

    // Got data back
    if (rows.length) {
      return res.render('list', { data: rows })
    }
  })
})

module.exports = router
