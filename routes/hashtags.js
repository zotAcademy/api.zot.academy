const express = require('express')
const router = express.Router()

const models = require('../models')

const getHashtagById = function (id) {
  return new Promise(function (resolve, reject) {
    var where
    if (/^[1-9]\d*$/.test('' + id)) {
      where = {
        id: +id
      }
    } else {
      where = {
        name: id
      }
    }
    models.hashtag.find({
      where
    }).then(resolve).catch(reject)
  })
}

router.get('/:id/posts/', function (req, res, next) {
  getHashtagById(req.params.id).then(function (hashtag) {
    if (!hashtag) {
      var err = new Error('Not found.')
      err.status = 404
      return next(err)
    }

    hashtag.getPosts({
      include: [{ model: models.user }],
      order: [['id', 'DESC']]
    }).then(function (posts) {
      res.send(posts)
    })
  })
})

module.exports = router
