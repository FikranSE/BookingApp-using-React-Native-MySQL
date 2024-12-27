// dummyData.ts

// -----------------------------------------------------------------------------
// 1) Interface TimeSlot
// -----------------------------------------------------------------------------
export interface ITimeSlot {
  timeSlotId: string;                 // PK (misal di-UUID)
  startTime: string;                  // HH:mm
  endTime: string;                    // HH:mm
  status: "Available" | "Booked";
  bookedByUserId?: string;            // relasi ke User table (jika ada)
}

// -----------------------------------------------------------------------------
// 2) Interface Room
// -----------------------------------------------------------------------------
export interface IRoom {
  roomId: string;                     // PK
  sizeName: string;                   // misal: 'Small', 'Middle', 'Large'
  roomName: string;                   // misal: 'Melati', 'Mawar', dll
  capacity: number;
  image?: string;                     // opsional: url/path ke gambar
  assetList: string[];                // atau relasi ke tabel Asset
  timeSlots: ITimeSlot[];            // slot waktu terpakai/tersedia
}

// -----------------------------------------------------------------------------
// 3) Interface Transport
// -----------------------------------------------------------------------------
export interface ITransport {
  transportId: string;               // PK
  transportName: string;             // misal: 'Kijang Innova', 'Alphard'
  capacity: string;                  // '7 seats'
  image?: string;                    // opsional
  timeSlots: ITimeSlot[];            // slot waktu terpakai/tersedia
}

// -----------------------------------------------------------------------------
// 4) Interface Meeting (tanpa 'borderColor')
//    - Mengubah 'room' => 'roomId' agar jelas bahwa ini referensi ke Room
// -----------------------------------------------------------------------------
export interface IMeeting {
  meetingId: string;                 // PK
  meetingDate: string;               // YYYY-MM-DD
  startTime: string;                 // HH:mm
  endTime: string;                   // HH:mm
  title: string;
  roomId: string;                    // relasi ke IRoom
  isOngoing: boolean;                // true jika sedang berlangsung
}

// -----------------------------------------------------------------------------
// 5) Interface TransportBooking (tanpa 'borderColor')
//    - Mengubah 'vehicle' => 'transportId' agar jelas referensi ke Transport
// -----------------------------------------------------------------------------
export interface ITransportBooking {
  transportBookingId: string;        // PK
  bookingDate: string;               // YYYY-MM-DD
  startTime: string;                 // HH:mm
  endTime: string;                   // HH:mm
  title: string;
  transportId: string;               // relasi ke ITransport
  isOngoing: boolean;
}

// -----------------------------------------------------------------------------
// Icons (opsional). Anda bisa pindahkan ke tabel "Asset" jika mau lebih relasional
// -----------------------------------------------------------------------------
import { icons } from "@/constants";
export const assetIcons = {
  Mic: icons.mic,
  Projector: icons.projector,
  Whiteboard: icons.whiteboard,
  WiFi: icons.wifi,
  AC: icons.ac,
};

// -----------------------------------------------------------------------------
// Contoh CommonTimeSlots (opsional, sekadar data pendukung)
// -----------------------------------------------------------------------------
export interface ICommonTimeSlots {
  morning: string[];
  afternoon: string[];
}

export const commonTimeSlots: ICommonTimeSlots = {
  morning: ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM"],
  afternoon: ["12:30 PM","01:00 PM","01:30 PM","02:00 PM","02:30 PM","03:00 PM","03:30 PM","04:00 PM","04:30 PM","05:00 PM","05:30 PM"]
};

