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
      }
    },
    instanceMethods: {
      toJSON: function () {
        var value = Object.assign({}, this.get())
        value.html = autolink(value.text)
        return value
      }
    }
  })

  return post
}
