"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/services/AdminService.ts
const Admin_1 = __importDefault(require("../models/Admin"));
class AdminService {
    static createAdmin(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return Admin_1.default.create(data);
        });
    }
    static getAllAdmins() {
        return __awaiter(this, void 0, void 0, function* () {
            return Admin_1.default.findAll();
        });
    }
    static getAdminById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return Admin_1.default.findByPk(id);
        });
    }
    static updateAdmin(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return Admin_1.default.update(data, { where: { admin_id: id }, returning: true });
        });
    }
    static deleteAdmin(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return Admin_1.default.destroy({ where: { admin_id: id } });
        });
    }
}
exports.default = AdminService;
