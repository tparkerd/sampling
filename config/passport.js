const LocalStrategy = require('passport-local').Strategy,
  mysql = require('mysql'),
  bcrypt = require('bcrypt-nodejs'),
  pool = require('./mysql-pool.js')

module.exports = (passport) => {
  pool.getConnection((err, connection) => {
    if (err) {
      connection.release()
      throw err
    }

    // Passport session setup
    passport.serializeUser((user, done) => {
      done(null, user.id)
    })

    passport.deserializeUser((id, done) => {
      connection.query('SELECT * FROM classifier.users WHERE id = ?', [id], (err, rows) => {
        done(err, rows[0])
      })
    })

    // Registration
    passport.use(
      'local-register',
      new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
      },
      (req, email, password, done) => {
        // If no alias was provided, assign the prefix of the email as the alias
        if (req.body.alias === '') req.body.alias = req.body.email.split('@')[0]
        let newUserMysql = {
          email: email,
          password: bcrypt.hashSync(password, null, null),
          alias: req.body.alias
        }
        let insertQuery = 'INSERT INTO classifier.users (email, password, alias) VALUES (?, ?, ?)'
        let params = [newUserMysql.email, newUserMysql.password, newUserMysql.alias]
        connection.query(insertQuery, params, (err, results, fields) => {
          if (err) {
            let message = err.sqlMessage
            if (err.code == 'ER_DUP_ENTRY') {
              message = 'An account has already been registered under the email.'
            }
            return done(null, false, message)
          }
          newUserMysql.id = results.insertId
          req.flash('success', 'Registration successful! Welcome!')
          return done(null, newUserMysql)
        })
      })
    )

    // Log in
    passport.use(
      'local-login',
      new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
      },
      (req, email, password, done) => {
        connection.query('SELECT * FROM classifier.users WHERE email = ?', [email], (err, results, fields) => {
          if (err) {
            console.error(new Error('An error occurred during login.'))
            console.error(err)
            return done(null, false, req.flash('An error occurred during login.'))
          }
          if (!results.length) {
            return done(null, false, req.flash('warning', 'User does not exist.'))
          }

          if (!bcrypt.compareSync(password, results[0].password)) {
            console.log('Password was incorrect. Login failed.')
            return done(null, false, req.flash('warning', 'Oops! Wrong password.'))
          }

          // Login successful
          return done(null, results[0], req.flash('success', 'You have successfully logged in.'))
        })
      })
    )
  }) // end of the pool connection
}
