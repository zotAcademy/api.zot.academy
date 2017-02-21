'use strict'

module.exports = function (sequelize, DataTypes) {
  var Subscribe = sequelize.define('Subscribe', {
    subscriberId: DataTypes.INTEGER,
    subscribingId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate (models) {
        models.User.belongsToMany(models.Tag, {
          as: 'Subscribers',
          foreignKey: 'subscriberId',
          through: Subscribe
        })
        models.Tag.belongsToMany(models.User, {
          as: 'Subscribings',
          foreignKey: 'subscribingId',
          through: Subscribe
        })
      }
    }
  })

  return Subscribe
}
