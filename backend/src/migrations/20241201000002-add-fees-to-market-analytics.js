export const up = async (queryInterface, Sequelize) => {
  // Add fee_pool and total_commission_earned columns to market_analytics table
  await queryInterface.addColumn('market_analytics', 'fee_pool', {
    type: Sequelize.DECIMAL(30, 0), // BigInt as decimal to store large numbers
    allowNull: true, // Allow null for existing records
    comment: 'Fee pool value (10% of interest fees) in base token microunits'
  });

  await queryInterface.addColumn('market_analytics', 'total_commission_earned', {
    type: Sequelize.DECIMAL(30, 0), // BigInt as decimal to store large numbers
    allowNull: true, // Allow null for existing records
    comment: 'Cumulative total commission earned (includes additional rewards) in base token microunits'
  });
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.removeColumn('market_analytics', 'total_commission_earned');
  await queryInterface.removeColumn('market_analytics', 'fee_pool');
};

