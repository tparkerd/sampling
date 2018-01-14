const router = require('express').Router(),
      path   = require('path'),
      mysql      = require('mysql'),
      dbconfig   = require('../../config/database.js')

router.get('/:id', (req, res) => {
  res.render('observation/edit')
})

router.post('/:id', (req, res) => {
  res.render('observation/edit')
})

module.exports = router
