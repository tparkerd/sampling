const router = require('express').Router(),
      path   = require('path'),
      mysql      = require('mysql'),
      dbconfig   = require('../../config/database.js'),
      {check, validationResult} = require('express-validator/check')


// TODO: Change this to pull from a smaller sample size
//       As is, it is far to slow for quick classification
router.get('/', (req, res) => {
  // Connect and set database
  let connection = mysql.createConnection(dbconfig.connection)
  connection.query('USE reddit')

  let query = `SELECT *
              FROM samples
              GROUP BY RAND()
              LIMIT 1;
              `
  connection.query(query, (err, rows) => {
    if (err) return req.flash('error', err)

    // Got data back
    if (rows.length) {
      return res.render('observation/evaluate', { data: rows[0] })
    }
  })
})

router.post('/', [
  check('rating', 'A rating must be selected.')
    .exists()
], (req, res) => {
  try {
    validationResult(req).throw()

    // Connect and set database
    let connection = mysql.createConnection(dbconfig.connection)
    connection.query('USE classifier')

    let query = `INSERT INTO classifications(sample_id, user_id, rating, notes)
                 VALUES(?, ?, ?, ?)`
    let values = [ req.body.sample_id,
                   req.user.id,
                   req.body.rating,
                   req.body.notes
                 ]

    console.log(values);


    connection.query(query, values, (err, rows) => {
      if (err) return req.flash('error', err)

      req.flash('success', 'Sample classified.')
      return res.redirect('/observation/evaluate')
    })

  } catch (err) {
    const errors = err.mapped()

    // Send the errors back to the client
    Object.keys(errors).map( (key, index) => {
      req.flash('error', errors[key].msg)
    })

    // Go back to registration form
    return res.redirect('/observation/evaluate')
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
