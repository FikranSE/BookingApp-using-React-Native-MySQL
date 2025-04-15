// src/models/RoomBooking.ts
import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/db';

interface RoomBookingAttributes {
  booking_id: number;
  user_id: number;
  room_id: number;
  booking_date: Date;
  start_time: string;
  end_time: string;
  pic: string;
  section: string;
  description?: string;
  status: string; // ENUM: 'pending', 'approved', 'reject'
  notes?: string;
  approver_id?: number;
  approved_at?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  agenda?: string; // New attribute
}

interface RoomBookingCreationAttributes extends Optional<RoomBookingAttributes, 'booking_id' | 'description' | 'notes' | 'approver_id' | 'approved_at' | 'agenda'> {}

class RoomBooking extends Model<RoomBookingAttributes, RoomBookingCreationAttributes> implements RoomBookingAttributes {
  public booking_id!: number;
  public user_id!: number;
  public room_id!: number;
  public booking_date!: Date;
  public start_time!: string;
  public end_time!: string;
  public pic!: string;
  public section!: string;
  public description?: string;
  public status!: string;
  public notes?: string;
  public approver_id?: number;
  public approved_at!: Date;
  public agenda?: string; // New attribute

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RoomBooking.init(
  {
    booking_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    room_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    booking_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    start_time: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    end_time: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    pic: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    section: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    approver_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    approved_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    agenda: { // New attribute
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'RoomBooking',
    tableName: 'RoomBookings',
    timestamps: true,
  }
);

export default RoomBooking;
