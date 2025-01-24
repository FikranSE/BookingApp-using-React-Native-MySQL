// src/controllers/RoomController.ts
import { Request, Response } from 'express';
import RoomService from '../services/RoomService';

class RoomController {
  public static async createRoom(req: Request, res: Response) {
    try {
      const room = await RoomService.createRoom(req.body);
      res.status(201).json(room);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  public static async getAllRooms(req: Request, res: Response) {
    try {
      const rooms = await RoomService.getAllRooms();
      res.status(200).json(rooms);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  public static async getRoomById(req: Request, res: Response) {
    try {
      const room = await RoomService.getRoomById(Number(req.params.id));
      if (room) {
        res.status(200).json(room);
      } else {
        res.status(404).json({ error: 'Room not found' });
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  public static async updateRoom(req: Request, res: Response) {
    try {
      const [updated, rooms] = await RoomService.updateRoom(Number(req.params.id), req.body);
      if (updated) {
        res.status(200).json(rooms[0]);
      } else {
        res.status(404).json({ error: 'Room not found' });
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  } 

  public static async deleteRoom(req: Request, res: Response) {
    try {
      const deleted = await RoomService.deleteRoom(Number(req.params.id));
      if (deleted) {
        res.status(200).json({ message: 'Room deleted successfully' });
      } else {
        res.status(404).json({ error: 'Room not found' });
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default RoomController;
