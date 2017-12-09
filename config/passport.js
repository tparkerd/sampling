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
          console.error(new Error('User already exists'))
          return done(null, false, req.flash('signupMessage', 'That email has been already been used.'))
        }
        else {
          let newUserMysql = {
            email: email,
            password: bcrypt.hashSync(password, null, null)
          }
          let insertQuery = 'INSERT INTO users (email, password) VALUES (?, ?)'

          connection.query(insertQuery, [newUserMysql.email, newUserMysql.password], (err, rows) => {
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
          console.log('Unknown error has occured.')
          return done(err)
        }
        if (!rows.length) {
          console.log('No user found.')
          return done(null, false, req.flash('loginMessage', 'No user found.'))
        }

      if (!bcrypt.compareSync(password, rows[0].password)) {
        console.log('Password was incorrect. Login failed.')
        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'))
      }

      console.log('Successfully logged in!')
      return done(null, rows[0])
    })
  })
)}
