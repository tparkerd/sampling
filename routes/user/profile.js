'use strict'
const router     = require('express').Router(),
      path       = require('path'),
      mysql      = require('mysql'),
      dbconfig   = require('../../config/database.js'),
      jsonexport = require('jsonexport'),
      csv        = require('csv-express')


// NOTE: Consider using middleware to get all the data instead, or at least for
//       the post data
router.get('/:id', (req, res) => {
  let connection = mysql.createConnection(dbconfig.connection)
  connection.query('USE ' + dbconfig.database)
  let query = `SELECT *
               FROM users
               WHERE id = ?
               `
  let data = {}

  // NOTE: consider escaping the req.param.id
  connection.query(query, [req.params.id], (err, rows) => {
    if (err) return req.flash('error', 'Unknown error occurred while accessing database.')

    if (rows.length) data.user = rows[0]

  connection.query('USE classifier')
  // Set a fixed width of the selftext!
  query = `SELECT COUNT(*) AS classificationCount
               FROM classifications c
               INNER JOIN reddit.posts p
                ON p._id = c.sample_id
               INNER JOIN users u
                ON c.user_id = u.id
               WHERE u.id = ?
               `
    connection.query(query, [req.params.id], (err, rows) => {
      if (err) return req.flash('error', err)

      // Got data back
      if (rows.length) data.user.classificationCount = rows[0].classificationCount
    })

    connection.query('USE classifier')

   query = `SELECT p._id AS postId,
                        p.content_text AS contents,
                        u.alias AS user_alias,
                        u.id AS user_id,
                        CASE c.rating
                          WHEN 0 THEN 'absent'
                          WHEN 1 THEN 'mild'
                          WHEN 2 THEN 'moderate'
                          WHEN 3 THEN 'severe'
                          ELSE 'unknown' END AS ratingText,
                        c.rating AS rating
                 FROM classifications c
                 INNER JOIN reddit.posts p
                  ON p._id = c.sample_id
                 INNER JOIN users u
                  ON c.user_id = u.id
                 WHERE u.id = ?
                 `

    data.observations = []
    connection.query(query, [req.params.id], (err, rows) => {
      if (err) return req.flash('error', err)

      // Got data back
      if (rows.length) {
        // Provide a shortened version for the view
        for (let i in rows) {
          if (rows[i].contents.length > 85) {
            // Get the first space after the first 85 characters
            let cutoffIndex = rows[i].contents.indexOf(' ', 85)
            rows[i].shorttext = rows[i].contents.substring(0, cutoffIndex) + '...'
          }
          else
            rows[i].shorttext = rows[i].contents
        }
        data.observations = rows
      }
      return res.render('profile', { data: data })
    })
  })
})

router.get('/export/:id', (req, res) => {
  // Connect and set database
  let connection = mysql.createConnection(dbconfig.connection)
  connection.query('USE classifier')

  connection.query('USE classifier')
  // Set a fixed width of the selftext!
  let query = `SELECT c.sample_id AS postId,
                       p.content_text AS contents,
                       p.title AS titleText,
                       u.alias AS user_alias,
                       u.id AS user_id,
                       c.rating AS rating,
                       CASE c.ratingText
                         WHEN 0 THEN 'absent'
                         WHEN 1 THEN 'mild'
                         WHEN 2 THEN 'moderate'
                         WHEN 3 THEN 'severe'
                         ELSE 'unknown' END AS ratingText,
                       c.rating AS rating
                FROM classifications c
                INNER JOIN reddit.posts p
                 ON p._id = c.sample_id
                INNER JOIN users u
                 ON c.user_id = u.id
                WHERE u.id = ?
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
