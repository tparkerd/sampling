'use strict'
const router     = require('express').Router(),
      path       = require('path')

router.get('/', (req, res) => { res.render('profile') })

module.exports = router
