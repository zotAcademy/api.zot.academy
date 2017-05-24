const express = require('express')
const router = express.Router()

const models = require('../models')

const requireAuthentication = require('./middlewares/requireAuthentication')

router.get('/', function (req, res, next) {
  models.post.findAll({
    order: [['id', 'DESC']],
    include: [{
      model: models.user
    }]
  }).then(function (posts) {
    res.send(posts)
  })
})

router.post('/', requireAuthentication, function (req, res, next) {
  req.body.user_id = req.user.id
  if (req.body.in_reply_to_post_id) {
    models.post.findById(req.body.in_reply_to_post_id)
      .then(function (post) {
        if (!post) {
          var err = new Error('Replying Post Not found.')
          err.status = 404
          return next(err)
        }

        models.post.create(req.body, {
          fields: ['text', 'user_id', 'in_reply_to_post_id']
        }).then(function (post) {
          models.post.findById(post.id, {
            include: [{ all: true }]
          }).then(function (post) {
            res.send(post)
          })
        })
      })
  } else {
    models.post.create(req.body, {
      fields: ['text', 'user_id']
    }).then(function (post) {
      models.post.findById(post.id, {
        include: [{ all: true }]
      }).then(function (post) {
        res.send(post)
      })
    })
  }
})

router.get('/:id', function (req, res, next) {
  models.post.findById(+req.params.id, {
    include: [{ all: true }]
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

      if (post.user_id !== req.user.id) {
        err = new Error('Permission denied.')
        err.status = 403
        return next(err)
      }

      post.update(req.body, {
        fields: ['text']
      }).then(function () {
        models.post.findById(post.id, {
          include: [{ all: true }]
        }).then(function (post) {
          res.send(post)
        })
      })
    })
})

router.delete('/:id', requireAuthentication, function (req, res, next) {
  models.post.findById(+req.params.id, {
    include: [{ all: true }]
  }).then(function (post) {
    var err
    if (!post) {
      err = new Error('Not found.')
      err.status = 404
      return next(err)
    }

    if (post.user_id !== req.user.id) {
      err = new Error('Permission denied.')
      err.status = 403
      return next(err)
    }

    post.destroy()
      .then(function () {
        res.send(post)
      })
  })
})

module.exports = router
