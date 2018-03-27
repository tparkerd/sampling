'use strict'
const router = require('express').Router(),
  path = require('path'),
  pool = require('../../config/mysql-pool.js')

router.get('/', (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) {
      connection.release()
      req.flash('error', 'Unknow error was encountered by accessing database.')
      return res.redirect('/')
    }
    let query = `SELECT p._id AS id,
    p.content_text AS document,
    u.alias as user_alias,
    u.id as user_id,
    c.rating AS severity
    FROM classifier.classifications c
    INNER JOIN reddit.posts p
    ON p._id = c.sample_id
    INNER JOIN classifier.users u
    ON c.user_id = u.id
    ORDER BY c.last_edited DESC
    `
    connection.query(query, (err, rows) => {
      connection.release()
      if (err) return req.flash('error', err)

      // Got data back
      if (rows.length) {
        // Provide a shortened version for the view
        for (let i in rows) {
          if (rows[i].document.length > 85) {
            // Get the first space after the first 85 characters
            let indexOfSpace = rows[i].document.indexOf(' ', 85)
            let phrase = rows[i].document.substring(0, indexOfSpace)
            rows[i].shorttext = phrase + '...'
          } else {
            rows[i].shorttext = rows[i].document
          }
        }
      }
      return res.render('history', { data: rows })
    })
  })
})

router.get('/export/csv', (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) {
      connection.release()
      req.flash('error', 'Unknow error was encountered by accessing database.')
      return res.redirect('/')
    }
    let query = `SELECT p._id AS id,
    p.content_text AS document,
    c.rating AS severity,
    DATE_FORMAT(FROM_UNIXTIME(UNIX_TIMESTAMP(TIMESTAMP(c.last_edited))), '%Y-%m-%d %H:%i:%s') as edit_time,
    c.sadness,
    c.pessimism,
    c.past_failure,
    c.loss_of_pleasure,
    c.guilty_feelings,
    c.punishment_feelings,
    c.self_dislike,
    c.self_criticalness,
    c.suicidal_thoughts,
    c.crying,
    c.agitation,
    c.loss_of_interest,
    c.indecisiveness,
    c.worthlessness,
    c.loss_of_energy,
    c.changes_in_sleeping_pattern,
    c.irritability,
    c.changes_in_appetite,
    c.concentration_difficulty,
    c.tiredness_or_fatigue,
    c.loss_of_interest_in_sex,
    c.personal_opinion
    FROM classifier.classifications c
    INNER JOIN reddit.posts p
    ON p._id = c.sample_id
    INNER JOIN classifier.users u
    ON c.user_id = u.id
    `
    connection.query(query, [req.params.id], (err, rows) => {
      connection.release()
      if (err) return req.flash('error', err)

      // Got data back
      if (rows.length) {
        let headers = { 'Content-Disposition': 'attachment;filename=sample_data.csv' }
        res.csv(rows, true, headers)
      }
    })
  })
})

router.get('/export/json', (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) {
      connection.release()
      req.flash('error', 'Unknow error was encountered by accessing database.')
      return res.redirect('/')
    }
    let query = `SELECT p._id AS id,
    p.content_text AS document,
    c.rating AS severity,
    DATE_FORMAT(FROM_UNIXTIME(UNIX_TIMESTAMP(TIMESTAMP(c.last_edited))), '%Y-%m-%d %H:%i:%s') as edit_time,
    c.sadness,
    c.pessimism,
    c.past_failure,
    c.loss_of_pleasure,
    c.guilty_feelings,
    c.punishment_feelings,
    c.self_dislike,
    c.self_criticalness,
    c.suicidal_thoughts,
    c.crying,
    c.agitation,
    c.loss_of_interest,
    c.indecisiveness,
    c.worthlessness,
    c.loss_of_energy,
    c.changes_in_sleeping_pattern,
    c.irritability,
    c.changes_in_appetite,
    c.concentration_difficulty,
    c.tiredness_or_fatigue,
    c.loss_of_interest_in_sex,
    c.personal_opinion
    FROM classifier.classifications c
    INNER JOIN reddit.posts p
    ON p._id = c.sample_id
    INNER JOIN classifier.users u
    ON c.user_id = u.id
    `
    connection.query(query, [req.params.id], (err, rows) => {
      connection.release()
      if (err) return req.flash('error', err)

      // Got data back
      if (rows.length) {
        let headers = { 'Content-Disposition': 'attachment;filename=sample_data.json', 'Content-Type': 'application/json' }
        rows = { documents: rows }
        return res.json(rows)
      }
    })
  })
})

module.exports = router
