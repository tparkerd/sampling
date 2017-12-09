'use strict'
const router = require('express').Router(),
      path   = require('path')

router.use('/login', require('./login.js'))
router.use('/register', require('./register.js'))
router.use('/logout', require('./logout.js'))

module.exports = router
