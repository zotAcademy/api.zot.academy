'use strict'

module.exports = function (sequelize, DataTypes) {
  var user = sequelize.define('user', {
    username: {
      type: sequelize.options.dialect === 'postgres' ? 'citext' : DataTypes.STRING,
      unique: true,
      validate: {
        is: /^[a-z]\w*$/i,
        len: [1, 39]
      }
    },
    email: {
      type: sequelize.options.dialect === 'postgres' ? 'citext' : DataTypes.STRING,
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
        models.user.belongsToMany(models.user, {
          as: 'followers',
          through: 'follow'
        })
        models.user.belongsToMany(models.user, {
          as: 'followings',
          through: 'follow'
        })
      }
    },
    instanceMethods: {
      toJSON: function () {
        var value = Object.assign({}, this.get())
        delete value.email
        delete value.secret
        return value
      }
    }
  })

  return user
}
