'use strict'
const router = require('express').Router(),
      path   = require('path'),
      mysql      = require('mysql'),
      dbconfig   = require('../../config/database.js'),
      passport   = require('passport'),
      nodemailer = require('nodemailer')

router.get('/', (req, res) => { res.render('login') })
router.post('/', passport.authenticate('local-login', {
  successRedirect: '/',
  failureRedirect: '/user/login',
  failureFlash: true
}),

)

router.post('/', passport.authenticate('local-login', {
          successRedirect : '/', // redirect to the secure profile section
          failureRedirect : '/user/login', // redirect back to the signup page if there is an error
          failureFlash : true // allow flash messages
  }),
      function(req, res) {
          console.log("hello");

          if (req.body.remember) {
            req.session.cookie.maxAge = 1000 * 60 * 3;
          } else {
            req.session.cookie.expires = false;
          }
      res.redirect('/');
  });


module.exports = router
