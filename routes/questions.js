const express = require('express')
const router = express.Router()

const models = require('../models')

const requireAuthentication = require('./middlewares/requireAuthentication')

/* GET question listing. */
router.get('/', function (req, res, next) {
  models.question.findAll({
    include: [ models.user ]
  }).then(function (questions) {
    return res.send(questions)
  })
})

/* GET question by id */
router.get('/:id', function (req, res, next) {
  models.question.findById(+req.params.id, {
    include: [ models.user ]
  }).then(function (question) {
    if (!question) {
      var err = new Error('Question not found.')
      err.status = 400
      return next(err)
    }

    return res.send(question)
  })
})

/* POST new question */
router.post('/', requireAuthentication, function (req, res, next) {
  models.question.create({

  })
})

module.exports = router
