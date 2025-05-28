"use strict";
// backend/src/models/User.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class User extends sequelize_1.Model {
}
User.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: new sequelize_1.DataTypes.STRING(128),
        allowNull: false,
    },
    email: {
        type: new sequelize_1.DataTypes.STRING(128),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: new sequelize_1.DataTypes.STRING(128),
        allowNull: false,
    },
    phone: {
        type: new sequelize_1.DataTypes.STRING(15),
        allowNull: true,
        validate: {
            is: /^[0-9]+$/i, // Hanya angka
        },
    },
}, {
    tableName: 'users',
    sequelize: db_1.default,
});
exports.default = User;
