// Dependencies
const bodyParser      = require('body-parser'),
      methodOverride  = require('method-override'),
      localStrategy   = require('passport-local'),
      passport        = require('passport'),
      flash           = require('connect-flash'),
      path            = require('path'),
      nodemailer      = require('nodemailer'),
      express         = require('express'),
      morgan          = require('morgan'),
      fs              = require('fs'),
      sessions        = require('express-session'),
      env             = require('dotenv')

let app = express()

// Configuration
if (process.env.NODE_ENV !== 'production') { env.load() }
require('./config/passport')(passport)

// Logging
app.use(morgan('dev'))
let logDirectory = path.join(__dirname, 'logs')
if (!fs.existsSync(logDirectory)) fs.mkdirSync(logDirectory)
app.use(morgan('combined', {
  stream: fs.createWriteStream(path.join(__dirname, 'logs', 'access.log'),
  { flags: 'a' })
}))

// Views & public files
app.use(express.static(path.join(__dirname, 'public')))
app.engine('html', require('ejs').renderFile)
app.set('views', [
  path.join(__dirname, 'views'),
  path.join(__dirname, 'views', 'user/'),
  path.join(__dirname, 'views', 'observation')
])
app.set('view engine', 'ejs')

// Passport
app.use(sessions({
  secret: process.env.SECRET,
  resave: true,
  saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())

// Body parsing
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Flash messages
app.use(flash())

// Routes
app.use('/', require('./routes'))


// TODO: Figure out how to set the environment up!
let port = process.env.PORT || 3000
app.set('port', port)

app.listen(app.get('port'), () => {
  console.log(`Server started and listening on port ${port}.`)
})
