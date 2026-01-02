
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { getTodayDateString } from '../utils/dateUtils';
import { AttendanceStatus, Student } from '../types';
import { CalendarDaysIcon, CheckBadgeIcon, NoSymbolIcon, UserCircleIcon, PaperAirplaneIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import { exportAttendanceToExcel } from '../utils/export';

const WhatsAppIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.31 20.62C8.75 21.41 10.36 21.82 12.04 21.82C17.5 21.82 21.95 17.37 21.95 11.91C21.95 6.45 17.5 2 12.04 2M12.04 20.13C10.56 20.13 9.12 19.72 7.89 19L7.5 18.78L4.36 19.64L5.24 16.58L5.03 16.19C4.16 14.85 3.73 13.32 3.73 11.91C3.73 7.36 7.45 3.64 12.04 3.64C16.63 3.64 20.35 7.36 20.35 11.91C20.35 16.46 16.63 20.13 12.04 20.13M17.41 14.5C17.16 14.38 16.05 13.86 15.82 13.78C15.6 13.7 15.44 13.66 15.28 13.9C15.12 14.14 14.65 14.69 14.5 14.85C14.34 15.01 14.19 15.03 13.94 14.91C13.69 14.79 12.83 14.49 11.83 13.6C11.04 12.91 10.53 12.12 10.39 11.88C10.25 11.64 10.38 11.51 10.5 11.39C10.61 11.28 10.76 11.09 10.88 10.95C11 10.81 11.05 10.71 11.17 10.47C11.29 10.23 11.23 10.02 11.15 9.86C11.07 9.7 10.6 8.65 10.42 8.2C10.24 7.75 10.05 7.82 9.9 7.82C9.74 7.82 9.58 7.82 9.42 7.82C9.26 7.82 9.03 7.88 8.81 8.12C8.59 8.36 8.08 8.81 8.08 9.9C8.08 10.99 8.84 11.95 8.96 12.11C9.08 12.27 10.6 14.69 12.94 15.68C13.53 15.92 13.96 16.04 14.3 16.12C14.83 16.24 15.28 16.2 15.49 16.12C15.74 16.02 16.69 15.45 16.91 14.9C17.13 14.35 17.13 13.9 17.05 13.78C16.97 13.66 16.8 13.62 16.6 13.52C16.4 13.42 17.66 14.62 17.41 14.5Z" />
    </svg>
);


const AttendanceReport: React.FC = () => {
  const { getAttendanceForDate, students } = useData();
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  
  const attendanceData = getAttendanceForDate(selectedDate);
  const presentCount = attendanceData.filter(a => a.status === AttendanceStatus.Present).length;
  const absentCount = attendanceData.length - presentCount;

  const handleNotifyParent = (student: Student, status: AttendanceStatus, skipConfirm: boolean = false) => {
    if (!student.parentContact) return;

    if (!skipConfirm) {
        const confirmMessage = `Are you sure you want to send a WhatsApp notification to ${student.name}'s parent?`;
        if (!window.confirm(confirmMessage)) {
            return;
        }
    }

    const date = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const message = `Dear Parent, this is an attendance update from SD NEGERI 4 KRONGGEN. Your child, ${student.name}, was marked ${status.toUpperCase()} on ${date}. Thank you.`;
    const number = student.parentContact.replace(/\D/g, ''); // Clean number
    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleNotifyAllAbsent = () => {
    const absentStudentsWithContact = attendanceData.filter(
      a => a.status === AttendanceStatus.Absent && !!a.student.parentContact
    );

    if (absentStudentsWithContact.length === 0) {
      alert("No absent students with contact information to notify.");
      return;
    }

    if (window.confirm(`This will open ${absentStudentsWithContact.length} new tabs to notify parents. Do you want to continue?`)) {
      absentStudentsWithContact.forEach(({ student }) => {
        handleNotifyParent(student, AttendanceStatus.Absent, true); // skipConfirm = true
      });
    }
  };

  const handleExportExcel = () => {
      const dataToExport = attendanceData.map(record => ({
          Name: record.student.name,
          ID: record.student.rollNumber,
          Class: record.student.className || '',
          Date: selectedDate,
          Status: record.status
      }));
      exportAttendanceToExcel(dataToExport, `Attendance_${selectedDate}`);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-sm border border-red-100">
        <h2 className="text-xl font-bold text-primary-700 mb-4 flex items-center">
          <CalendarDaysIcon className="w-6 h-6 mr-2 text-primary-500"/>
          View Attendance Report
        </h2>
        <div className="mb-4">
          <label htmlFor="date-picker" className="block text-sm font-medium text-gray-700">Select Date</label>
          <input
            type="date"
            id="date-picker"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white/50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>
        <div className="flex justify-around text-center p-2 bg-white/50 rounded-lg border border-red-100">
            <div>
                <p className="font-bold text-lg text-green-600">{presentCount}</p>
                <p className="text-sm text-gray-500">Present</p>
            </div>
            <div>
                <p className="font-bold text-lg text-red-600">{absentCount}</p>
                <p className="text-sm text-gray-500">Absent</p>
            </div>
            <div>
                <p className="font-bold text-lg text-primary-600">{students.length}</p>
                <p className="text-sm text-gray-500">Total</p>
            </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-sm border border-red-100">
        <div className="flex flex-col gap-3 mb-4">
            <h3 className="text-lg font-bold text-primary-700">
            Report for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </h3>
            
            <div className="flex gap-2 flex-wrap">
                <button
                onClick={handleExportExcel}
                className="flex items-center justify-center text-xs font-bold text-white bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg shadow-sm transition-colors"
                >
                <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                Export to Excel
                </button>
                
                <button
                onClick={handleNotifyAllAbsent}
                className="flex items-center justify-center text-xs font-bold text-white bg-red-500 hover:bg-red-600 px-3 py-2 rounded-lg shadow-sm transition-colors"
                >
                <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                Notify Absentees
                </button>
            </div>
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {attendanceData.length > 0 ? (
            attendanceData.map(({ student, status }) => (
              <div key={student.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-gray-100 hover:bg-primary-50 transition-colors">
                <div className="flex items-center">
                  {student.profilePicture ? (
                    <img src={student.profilePicture} alt={student.name} className="w-12 h-12 rounded-full object-cover mr-4 border border-gray-200" />
                  ) : (
                    <UserCircleIcon className="w-12 h-12 text-gray-400 mr-4" />
                  )}
                  <div>
                    <p className="font-bold text-gray-800">{student.name}</p>
                    <p className="text-sm text-gray-500">ID: {student.rollNumber}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                    {status === AttendanceStatus.Present ? (
                    <span className="flex items-center text-sm font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">
                        <CheckBadgeIcon className="w-5 h-5 mr-1"/>
                        Present
                    </span>
                    ) : (
                    <span className="flex items-center text-sm font-medium text-red-600 bg-red-100 px-3 py-1 rounded-full">
                        <NoSymbolIcon className="w-5 h-5 mr-1"/>
                        Absent
                    </span>
                    )}
                    {status === AttendanceStatus.Absent && (
                        <button
                            onClick={() => handleNotifyParent(student, status)}
                            disabled={!student.parentContact}
                            title={student.parentContact ? "Notify parent via WhatsApp" : "No parent contact number available"}
                            className="p-2 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-white bg-green-500 hover:bg-green-600"
                        >
                            <WhatsAppIcon />
                        </button>
                    )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8 bg-white/50 rounded-lg border border-dashed border-gray-300">No students to display report for.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceReport;
