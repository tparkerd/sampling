const router = require('express').Router(),
      path   = require('path')

router.use('/annotate', require('./annotate.js'))

module.exports = router
