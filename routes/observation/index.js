const router = require('express').Router(),
  path = require('path'),
  helper = require('../middleware/session.js')

router.use('/v1', helper.isAuthenticated, require('./v1'))
router.use('/v2', helper.isAuthenticated, require('./v2'))
router.use('/details', helper.isAuthenticated, require('./details.js'))
router.use('/history', helper.isAuthenticated, require('./history.js'))
router.use('/list', helper.isAuthenticated, require('./list.js'))
router.use('/statistics', require('./statistics.js'))

module.exports = router
