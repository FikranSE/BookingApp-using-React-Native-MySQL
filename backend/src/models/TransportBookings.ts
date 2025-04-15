// src/models/TransportBooking.ts
import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/db';

interface TransportBookingAttributes {
  booking_id: number;
  user_id: number;
  transport_id: number;
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
  destination: string;
  createdAt?: Date;
  updatedAt?: Date;
  agenda?: string; // New attribute
}

interface TransportBookingCreationAttributes extends Optional<TransportBookingAttributes, 'booking_id' | 'description' | 'notes' | 'approver_id' | 'approved_at' | 'agenda'> {}

class TransportBooking extends Model<TransportBookingAttributes, TransportBookingCreationAttributes> implements TransportBookingAttributes {
  public booking_id!: number;
  public user_id!: number;
  public transport_id!: number;
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
  public destination!: string;
  public agenda?: string; // New attribute

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

TransportBooking.init(
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
    transport_id: {
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
    destination: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    agenda: { // New attribute
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'TransportBooking',
    tableName: 'TransportBookings',
    timestamps: true,
    engine: 'InnoDB',
  }
);

export default TransportBooking;
