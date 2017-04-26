const express = require('express')
const router = express.Router()

const models = require('../models')

const requireAuthentication = require('./middlewares/requireAuthentication')

/* GET question listing. */
router.get('/', function (req, res, next) {
  models.Question.findAll({
    include: [ models.User ]
  }).then(function (questions) {
    return res.send(questions)
  })
})

/* GET question by id */
router.get('/:id', function (req, res, next) {
  models.Question.findById(+req.params.id, {
    include: [ models.User ]
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

})

module.exports = router
