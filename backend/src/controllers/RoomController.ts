// RoomController.ts - Updated with consistent path handling
import { Request, Response } from 'express';
import RoomService from '../services/RoomService';
import upload from '../utils/multerConfig';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get server URL from environment variables or use a default
const SERVER_URL = process.env.SERVER_URL || 'https://bookingsisi.maturino.my.id';

// Use the same uploads directory path as in app.js and multerConfig.ts
const uploadsDir = path.join(__dirname, '../utils/uploads');

class RoomController {
  // Create Room with image upload
  public static async createRoom(req: Request, res: Response) {
    upload.single('image')(req, res, async (err: any) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      try {
        let imageUrl = null;
        
        if (req.file) {
          // Log file details for debugging
          console.log(`File uploaded: ${JSON.stringify(req.file)}`);
          console.log(`File saved at: ${req.file.path}`);
          
          // Verify file exists after saving
          if (fs.existsSync(req.file.path)) {
            console.log(`Verified file exists at: ${req.file.path}`);
            
            // Create a proper URL with the server domain
            imageUrl = `${SERVER_URL}/uploads/${req.file.filename}`;
            console.log(`Image URL created: ${imageUrl}`);
          } else {
            console.error(`WARNING: File does not exist at path: ${req.file.path}`);
            return res.status(500).json({ error: 'Failed to save image file' });
          }
        }
        
        const roomData = { ...req.body, image: imageUrl };
        const room = await RoomService.createRoom(roomData);
        res.status(201).json(room);
      } catch (error: any) {
        // If there was an error and we uploaded a file, clean it up
        if (req.file && req.file.path) {
          try {
            fs.unlinkSync(req.file.path);
            console.log(`Deleted file after error: ${req.file.path}`);
          } catch (unlinkErr) {
            console.error('Failed to clean up file after error:', unlinkErr);
          }
        }
        res.status(400).json({ error: error.message });
      }
    });
  }

  // Get all rooms
  public static async getAllRooms(req: Request, res: Response) {
    try {
      const rooms = await RoomService.getAllRooms();
      
      // Make sure all image URLs are properly formatted
      const formattedRooms = rooms.map(room => {
        if (room.image) {
          // Check if image URL is already a full URL
          if (!room.image.startsWith('http')) {
            room.image = `${SERVER_URL}${room.image.startsWith('/') ? '' : '/'}${room.image}`;
          }
          
          // Check if image file exists on server (for debugging)
          try {
            const imageName = room.image.split('/').pop();
            const localPath = path.join(uploadsDir, imageName);
            const exists = fs.existsSync(localPath);
            console.log(`Image ${room.image} exists on server: ${exists ? 'YES' : 'NO'}, local path: ${localPath}`);
          } catch (e) {
            console.error(`Error checking image existence: ${e.message}`);
          }
        }
        return room;
      });
      
      res.status(200).json(formattedRooms);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Get room by ID
  public static async getRoomById(req: Request, res: Response) {
    try {
      const room = await RoomService.getRoomById(Number(req.params.id));
      if (room) {
        // Ensure the image URL is properly formatted
        if (room.image && !room.image.startsWith('http')) {
          room.image = `${SERVER_URL}${room.image.startsWith('/') ? '' : '/'}${room.image}`;
        }
        
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
          const roomData: any = { ...req.body };
  
          // Handle image upload if a new file was provided
          if (req.file) {
            console.log(`New file uploaded for update: ${JSON.stringify(req.file)}`);
            
            // Verify the new file exists
            if (fs.existsSync(req.file.path)) {
              console.log(`Verified new file exists at: ${req.file.path}`);
              
              // Use full URL with server domain
              roomData.image = `${SERVER_URL}/uploads/${req.file.filename}`;
              console.log(`New image URL: ${roomData.image}`);
  
              // Try to delete the old image if it exists
              if (existingRoom.image) {
                try {
                  const oldFilename = existingRoom.image.split('/').pop();
                  if (oldFilename) {
                    const oldImagePath = path.join(uploadsDir, oldFilename);
                    console.log(`Trying to delete old image: ${oldImagePath}`);
                    
                    if (fs.existsSync(oldImagePath)) {
                      fs.unlinkSync(oldImagePath);
                      console.log(`Successfully deleted old image: ${oldImagePath}`);
                    } else {
                      console.warn(`Old image file not found: ${oldImagePath}`);
                    }
                  }
                } catch (unlinkErr) {
                  console.error('Error deleting old image file:', unlinkErr);
                }
              }
            } else {
              console.error(`WARNING: New file does not exist at: ${req.file.path}`);
              return res.status(500).json({ error: 'Failed to save uploaded image' });
            }
          }
  
          const updatedRoom = await RoomService.updateRoom(Number(req.params.id), roomData);
          if (updatedRoom) {
            res.status(200).json(updatedRoom);
          } else {
            if (req.file && req.file.path) {
              fs.unlinkSync(req.file.path);
              console.log(`Deleted new file after update failure: ${req.file.path}`);
            }
            res.status(404).json({ error: 'Room not found or update failed' });
          }
        } catch (error: any) {
          // Cleanup if error occurs during processing
          if (req.file && req.file.path) {
            try {
              fs.unlinkSync(req.file.path);
              console.log(`Deleted file after error: ${req.file.path}`);
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
      // First get the room to find its image
      const room = await RoomService.getRoomById(Number(req.params.id));
      
      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }
      
      // Delete the image file if it exists
      if (room.image) {
        try {
          const filename = room.image.split('/').pop();
          if (filename) {
            const imagePath = path.join(uploadsDir, filename);
            console.log(`Attempting to delete image: ${imagePath}`);
            
            if (fs.existsSync(imagePath)) {
              fs.unlinkSync(imagePath);
              console.log(`Successfully deleted image: ${imagePath}`);
            } else {
              console.warn(`Image file not found for deletion: ${imagePath}`);
            }
          }
        } catch (unlinkErr) {
          console.error('Error deleting image file:', unlinkErr);
        }
      }
      
      // Delete the room from database
      const deleted = await RoomService.deleteRoom(Number(req.params.id));
      
      if (deleted) {
        res.status(200).json({ message: 'Room deleted successfully' });
      } else {
        res.status(500).json({ error: 'Failed to delete room' });
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
  
  // Helper method to ensure uploads directory exists
  private static ensureUploadsDir() {
    if (!fs.existsSync(uploadsDir)) {
      console.log(`RoomController: Creating uploads directory at ${uploadsDir}`);
      fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o755 });
    }
  }
}

// Ensure uploads directory exists when controller is loaded
RoomController.ensureUploadsDir();

export default RoomController;