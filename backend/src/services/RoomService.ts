// src/services/RoomService.ts
import Room from '../models/Room';

class RoomService {
  public static async createRoom(data: Partial<Room>): Promise<Room> {
    return Room.create(data);
  }

  public static async getAllRooms(): Promise<Room[]> {
    return Room.findAll();
  }

  public static async getRoomById(id: number): Promise<Room | null> {
    return Room.findByPk(id);
  }

  public static async updateRoom(id: number, data: Partial<Room>): Promise<[number, Room[]]> {
    return Room.update(data, { where: { room_id: id }, returning: true });
  }

  public static async deleteRoom(id: number): Promise<number> {
    return Room.destroy({ where: { room_id: id } });
  }
}

export default RoomService;
