import { Request, Response } from 'express';
import RoomService from '../services/RoomService';
import upload from '../utils/multerConfig';

class RoomController {
  // Create Room with image upload
  public static async createRoom(req: Request, res: Response) {
    upload.single('image')(req, res, async (err: any) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      try {
        const image = req.file ? req.file.path : null;
        const roomData = { ...req.body, image };
        const room = await RoomService.createRoom(roomData);
        res.status(201).json(room);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    });
  }

  // Get all rooms
  public static async getAllRooms(req: Request, res: Response) {
    try {
      const rooms = await RoomService.getAllRooms();
      res.status(200).json(rooms);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Get room by ID
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

  // Update Room with image upload
  public static async updateRoom(req: Request, res: Response) {
    upload.single('image')(req, res, async (err: any) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      try {
        const image = req.file ? req.file.path : null;
        const roomData = { ...req.body, image };
        const [updated, rooms] = await RoomService.updateRoom(Number(req.params.id), roomData);
        
        if (updated) {
          res.status(200).json(rooms[0]);
        } else {
          res.status(404).json({ error: 'Room not found' });
        }
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    });
  }

  // Delete Room
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
