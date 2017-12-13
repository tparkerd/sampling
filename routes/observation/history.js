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
  let query = `SELECT c.id AS postId,
                      p.selftext AS contents,
                      u.alias AS user_alias,
                      u.id AS user_id,
                      c.rating AS rating
               FROM classifications c
               INNER JOIN reddit.posts p
                ON p.id = c.sample_id
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

          console.log('Text: ' + rows[i].shorttext);
      }
      return res.render('history', { data: rows })
    }
  })
})

module.exports = router
