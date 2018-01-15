'use strict'
const router     = require('express').Router(),
      path       = require('path'),
      mysql      = require('mysql'),
      dbconfig   = require('../../config/database.js')

router.get('/', (req, res) => {
  // Connect and set database
  let connection = mysql.createConnection(dbconfig.connection)
  connection.query('USE classifier')

  // Set a fixed width of the selftext!
  let query = `SELECT p._id AS postId,
                      p.content_text AS contents,
                      u.alias AS user_alias,
                      u.id AS user_id,
                      c.rating AS rating
               FROM classifications c
               INNER JOIN reddit.posts p
                ON p._id = c.sample_id
               INNER JOIN users u
                ON c.user_id = u.id
               `
  connection.query(query, (err, rows) => {
    if (err) return req.flash('error', err)

    // Got data back
    if (rows.length) {
      // Provide a shortened version for the view
      for (let i in rows) {
        if (rows[i].contents.length > 85) {
          // Get the first space after the first 85 characters
          let indexOfSpace = rows[i].contents.indexOf(' ', 85)
          let phrase = rows[i].contents.substring(0, indexOfSpace)
          rows[i].shorttext = phrase + '...'
        }
        else
          rows[i].shorttext = rows[i].contents
      }
    }
    return res.render('history', { data: rows })
  })
})


router.get('/export/', (req, res) => {
  // Connect and set database
  let connection = mysql.createConnection(dbconfig.connection)
  connection.query('USE classifier')

  connection.query('USE classifier')
  // Set a fixed width of the selftext!
  let query = `SELECT c.id AS postId,
                      p.content_text AS contents,
                      u.alias AS user_alias,
                      u.id AS user_id,
                      c.rating AS rating
               FROM classifications c
               INNER JOIN reddit.posts p
                ON p._id = c.sample_id
               INNER JOIN users u
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
