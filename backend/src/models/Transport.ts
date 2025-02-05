import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/db';

interface TransportAttributes {
  transport_id: number;
  vehicle_name: string;
  driver_name: string;
  capacity: number;
  image?: string; // Atribut gambar
  createdAt?: Date;
  updatedAt?: Date;
}

interface TransportCreationAttributes extends Optional<TransportAttributes, 'transport_id'> {}

class Transport extends Model<TransportAttributes, TransportCreationAttributes> implements TransportAttributes {
  public transport_id!: number;
  public vehicle_name!: string;
  public driver_name!: string;
  public capacity!: number;
  public image?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Transport.init(
  {
    transport_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    vehicle_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    driver_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 },
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true, // Image bersifat opsional
    },
  },
  {
    sequelize,
    modelName: 'Transport',
    tableName: 'Transports',
    timestamps: true,
    engine: 'InnoDB',
  }
);

export default Transport;
