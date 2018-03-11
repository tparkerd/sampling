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
    let query = `SELECT p._id AS postId,
    p.content_text AS txt,
    u.alias as user_alias,
    u.id as user_id,
    c.rating AS rating
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
          if (rows[i].txt.length > 85) {
            // Get the first space after the first 85 characters
            let indexOfSpace = rows[i].txt.indexOf(' ', 85)
            let phrase = rows[i].txt.substring(0, indexOfSpace)
            rows[i].shorttext = phrase + '...'
          } else {
            rows[i].shorttext = rows[i].txt
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
    let query = `SELECT p._id AS postId,
    p.content_text AS txt,
    c.rating AS rating
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
    let query = `SELECT p._id AS postId,
    p.content_text AS txt,
    c.rating AS rating
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
        return res.json(rows)
      }
    })
  })
})

module.exports = router
