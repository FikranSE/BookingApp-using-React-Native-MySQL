"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startScheduler = startScheduler;
const ReminderService_1 = __importDefault(require("./services/ReminderService"));
// Run reminders every minute
const REMINDER_INTERVAL = 60 * 1000; // 1 minute in milliseconds
function startScheduler() {
    console.log('Starting reminder scheduler...');
    // Run immediately on startup
    ReminderService_1.default.scheduleReminders();
    // Then run every minute
    setInterval(() => {
        ReminderService_1.default.scheduleReminders();
    }, REMINDER_INTERVAL);
}
