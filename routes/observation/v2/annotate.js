const router = require('express').Router(),
  path = require('path'),
  pool = require('../../../config/mysql-pool.js'),
  {check, validationResult} = require('express-validator/check')

router.get('/', (req, res) => {
  // Connect and set database
  pool.getConnection((err, connection) => {
    if (err) {
      connection.release()
      req.flash('error', 'Unknown error occurred while accessing database.')
      return res.redirect('/')
    }
    let query = `SELECT s._id AS postId
    FROM reddit.samples s
    WHERE s._id NOT IN (
      SELECT p._id
      FROM classifier.classifications c
      INNER JOIN reddit.posts p
      ON p._id = c.sample_id
    )
    AND s.compound < -0.596
    `

    connection.query(query, [req.user.id], (err, rows) => {
      connection.release()
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
        let url = '/observation/v2/annotate/' + randomId
        return res.redirect(url)
      }
    })
  })
})

router.get('/:id', (req, res) => {
  let results = []
  pool.getConnection((err, connection) => {
    if (err) {
      connection.release()
      req.flash('error', 'Unknown error occurred while accessing database.')
      return res.redirect('/')
    }

    let query = `SELECT * FROM reddit.samples s WHERE s._id = ?`
    connection.query(query, [req.params.id], (err, rows) => {
      connection.release()
      if (err) {
        req.flash('error', 'Unknown error occurred while accessing database.')
        return res.render('index')
      }

      if (rows.length) {
        results = rows[0]
        results.json = JSON.stringify(rows[0], null, 2)
        return res.render('observation/v2/annotate', { data: results })
      } else {
        req.flash('error', 'Sample #' + req.params.id + ' does not exist.')
        return res.redirect('/')
      }
    })
  })
})

