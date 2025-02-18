// src/services/RoomBookingService.ts

import { RoomBooking } from "../models";

class RoomBookingService {
  public static async createBooking(data: Partial<RoomBooking>): Promise<RoomBooking> {
    return RoomBooking.create(data);
  }

  public static async getAllBookings(): Promise<RoomBooking[]> {
    return RoomBooking.findAll();
  }

  public static async getBookingById(id: number): Promise<RoomBooking | null> {
    return RoomBooking.findByPk(id);
  }

  public static async updateBooking(id: number, data: Partial<RoomBooking>): Promise<RoomBooking | null> {
    const [affectedCount] = await RoomBooking.update(data, {
      where: { booking_id: id }
    });
  
    if (affectedCount > 0) {
      const updatedBooking = await RoomBooking.findByPk(id);
      return updatedBooking;
    }
  
    return null;
  }

  public static async deleteBooking(id: number): Promise<number> {
    return RoomBooking.destroy({ where: { booking_id: id } });
  }
}

export default RoomBookingService;
