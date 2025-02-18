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

  public static async updateRoom(id: number, data: Partial<Room>): Promise<Room | null> {
    const [affectedCount] = await Room.update(data, {
      where: { room_id: id }
    });
  
    if (affectedCount > 0) {
      const updatedRoom = await Room.findByPk(id);
      return updatedRoom;
    }
  
    return null;
  }

  public static async deleteRoom(id: number): Promise<number> {
    return Room.destroy({ where: { room_id: id } });
  }
}

export default RoomService;
