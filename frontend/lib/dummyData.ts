// dummyData.ts
import { icons } from "@/constants";

// -- 1) Interface data
export interface TimeSlot {
  startTime: string;          // Contoh: "08:00"
  endTime: string;            // Contoh: "09:00"
  status: "Available" | "Booked";
  bookedBy?: string;
}

export interface Room {
  id: string;
  size: string;               // Contoh: "Small meeting room"
  name: string;               // Contoh: "Melati"
  capacity: number;           // Contoh: 3
  image: any;
  assets: string[];           // Contoh: ["Mic", "Projector", "Whiteboard"]
  timeSlots: TimeSlot[];
}

export interface Transport {
  id: string;
  name: string;
  capacity: string;           // Contoh: "7 seats"
  image: any;
  timeSlots: TimeSlot[];
}

export interface Meeting {
  date: string;               // Format: YYYY-MM-DD
  startTime: string;          // Format: HH:mm (misal "09:30")
  endTime: string;            // Format: HH:mm (misal "11:00")
  title: string;
  room: string;
  now: boolean;               // Indikator apakah meeting sedang berlangsung "NOW"
  borderColor: string;        // Style border, ex: "border-blue-900"
}

// -- 2) Icons pendukung
export const assetIcons = {
  Mic: icons.mic,
  Projector: icons.projector,
  Whiteboard: icons.whiteboard,
  WiFi: icons.wifi,
  AC: icons.ac, // Disamakan agar konsisten dengan data di 'assets'
};

export interface CommonTimeSlots {
  morning: string[];
  afternoon: string[];
}

// Contoh implementasi 
export const commonTimeSlots: CommonTimeSlots = {
  morning: [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM", "12:00 PM"
  ],
  afternoon: [
    "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM",
    "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM",
    "04:30 PM", "05:00 PM", "05:30 PM"
  ]
};

// -- 3) Data dummy Rooms
export const rooms: Room[] = [
  {
    id: "1",
    size: "Small meeting room",
    name: "Melati",
    capacity: 3,
    image: require("@/assets/images/small-room.jpg"),
    assets: ["Mic", "Projector", "Whiteboard"],
    timeSlots: [
      { startTime: "08:00", endTime: "09:00", status: "Booked", bookedBy: "Marketing Team" },
      { startTime: "09:00", endTime: "10:00", status: "Booked", bookedBy: "Marketing Team" },
      { startTime: "10:00", endTime: "11:00", status: "Booked", bookedBy: "Marketing Team" },
      { startTime: "11:00", endTime: "12:00", status: "Booked", bookedBy: "Marketing Team" },
      { startTime: "13:00", endTime: "14:00", status: "Booked", bookedBy: "Marketing Team" },
      { startTime: "14:00", endTime: "15:00", status: "Booked", bookedBy: "HR Department" },
      { startTime: "15:00", endTime: "16:00", status: "Booked", bookedBy: "Marketing Team" },
      { startTime: "16:00", endTime: "17:00", status: "Booked", bookedBy: "Marketing Team" },
    ],
  },
  {
    id: "2",
    size: "Middle meeting room",
    name: "Mawar",
    capacity: 8,
    image: require("@/assets/images/middle-room.jpg"),
    assets: ["Mic", "Projector", "WiFi"],
    timeSlots: [
      { startTime: "08:00", endTime: "09:00", status: "Booked", bookedBy: "IT Team" },
      { startTime: "09:00", endTime: "10:00", status: "Booked", bookedBy: "IT Team" },
      { startTime: "10:00", endTime: "11:00", status: "Available" },
      { startTime: "11:00", endTime: "12:00", status: "Available" },
      { startTime: "13:00", endTime: "14:00", status: "Booked", bookedBy: "Finance Team" },
      { startTime: "14:00", endTime: "15:00", status: "Booked", bookedBy: "Finance Team" },
      { startTime: "15:00", endTime: "16:00", status: "Available" },
      { startTime: "16:00", endTime: "17:00", status: "Available" },
    ],
  },
  {
    id: "3",
    size: "Big meeting room",
    name: "Anggrek",
    capacity: 12,
    image: require("@/assets/images/big-room.jpg"),
    assets: ["Mic", "Projector", "AC"], // Diubah "Air Conditioner" → "AC" agar konsisten
    timeSlots: [
      { startTime: "08:00", endTime: "09:00", status: "Available" },
      { startTime: "09:00", endTime: "10:00", status: "Available" },
      { startTime: "10:00", endTime: "11:00", status: "Available" },
      { startTime: "11:00", endTime: "12:00", status: "Booked", bookedBy: "Board Meeting" },
      { startTime: "13:00", endTime: "14:00", status: "Booked", bookedBy: "Board Meeting" },
      { startTime: "14:00", endTime: "15:00", status: "Available" },
      { startTime: "15:00", endTime: "16:00", status: "Available" },
      { startTime: "16:00", endTime: "17:00", status: "Available" },
    ],
  },
];

// -- 4) Data dummy Transportation
export const transportation: Transport[] = [
  {
    id: "1",
    name: "Kijang Innova Zenix",
    capacity: "7 seats",
    image: require("@/assets/images/car1.jpg"),
    timeSlots: [
      { startTime: "08:00", endTime: "10:00", status: "Booked", bookedBy: "Site Visit Team" },
      { startTime: "10:00", endTime: "12:00", status: "Booked", bookedBy: "Site Visit Team" },
      { startTime: "13:00", endTime: "15:00", status: "Booked", bookedBy: "Site Visit Team" },
      { startTime: "15:00", endTime: "17:00", status: "Booked", bookedBy: "Site Visit Team" },
    ],
  },
  {
    id: "2",
    name: "Kijang Innova reborn 2.4 G",
    capacity: "7 seats",
    image: require("@/assets/images/car2.jpg"),
    timeSlots: [
      { startTime: "08:00", endTime: "10:00", status: "Booked", bookedBy: "Sales Team" },
      { startTime: "10:00", endTime: "12:00", status: "Available" },
      { startTime: "13:00", endTime: "15:00", status: "Booked", bookedBy: "Executive Visit" },
      { startTime: "15:00", endTime: "17:00", status: "Available" },
    ],
  },
  {
    id: "3",
    name: "Alphard",
    capacity: "6 seats",
    image: require("@/assets/images/car3.jpg"),
    timeSlots: [
      { startTime: "08:00", endTime: "10:00", status: "Available" },
      { startTime: "10:00", endTime: "12:00", status: "Available" },
      { startTime: "13:00", endTime: "15:00", status: "Available" },
      { startTime: "15:00", endTime: "17:00", status: "Booked", bookedBy: "VIP Transport" },
    ],
  },
];

// -- 5) Data dummy Meetings
export const meetings: Meeting[] = [
  {
    date: "2024-12-25",
    startTime: "09:30",
    endTime: "11:00",
    title: "Designers Meeting",
    room: "Small meeting room",
    now: true,
    borderColor: "border-blue-900",
  },
  {
    date: "2024-12-21",
    startTime: "12:00",
    endTime: "14:00",
    title: "Daily Project Meeting",
    room: "Big meeting room",
    now: false,
    borderColor: "border-yellow-600",
  },
  {
    date: "2024-12-22",
    startTime: "10:00",
    endTime: "12:00",
    title: "Team Retrospective",
    room: "Main Hall",
    now: false,
    borderColor: "border-green-700",
  },
];

// -- 6) Nama bulan & hari
export const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const dayNames = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];
