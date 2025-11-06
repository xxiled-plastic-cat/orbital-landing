export const up = async (queryInterface, Sequelize) => {
  // Add network column to orbital_lending_markets table
  await queryInterface.addColumn('orbital_lending_markets', 'network', {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: 'mainnet',
    comment: 'Network type: mainnet or testnet'
  });

  // Add index for better query performance when filtering by network
  await queryInterface.addIndex('orbital_lending_markets', ['network'], {
    name: 'orbital_lending_markets_network_idx'
  });
};

export const down = async (queryInterface, Sequelize) => {
  // Remove index first
  await queryInterface.removeIndex('orbital_lending_markets', 'orbital_lending_markets_network_idx');
  
  // Remove network column
  await queryInterface.removeColumn('orbital_lending_markets', 'network');
};

