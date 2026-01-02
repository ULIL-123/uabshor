
export enum AttendanceStatus {
  Present = 'Present',
  Absent = 'Absent',
}

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  customId?: string; // New field for optional Student ID
  className?: string;
  profilePicture?: string; // data URL for the image
  parentContact?: string; // WhatsApp number
}

export interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
  date: string; // YYYY-MM-DD
}

export interface BackupData {
  version: number;
  timestamp: string;
  students: Student[];
  attendance: AttendanceRecord[];
}
