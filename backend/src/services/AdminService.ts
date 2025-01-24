// src/services/AdminService.ts
import Admin from '../models/Admin';

class AdminService {
  public static async createAdmin(data: Partial<Admin>): Promise<Admin> {
    return Admin.create(data);
  }

  public static async getAllAdmins(): Promise<Admin[]> {
    return Admin.findAll();
  }

  public static async getAdminById(id: number): Promise<Admin | null> {
    return Admin.findByPk(id);
  }

  public static async updateAdmin(id: number, data: Partial<Admin>): Promise<[number, Admin[]]> {
    return Admin.update(data, { where: { admin_id: id }, returning: true });
  }

  public static async deleteAdmin(id: number): Promise<number> {
    return Admin.destroy({ where: { admin_id: id } });
  }
}

export default AdminService;
