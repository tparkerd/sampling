'use strict'
const router     = require('express').Router(),
      path       = require('path'),
      mysql      = require('mysql'),
      dbconfig   = require('../../config/database.js')


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
                ON p.id = c.sample_id
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

    // Set a fixed width of the selftext!
   query = `SELECT c.id AS postId,
                        p.selftext AS contents,
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
                  ON p.id = c.sample_id
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

// TODO: Figure out how to view the current user's page
// router.get('/', (req, res) => { res.render('profile') })

module.exports = router
