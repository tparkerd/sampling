const router = require('express').Router(),
      path   = require('path'),
      mysql      = require('mysql'),
      dbconfig   = require('../../config/database.js')

router.get('/', (req, res) => {
  // Connect and set database
  let connection = mysql.createConnection(dbconfig.connection)

  let query = `SELECT s._id AS postId,
                      s.content_text AS txt,
                      AVG(c.rating) AS avgRating
               FROM reddit.samples s
               LEFT JOIN classifier.classifications c
                ON s._id = c.sample_id
               LEFT JOIN classifier.users u
                ON c.user_id = u.id
               GROUP BY s._id;
               `
  let data = {}
  connection.query(query, (err, rows) => {
    if (err) {
      req.flash('error', err)
      return res.render('index')
    }

    data.observations = []
          // Got data back
          if (rows.length) {
            // Provide a shortened version for the view
            for (let i in rows) {
              if (rows[i].txt.length > 85) {
                // Get the first space after the first 85 characters
                let cutoffIndex = rows[i].txt.indexOf(' ', 85)
                if (cutoffIndex > 120) cutoffIndex = 65
                rows[i].shorttext = rows[i].txt.substring(0, cutoffIndex) + '...'
              }
              else
                rows[i].shorttext = rows[i].txt
            }
            data.observations = rows
          }
          return res.render('observation/list', { data: data.observations })
  })
})


router.get('/export/', (req, res) => {
  // Connect and set database
  let connection = mysql.createConnection(dbconfig.connection)
  let query = `SELECT s._id AS postId,
                      s.content_text AS txt,
                      AVG(c.rating) AS rating
               FROM reddit.samples s
               LEFT JOIN classifier.classifications c
                ON s._id = c.sample_id
               LEFT JOIN classifier.users u
                ON c.user_id = u.id
               GROUP BY s._id
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
