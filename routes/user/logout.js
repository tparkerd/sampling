'use strict'
const router = require('express').Router(),
      path   = require('path')

router.all('/', (req, res) => {
  // TODO
  req.logout()
  req.flash('info', 'You have been successfully logged out.')
  res.redirect('/')
})

module.exports = router
