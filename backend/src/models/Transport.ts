import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db';

class Transport extends Model {
  public transport_id!: number;
  public vehicle_name!: string;
  public driver_name!: string;
  public capacity!: number;
  public image!: string | null; // Now stores Base64 string
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Transport.init(
  {
    transport_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    vehicle_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    driver_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    image: {
      type: DataTypes.TEXT('long'), // Using TEXT type to store Base64 encoded images
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Transport',
    tableName: 'transports',
    timestamps: true,
  }
);

export default Transport;