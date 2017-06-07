'use strict'

const autolink = require('./middlewares/autolink')

module.exports = function (sequelize, DataTypes) {
  var post = sequelize.define('post', {
    text: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    classMethods: {
      associate (models) {
        post.belongsTo(models.user, {
          foreignKey: {
            allowNull: false,
            onDelete: 'CASCADE'
          }
        })
        post.belongsTo(post, {
          as: 'in_reply_to_post'
        })
        post.belongsToMany(models.user, {
          as: 'mentions',
          through: 'mention'
        })
        models.user.belongsToMany(post, {
          as: 'mentions',
          through: 'mention'
        })
      }
    },
    instanceMethods: {
      toJSON: function () {
        var value = Object.assign({}, this.get())

        // https://github.com/sequelize/sequelize/issues/5590
        delete value.mention

        value.html = autolink(value.text)
        return value
      }
    }
  })

  return post
}
