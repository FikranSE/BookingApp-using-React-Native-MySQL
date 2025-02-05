import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/db';

interface RoomAttributes {
  room_id: number;
  room_name: string;
  room_type: string;
  capacity: string;
  facilities: string;
  image?: string; // Atribut gambar
  createdAt?: Date;
  updatedAt?: Date;
}

interface RoomCreationAttributes extends Optional<RoomAttributes, 'room_id'> {}

class Room extends Model<RoomAttributes, RoomCreationAttributes> implements RoomAttributes {
  public room_id!: number;
  public room_name!: string;
  public room_type!: string;
  public capacity!: string;
  public facilities!: string;
  public image?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Room.init(
  {
    room_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    room_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    room_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    capacity: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    facilities: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true, // Image bersifat opsional
    },
  },
  {
    sequelize,
    modelName: 'Room',
    tableName: 'Rooms',
    timestamps: true,
  }
);

export default Room;
