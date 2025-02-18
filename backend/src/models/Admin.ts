import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/db';

interface AdminAttributes {
  admin_id: number;
  username: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AdminCreationAttributes extends Optional<AdminAttributes, 'admin_id'> {}

class Admin extends Model<AdminAttributes, AdminCreationAttributes> implements AdminAttributes {
  public admin_id!: number;
  public username!: string;
  public email!: string;
  public password!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Admin.init(
  {
    admin_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
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
  }
);

export default Admin;