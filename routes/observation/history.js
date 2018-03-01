'use strict'
const router     = require('express').Router(),
      path       = require('path'),
      mysql      = require('mysql'),
      dbconfig   = require('../../config/database.js')

router.get('/', (req, res) => {
  let connection = mysql.createConnection(dbconfig.connection)
  let query = `SELECT p._id AS postId,
                      p.content_text AS txt,
                      u.alias as user_alias,
                      u.id as user_id,
                      c.rating AS rating
               FROM classifier.classifications c
               INNER JOIN reddit.posts p
                ON p._id = c.sample_id
               INNER JOIN classifier.users u
                ON c.user_id = u.id
               ORDER BY c.last_edited DESC
               `
  connection.query(query, (err, rows) => {
    if (err) return req.flash('error', err)

    // Got data back
    if (rows.length) {
      // Provide a shortened version for the view
      for (let i in rows) {
        if (rows[i].txt.length > 85) {
          // Get the first space after the first 85 characters
          let indexOfSpace = rows[i].txt.indexOf(' ', 85)
          let phrase = rows[i].txt.substring(0, indexOfSpace)
          rows[i].shorttext = phrase + '...'
        }
        else
          rows[i].shorttext = rows[i].txt
      }
    }
    return res.render('history', { data: rows })
  })
})

router.get('/export/', (req, res) => {
  // Connect and set database
  let connection = mysql.createConnection(dbconfig.connection)
  let query = `SELECT p._id AS postId,
                      p.content_text AS txt,
                      c.rating AS rating
               FROM classifier.classifications c
               INNER JOIN reddit.posts p
                ON p._id = c.sample_id
               INNER JOIN classifier.users u
                ON c.user_id = u.id
               `
    connection.query(query, [req.params.id], (err, rows) => {
      if (err) return req.flash('error', err)

      // Got data back
      if (rows.length) {
        let headers = { "Content-Disposition": 'attachment;filename=sample_data.csv' }
        res.csv(rows, true, headers)
      }
    })
})

module.exports = router
