const router = require('express').Router(),
      path   = require('path')

router.use('/details', require('./details.js'))
router.use('/evaluate', require('./evaluate.js'))
router.use('/history', require('./history.js'))
router.use('/list', require('./list.js'))
router.use('/statistics', require('./statistics.js'))


module.exports = router
