// backend/src/models/User.ts

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';


class User extends Model {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public phone!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    email: {
      type: new DataTypes.STRING(128),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    phone: {
      type: new DataTypes.STRING(15),
      allowNull: true,
      validate: {
        is: /^[0-9]+$/i, // Hanya angka
      },
    },
  },
  {
    tableName: 'users',
    sequelize,
  }
);

export default User;
