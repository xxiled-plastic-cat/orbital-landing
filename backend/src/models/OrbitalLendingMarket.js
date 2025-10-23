import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const OrbitalLendingMarket = sequelize.define('orbital_lending_markets', {
  appId: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false
  },
  baseTokenId: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  lstTokenId: {
    type: DataTypes.BIGINT,
    allowNull: false
  }
}, {
  tableName: 'orbital_lending_markets',
  timestamps: false
});

export default OrbitalLendingMarket;

