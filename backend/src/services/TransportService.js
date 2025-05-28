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
const Transport_1 = __importDefault(require("../models/Transport"));
class TransportService {
    static createTransport(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return Transport_1.default.create(data);
        });
    }
    static getAllTransports() {
        return __awaiter(this, void 0, void 0, function* () {
            return Transport_1.default.findAll();
        });
    }
    static getTransportById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return Transport_1.default.findByPk(id);
        });
    }
    static updateTransport(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const [affectedCount] = yield Transport_1.default.update(data, {
                where: { transport_id: id }
            });
            if (affectedCount > 0) {
                const updatedTransport = yield Transport_1.default.findByPk(id);
                return updatedTransport;
            }
            return null;
        });
    }
    static deleteTransport(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return Transport_1.default.destroy({ where: { transport_id: id } });
        });
    }
}
exports.default = TransportService;
