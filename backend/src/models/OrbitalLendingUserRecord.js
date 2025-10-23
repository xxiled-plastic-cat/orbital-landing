import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const OrbitalLendingUserRecord = sequelize.define('orbital_lending_user_record', {
  address: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  marketId: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tokenInId: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  tokenOutId: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  tokensOut: {
    type: DataTypes.REAL,
    allowNull: false
  },
  tokensIn: {
    type: DataTypes.REAL,
    allowNull: false
  },
  timestamp: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false
  },
  txnId: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'orbital_lending_user_record',
  timestamps: false
});

export default OrbitalLendingUserRecord;

