const router = require('express').Router(),
      path   = require('path')


// TODO: Actually pull a random observation from the samples

router.use('/history', require('./history.js'))
router.use('/evaluate', require('./evaluate.js'))


module.exports = router
