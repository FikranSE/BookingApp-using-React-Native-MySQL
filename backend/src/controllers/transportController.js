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
const TransportService_1 = __importDefault(require("../services/TransportService"));
const multerConfig_1 = __importDefault(require("../utils/multerConfig"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Get server URL from environment variables or use a default
const SERVER_URL = process.env.SERVER_URL;
// IMPORTANT: This path must match the one in app.js and multerConfig.ts
const uploadsDir = path_1.default.join(__dirname, '../utils/uploads');
class TransportController {
    // Create Transport with image upload
    static createTransport(req, res) {
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
                            // Make sure URL doesn't have double slashes
                            // Store the relative URL path in the database, not the full server URL
                            imageUrl = `/uploads/${req.file.filename}`;
                            console.log(`Image URL created: ${imageUrl}`);
                        }
                        else {
                            console.error(`WARNING: File does not exist at path: ${req.file.path}`);
                            return res.status(500).json({ error: 'Failed to save image file' });
                        }
                    }
                    const transportData = Object.assign(Object.assign({}, req.body), { image: imageUrl });
                    const transport = yield TransportService_1.default.createTransport(transportData);
                    // For the response, we can add the full URL
                    if (transport && transport.image) {
                        // Keep the original relative path in the database record
                        // But return the full URL in the API response
                        const fullImageUrl = `${SERVER_URL}${transport.image}`;
                        console.log(`Transport created with full image URL: ${fullImageUrl}`);
                        // Create a new object with the full URL for the response
                        const responseTransport = Object.assign(Object.assign({}, transport.toJSON()), { image: fullImageUrl });
                        res.status(201).json(responseTransport);
                    }
                    else {
                        res.status(201).json(transport);
                    }
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
    // Get all transports
    static getAllTransports(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transports = yield TransportService_1.default.getAllTransports();
                // Make sure all image URLs are properly formatted with full server URL
                const formattedTransports = transports.map(transport => {
                    const transportJson = transport.toJSON();
                    if (transportJson.image) {
                        // Check if image URL is already a full URL
                        if (!transportJson.image.startsWith('http')) {
                            transportJson.image = `${SERVER_URL}${transportJson.image.startsWith('/') ? '' : '/'}${transportJson.image}`;
                        }
                        // Debug: check if image file exists on server
                        try {
                            // Extract the filename from the path
                            const imageFilename = transportJson.image.split('/').pop();
                            // Construct the file path based on where the file should be
                            const localPath = path_1.default.join(uploadsDir, imageFilename);
                            const exists = fs_1.default.existsSync(localPath);
                            console.log(`Image ${transportJson.image} exists on server: ${exists ? 'YES' : 'NO'}, local path: ${localPath}`);
                        }
                        catch (e) {
                            console.error(`Error checking image existence: ${e.message}`);
                        }
                    }
                    return transportJson;
                });
                res.status(200).json(formattedTransports);
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }
        });
    }
    // Get transport by ID
    static getTransportById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transport = yield TransportService_1.default.getTransportById(Number(req.params.id));
                if (transport) {
                    // Ensure the image URL is properly formatted
                    if (transport.image && !transport.image.startsWith('http')) {
                        transport.image = `${SERVER_URL}${transport.image.startsWith('/') ? '' : '/'}${transport.image}`;
                    }
                    res.status(200).json(transport);
                }
                else {
                    res.status(404).json({ error: 'Transport not found' });
                }
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }
        });
    }
    // Update Transport with image upload
    static updateTransport(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existingTransport = yield TransportService_1.default.getTransportById(Number(req.params.id));
                if (!existingTransport) {
                    return res.status(404).json({ error: 'Transport not found' });
                }
                multerConfig_1.default.single('image')(req, res, (err) => __awaiter(this, void 0, void 0, function* () {
                    if (err) {
                        return res.status(400).json({ error: err.message });
                    }
                    try {
                        const transportData = Object.assign({}, req.body);
                        // Handle image upload if a new file was provided
                        if (req.file) {
                            console.log(`New file uploaded for update: ${JSON.stringify(req.file)}`);
                            // Verify the new file exists
                            if (fs_1.default.existsSync(req.file.path)) {
                                console.log(`Verified new file exists at: ${req.file.path}`);
                                transportData.image = `${SERVER_URL}/uploads/${req.file.filename}`;
                                console.log(`New image URL: ${transportData.image}`);
                                // Try to delete the old image if it exists
                                if (existingTransport.image) {
                                    try {
                                        const oldFilename = existingTransport.image.split('/').pop();
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
                        const updatedTransport = yield TransportService_1.default.updateTransport(Number(req.params.id), transportData);
                        if (updatedTransport) {
                            res.status(200).json(updatedTransport);
                        }
                        else {
                            if (req.file && req.file.path) {
                                fs_1.default.unlinkSync(req.file.path);
                                console.log(`Deleted new file after update failure: ${req.file.path}`);
                            }
                            res.status(404).json({ error: 'Transport not found or update failed' });
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
    // Delete Transport
    static deleteTransport(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // First get the transport to check for image
                const transport = yield TransportService_1.default.getTransportById(Number(req.params.id));
                if (!transport) {
                    return res.status(404).json({ error: 'Transport not found' });
                }
                // Delete the image file if it exists
                if (transport.image) {
                    try {
                        const filename = transport.image.split('/').pop();
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
                const deleted = yield TransportService_1.default.deleteTransport(Number(req.params.id));
                if (deleted) {
                    res.status(200).json({ message: 'Transport deleted successfully' });
                }
                else {
                    res.status(404).json({ error: 'Transport not found' });
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
            console.log(`TransportController: Creating uploads directory at ${uploadsDir}`);
            fs_1.default.mkdirSync(uploadsDir, { recursive: true, mode: 0o755 });
        }
    }
}
// Ensure uploads directory exists when controller is loaded
TransportController.ensureUploadsDir();
exports.default = TransportController;
