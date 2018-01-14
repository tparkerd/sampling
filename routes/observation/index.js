const router = require('express').Router(),
      path   = require('path')


// TODO: Actually pull a random observation from the samples

router.use('/details', require('./details.js'))
router.use('/edit', require('./edit.js'))
router.use('/evaluate', require('./evaluate.js'))
router.use('/history', require('./history.js'))

module.exports = router
