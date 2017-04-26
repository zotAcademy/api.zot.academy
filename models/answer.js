'use strict'

module.exports = function (sequelize, DataTypes) {
  var answer = sequelize.define('answer', {
    text: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    classMethods: {
      associate (models) {
        answer.belongsTo(models.user, {
          foreignKey: {
            allowNull: false,
            onDelete: 'CASCADE'
          }
        })
        answer.belongsTo(models.question, {
          foreignKey: {
            allowNull: false,
            onDelete: 'CASCADE'
          }
        })
      }
    },
    instanceMethods: {
      toJSON: function () {
        return Object.assign({}, this.get())
      }
    }
  })

  return answer
}
