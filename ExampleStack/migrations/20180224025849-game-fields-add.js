'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return [
      queryInterface.addColumn(
        'games',
        'url',
        {
          type: Sequelize.STRING
        }
      ),
      queryInterface.addColumn(
        'games',
        'classes',
        {
          type: Sequelize.TEXT
        }
      ),
      queryInterface.addColumn(
        'games',
        'date_start',
        {
          type: Sequelize.DATE
        }
      ),
      queryInterface.addColumn(
        'games',
        'date_end',
        {
          type: Sequelize.DATE
        }
      )
    ];
  },

  down: function (queryInterface, Sequelize) {
    return [
      queryInterface.removeColumn('games', 'url'),
      queryInterface.removeColumn('games', 'classes'),
      queryInterface.removeColumn('games', 'date_start'),
      queryInterface.removeColumn('games', 'date_end')
    ];
  }
};
