// src/controllers/TransportController.ts
import { Request, Response } from 'express';
import TransportService from '../services/TransportService';

class TransportController {
  public static async createTransport(req: Request, res: Response) {
    try {
      const transport = await TransportService.createTransport(req.body);
      res.status(201).json(transport);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  public static async getAllTransports(req: Request, res: Response) {
    try {
      const transports = await TransportService.getAllTransports();
      res.status(200).json(transports);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

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

  public static async updateTransport(req: Request, res: Response) {
    try {
      const [updated, transports] = await TransportService.updateTransport(Number(req.params.id), req.body);
      if (updated) {
        res.status(200).json(transports[0]);
      } else {
        res.status(404).json({ error: 'Transport not found' });
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

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
