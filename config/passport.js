const LocalStrategy = require('passport-local').Strategy,
      mysql         = require('mysql'),
      bcrypt        = require('bcrypt-nodejs'),
      dbconfig      = require('./database.js')


let connection    = mysql.createConnection(dbconfig.connection)

// Declare database used
connection.query('USE ' + dbconfig.database)

module.exports = (passport) => {

  // Passport session setup
  passport.serializeUser( (user, done) => {
    done(null, user.id)
  })

  passport.deserializeUser( (id, done) => {
    connection.query('SELECT * FROM users WHERE id = ?', [id], (err, rows) => {
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
      connection.query('SELECT * FROM users WHERE email = ?', [email], (err, rows) => {
        if (err) {
          req.flash('error', 'There was an unknown error during registration process')
          console.error(new Error('There was an error while trying to register a new user'))
          return done(err)
        }
        if (rows.length) {
          return done(null, false, req.flash('error', 'Email has been previously used.'))
        }
        else {
          let newUserMysql = {
            email: email,
            password: bcrypt.hashSync(password, null, null),
            alias: req.body.alias
          }
          let insertQuery = 'INSERT INTO users (email, password, alias) VALUES (?, ?, ?)'

          connection.query(insertQuery, [newUserMysql.email, newUserMysql.password, newUserMysql.alias], (err, rows) => {
            newUserMysql.id = rows.insertId
            return done(null, newUserMysql)
          })
        }
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
      connection.query('SELECT * FROM users WHERE email = ?', [email], (err, rows) => {
        if (err) {
          console.error(new Error('An error occurred during registration.'))
          return done(err)
        }
        if (!rows.length) {
          return done(null, false, req.flash('warning', 'User does not exist.'))
        }

      if (!bcrypt.compareSync(password, rows[0].password)) {
        console.log('Password was incorrect. Login failed.')
        return done(null, false, req.flash('warning', 'Oops! Wrong password.'))
      }

      // Login successful
      return done(null, rows[0], req.flash('success', 'You have successfully logged in.'))
    })
  })
)}
