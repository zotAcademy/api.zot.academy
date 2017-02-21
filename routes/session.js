const express = require('express')
const router = express.Router()
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

const models = require('../models')

const requireAuthentication = require('./middlewares/requireAuthentication')

passport.use(new LocalStrategy(function (username, password, done) {
  models.User.findOne({
    where: models.Sequelize.or({
      username
    }, {
      email: username
    })
  }).then(function (user) {
    var message = 'Incorrect username or password.'
    if (!user) {
      return done(null, false, {
        message
      })
    }
    bcrypt.compare(password, user.secret, function (err, res) {
      if (err) {
        return done(new Error('Internal Server Error'), false)
      }
      if (!res) {
        return done(null, false, {
          message
        })
      }
      return done(null, user)
    })
  }).catch(function (error) {
    return done(error)
  })
}))

// GET current user
router.get('', requireAuthentication, function (req, res, next) {
  return res.send(req.user)
})

// POST login
router.post('', function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    if (err) {
      return next(err)
    }
    if (!user) {
      var error = new Error(info.message)
      error.status = 400
      return next(error)
    }

    req.login(user, function (err) {
      if (err) {
        return next(err)
      }
      return res.send(user)
    })
  })(req, res, next)
})

// DELETE logout
router.delete('', requireAuthentication, function (req, res, next) {
  req.logout()
  res.send({
    'message': 'Successfully logged out.'
  })
})

module.exports = router
