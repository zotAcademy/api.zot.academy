const express = require('express')
const router = express.Router()

const models = require('../models')

/* GET tags listing. */
router.get('/', function (req, res, next) {
  models.tag.findAll({
  }).then(function (tags) {
    return res.send(tags)
  })
})

/* GET questions by tag id or name */
router.get('/:id/questions/', function (req, res, next) {
  var where
  if (/^[1-9]\d*$/.test(req.params.id)) {
    where = {
      id: +req.params.id
    }
  } else {
    where = {
      name: req.params.id
    }
  }
  models.tag.find({
    where
  }).then(function (tag) {
    if (!tag) {
      var err = new Error('Tag not found.')
      err.status = 400
      return next(err)
    }

    tag.getQuestions().then(function (questions) {
      return res.send(questions)
    })
  })
})

module.exports = router
