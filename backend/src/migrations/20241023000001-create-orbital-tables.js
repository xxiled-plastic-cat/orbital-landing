export const up = async (queryInterface, Sequelize) => {
  // Create orbital_lending_markets table
  await queryInterface.createTable('orbital_lending_markets', {
    appId: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      allowNull: false
    },
    baseTokenId: {
      type: Sequelize.BIGINT,
      allowNull: false
    },
    lstTokenId: {
      type: Sequelize.BIGINT,
      allowNull: false
    }
  });

  // Create orbital_lending_user_record table
  await queryInterface.createTable('orbital_lending_user_record', {
    address: {
      type: Sequelize.STRING,
      primaryKey: true,
      allowNull: false
    },
    marketId: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      allowNull: false
    },
    action: {
      type: Sequelize.STRING,
      allowNull: false
    },
    tokenInId: {
      type: Sequelize.BIGINT,
      allowNull: false
    },
    tokenOutId: {
      type: Sequelize.BIGINT,
      allowNull: false
    },
    tokensOut: {
      type: Sequelize.REAL,
      allowNull: false
    },
    tokensIn: {
      type: Sequelize.REAL,
      allowNull: false
    },
    timestamp: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      allowNull: false
    },
    txnId: {
      type: Sequelize.STRING,
      allowNull: false
    }
  });

  // Add indexes for better query performance
  await queryInterface.addIndex('orbital_lending_user_record', ['address'], {
    name: 'user_record_address_idx'
  });
  await queryInterface.addIndex('orbital_lending_user_record', ['marketId'], {
    name: 'user_record_market_id_idx'
  });
  await queryInterface.addIndex('orbital_lending_user_record', ['timestamp'], {
    name: 'user_record_timestamp_idx'
  });
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('orbital_lending_user_record');
  await queryInterface.dropTable('orbital_lending_markets');
};

