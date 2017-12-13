'use strict'
const router     = require('express').Router(),
      path       = require('path'),
      mysql      = require('mysql'),
      dbconfig   = require('../../config/database.js'),
      passport   = require('passport'),
      nodemailer = require('nodemailer'),
      {check, validationResult} = require('express-validator/check')

router.get('/', (req, res) => { res.render('register') })

router.post('/',
  [
    // Validate user input
    // Check email
    check('email').isEmail().withMessage('Invalid email entered.')
      .trim()
      .normalizeEmail(),

    // Make sure the alias only contains alphanumeric values, commas, periods, or space.
    check('alias', 'Alias contains illegal characters. Please use alphanumeric characters and commas, periods, or spaces. Leading and trialing whitespace is removed.')
      .trim()
      .matches(/^[A-z0-9,.\s]*$/),

    // Check if user entered a password and that it matches its re-entered value
    check('password').exists(),
    check('passwordReentry', 'Passwords do not match.')
      .exists()
      .custom((value, { req }) => value === req.body.password)

  ], (req, res, next) => {
    try {
      // Throw error if any input was invalid
      validationResult(req).throw()

      // User input is valid as far as the form is concerned
      // Call passport authentication
      passport.authenticate('local-register', {
        successRedirect: '/',
        failureRedirect: '/user/register',
        failureFlash: true
      })(req, res)
    } catch (err) {
      // At least one error was encountered
      const errors = err.mapped()

      // Send the errors back to the client
      Object.keys(errors).map( (key, index) => {
        req.flash('error', errors[key].msg)
      })

      // Go back to registration form
      return res.redirect('/user/register')
    }
})

module.exports = router
