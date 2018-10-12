'use strict';
module.exports =function (sequelize, DataTypes) {
  let game = sequelize.define('game', {
    name: DataTypes.STRING,
    url: DataTypes.STRING,
    classes: DataTypes.TEXT,
    date_start: DataTypes.DATE,
    date_end: DataTypes.DATE,
    address1: DataTypes.STRING,
    address2: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    country: DataTypes.STRING,
    zip_code: DataTypes.STRING
  }, {
    underscored: true
  });

  game.associate = function (models) {
    models.game.hasMany(models.game_ad);
    models.game.hasMany(models.organization_game);
    models.game.hasMany(models.game_throw);
  };

  return game;
};
