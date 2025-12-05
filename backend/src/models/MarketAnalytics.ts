import { DataTypes, Model, InferAttributes, InferCreationAttributes } from 'sequelize';
import sequelize from '../config/database.js';

class MarketAnalytics extends Model<
  InferAttributes<MarketAnalytics>,
  InferCreationAttributes<MarketAnalytics>
> {
  declare id: number;
  declare marketAppId: number;
  declare baseTokenId: number;
  declare tvl: number;
  declare borrowing: number;
  declare feePool: bigint | null;
  declare totalCommissionEarned: bigint | null;
  declare dateAdded: Date;
}

MarketAnalytics.init({
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  marketAppId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    field: 'market_app_id'
  },
  baseTokenId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    field: 'base_token_id'
  },
  tvl: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
    get() {
      const value = this.getDataValue('tvl');
      return value ? parseFloat(value.toString()) : 0;
    }
  },
  borrowing: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
    get() {
      const value = this.getDataValue('borrowing');
      return value ? parseFloat(value.toString()) : 0;
    }
  },
  feePool: {
    type: DataTypes.DECIMAL(30, 0),
    allowNull: true,
    field: 'fee_pool',
    get() {
      const value = this.getDataValue('fee_pool');
      return value ? BigInt(value.toString()) : null;
    }
  },
  totalCommissionEarned: {
    type: DataTypes.DECIMAL(30, 0),
    allowNull: true,
    field: 'total_commission_earned',
    get() {
      const value = this.getDataValue('total_commission_earned');
      return value ? BigInt(value.toString()) : null;
    }
  },
  dateAdded: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'date_added'
  }
}, {
  sequelize,
  tableName: 'market_analytics',
  timestamps: false,
  indexes: [
    {
      fields: ['market_app_id']
    },
    {
      fields: ['date_added']
    },
    {
      fields: ['market_app_id', 'date_added']
    }
  ]
});

export default MarketAnalytics;

