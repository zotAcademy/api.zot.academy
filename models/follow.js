'use strict'

module.exports = function (sequelize, DataTypes) {
  var Follow = sequelize.define('Follow', {
    followerId: DataTypes.INTEGER,
    followingId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate (models) {
        models.User.belongsToMany(models.User, {
          as: 'Followers',
          foreignKey: 'followerId',
          through: Follow
        })
        models.User.belongsToMany(models.User, {
          as: 'Followings',
          foreignKey: 'followingId',
          through: Follow
        })
      }
    }
  })

  return Follow
}
