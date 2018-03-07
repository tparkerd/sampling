const router = require('express').Router(),
      path   = require('path')

router.use('/v1', require('./v1'))
router.use('/v2', require('./v2'))
router.use('/details', require('./details.js'))
router.use('/history', require('./history.js'))
router.use('/list', require('./list.js'))
router.use('/statistics', require('./statistics.js'))


module.exports = router
