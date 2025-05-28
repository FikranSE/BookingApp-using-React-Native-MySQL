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
const Room_1 = __importDefault(require("../models/Room"));
class RoomService {
    static createRoom(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return Room_1.default.create(data);
        });
    }
    static getAllRooms() {
        return __awaiter(this, void 0, void 0, function* () {
            return Room_1.default.findAll();
        });
    }
    static getRoomById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return Room_1.default.findByPk(id);
        });
    }
    static updateRoom(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const [affectedCount] = yield Room_1.default.update(data, {
                where: { room_id: id }
            });
            if (affectedCount > 0) {
                const updatedRoom = yield Room_1.default.findByPk(id);
                return updatedRoom;
            }
            return null;
        });
    }
    static deleteRoom(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return Room_1.default.destroy({ where: { room_id: id } });
        });
    }
}
exports.default = RoomService;
