const router = require('express').Router(),
      path   = require('path'),
      mysql      = require('mysql'),
      dbconfig   = require('../../../config/database.js'),
      {check, validationResult} = require('express-validator/check')

router.get('/', (req, res) => {
  // Connect and set database
  let connection = mysql.createConnection(dbconfig.connection)

  let query = `SELECT s._id AS postId
               FROM reddit.samples s
               WHERE s._id NOT IN (
                 SELECT p._id
                 FROM classifier.classifications c
                 INNER JOIN reddit.posts p
                 ON p._id = c.sample_id
                 )
               `

  connection.query(query, [req.user.id], (err, rows) => {
    if (err) {
      req.flash('error', 'Unknown error occurred while accessing database.')
      req.flash('error', err)
      return res.render('index')
    }

    // Got data back
    if (rows.length) {
      // Build url for redirect based on the s._id using a random number
      let randomIndex = Math.floor(Math.random() * rows.length)
      let randomId = rows[randomIndex].postId
      let url = '/observation/v1/annotate/' + randomId
      return res.redirect(url)
    }
  })
})

router.get('/:id', (req, res) => {
  let results = []
  let connection = mysql.createConnection(dbconfig.connection)
  let query = `SELECT * FROM reddit.samples s WHERE s._id = ?`
  connection.query(query, [req.params.id], (err, rows) => {
    if (err) {
      req.flash('error', 'Unknown error occurred while accessing database.')
      return res.render('index')
    }

    if (rows.length) {
      results = rows[0]
      results.json = JSON.stringify(rows[0], null, 2)
      return res.render('observation/v1/annotate', { data: results })
    } else {
      req.flash('error', 'Sample #' + req.params.id + ' does not exist.')
      return res.redirect('/')
    }
  })
})

router.post('/:id', [
  check('rating', 'An annotation must be selected.')
    .exists()
  ], (req, res) => {
  try {
    validationResult(req).throw()

    // Connect and set database
    let connection = mysql.createConnection(dbconfig.connection)
    let query = `INSERT INTO classifier.classifications(sample_id, user_id, rating, notes)
                 VALUES(?, ?, ?, ?) ON DUPLICATE KEY UPDATE rating = ?`
    let values = [ req.body.sample_id,
                   req.user.id,
                   req.body.rating,
                   req.body.notes,
                   req.body.rating
                 ]

    connection.query(query, values, (err, rows) => {
      if (err) {
        req.flash('error', err.toString())
        let url = '/observation/v1/annotate/' + req.body.sample_id
        return res.redirect(url)
      }

      let message = ''
      message += 'Sample #'
      message += req.body.sample_id
      message += ' was successfully evaluated.'
      req.flash('success alert-dismissible alert', message)
      return res.redirect('/observation/v1/annotate')
    })

  } catch (err) {
    const errors = err.mapped()

    // Send the errors back to the client
    Object.keys(errors).map( (key, index) => {
      req.flash('error', errors[key].msg)
    })

    // Go back to evaluation form
    return res.redirect('/observation/v1/annotate/' + req.body.sample_id)
  }
})

router.put('/', (req, res) => {
  // Connect and set database
  let connection = mysql.createConnection(dbconfig.connection)

  // TODO
})

router.delete('/', (req, res) => {
  // Connect and set database
  let connection = mysql.createConnection(dbconfig.connection)

  // TODO
})

module.exports = router
