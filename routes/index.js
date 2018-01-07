'use strict'
const router = require('express').Router(),
      path   = require('path'),
      helper = require('./middleware/session.js')

// User account
router.get('/', (req, res) => { res.render('index') })

router.post('/postreceive', (req, res) => {
	return res.status(200).json({message: 'received message'})
})

// Sub-routes
router.use('/user', require('./user'))
router.use('/observation', helper.isAuthenticated, require('./observation'))

// 404 Fallback routes
router.all ('*', (req, res) => { res.render('404') })

module.exports = router
