'use strict'

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
        question.belongsToMany(models.tag, { through: 'post' })
        models.tag.belongsToMany(question, { through: 'post' })
      }
    },
    instanceMethods: {
      toJSON: function () {
        return Object.assign({}, this.get())
      }
    }
  })

  return question
}
