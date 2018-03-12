'use strict'
const router = require('express').Router(),
  path = require('path'),
  pool = require('../../config/mysql-pool.js')

router.get('/', (req, res) => {
  // Connect and set database
  pool.getConnection((err, connection) => {
    if (err) {
      connection.release()
      req.flash('error', 'Unknow error was encountered by accessing database.')
      return res.redirect('/')
    }

    let query = `
    SELECT u.id, u.alias, count(c.id) as observationCount
    FROM classifier.users u
    LEFT JOIN classifier.classifications c
    ON u.id = c.user_id
    GROUP BY u.id
    `
    connection.query(query, (err, rows) => {
      connection.release()
      if (err) return req.flash('error', err)

      // Got data back
      if (rows.length) {
        let total = 0
        for (let r in rows) {
          total += rows[r].observationCount
        }
        return res.render('list', { data: rows, total: total })
      }
    })
  })
})

module.exports = router
