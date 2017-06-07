const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const saltRounds = 10
const validator = require('validator')

const models = require('../models')

router.get('/', function (req, res, next) {
  models.user.findAll({
  }).then(function (users) {
    res.send(users)
  })
})

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
    where: {
      $or: [{
        username: req.body.username
      }, {
        email: req.body.email
      }]
    }
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
        res.send(user)
      }).catch(function (err) {
        next(err)
      })
    })
  }).catch(function (err) {
    next(err)
  })
})

const getUserById = function (id) {
  return new Promise(function (resolve, reject) {
    var where
    if (/^[1-9]\d*$/.test('' + id)) {
      where = {
        id: +id
      }
    } else {
      where = {
        username: id
      }
    }
    models.user.find({
      where
    }).then(resolve).catch(reject)
  })
}

router.get('/:id', function (req, res, next) {
  getUserById(req.params.id).then(function (user) {
    if (!user) {
      var err = new Error('Not found.')
      err.status = 404
      return next(err)
    }

    res.send(user)
  })
})

router.get('/:id/posts/', function (req, res, next) {
  getUserById(req.params.id).then(function (user) {
    if (!user) {
      var err = new Error('Not found.')
      err.status = 404
      return next(err)
    }

    user.getPosts({
      include: [{ model: models.user }],
      order: [['id', 'DESC']]
    }).then(function (posts) {
      res.send(posts)
    })
  })
})

router.get('/:id/mentions/', function (req, res, next) {
  getUserById(req.params.id).then(function (user) {
    if (!user) {
      var err = new Error('Not found.')
      err.status = 404
      return next(err)
    }

    user.getMentions({
      include: [{ model: models.user }],
      through: {
        attributes: []
      },
      order: [['id', 'DESC']]
    }).then(function (posts) {
      res.send(posts)
    })
  })
})

module.exports = router