router.post('/:id', [
  check('personal_opinion', 'Your personal opinion for the annotation is required.')
    .exists()
], (req, res) => {
  try {
    validationResult(req).throw()

    let calculateAnnotation = (data) => {
      let symptoms = [ 'sadness', 'pessimism', 'past_failure', 'loss_of_pleasure', 'guilty_feelings', 'punishment_feelings', 'self_dislike', 'self_criticalness', 'suicidal_thoughts', 'crying', 'agitation', 'loss_of_interest', 'indecisiveness', 'worthlessness', 'loss_of_energy', 'changes_in_sleeping_pattern', 'irritability', 'changes_in_appetite', 'concentration_difficulty', 'tiredness_or_fatigue', 'loss_of_interest_in_sex' ]
      let weight = 0.3
      let maxScore = 63

      let cAbsent = 0
      let cMild = 0
      let cModerate = 0
      let cSevere = 0
      let cMissing = 0
      for (let s of symptoms) {
        switch (parseInt(data[s])) {
          case 0: // absent
            cAbsent++
            break
          case 1: // mild
            cMild++
            break
          case 2: // moderate
            cModerate++
            break
          case 3: // severe
            cSevere++
            break
          default:
            cMissing++
            break
        }
      }

      let results = {}

      let percentage = ((0 * cAbsent) + (1 * cMild) + (2 * cModerate) + (3 * cSevere)) / (maxScore - ((3 - weight) * cMissing)) * 100.00

      if (percentage >= 0 && percentage <= 16) {
        results.annotation = 0
        results.annotationName = 'Absent'
      } else if (percentage > 16 && percentage <= 31) {
        results.annotation = 1
        results.annotationName = 'Mild'
      } else if (percentage > 31 && percentage <= 48) {
        results.annotation = 2
        results.annotationName = 'Moderate'
      } else {
        results.annotation = 3
        results.annotationName = 'Severe'
      }

      results.percentage = percentage
      return results
    }

    let results = calculateAnnotation(req.body)

    req.body.rating = results.annotation

    // Connect and set database
    pool.getConnection((err, connection) => {
      if (err) {
        connection.release()
        req.flash('error', 'Unknown error occurred while accessing database.')
        return res.redirect('/')
      }

      let query = `INSERT INTO classifier.classifications
            (
                        sample_id,
                        user_id,
                        rating,
                        notes,
                        sadness,
                        pessimism,
                        past_failure,
                        loss_of_pleasure,
                        guilty_feelings,
                        punishment_feelings,
                        self_dislike,
                        self_criticalness,
                        suicidal_thoughts,
                        crying,
                        agitation,
                        loss_of_interest,
                        indecisiveness,
                        worthlessness,
                        loss_of_energy,
                        changes_in_sleeping_pattern,
                        irritability,
                        changes_in_appetite,
                        concentration_difficulty,
                        tiredness_or_fatigue,
                        loss_of_interest_in_sex,
                        personal_opinion
            )
            VALUES
            (
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?
            )
on duplicate KEY
UPDATE rating = ?,
       notes = ?,
       sadness = ?,
       pessimism = ?,
       past_failure = ?,
       loss_of_pleasure = ?,
       guilty_feelings = ?,
       punishment_feelings = ?,
       self_dislike = ?,
       self_criticalness = ?,
       suicidal_thoughts = ?,
       crying = ?,
       agitation = ?,
       loss_of_interest = ?,
       indecisiveness = ?,
       worthlessness = ?,
       loss_of_energy = ?,
       changes_in_sleeping_pattern = ?,
       irritability = ?,
       changes_in_appetite = ?,
       concentration_difficulty = ?,
       tiredness_or_fatigue = ?,
       loss_of_interest_in_sex = ?,
       personal_opinion = ?`
      let values = [
        req.body.sample_id,
        req.user.id,
        req.body.rating,
        req.body.notes,
        req.body.sadness,
        req.body.pessimism,
        req.body.past_failure,
        req.body.loss_of_pleasure,
        req.body.guilty_feelings,
        req.body.punishment_feelings,
        req.body.self_dislike,
        req.body.self_criticalness,
        req.body.suicidal_thoughts,
        req.body.crying,
        req.body.agitation,
        req.body.loss_of_interest,
        req.body.indecisiveness,
        req.body.worthlessness,
        req.body.loss_of_energy,
        req.body.changes_in_sleeping_pattern,
        req.body.irritability,
        req.body.changes_in_appetite,
        req.body.concentration_difficulty,
        req.body.tiredness_or_fatigue,
        req.body.loss_of_interest_in_sex,
        req.body.personal_opinion,
        req.body.rating,
        req.body.notes,
        req.body.sadness,
        req.body.pessimism,
        req.body.past_failure,
        req.body.loss_of_pleasure,
        req.body.guilty_feelings,
        req.body.punishment_feelings,
        req.body.self_dislike,
        req.body.self_criticalness,
        req.body.suicidal_thoughts,
        req.body.crying,
        req.body.agitation,
        req.body.loss_of_interest,
        req.body.indecisiveness,
        req.body.worthlessness,
        req.body.loss_of_energy,
        req.body.changes_in_sleeping_pattern,
        req.body.irritability,
        req.body.changes_in_appetite,
        req.body.concentration_difficulty,
        req.body.tiredness_or_fatigue,
        req.body.loss_of_interest_in_sex,
        req.body.personal_opinion
      ]

      connection.query(query, values, (err, rows) => {
        connection.release()
        if (err) {
          // console.log(err)
          console.log(Object.keys(err))
          console.log(err.sql)
          req.flash('error', err.toString())
          let url = '/observation/v2/annotate/' + req.body.sample_id
          return res.redirect(url)
        }

        let message = ''
        message += 'Sample #'
        message += req.body.sample_id
        message += ` was successfully evaluated. Calculated annotation: ${results.annotationName} (${results.percentage.toFixed(2)}%).`
        req.flash('success alert-dismissible alert', message)
        return res.redirect('/observation/v2/annotate')
      })
    })
  } catch (err) {
    console.log(err)
    const errors = err.mapped()

    // Send the errors back to the client
    Object.keys(errors).map((key, index) => {
      req.flash('error', errors[key].msg)
    })

    // Go back to evaluation form
    return res.redirect('/observation/v2/annotate/' + req.body.sample_id)
  }
})

router.put('/', (req, res) => {
  // Connect and set database
  pool.getConnection((err, connection) => {
    if (err) {
      connection.release()
    }
  })

  // TODO
})

router.delete('/', (req, res) => {
  // Connect and set database
  pool.getConnection((err, connection) => {
    if (err) {
      connection.release()
    }
  })
  // TODO
})

module.exports = router
