import { DataTypes, Model, InferAttributes, InferCreationAttributes } from 'sequelize';
import sequelize from '../config/database.js';

class OrbitalLendingMarket extends Model<
  InferAttributes<OrbitalLendingMarket>,
  InferCreationAttributes<OrbitalLendingMarket>
> {
  declare appId: number;
  declare baseTokenId: number;
  declare lstTokenId: number;
}

OrbitalLendingMarket.init({
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
  sequelize,
  tableName: 'orbital_lending_markets',
  timestamps: false
});

export default OrbitalLendingMarket;

