export const up = async (queryInterface, Sequelize) => {
  // Create market_analytics table
  await queryInterface.createTable('market_analytics', {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    market_app_id: {
      type: Sequelize.BIGINT,
      allowNull: false,
      comment: 'Market application ID'
    },
    base_token_id: {
      type: Sequelize.BIGINT,
      allowNull: false,
      comment: 'Base token asset ID'
    },
    tvl: {
      type: Sequelize.DECIMAL(20, 2),
      allowNull: false,
      comment: 'Total Value Locked in USD'
    },
    borrowing: {
      type: Sequelize.DECIMAL(20, 2),
      allowNull: false,
      comment: 'Total borrowing in USD'
    },
    date_added: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      comment: 'Date when this analytics record was created'
    }
  });

  // Add indexes for better query performance
  await queryInterface.addIndex('market_analytics', ['market_app_id'], {
    name: 'market_analytics_market_app_id_idx'
  });
  await queryInterface.addIndex('market_analytics', ['date_added'], {
    name: 'market_analytics_date_added_idx'
  });
  await queryInterface.addIndex('market_analytics', ['market_app_id', 'date_added'], {
    name: 'market_analytics_market_date_idx'
  });
};

export const down = async (queryInterface, Sequelize) => {
  // Remove indexes first
  await queryInterface.removeIndex('market_analytics', 'market_analytics_market_date_idx');
  await queryInterface.removeIndex('market_analytics', 'market_analytics_date_added_idx');
  await queryInterface.removeIndex('market_analytics', 'market_analytics_market_app_id_idx');
  
  // Drop table
  await queryInterface.dropTable('market_analytics');
};

