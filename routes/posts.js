const express = require('express')
const router = express.Router()
const twttr = {
  txt: require('twitter-text')
}

const models = require('../models')

const requireAuthentication = require('./middlewares/requireAuthentication')

const include = [{
  model: models.user
}, {
  model: models.post,
  as: 'in_reply_to_post',
  include: [ models.user ]
}]

const setMentionsAndHashtags = function (post) {
  var mentions = twttr.txt.extractMentions(post.text).filter(function (mention, index, array) {
    return array.indexOf(mention) === index
  })

  var hashtags = twttr.txt.extractHashtags(post.text).filter(function (hashtag, index, array) {
    return array.indexOf(hashtag) === index
  })

  return Promise.all([
    new Promise(function (resolve, reject) {
      Promise.all(hashtags.map(function (hashtag) {
        return models.hashtag.findOrCreate({
          where: {
            name: hashtag
          }
        })
      })).then(function (results) {
        post.setHashtags(results.map(function (result) { return result[0] })).then(function () {
          resolve()
        }).catch(reject)
      }).catch(reject)
    }),
    new Promise(function (resolve, reject) {
      models.user.findAll({
        where: {
          $or: mentions.map(function (mention) {
            return { username: mention }
          })
        }
      }).then(function (users) {
        post.setMentions(users).then(function () {
          resolve()
        }).catch(reject)
      }).catch(reject)
    })
  ])
}

router.get('/', function (req, res, next) {
  var where = {}

  if (req.query.in_reply_to_post_id === '') {
    where.in_reply_to_post_id = null
  } else if (req.query.in_reply_to_post_id != null) {
    where.in_reply_to_post_id = +req.query.in_reply_to_post_id
  }

  models.post.findAll({
    where,
    include: [{ model: models.user }],
    order: [['id', 'DESC']]
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
          setMentionsAndHashtags(post).then(function () {
            models.post.findById(post.id, {
              include
            }).then(function (post) {
              res.send(post)
            })
          })
        })
      })
  } else {
    models.post.create(req.body, {
      fields: ['text', 'user_id']
    }).then(function (post) {
      setMentionsAndHashtags(post).then(function () {
        models.post.findById(post.id, {
          include: [{ all: true }]
        }).then(function (post) {
          res.send(post)
        })
      })
    })
  }
})

router.get('/:id', function (req, res, next) {
  models.post.findById(+req.params.id, {
    include
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
          include
        }).then(function (post) {
          setMentionsAndHashtags(post).then(function () {
            res.send(post)
          }).catch(function (err) {
            console.log(err)
          })
        })
      })
    })
})

router.delete('/:id', requireAuthentication, function (req, res, next) {
  models.post.findById(+req.params.id, {
    include
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
