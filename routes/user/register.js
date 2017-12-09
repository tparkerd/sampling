'use strict'
const router     = require('express').Router(),
      path       = require('path'),
      mysql      = require('mysql'),
      dbconfig   = require('../../config/database.js'),
      passport   = require('passport'),
      nodemailer = require('nodemailer')

router.get('/', (req, res) => { res.render('register') })

router.post('/', passport.authenticate('local-register', {
  successRedirect: '/',
  failureRedirect: '/user/register',
  failureFlash: true
}))

module.exports = router
