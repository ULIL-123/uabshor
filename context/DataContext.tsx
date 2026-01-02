
import React, { createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Student, AttendanceRecord, AttendanceStatus, BackupData } from '../types';

interface DataContextType {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  attendance: AttendanceRecord[];
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  addStudent: (name: string, rollNumber: string, className: string, profilePicture?: string, parentContact?: string, customId?: string) => void;
  updateStudent: (studentId: string, updatedData: Partial<Omit<Student, 'id'>>) => void;
  deleteStudent: (id: string) => void;
  updateStudentPicture: (studentId: string, pictureDataUrl: string) => void;
  markAttendance: (studentId: string, date: string) => Student | null;
  getAttendanceForDate: (date: string) => { student: Student, status: AttendanceStatus }[];
  importStudents: (newStudents: Omit<Student, 'id'|'profilePicture'>[]) => { imported: number, duplicates: number };
  bulkUpdateStudents: (ids: string[], updatedData: Partial<Omit<Student, 'id'>>) => void;
  bulkDeleteStudents: (ids: string[]) => void;
  getBackupData: () => BackupData;
  restoreFromBackup: (data: BackupData) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [students, setStudents] = useLocalStorage<Student[]>('students', []);
  const [attendance, setAttendance] = useLocalStorage<AttendanceRecord[]>('attendance', []);

  const addStudent = useCallback((name: string, rollNumber: string, className: string, profilePicture?: string, parentContact?: string, customId?: string) => {
    const newStudent: Student = {
      id: `student-${Date.now()}`,
      name,
      rollNumber,
      className,
      profilePicture,
      parentContact,
      customId,
    };
    setStudents(prev => [...prev, newStudent]);
  }, [setStudents]);
  
  const importStudents = useCallback((newStudentsData: Omit<Student, 'id'|'profilePicture'>[]): { imported: number, duplicates: number } => {
    let importedCount = 0;
    let duplicateCount = 0;

    setStudents(prev => {
        const existingRollNumbers = new Set(prev.map(s => s.rollNumber));
        const uniqueNewStudents: Student[] = [];

        for (const s of newStudentsData) {
            if (s.rollNumber && !existingRollNumbers.has(s.rollNumber)) {
                uniqueNewStudents.push({
                    ...s,
                    id: `student-import-${Date.now()}-${importedCount}`,
                });
                existingRollNumbers.add(s.rollNumber);
                importedCount++;
            } else {
                duplicateCount++;
            }
        }
        return [...prev, ...uniqueNewStudents];
    });

    return { imported: importedCount, duplicates: duplicateCount };
  }, [setStudents]);

  const updateStudent = useCallback((studentId: string, updatedData: Partial<Omit<Student, 'id'>>) => {
    setStudents(prev =>
      prev.map(student =>
        student.id === studentId ? { ...student, ...updatedData } : student
      )
    );
  }, [setStudents]);
  
  const deleteStudent = useCallback((id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    setAttendance(prev => prev.filter(a => a.studentId !== id));
  }, [setStudents, setAttendance]);

  const bulkUpdateStudents = useCallback((ids: string[], updatedData: Partial<Omit<Student, 'id'>>) => {
    setStudents(prev =>
      prev.map(student =>
        ids.includes(student.id) ? { ...student, ...updatedData } : student
      )
    );
  }, [setStudents]);

  const bulkDeleteStudents = useCallback((ids: string[]) => {
    setStudents(prev => prev.filter(s => !ids.includes(s.id)));
    setAttendance(prev => prev.filter(a => !ids.includes(a.studentId)));
  }, [setStudents, setAttendance]);

  const updateStudentPicture = useCallback((studentId: string, pictureDataUrl: string) => {
    setStudents(prev => 
      prev.map(student => 
        student.id === studentId 
          ? { ...student, profilePicture: pictureDataUrl }
          : student
      )
    );
  }, [setStudents]);

  const markAttendance = useCallback((studentId: string, date: string): Student | null => {
    const student = students.find(s => s.id === studentId);
    if (!student) return null;

    setAttendance(prev => {
      const existingRecordIndex = prev.findIndex(
        record => record.studentId === studentId && record.date === date
      );

      if (existingRecordIndex > -1) {
        const updatedAttendance = [...prev];
        updatedAttendance[existingRecordIndex].status = AttendanceStatus.Present;
        return updatedAttendance;
      } else {
        return [...prev, { studentId, date, status: AttendanceStatus.Present }];
      }
    });
    return student;
  }, [students, setAttendance]);
  
  const getAttendanceForDate = useCallback((date: string) => {
    return students.map(student => {
      const record = attendance.find(a => a.studentId === student.id && a.date === date);
      return {
        student,
        status: record ? record.status : AttendanceStatus.Absent,
      };
    });
  }, [students, attendance]);

  const getBackupData = useCallback((): BackupData => {
    return {
      version: 1,
      timestamp: new Date().toISOString(),
      students,
      attendance,
    };
  }, [students, attendance]);

  const restoreFromBackup = useCallback((data: BackupData) => {
    if (data.students && Array.isArray(data.students)) {
      setStudents(data.students);
    }
    if (data.attendance && Array.isArray(data.attendance)) {
      setAttendance(data.attendance);
    }
  }, [setStudents, setAttendance]);

  const value = useMemo(() => ({ 
    students, 
    setStudents, 
    attendance, 
    setAttendance, 
    addStudent, 
    updateStudent, 
    deleteStudent, 
    updateStudentPicture, 
    markAttendance, 
    getAttendanceForDate, 
    importStudents,
    bulkUpdateStudents,
    bulkDeleteStudents,
    getBackupData,
    restoreFromBackup
  }), [students, setStudents, attendance, setAttendance, addStudent, updateStudent, deleteStudent, updateStudentPicture, markAttendance, getAttendanceForDate, importStudents, bulkUpdateStudents, bulkDeleteStudents, getBackupData, restoreFromBackup]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
