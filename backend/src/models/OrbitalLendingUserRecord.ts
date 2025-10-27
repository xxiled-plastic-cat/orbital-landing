import { DataTypes, Model, InferAttributes, InferCreationAttributes } from 'sequelize';
import sequelize from '../config/database.js';

class OrbitalLendingUserRecord extends Model<
  InferAttributes<OrbitalLendingUserRecord>,
  InferCreationAttributes<OrbitalLendingUserRecord>
> {
  declare address: string;
  declare marketId: number;
  declare action: string;
  declare tokenInId: number;
  declare tokenOutId: number;
  declare tokensOut: number;
  declare tokensIn: number;
  declare timestamp: number;
  declare txnId: string;
}

OrbitalLendingUserRecord.init({
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
  sequelize,
  tableName: 'orbital_lending_user_record',
  timestamps: false
});

export default OrbitalLendingUserRecord;

