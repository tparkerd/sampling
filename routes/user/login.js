'use strict'
const router = require('express').Router(),
      path   = require('path')

router.get('/', (req, res) => { res.render('login') })

module.exports = router
