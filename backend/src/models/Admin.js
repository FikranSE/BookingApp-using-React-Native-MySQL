"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class Admin extends sequelize_1.Model {
}
Admin.init({
    admin_id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: { isEmail: true },
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize: db_1.default,
    modelName: 'Admin',
    tableName: 'Admins',
    timestamps: true,
    engine: 'InnoDB',
    indexes: [
        {
            unique: true,
            fields: ['username'],
            name: 'admin_username_unique'
        },
        {
            unique: true,
            fields: ['email'],
            name: 'admin_email_unique'
        }
    ]
});
exports.default = Admin;
