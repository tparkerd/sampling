const router = require('express').Router(),
      path   = require('path'),
      mysql      = require('mysql'),
      dbconfig   = require('../../config/database.js')



router.get('/:id', (req, res) => {
  dbconfig.connection.multipleStatements = true
  let connection = mysql.createConnection(dbconfig.connection)
  let query
  query = `SELECT *
           FROM classifier.classifications c
           INNER JOIN reddit.posts p
            ON p._id = c.sample_id
           WHERE c.id = ?;

           SELECT c.id, c.rating, c.notes, u.alias AS rater, u.id AS user_id
           FROM classifier.classifications c
           INNER JOIN classifier.users u
            ON u.id = c.user_id
           WHERE c.id = ?;

           SELECT AVG(c.rating) AS mean
           FROM classifier.classifications c
           WHERE c.id = ?;
           `
  query = `
          SELECT *
          FROM reddit.posts p
          LEFT JOIN classifier.classifications c
            ON p._id = c.sample_id
          WHERE p._id = ?;

          SELECT c.id, c.rating, c.notes, u.alias AS rater, u.id AS user_id
          FROM classifier.classifications c
          INNER JOIN classifier.users u
            ON u.id = c.user_id
          INNER JOIN reddit.posts p
            ON p._id = c.sample_id
          WHERE p._id = ?;

          SELECT AVG(c.rating) AS mean
          FROM classifier.classifications c
          INNER JOIN reddit.posts p
            ON p._id = c.sample_id
          WHERE p._id = ?;
          `

  connection.query(query, [req.params.id, req.params.id, req.params.id], (err, rows) => {
    if (err) {
      req.flash('error', 'Unknown error occurred while accessing database.')
      return res.render('observation/details', { data: { info: {}, evaluations: {} } })
    }

    // Check if there is info on the sample
    if (rows[0].length > 0) {
      results = {}
      results.info = rows[0][0]
      results.info.averageRating = rows[2][0].mean
      results.evaluations = rows[1]
      return res.render('observation/details', { data: results })
    } else {
      req.flash('error', 'Sample does not exist')
      return res.render('index')
    }
  })
})


module.exports = router
