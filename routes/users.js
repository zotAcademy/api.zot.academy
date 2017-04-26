const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const saltRounds = 10
const validator = require('validator')

const models = require('../models')

/* GET users listing. */
router.get('/', function (req, res, next) {
  models.user.findAll({
  }).then(function (users) {
    return res.send(users)
  })
})

/* GET user by id or username */
router.get('/:id', function (req, res, next) {
  var where
  if (/^[1-9]\d*$/.test(req.params.id)) {
    where = {
      id: +req.params.id
    }
  } else {
    where = {
      username: req.params.id
    }
  }
  models.user.find({
    where
  }).then(function (user) {
    if (!user) {
      var err = new Error('User not found.')
      err.status = 400
      return next(err)
    }

    return res.send(user)
  })
})

/* POST new user */
router.post('/', function (req, res, next) {
  var errs = []

  // username needs to be not null when sign up directly
  // not null is not on the model because when sign in with social media,
  // username will be manually set by user after creation of account
  if (req.body.username == null ||
    !validator.isLength('' + req.body.username, {min: 1, max: 39}) ||
    !validator.matches('' + req.body.username, /^[a-z]\w*$/i)) {
    errs.push('Invalid username.')
  }

  if (req.body.password == null ||
    !validator.isLength('' + req.body.password, {min: 8, max: 128})) {
    errs.push('Invalid password.')
  }

  if (req.body.email == null ||
    !validator.isEmail('' + req.body.email) ||
    !validator.isLength('' + req.body.email, {max: 254})) {
    errs.push('Invalid email.')
  }

  if (errs.length) {
    var err = new Error(errs.join('\n'))
    err.status = 400
    return next(err)
  }

  models.user.findOne({
    where: models.Sequelize.or({
      username: req.body.username
    }, {
      email: req.body.email
    })
  }).then(function (user) {
    if (user) {
      var err
      if (user.username.toLowerCase() === req.body.username.toLowerCase()) {
        err = new Error('Username is taken.')
      } else {
        err = new Error('Your email is already registered.')
      }
      err.status = 400
      return next(err)
    }

    bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
      if (err) {
        return next(err)
      }
      models.user.create({
        username: req.body.username,
        secret: hash,
        email: req.body.email
      }).then(function (user) {
        req.login(user, function (err) {
          if (err) {
            return next(err)
          }
          return res.send(user)
        })
      }).catch(function (err) {
        return next(err)
      })
    })
  }).catch(function (err) {
    return next(err)
  })
})

module.exports = router
