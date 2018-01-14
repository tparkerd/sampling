const router = require('express').Router(),
      path   = require('path'),
      mysql      = require('mysql'),
      dbconfig   = require('../../config/database.js')


      router.get('/:id', (req, res) => {
        let connection = mysql.createConnection(dbconfig.connection)
        connection.query('USE ' + dbconfig.database)
          let query = `SELECT c.*, p.*
                       FROM classifications c
                       INNER JOIN reddit.posts p
                        ON p._id = c.sample_id
                       WHERE c.id = ?
                       `
        let data = {}

        // NOTE: consider escaping the req.param.id
        connection.query(query, [req.params.id], (err, rows) => {
          if (err) return req.flash('error', 'Unknown error occurred while accessing database.')

          if (rows.length) {
            data.info = rows
          }

        connection.query('USE classifier')
        query = `SELECT c.id, c.rating, c.notes, u.alias AS rater, u.id as user_id
                 FROM classifier.classifications c
                 INNER JOIN classifier.users u
                  ON u.id = c.user_id
                 WHERE c.id = ?
                `
          connection.query(query, [req.params.id], (err, rows) => {
            if (err) return req.flash('error', err)

            // Got data back
            if (rows.length) {
              console.log(rows);
              data.evaluations = rows
            }
            return res.render('observation/details', { data: data })
          })
        })
      })


// router.get('/:id', (req, res) => {
//   let results = {}
//
//   let connection = mysql.createConnection(dbconfig.connection)
//   connection.query('USE classifier')
//
//   let query = `SELECT c.*, p.*
//                FROM classifications c
//                INNER JOIN reddit.posts p
//                 ON p._id = c.sample_id
//                WHERE c.id = ?
//                `
//   results.info = []
//   connection.query(query, [ req.params.id ] ,(err, rows) => {
//     if (err) {
//       return req.flash('error', err)
//     }
//
//     // Got data back
//     if (rows.length) {
//       for (let r in rows) {
//         results.info[r] = rows[r]
//       }
//     }
//   })
//
//   // Get history of evaluations of the observation
//   query = `SELECT c.id, c.rating, c.notes, u.alias AS rater, u.id as user_id
//            FROM classifier.classifications c
//            INNER JOIN classifier.users u
//             ON u.id = c.user_id
//            WHERE c.id = ?
//           `
//
//   results.evaluations = []
//   connection.query(query, [ req.params.id ], (err, rows) => {
//     if (err) return req.flash('error', err)
//
//     if (rows.length) {
//       results.evaluations = rows
//     }
//   })
//
//   console.log(results);
//   return res.render('observation/details', { data: results })
//   // res.render('404')
// })

module.exports = router
