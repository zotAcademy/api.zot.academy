'use strict'

const twitter = require('twitter-text')

module.exports = function (sequelize, DataTypes) {
  var comment = sequelize.define('comment', {
    text: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    classMethods: {
      associate (models) {
        comment.belongsTo(models.user, {
          foreignKey: {
            allowNull: false,
            onDelete: 'CASCADE'
          }
        })
        comment.belongsTo(models.post, {
          foreignKey: {
            allowNull: false,
            onDelete: 'CASCADE'
          }
        })
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

  return comment
}
