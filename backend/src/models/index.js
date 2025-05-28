"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModels = exports.RoomBooking = exports.TransportBooking = exports.Room = exports.Transport = exports.Admin = exports.User = void 0;
// src/models/index.ts
const User_1 = __importDefault(require("./User"));
exports.User = User_1.default;
const Admin_1 = __importDefault(require("./Admin"));
exports.Admin = Admin_1.default;
const Transport_1 = __importDefault(require("./Transport"));
exports.Transport = Transport_1.default;
const Room_1 = __importDefault(require("./Room"));
exports.Room = Room_1.default;
const TransportBookings_1 = __importDefault(require("./TransportBookings"));
exports.TransportBooking = TransportBookings_1.default;
const RoomBookings_1 = __importDefault(require("./RoomBookings"));
exports.RoomBooking = RoomBookings_1.default;
const initModels = () => {
    // User Associations
    User_1.default.hasMany(TransportBookings_1.default, { foreignKey: 'user_id', as: 'transportBookings' });
    TransportBookings_1.default.belongsTo(User_1.default, { foreignKey: 'user_id', as: 'user' });
    User_1.default.hasMany(RoomBookings_1.default, { foreignKey: 'user_id', as: 'roomBookingsForUser' });
    RoomBookings_1.default.belongsTo(User_1.default, { foreignKey: 'user_id', as: 'user' });
    // Admin Associations
    Admin_1.default.hasMany(TransportBookings_1.default, { foreignKey: 'approver_id', as: 'transportApprovals' });
    TransportBookings_1.default.belongsTo(Admin_1.default, { foreignKey: 'approver_id', as: 'approver' });
    Admin_1.default.hasMany(RoomBookings_1.default, { foreignKey: 'approver_id', as: 'roomApprovals' });
    RoomBookings_1.default.belongsTo(Admin_1.default, { foreignKey: 'approver_id', as: 'approver' });
    // Transport Associations
    Transport_1.default.hasMany(TransportBookings_1.default, { foreignKey: 'transport_id', as: 'transportBookings' });
    TransportBookings_1.default.belongsTo(Transport_1.default, { foreignKey: 'transport_id', as: 'transport' });
    // Room Associations
    Room_1.default.hasMany(RoomBookings_1.default, { foreignKey: 'room_id', as: 'roomBookings' });
    RoomBookings_1.default.belongsTo(Room_1.default, { foreignKey: 'room_id', as: 'room' });
};
exports.initModels = initModels;
