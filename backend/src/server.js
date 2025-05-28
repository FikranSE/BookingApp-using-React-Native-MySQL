"use strict";
// backend/src/server.ts
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
const app_1 = __importDefault(require("./app"));
const db_1 = __importDefault(require("./config/db"));
const scheduler_1 = require("./scheduler");
const PORT = process.env.PORT || 5000;
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Cek koneksi database
        yield db_1.default.authenticate();
        console.log('Koneksi ke database berhasil');
        // Sinkronisasi model (hanya untuk pengembangan; gunakan migrasi untuk produksi)
        yield db_1.default.sync({ alter: false });
        console.log('Model disinkronkan');
        // Jalankan server
        app_1.default.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            // Start the reminder scheduler
            (0, scheduler_1.startScheduler)();
        });
    }
    catch (error) {
        console.error('Gagal menghubungkan ke database:', error);
        process.exit(1);
    }
});
startServer();
