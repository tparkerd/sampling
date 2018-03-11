'use strict'
const router = require('express').Router(),
  path = require('path'),
  pool = require('../../config/mysql-pool.js'),
  jsonexport = require('jsonexport'),
  csv = require('csv-express')

// NOTE: Consider using middleware to get all the data instead, or at least for
//       the post data
router.get('/:id', (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) {
      connection.release()
      req.flash('error', 'Unknow error was encountered by accessing database.')
      return res.redirect('/')
    }
    let query = `SELECT id,
    alias,
    email
    FROM classifier.users
    WHERE id = ?
    `
    let data = {}

    // NOTE: consider escaping the req.param.id
    connection.query(query, [req.params.id], (err, rows) => {
      if (err) {
        req.flash('error', 'Unknown error occurred while accessing database.')
        req.flash('error', err.toString())
        return res.redirect('/')
      }

      if (rows.length) data.user = rows[0]

      // Set a fixed width of the selftext!
      query = `SELECT COUNT(c.id) AS classificationCount
      FROM classifier.classifications c
      INNER JOIN reddit.posts p
      ON p._id = c.sample_id
      INNER JOIN classifier.users u
      ON c.user_id = u.id
      WHERE u.id = ?
      `
      connection.query(query, [req.params.id], (err, rows) => {
        if (err) return req.flash('error', err)

        // Got data back
        if (rows.length) data.user.classificationCount = rows[0].classificationCount
      })

      query = `SELECT p._id AS postId,
      p.content_text AS contents,
      u.alias AS user_alias,
      u.id AS user_id,
      CASE c.rating
      WHEN 0 THEN 'absent'
      WHEN 1 THEN 'mild'
      WHEN 2 THEN 'moderate'
      WHEN 3 THEN 'severe'
      ELSE 'unknown' END AS ratingText,
      c.rating AS rating
      FROM classifier.classifications c
      INNER JOIN reddit.posts p
      ON p._id = c.sample_id
      INNER JOIN classifier.users u
      ON c.user_id = u.id
      WHERE u.id = ?
      ORDER BY c.last_edited DESC
      `

      data.observations = []
      connection.query(query, [req.params.id], (err, rows) => {
        connection.release()
        if (err) return req.flash('error', err)

        // Got data back
        if (rows.length) {
          // Provide a shortened version for the view
          for (let i in rows) {
            if (rows[i].contents.length > 85) {
              // Get the first space after the first 85 characters
              let cutoffIndex = rows[i].contents.indexOf(' ', 85)
              rows[i].shorttext = rows[i].contents.substring(0, cutoffIndex) + '...'
            } else {
              rows[i].shorttext = rows[i].contents
            }
          }
          data.observations = rows
        }
        return res.render('profile', { data: data })
      })
    })
  })
})

router.get('/export/csv/:id', (req, res) => {
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
    WHERE u.id = ?
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

router.get('/export/json/:id', (req, res) => {
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
    WHERE u.id = ?
    `
    connection.query(query, [req.params.id], (err, rows) => {
      connection.release()
      if (err) return req.flash('error', err)

      // Got data back
      if (rows.length) {
        let headers = { 'Content-Disposition': 'attachment;filename=sample_data.json', 'Content-Type': 'application/json' }
        res.json(rows)
      }
    })
  })
})

module.exports = router
