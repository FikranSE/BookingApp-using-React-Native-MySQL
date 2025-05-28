"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/RoomBooking.ts
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class RoomBooking extends sequelize_1.Model {
}
RoomBooking.init({
    booking_id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    room_id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    booking_date: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    start_time: {
        type: sequelize_1.DataTypes.STRING(5),
        allowNull: false,
    },
    end_time: {
        type: sequelize_1.DataTypes.STRING(5),
        allowNull: false,
    },
    pic: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    section: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
    },
    notes: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    approver_id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
    },
    approved_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    agenda: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
}, {
    sequelize: db_1.default,
    modelName: 'RoomBooking',
    tableName: 'RoomBookings',
    timestamps: true,
});
exports.default = RoomBooking;
