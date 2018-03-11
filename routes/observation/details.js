const router = require('express').Router(),
  path = require('path'),
  pool = require('../../config/mysql-pool.js')

router.get('/:id', (req, res) => {
  // TODO(timp): Figure out how to handle this with pooling
  pool.getConnection((err, connection) => {
    let queries = [
      `
      SELECT *
      FROM reddit.posts p
      LEFT JOIN classifier.classifications c
      ON p._id = c.sample_id
      WHERE p._id = ?;
      `,
      `
      SELECT c.id, c.rating, c.notes, u.alias AS rater, u.id AS user_id
      FROM classifier.classifications c
      INNER JOIN classifier.users u
      ON u.id = c.user_id
      INNER JOIN reddit.posts p
      ON p._id = c.sample_id
      WHERE p._id = ?;
      `,
      `
      SELECT AVG(c.rating) AS mean
      FROM classifier.classifications c
      INNER JOIN reddit.posts p
      ON p._id = c.sample_id
      WHERE p._id = ?;
      `
    ]

    // Check if was an available connection in the pool
    if (err) {
      connection.release()
      req.flash('error', 'Unknown error occurred while accessing database.')
      return res.redirect('/')
    }

    // Found valid connection, attempt query

    let results = { data: { info: {}, evaluations: [] } }

    // Get general info about the post
    connection.query(queries[0], [req.params.id], (err, rows) => {
      // If query failed, stop further action
      if (err) {
        connection.release()
        req.flash('error', 'Unknown error occurred while accessing database.')
        return res.render('observation/details', { data: { info: {}, evaluations: {} } })
      }
      // Check if data was found
      if (rows.length > 0) {
        results.data.info = JSON.parse(JSON.stringify(rows[0]))
      }
    })
    // Get annotations on the post
    connection.query(queries[1], [req.params.id], (err, rows) => {
      // If query failed, stop further action
      if (err) {
        connection.release()
        req.flash('error', 'Unknown error occurred while accessing database.')
        return res.render('observation/details', { data: { info: {}, evaluations: {} } })
      }
      // Check if data was found
      if (rows.length > 0) {
        for (let r in rows) {
          results.data.evaluations.push(rows[r])
        }
      }
    })
    // Get get average rating
    connection.query(queries[2], [req.params.id], (err, rows) => {
      connection.release()
      // If query failed, stop further action
      if (err) {
        connection.release()
        req.flash('error', 'Unknown error occurred while accessing database.')
        return res.render('observation/details', { data: { info: {}, evaluations: {} } })
      }
      // Check if data was found
      if (rows.length > 0) {
        results.data.info.averageRating = rows[0].mean
      }

      // Check if all queries executed and returned data
      if (results.data.info) {
        return res.render('observation/details', { data: results.data })
      } else {
        req.flash('error', `Sample #${req.params.id} does not exist`)
        return res.render('index')
      }
    })
  })
})

module.exports = router
