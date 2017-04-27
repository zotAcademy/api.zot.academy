const express = require('express')
const router = express.Router()

const models = require('../models')

const requireAuthentication = require('./middlewares/requireAuthentication')

router.get('/', function (req, res, next) {
  models.question.findAll({
    include: [ models.user ]
  }).then(function (questions) {
    res.send(questions)
  })
})

router.post('/', requireAuthentication, function (req, res, next) {
  req.body.userId = req.user.id
  models.question.create(req.body, {
    fields: ['text', 'userId'],
    include: [{ all: true }]
  }).then(function (question) {
    res.send(question)
  })
})

router.get('/:id', function (req, res, next) {
  models.question.findById(+req.params.id, {
    include: [ models.user, models.answer ]
  }).then(function (question) {
    if (!question) {
      var err = new Error('Not found.')
      err.status = 404
      return next(err)
    }

    res.send(question)
  })
})

router.patch('/:id', requireAuthentication, function (req, res, next) {
  models.question.findById(+req.params.id)
    .then(function (question) {
      var err
      if (!question) {
        err = new Error('Not found.')
        err.status = 404
        return next(err)
      }

      if (question.userId !== req.user.id) {
        err = new Error('Permission denied.')
        err.status = 403
        return next(err)
      }

      question.update(req.body, {
        fields: ['text']
      }).then(function () {
        res.send(question)
      })
    })
})

router.delete('/:id', requireAuthentication, function (req, res, next) {
  models.question.findById(+req.params.id)
    .then(function (question) {
      var err
      if (!question) {
        err = new Error('Not found.')
        err.status = 404
        return next(err)
      }

      if (question.userId !== req.user.id) {
        err = new Error('Permission denied.')
        err.status = 403
        return next(err)
      }

      question.destroy()
        .then(function () {
          res.send(question)
        })
    })
})

module.exports = router
