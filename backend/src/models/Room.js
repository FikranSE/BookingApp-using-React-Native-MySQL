"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class Room extends sequelize_1.Model {
}
Room.init({
    room_id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    room_name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    room_type: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    capacity: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    facilities: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    image: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true, // Image bersifat opsional
    },
}, {
    sequelize: db_1.default,
    modelName: 'Room',
    tableName: 'Rooms',
    timestamps: true,
});
exports.default = Room;
