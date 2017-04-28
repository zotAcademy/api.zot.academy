'use strict'

const twitter = require('twitter-text')

module.exports = function (sequelize, DataTypes) {
  var post = sequelize.define('post', {
    text: {
      type: DataTypes.STRING,
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
        post.hasMany(models.comment)
      }
    },
    instanceMethods: {
      toJSON: function () {
        var value = Object.assign({}, this.get())

        value.entities = twitter.extractEntitiesWithIndices(value.text, {
          extractUrlsWithoutProtocol: false
        })

        return value
      }
    }
  })

  return post
}
