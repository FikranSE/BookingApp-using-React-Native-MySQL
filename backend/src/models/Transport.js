"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class Transport extends sequelize_1.Model {
}
Transport.init({
    transport_id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    vehicle_name: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    driver_name: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    capacity: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    image: {
        type: sequelize_1.DataTypes.TEXT('long'), // Using TEXT type to store Base64 encoded images
        allowNull: true,
    },
}, {
    sequelize: db_1.default,
    modelName: 'Transport',
    tableName: 'transports',
    timestamps: true,
});
exports.default = Transport;
