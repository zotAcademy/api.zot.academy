'use strict'

module.exports = function (sequelize, DataTypes) {
  var Answer = sequelize.define('Answer', {
    text: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    classMethods: {
      associate (models) {
        Answer.belongsTo(models.User, {
          as: 'Answerer',
          foreignKey: {
            name: 'answererId',
            allowNull: false
          }
        })
        Answer.belongsTo(models.Question)
      }
    },
    instanceMethods: {
      toJSON: function () {
        return Object.assign({}, this.get())
      }
    }
  })

  return Answer
}
