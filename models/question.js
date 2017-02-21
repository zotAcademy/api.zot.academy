'use strict'

module.exports = function (sequelize, DataTypes) {
  var Question = sequelize.define('Question', {
    text: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    classMethods: {
      associate (models) {
        Question.belongsTo(models.User, {
          as: 'Asker',
          foreignKey: {
            name: 'AskerId',
            allowNull: false
          }
        })
        Question.belongsToMany(models.Tag, { through: 'Post' })
        models.Tag.belongsToMany(Question, { through: 'Post' })
      }
    },
    instanceMethods: {
      toJSON: function () {
        return Object.assign({}, this.get())
      }
    }
  })

  return Question
}
