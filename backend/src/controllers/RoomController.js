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
const RoomService_1 = __importDefault(require("../services/RoomService"));
const multerConfig_1 = __importDefault(require("../utils/multerConfig"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Get server URL from environment variables or use a default
const SERVER_URL = process.env.SERVER_URL;
// Use the same uploads directory path as in app.js and multerConfig.ts
const uploadsDir = path_1.default.join(__dirname, '../utils/uploads');
class RoomController {
    // Create Room with image upload
    static createRoom(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            multerConfig_1.default.single('image')(req, res, (err) => __awaiter(this, void 0, void 0, function* () {
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
                        if (fs_1.default.existsSync(req.file.path)) {
                            console.log(`Verified file exists at: ${req.file.path}`);
                            // Create a proper URL with the server domain
                            imageUrl = `/uploads/${req.file.filename}`;
                            console.log(`Image URL created: ${imageUrl}`);
                        }
                        else {
                            console.error(`WARNING: File does not exist at path: ${req.file.path}`);
                            return res.status(500).json({ error: 'Failed to save image file' });
                        }
                    }
                    const roomData = Object.assign(Object.assign({}, req.body), { image: imageUrl });
                    const room = yield RoomService_1.default.createRoom(roomData);
                    res.status(201).json(room);
                }
                catch (error) {
                    // If there was an error and we uploaded a file, clean it up
                    if (req.file && req.file.path) {
                        try {
                            fs_1.default.unlinkSync(req.file.path);
                            console.log(`Deleted file after error: ${req.file.path}`);
                        }
                        catch (unlinkErr) {
                            console.error('Failed to clean up file after error:', unlinkErr);
                        }
                    }
                    res.status(400).json({ error: error.message });
                }
            }));
        });
    }
    // Get all rooms
    static getAllRooms(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rooms = yield RoomService_1.default.getAllRooms();
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
                            const localPath = path_1.default.join(uploadsDir, imageName);
                            const exists = fs_1.default.existsSync(localPath);
                            console.log(`Image ${room.image} exists on server: ${exists ? 'YES' : 'NO'}, local path: ${localPath}`);
                        }
                        catch (e) {
                            console.error(`Error checking image existence: ${e.message}`);
                        }
                    }
                    return room;
                });
                res.status(200).json(formattedRooms);
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }
        });
    }
    // Get room by ID
    static getRoomById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const room = yield RoomService_1.default.getRoomById(Number(req.params.id));
                if (room) {
                    // Ensure the image URL is properly formatted
                    if (room.image && !room.image.startsWith('http')) {
                        room.image = `${SERVER_URL}${room.image.startsWith('/') ? '' : '/'}${room.image}`;
                    }
                    res.status(200).json(room);
                }
                else {
                    res.status(404).json({ error: 'Room not found' });
                }
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }
        });
    }
    // Update Room with image upload
    static updateRoom(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existingRoom = yield RoomService_1.default.getRoomById(Number(req.params.id));
                if (!existingRoom) {
                    return res.status(404).json({ error: 'Room not found' });
                }
                multerConfig_1.default.single('image')(req, res, (err) => __awaiter(this, void 0, void 0, function* () {
                    if (err) {
                        return res.status(400).json({ error: err.message });
                    }
                    try {
                        const roomData = Object.assign({}, req.body);
                        // Handle image upload if a new file was provided
                        if (req.file) {
                            console.log(`New file uploaded for update: ${JSON.stringify(req.file)}`);
                            // Verify the new file exists
                            if (fs_1.default.existsSync(req.file.path)) {
                                console.log(`Verified new file exists at: ${req.file.path}`);
                                // Use full URL with server domain
                                roomData.image = `/uploads/${req.file.filename}`;
                                console.log(`New image URL: ${roomData.image}`);
                                // Try to delete the old image if it exists
                                if (existingRoom.image) {
                                    try {
                                        const oldFilename = existingRoom.image.split('/').pop();
                                        if (oldFilename) {
                                            const oldImagePath = path_1.default.join(uploadsDir, oldFilename);
                                            console.log(`Trying to delete old image: ${oldImagePath}`);
                                            if (fs_1.default.existsSync(oldImagePath)) {
                                                fs_1.default.unlinkSync(oldImagePath);
                                                console.log(`Successfully deleted old image: ${oldImagePath}`);
                                            }
                                            else {
                                                console.warn(`Old image file not found: ${oldImagePath}`);
                                            }
                                        }
                                    }
                                    catch (unlinkErr) {
                                        console.error('Error deleting old image file:', unlinkErr);
                                    }
                                }
                            }
                            else {
                                console.error(`WARNING: New file does not exist at: ${req.file.path}`);
                                return res.status(500).json({ error: 'Failed to save uploaded image' });
                            }
                        }
                        const updatedRoom = yield RoomService_1.default.updateRoom(Number(req.params.id), roomData);
                        if (updatedRoom) {
                            res.status(200).json(updatedRoom);
                        }
                        else {
                            if (req.file && req.file.path) {
                                fs_1.default.unlinkSync(req.file.path);
                                console.log(`Deleted new file after update failure: ${req.file.path}`);
                            }
                            res.status(404).json({ error: 'Room not found or update failed' });
                        }
                    }
                    catch (error) {
                        // Cleanup if error occurs during processing
                        if (req.file && req.file.path) {
                            try {
                                fs_1.default.unlinkSync(req.file.path);
                                console.log(`Deleted file after error: ${req.file.path}`);
                            }
                            catch (unlinkErr) {
                                console.error('Failed to clean up file after error:', unlinkErr);
                            }
                        }
                        res.status(400).json({ error: error.message });
                    }
                }));
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }
        });
    }
    // Delete Room
    static deleteRoom(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // First get the room to find its image
                const room = yield RoomService_1.default.getRoomById(Number(req.params.id));
                if (!room) {
                    return res.status(404).json({ error: 'Room not found' });
                }
                // Delete the image file if it exists
                if (room.image) {
                    try {
                        const filename = room.image.split('/').pop();
                        if (filename) {
                            const imagePath = path_1.default.join(uploadsDir, filename);
                            console.log(`Attempting to delete image: ${imagePath}`);
                            if (fs_1.default.existsSync(imagePath)) {
                                fs_1.default.unlinkSync(imagePath);
                                console.log(`Successfully deleted image: ${imagePath}`);
                            }
                            else {
                                console.warn(`Image file not found for deletion: ${imagePath}`);
                            }
                        }
                    }
                    catch (unlinkErr) {
                        console.error('Error deleting image file:', unlinkErr);
                    }
                }
                // Delete the room from database
                const deleted = yield RoomService_1.default.deleteRoom(Number(req.params.id));
                if (deleted) {
                    res.status(200).json({ message: 'Room deleted successfully' });
                }
                else {
                    res.status(500).json({ error: 'Failed to delete room' });
                }
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }
        });
    }
    // Helper method to ensure uploads directory exists
    static ensureUploadsDir() {
        if (!fs_1.default.existsSync(uploadsDir)) {
            console.log(`RoomController: Creating uploads directory at ${uploadsDir}`);
            fs_1.default.mkdirSync(uploadsDir, { recursive: true, mode: 0o755 });
        }
    }
}
// Ensure uploads directory exists when controller is loaded
RoomController.ensureUploadsDir();
exports.default = RoomController;
