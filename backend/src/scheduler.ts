import ReminderService from './services/ReminderService';

// Run reminders every minute
const REMINDER_INTERVAL = 60 * 1000; // 1 minute in milliseconds

export function startScheduler() {
  console.log('Starting reminder scheduler...');
  
  // Run immediately on startup
  ReminderService.scheduleReminders();
  
  // Then run every minute
  setInterval(() => {
    ReminderService.scheduleReminders();
  }, REMINDER_INTERVAL);
} 