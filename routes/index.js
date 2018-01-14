'use strict'
const router = require('express').Router(),
      path   = require('path'),
      helper = require('./middleware/session.js')

// User account
router.get('/', (req, res) => { res.render('index') })

// Sub-routes
router.use('/observation', helper.isAuthenticated, require('./observation'))
router.use('/user', require('./user'))

// 404 Fallback routes
router.all ('*', (req, res) => { res.render('404') })

module.exports = router
