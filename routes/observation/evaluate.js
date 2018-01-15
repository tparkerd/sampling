const router = require('express').Router(),
      path   = require('path'),
      mysql      = require('mysql'),
      dbconfig   = require('../../config/database.js'),
      {check, validationResult} = require('express-validator/check')

router.get('/', (req, res) => {
  // Connect and set database
  let connection = mysql.createConnection(dbconfig.connection)

  ////////////////////

  // TODO: Check if it's already been evaluated, and if so, pull data and
  //       fill in the values

  ////////////////////



  let query = `SELECT s._id AS postId FROM reddit.samples s`
  connection.query(query, (err, rows) => {
    if (err) {
      req.flash('error', 'Unknown error occurred while accessing database.')
      return res.render('index')
    }

    // Got data back
    if (rows.length) {
      // Build url for redirect based on the s._id using a random number
      let randomIndex = Math.floor(Math.random() * rows.length)
      let randomId = rows[randomIndex].postId
      let url = '/observation/evaluate/' + randomId
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
    }
    return res.render('observation/evaluate', { data: results })
  })
})

router.post('/:id', [
  check('rating', 'A rating must be selected.')
    .exists()
], (req, res) => {
  try {
    validationResult(req).throw()

    // Connect and set database
    let connection = mysql.createConnection(dbconfig.connection)
    let query = `INSERT INTO classifier.classifications(sample_id, user_id, rating, notes)
                 VALUES(?, ?, ?, ?)`
    let values = [ req.body.sample_id,
                   req.user.id,
                   req.body.rating,
                   req.body.notes ]

    connection.query(query, values, (err, rows) => {
      if (err) {
        req.flash('error', err)
        let url = '/observation/evaluate/' + req.body.sample_id
        return res.render(url)
      }

      let message = ''
      message += 'Sample #'
      message += req.body.sample_id
      message += ' was successfully evaluated.'
      req.flash('success alert-dismissible alert', message)
      return res.redirect('/observation/evaluate')
    })

  } catch (err) {
    const errors = err.mapped()

    // Send the errors back to the client
    Object.keys(errors).map( (key, index) => {
      req.flash('error', errors[key].msg)
    })

    // Go back to evaluation form
    return res.redirect('/observation/evaluate/')
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
