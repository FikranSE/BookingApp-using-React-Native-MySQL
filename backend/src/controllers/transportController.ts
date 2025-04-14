import { Request, Response } from 'express';
import TransportService from '../services/TransportService';
import upload from '../utils/multerConfig';
import fs from 'fs';
import path from 'path';

class TransportController {
  // Create Transport with image upload
  public static async createTransport(req: Request, res: Response) {
    upload.single('image')(req, res, async (err: any) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      try {
        const serverUrl = 'https://j9d3hc82-3001.asse.devtunnels.ms/'; // Configure this in your environment
        const image = req.file ? `${serverUrl}/uploads/${req.file.filename}` : null;

        const transportData = { ...req.body, image };
        const transport = await TransportService.createTransport(transportData);
        res.status(201).json(transport);
      } catch (error: any) {
        // If there was an error and we uploaded a file, clean it up
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
  }

  // Get all transports
  public static async getAllTransports(req: Request, res: Response) {
    try {
      const transports = await TransportService.getAllTransports();
      res.status(200).json(transports);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Get transport by ID
  public static async getTransportById(req: Request, res: Response) {
    try {
      const transport = await TransportService.getTransportById(Number(req.params.id));
      if (transport) {
        res.status(200).json(transport);
      } else {
        res.status(404).json({ error: 'Transport not found' });
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Update Transport with image upload
  public static async updateTransport(req: Request, res: Response) {
    try {
      const existingTransport = await TransportService.getTransportById(Number(req.params.id));
  
      if (!existingTransport) {
        return res.status(404).json({ error: 'Transport not found' });
      }
  
      upload.single('image')(req, res, async (err: any) => {
        if (err) {
          return res.status(400).json({ error: err.message });
        }
  
        try {
          const newImagePath = req.file ? req.file.path : null;
          const transportData: any = { ...req.body };
  
          // Construct the image URL if a new image was uploaded
          if (newImagePath) {
            const serverUrl = 'https://j9d3hc82-3001.asse.devtunnels.ms/'; // Ensure this URL is configured correctly
            transportData.image = `${serverUrl}/uploads/${req.file.filename}`;
  
            // Delete the old image if it exists
            if (existingTransport.image) {
              try {
                if (fs.existsSync(existingTransport.image)) {
                  fs.unlinkSync(existingTransport.image);
                } else {
                  console.warn(`Could not find old image at ${existingTransport.image} to delete`);
                }
              } catch (unlinkErr) {
                console.error('Error deleting old image file:', unlinkErr);
              }
            }
          }
  
          const updatedTransport = await TransportService.updateTransport(Number(req.params.id), transportData);
          if (updatedTransport) {
            res.status(200).json(updatedTransport);
          } else {
            if (newImagePath) {
              try {
                fs.unlinkSync(newImagePath); // Clean up the uploaded file if update fails
              } catch (unlinkErr) {
                console.error('Failed to clean up file after update error:', unlinkErr);
              }
            }
            res.status(404).json({ error: 'Transport not found or update failed' });
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
  

  // Delete Transport
  public static async deleteTransport(req: Request, res: Response) {
    try {
      // First get the transport to check for image
      const transport = await TransportService.getTransportById(Number(req.params.id));
      
      if (!transport) {
        return res.status(404).json({ error: 'Transport not found' });
      }
      
      // Delete the image file if it exists
      if (transport.image) {
        try {
          // Check if file exists before trying to delete
          if (fs.existsSync(transport.image)) {
            fs.unlinkSync(transport.image);
          } else {
            console.warn(`Could not find image at ${transport.image} to delete`);
          }
        } catch (unlinkErr) {
          console.error('Error deleting image file:', unlinkErr);
          // Continue with the deletion even if we can't delete the file
        }
      }
      
      const deleted = await TransportService.deleteTransport(Number(req.params.id));
      if (deleted) {
        res.status(200).json({ message: 'Transport deleted successfully' });
      } else {
        res.status(404).json({ error: 'Transport not found' });
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
  
  // Helper method to ensure uploads directory exists
  private static ensureUploadsDir() {
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)){
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  }
}

// Ensure uploads directory exists when controller is loaded
TransportController.ensureUploadsDir();

export default TransportController;