import { Request, Response } from 'express';
import TransportService from '../services/TransportService';
import upload from '../utils/multerConfig';

class TransportController {
  // Create Transport with image upload
  public static async createTransport(req: Request, res: Response) {
    upload.single('image')(req, res, async (err: any) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      try {
        const image = req.file ? req.file.path : null;
        const transportData = { ...req.body, image };
        const transport = await TransportService.createTransport(transportData);
        res.status(201).json(transport);
      } catch (error: any) {
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
    upload.single('image')(req, res, async (err: any) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      try {
        const image = req.file ? req.file.path : null;
        const transportData = { ...req.body, image };
        const [updated, transports] = await TransportService.updateTransport(Number(req.params.id), transportData);
        
        if (updated) {
          res.status(200).json(transports[0]);
        } else {
          res.status(404).json({ error: 'Transport not found' });
        }
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    });
  }

  // Delete Transport
  public static async deleteTransport(req: Request, res: Response) {
    try {
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
}

export default TransportController;
