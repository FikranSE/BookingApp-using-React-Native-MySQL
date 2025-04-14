import { Request, Response } from 'express';
import RoomService from '../services/RoomService';
import upload from '../utils/multerConfig';
import fs from 'fs';
import path from 'path';

class RoomController {
  // Create Room with image upload
  public static async createRoom(req: Request, res: Response) {
    upload.single('image')(req, res, async (err: any) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      try {
        const serverUrl = 'https://j9d3hc82-3001.asse.devtunnels.ms/'; // Ensure this URL is set up correctly in your environment
        const image = req.file ? `${serverUrl}/uploads/${req.file.filename}` : null;
        
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
    try {
      const existingRoom = await RoomService.getRoomById(Number(req.params.id));

      if (!existingRoom) {
        return res.status(404).json({ error: 'Room not found' });
      }

      upload.single('image')(req, res, async (err: any) => {
        if (err) {
          return res.status(400).json({ error: err.message });
        }

        try {
          const newImagePath = req.file ? req.file.path : null;
          const serverUrl = 'https://j9d3hc82-3001.asse.devtunnels.ms/'; // Ensure this URL is correctly set
          const imageUrl = newImagePath ? `${serverUrl}/uploads/${req.file.filename}` : null;

          const roomData: any = { ...req.body, image: imageUrl };

          // If a new image is uploaded, delete the old one
          if (newImagePath) {
            // Delete old image file if it exists
            if (existingRoom.image) {
              try {
                // Remove the old image file from server
                if (fs.existsSync(existingRoom.image)) {
                  fs.unlinkSync(existingRoom.image);
                }
              } catch (unlinkErr) {
                console.error('Error deleting old image file:', unlinkErr);
              }
            }
          }

          const updatedRoom = await RoomService.updateRoom(Number(req.params.id), roomData);

          if (updatedRoom) {
            res.status(200).json(updatedRoom);
          } else {
            // If update failed and we uploaded a new file, clean it up
            if (newImagePath) {
              try {
                fs.unlinkSync(newImagePath); // Clean up the uploaded file if update fails
              } catch (unlinkErr) {
                console.error('Failed to clean up file after update error:', unlinkErr);
              }
            }
            res.status(404).json({ error: 'Room not found or update failed' });
          }
        } catch (error: any) {
          // Cleanup if error occurs during image upload
          if (req.file && req.file.path) {
            try {
              fs.unlinkSync(req.file.path);
            } catch (unlinkErr) {
              console.error('Failed to clean up file after error:', unlinkErr);
            }
          }
          res.status(400).json({ error: error.message });
        }
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
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
