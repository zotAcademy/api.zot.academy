'use strict'

module.exports = function (sequelize, DataTypes) {
  var Tag = sequelize.define('Tag', {
    name: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        is: /^[a-z]\w*$/i,
        len: [1, 39]
      }
    }
  }, {
    classMethods: {
      associate (models) {
      }
    },
    instanceMethods: {
      toJSON: function () {
        return Object.assign({}, this.get())
      }
    }
  })

  return Tag
}