// -----------------------------------------------------------------------------
// 6) Data Rooms (contoh dummy data)
// -----------------------------------------------------------------------------
export const rooms: IRoom[] = [
  {
    roomId: "R1",
    sizeName: "Small",
    roomName: "Melati",
    capacity: 3,
    image: require("@/assets/images/small-room.jpg"),
    assetList: ["Mic", "Projector", "Whiteboard"],
    timeSlots: [
      {
        timeSlotId: "TS1",
        startTime: "08:00",
        endTime: "09:00",
        status: "Booked",
        bookedByUserId: "U-MarketingTeam"
      },
      {
        timeSlotId: "TS2",
        startTime: "09:00",
        endTime: "10:00",
        status: "Booked",
        bookedByUserId: "U-MarketingTeam"
      },
      {
        timeSlotId: "TS3",
        startTime: "10:00",
        endTime: "11:00",
        status: "Booked",
        bookedByUserId: "U-MarketingTeam"
      },
      {
        timeSlotId: "TS4",
        startTime: "11:00",
        endTime: "12:00",
        status: "Booked",
        bookedByUserId: "U-MarketingTeam"
      },
      {
        timeSlotId: "TS5",
        startTime: "13:00",
        endTime: "14:00",
        status: "Booked",
        bookedByUserId: "U-MarketingTeam"
      },
      {
        timeSlotId: "TS6",
        startTime: "14:00",
        endTime: "15:00",
        status: "Booked",
        bookedByUserId: "U-HRDepartment"
      },
      {
        timeSlotId: "TS7",
        startTime: "15:00",
        endTime: "16:00",
        status: "Booked",
        bookedByUserId: "U-MarketingTeam"
      },
      {
        timeSlotId: "TS8",
        startTime: "16:00",
        endTime: "17:00",
        status: "Booked",
        bookedByUserId: "U-MarketingTeam"
      },
    ],
  },
  {
    roomId: "R2",
    sizeName: "Middle",
    roomName: "Mawar",
    capacity: 8,
    image: require("@/assets/images/middle-room.jpg"),
    assetList: ["Mic", "Projector", "WiFi"],
    timeSlots: [
      {
        timeSlotId: "TS9",
        startTime: "08:00",
        endTime: "09:00",
        status: "Booked",
        bookedByUserId: "U-ITTeam"
      },
      {
        timeSlotId: "TS10",
        startTime: "09:00",
        endTime: "10:00",
        status: "Booked",
        bookedByUserId: "U-ITTeam"
      },
      {
        timeSlotId: "TS11",
        startTime: "10:00",
        endTime: "11:00",
        status: "Available"
      },
      {
        timeSlotId: "TS12",
        startTime: "11:00",
        endTime: "12:00",
        status: "Available"
      },
      {
        timeSlotId: "TS13",
        startTime: "13:00",
        endTime: "14:00",
        status: "Booked",
        bookedByUserId: "U-FinanceTeam"
      },
      {
        timeSlotId: "TS14",
        startTime: "14:00",
        endTime: "15:00",
        status: "Booked",
        bookedByUserId: "U-FinanceTeam"
      },
      {
        timeSlotId: "TS15",
        startTime: "15:00",
        endTime: "16:00",
        status: "Available"
      },
      {
        timeSlotId: "TS16",
        startTime: "16:00",
        endTime: "17:00",
        status: "Available"
      },
    ],
  },
  {
    roomId: "R3",
    sizeName: "Big",
    roomName: "Anggrek",
    capacity: 12,
    image: require("@/assets/images/big-room.jpg"),
    assetList: ["Mic", "Projector", "AC"],
    timeSlots: [
      {
        timeSlotId: "TS17",
        startTime: "08:00",
        endTime: "09:00",
        status: "Available"
      },
      {
        timeSlotId: "TS18",
        startTime: "09:00",
        endTime: "10:00",
        status: "Available"
      },
      {
        timeSlotId: "TS19",
        startTime: "10:00",
        endTime: "11:00",
        status: "Available"
      },
      {
        timeSlotId: "TS20",
        startTime: "11:00",
        endTime: "12:00",
        status: "Booked",
        bookedByUserId: "U-BoardMeeting"
      },
      {
        timeSlotId: "TS21",
        startTime: "13:00",
        endTime: "14:00",
        status: "Booked",
        bookedByUserId: "U-BoardMeeting"
      },
      {
        timeSlotId: "TS22",
        startTime: "14:00",
        endTime: "15:00",
        status: "Available"
      },
      {
        timeSlotId: "TS23",
        startTime: "15:00",
        endTime: "16:00",
        status: "Available"
      },
      {
        timeSlotId: "TS24",
        startTime: "16:00",
        endTime: "17:00",
        status: "Available"
      },
    ],
  },
];

