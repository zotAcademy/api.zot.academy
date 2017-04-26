'use strict'

module.exports = function (sequelize, DataTypes) {
  var tag = sequelize.define('tag', {
    name: {
      type: sequelize.options.dialect === 'postgres' ? 'citext' : DataTypes.STRING,
      unique: true,
      validate: {
        is: /^[a-z]\w*$/i,
        len: [1, 39]
      }
    }
  }, {
    classMethods: {
      associate (models) {
        models.user.belongsToMany(models.tag, {
          as: 'subscribers',
          through: 'subscribe'
        })
        models.tag.belongsToMany(models.user, {
          as: 'subscribings',
          through: 'subscribe'
        })
      }
    },
    instanceMethods: {
      toJSON: function () {
        return Object.assign({}, this.get())
      }
    }
  })

  return tag
}
