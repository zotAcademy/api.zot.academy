'use strict'

module.exports = function (sequelize, DataTypes) {
  var User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        is: /^[a-z]\w*$/i,
        len: [1, 39]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    secret: DataTypes.STRING
  }, {
    classMethods: {
      associate (models) {
      }
    },
    instanceMethods: {
      toJSON: function () {
        var values = Object.assign({}, this.get())

        delete values.secret
        return values
      }
    }
  })

  return User
}