// -----------------------------------------------------------------------------
// 7) Data Transportation (contoh dummy data)
// -----------------------------------------------------------------------------
export const transportList: ITransport[] = [
  {
    transportId: "T1",
    transportName: "Kijang Innova Zenix",
    capacity: "7 seats",
    image: require("@/assets/images/car1.jpg"),
    timeSlots: [
      {
        timeSlotId: "TT1",
        startTime: "08:00",
        endTime: "10:00",
        status: "Booked",
        bookedByUserId: "U-SiteVisitTeam"
      },
      {
        timeSlotId: "TT2",
        startTime: "10:00",
        endTime: "12:00",
        status: "Booked",
        bookedByUserId: "U-SiteVisitTeam"
      },
      {
        timeSlotId: "TT3",
        startTime: "13:00",
        endTime: "15:00",
        status: "Booked",
        bookedByUserId: "U-SiteVisitTeam"
      },
      {
        timeSlotId: "TT4",
        startTime: "15:00",
        endTime: "17:00",
        status: "Booked",
        bookedByUserId: "U-SiteVisitTeam"
      },
    ],
  },
  {
    transportId: "T2",
    transportName: "Kijang Innova Reborn 2.4 G",
    capacity: "7 seats",
    image: require("@/assets/images/car2.jpg"),
    timeSlots: [
      {
        timeSlotId: "TT5",
        startTime: "08:00",
        endTime: "10:00",
        status: "Booked",
        bookedByUserId: "U-SalesTeam"
      },
      {
        timeSlotId: "TT6",
        startTime: "10:00",
        endTime: "12:00",
        status: "Available"
      },
      {
        timeSlotId: "TT7",
        startTime: "13:00",
        endTime: "15:00",
        status: "Booked",
        bookedByUserId: "U-ExecutiveVisit"
      },
      {
        timeSlotId: "TT8",
        startTime: "15:00",
        endTime: "17:00",
        status: "Available"
      },
    ],
  },
  {
    transportId: "T3",
    transportName: "Alphard",
    capacity: "6 seats",
    image: require("@/assets/images/car3.jpg"),
    timeSlots: [
      {
        timeSlotId: "TT9",
        startTime: "08:00",
        endTime: "10:00",
        status: "Available"
      },
      {
        timeSlotId: "TT10",
        startTime: "10:00",
        endTime: "12:00",
        status: "Available"
      },
      {
        timeSlotId: "TT11",
        startTime: "13:00",
        endTime: "15:00",
        status: "Available"
      },
      {
        timeSlotId: "TT12",
        startTime: "15:00",
        endTime: "17:00",
        status: "Booked",
        bookedByUserId: "U-VIPTransport"
      },
    ],
  },
];

// -----------------------------------------------------------------------------
// 8) Data Meetings (dummy) untuk Room
//    - Pastikan menambahkan 'meetingId' agar jadi PK di DB
// -----------------------------------------------------------------------------
export const meetings: IMeeting[] = [
  {
    meetingId: "M1",
    meetingDate: "2024-12-21",
    startTime: "09:30",
    endTime: "11:00",
    title: "Designers Meeting",
    roomId: "R1",      // Room: "Small meeting room" => 'R1'
    isOngoing: true,
  },
  {
    meetingId: "M2",
    meetingDate: "2024-12-21",
    startTime: "12:00",
    endTime: "14:00",
    title: "Daily Project Meeting",
    roomId: "R3",      // Room: "Big meeting room" => 'R3'
    isOngoing: false,
  },
  {
    meetingId: "M3",
    meetingDate: "2024-12-22",
    startTime: "10:00",
    endTime: "12:00",
    title: "Team Retrospective",
    roomId: "R999",    // misal: "Main Hall" => di DB ada ID lain
    isOngoing: false,
  },
];

// -----------------------------------------------------------------------------
// 8a) Data Transport Booking (dummy)
// -----------------------------------------------------------------------------
export const transportBookings: ITransportBooking[] = [
  {
    transportBookingId: "TB1",
    bookingDate: "2024-12-27",
    startTime: "10:00",
    endTime: "12:00",
    title: "Airport Pickup",
    transportId: "T1",   // "Kijang Innova Zenix"
    isOngoing: false,
  },
  {
    transportBookingId: "TB2",
    bookingDate: "2024-12-21",
    startTime: "10:00",
    endTime: "12:00",
    title: "VIP Guest Tour",
    transportId: "T3",   // "Alphard"
    isOngoing: true,
  },
  {
    transportBookingId: "TB3",
    bookingDate: "2024-12-22",
    startTime: "09:00",
    endTime: "12:00",
    title: "Site Visit Team",
    transportId: "T2",   // "Kijang Innova Reborn 2.4 G"
    isOngoing: false,
  },
];

// -----------------------------------------------------------------------------
// 9) Nama bulan & hari (opsional, data pendukung)
// -----------------------------------------------------------------------------
export const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const dayNames = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];
