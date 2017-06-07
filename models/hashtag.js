'use strict'

module.exports = function (sequelize, DataTypes) {
  var hashtag = sequelize.define('hashtag', {
    name: {
      type: sequelize.options.dialect === 'postgres' ? 'citext' : DataTypes.STRING,
      unique: true,
      validate: {
        is: /^[a-z]\w*$/i
      }
    }
  }, {
    timestamps: false,
    classMethods: {
      associate (models) {
        models.user.belongsToMany(models.hashtag, {
          as: 'subscribers',
          through: 'subscribe'
        })
        models.hashtag.belongsToMany(models.user, {
          as: 'subscribings',
          through: 'subscribe'
        })
      }
    },
    instanceMethods: {
      toJSON: function () {
        var value = Object.assign({}, this.get())

        delete value.hash

        return value
      }
    }
  })

  return hashtag
}
