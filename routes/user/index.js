'use strict'
const router = require('express').Router(),
      path   = require('path'),
      helper = require('../middleware/session.js')

router.use('/login', require('./login.js'))
router.use('/register', require('./register.js'))
router.use('/logout', helper.isAuthenticated, require('./logout.js'))
router.use('/settings', helper.isAuthenticated, require('./settings.js'))
router.use('/profile', helper.isAuthenticated, require('./profile.js'))
router.use('/list', helper.isAuthenticated, require('./list.js'))

module.exports = router
