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
        user.belongsToMany(user, {
          as: 'followers',
          through: 'follow'
        })
        user.belongsToMany(user, {
          as: 'followings',
          through: 'follow'
        })
        user.hasMany(models.post)
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
