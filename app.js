const express = require('express')
const path = require('path')
const logger = require('morgan')
const bodyParser = require('body-parser')
const passport = require('passport')
const expressSession = require('express-session')
const RedisStore = require('connect-redis')(expressSession)

const models = require('./models')

const index = require('./routes/index')
const session = require('./routes/session')
const users = require('./routes/users')
const tags = require('./routes/tags')
const questions = require('./routes/questions')

const app = express()

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(
  app.get('env') === 'development'
    ? require('cookie-session')({
      secret: '731c2c569fabf61945a35ed1b90fc5a3a9ca9eac2a275bca7b52fc0ca95b2bc9'
    })
    : expressSession({
      store: new RedisStore({
        url: process.env.REDIS_URL
      }),
      secret: process.env.SESSION_SECRET
    })
)
app.use(passport.initialize())
app.use(passport.session())

app.use(express.static(path.join(__dirname, 'public')))

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, PATCH, DELETE')
  res.header('Access-Control-Allow-Origin', req.app.get('env') === 'development' ? 'http://localhost:8080' : 'https://zot.academy')
  next()
})

app.use('/', index)
app.use('/session', session)
app.use('/users', users)
app.use('/tags', tags)
app.use('/questions', questions)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.send({
    'message': err.message
  })
})

// passport
passport.serializeUser(function (user, callback) {
  callback(null, user.id)
})

passport.deserializeUser(function (id, callback) {
  models.User.findById(id).then(function (user) {
    callback(null, user)
  })
})

module.exports = app
