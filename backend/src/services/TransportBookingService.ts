// src/services/TransportBookingService.ts

import { TransportBooking } from "../models";


class TransportBookingService {
  public static async createBooking(data: Partial<TransportBooking>): Promise<TransportBooking> {
    return TransportBooking.create(data);
  }

  public static async getAllBookings(): Promise<TransportBooking[]> {
    return TransportBooking.findAll();
  }

  public static async getBookingById(id: number): Promise<TransportBooking | null> {
    return TransportBooking.findByPk(id);
  }

  public static async updateBooking(id: number, data: Partial<TransportBooking>): Promise<[number, TransportBooking[]]> {
    return TransportBooking.update(data, { where: { booking_id: id }, returning: true });
  }

  public static async deleteBooking(id: number): Promise<number> {
    return TransportBooking.destroy({ where: { booking_id: id } });
  }
}

export default TransportBookingService;
