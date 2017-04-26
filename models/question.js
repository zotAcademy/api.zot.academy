'use strict'

const twitter = require('twitter-text')

module.exports = function (sequelize, DataTypes) {
  var question = sequelize.define('question', {
    text: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    classMethods: {
      associate (models) {
        question.belongsTo(models.user, {
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

  return question
}
