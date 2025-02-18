import Transport from '../models/Transport';

class TransportService {
  public static async createTransport(data: Partial<Transport>): Promise<Transport> {
    return Transport.create(data);
  }

  public static async getAllTransports(): Promise<Transport[]> {
    return Transport.findAll();
  }

  public static async getTransportById(id: number): Promise<Transport | null> {
    return Transport.findByPk(id); 
  }

  public static async updateTransport(id: number, data: Partial<Transport>): Promise<Transport | null> {
    const [affectedCount] = await Transport.update(data, {
      where: { transport_id: id }
    });
  
    if (affectedCount > 0) {
      const updatedTransport = await Transport.findByPk(id);
      return updatedTransport;
    }
  
    return null;
  }

  public static async deleteTransport(id: number): Promise<number> {
    return Transport.destroy({ where: { transport_id: id } });
  }
}

export default TransportService;
