'use strict'
const router = require('express').Router(),
      path   = require('path')

// User account
router.get('/', (req, res) => { res.render('index') })

// Sub-routes
router.use('/user', require('./user'))
router.use('/observation', require('./observation'))


// 404 Fallback routes
router.all ('*', (req, res) => { res.render('404') })

module.exports = router
