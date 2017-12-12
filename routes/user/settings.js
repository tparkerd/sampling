'use strict'
const router     = require('express').Router(),
      path       = require('path')

router.get('/', (req, res) => { res.render('settings') })

module.exports = router
