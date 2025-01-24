// src/models/index.ts
import User from './User';
import Admin from './Admin';
import Transport from './Transport';
import Room from './Room';
import TransportBooking from './TransportBookings';
import RoomBooking from './RoomBookings';

const initModels = () => {
  // User Associations
  User.hasMany(TransportBooking, { foreignKey: 'user_id', as: 'transportBookings' });
  TransportBooking.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  User.hasMany(RoomBooking, { foreignKey: 'user_id', as: 'roomBookingsForUser' });
  RoomBooking.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // Admin Associations
  Admin.hasMany(TransportBooking, { foreignKey: 'approver_id', as: 'transportApprovals' });
  TransportBooking.belongsTo(Admin, { foreignKey: 'approver_id', as: 'approver' });

  Admin.hasMany(RoomBooking, { foreignKey: 'approver_id', as: 'roomApprovals' });
  RoomBooking.belongsTo(Admin, { foreignKey: 'approver_id', as: 'approver' });

  // Transport Associations
  Transport.hasMany(TransportBooking, { foreignKey: 'transport_id', as: 'transportBookings' });
  TransportBooking.belongsTo(Transport, { foreignKey: 'transport_id', as: 'transport' });

  // Room Associations
  Room.hasMany(RoomBooking, { foreignKey: 'room_id', as: 'roomBookings' });
  RoomBooking.belongsTo(Room, { foreignKey: 'room_id', as: 'room' });
};

export {
  User,
  Admin,
  Transport,
  Room,
  TransportBooking,
  RoomBooking,
  initModels,
};
