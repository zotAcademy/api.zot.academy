const express = require('express')
const router = express.Router()

const models = require('../models')

const requireAuthentication = require('./middlewares/requireAuthentication')

router.get('/', function (req, res, next) {
  models.post.findAll({
    order: [['createdAt', 'DESC']],
    attributes: {
      include: [[models.Sequelize.fn('COUNT', models.Sequelize.col('comments.id')), 'commentsCount']]
    },
    include: [{
      model: models.comment,
      attributes: []
    }, {
      model: models.user
    }],
    group: ['post.id']
  }).then(function (posts) {
    res.send(posts)
  })
})

router.post('/', requireAuthentication, function (req, res, next) {
  req.body.userId = req.user.id
  models.post.create(req.body, {
    fields: ['text', 'userId'],
    include: [{ all: true }]
  }).then(function (post) {
    res.send(post)
  })
})

router.get('/:id', function (req, res, next) {
  models.post.findById(+req.params.id, {
    include: [ models.user, models.comment ]
  }).then(function (post) {
    if (!post) {
      var err = new Error('Not found.')
      err.status = 404
      return next(err)
    }

    res.send(post)
  })
})

router.patch('/:id', requireAuthentication, function (req, res, next) {
  models.post.findById(+req.params.id)
    .then(function (post) {
      var err
      if (!post) {
        err = new Error('Not found.')
        err.status = 404
        return next(err)
      }

      if (post.userId !== req.user.id) {
        err = new Error('Permission denied.')
        err.status = 403
        return next(err)
      }

      post.update(req.body, {
        fields: ['text']
      }).then(function () {
        res.send(post)
      })
    })
})

router.delete('/:id', requireAuthentication, function (req, res, next) {
  models.post.findById(+req.params.id)
    .then(function (post) {
      var err
      if (!post) {
        err = new Error('Not found.')
        err.status = 404
        return next(err)
      }

      if (post.userId !== req.user.id) {
        err = new Error('Permission denied.')
        err.status = 403
        return next(err)
      }

      models.comment.findOne({
        postId: post.id
      }).then(function (comment) {
        if (comment) {
          err = new Error('Cannot delete post once it has been commented.')
          err.status = 403
          return next(err)
        }

        post.destroy()
          .then(function () {
            res.send(post)
          })
      })
    })
})

module.exports = router
