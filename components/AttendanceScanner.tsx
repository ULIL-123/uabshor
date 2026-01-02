
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useData } from '../context/DataContext';
import { getTodayDateString } from '../utils/dateUtils';
import { CheckCircleIcon, XCircleIcon, CameraIcon, BoltIcon } from '@heroicons/react/24/solid';

// Declare Html5Qrcode at the component level
declare var Html5Qrcode: any;

interface ScanResult {
    studentName: string;
    status: 'success' | 'error' | 'already_marked';
    message: string;
}

const AttendanceScanner: React.FC = () => {
  const { markAttendance, getAttendanceForDate, students } = useData();
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [hardwareDetected, setHardwareDetected] = useState(false);
  const markedToday = useRef(new Set<string>());
  const scannerRef = useRef<any>(null); // To hold the Html5Qrcode instance
  const isProcessingScan = useRef(false);

  // Initialize markedToday cache
  useEffect(() => {
    const today = getTodayDateString();
    const attendanceToday = getAttendanceForDate(today);
    const presentStudents = attendanceToday
      .filter(a => a.status === 'Present')
      .map(a => a.student.id);
    markedToday.current = new Set(presentStudents);
  }, [getAttendanceForDate, students]); // Re-run if students list changes (e.g. import)

  const onScanSuccess = useCallback((decodedText: string) => {
    if (isProcessingScan.current) return;
    isProcessingScan.current = true;

    let qrData: { id?: string };
    try {
        qrData = JSON.parse(decodedText);
        if (!qrData.id) {
            throw new Error("Invalid QR code data: missing id");
        }
    } catch (error) {
        // Attempt to treat it as a raw ID if JSON parse fails (fallback for simple barcode/QR)
        // If the decoded text looks like one of our IDs (e.g. student-...)
        if (typeof decodedText === 'string' && decodedText.startsWith('student-')) {
             qrData = { id: decodedText };
        } else {
            setScanResult({
                studentName: '',
                status: 'error',
                message: 'Invalid QR Code format.'
            });
            setTimeout(() => {
                setScanResult(null);
                isProcessingScan.current = false;
            }, 3000);
            return;
        }
    }

    const studentId = qrData.id;
    const studentInfo = students.find(s => s.id === studentId);

    if (markedToday.current.has(studentId)) {
        setScanResult({
            studentName: studentInfo?.name || "Student",
            status: 'already_marked',
            message: 'This student has already been marked present.'
        });
        setTimeout(() => {
            setScanResult(null);
            isProcessingScan.current = false;
        }, 3000);
        return;
    }

    const today = getTodayDateString();
    const student = markAttendance(studentId, today);

    if (student) {
        markedToday.current.add(student.id);
        setScanResult({
            studentName: student.name,
            status: 'success',
            message: 'Marked as Present!'
        });
    } else {
        setScanResult({
            studentName: studentInfo?.name || "Unknown Student",
            status: 'error',
            message: 'Student not found in the system.'
        });
    }
    
    setTimeout(() => {
        setScanResult(null);
        isProcessingScan.current = false;
    }, 2000); // Faster reset for hardware scanners
  }, [students, markAttendance, setScanResult]);
  
  const onScanFailure = useCallback(() => {
    // This is called frequently by the library, so we will ignore it to prevent log spam.
  }, []);

  // HID (Keyboard) Scanner Support
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
        const currentTime = Date.now();
        // If delay is > 100ms, assume it's a new input sequence or manual typing
        if (currentTime - lastKeyTime > 100) {
            buffer = '';
        }
        lastKeyTime = currentTime;

        if (e.key === 'Enter') {
            if (buffer.length > 3) { // Minimum length to be a valid scan
                // Visual feedback that hardware scan was detected
                setHardwareDetected(true);
                setTimeout(() => setHardwareDetected(false), 2000);
                
                onScanSuccess(buffer);
            }
            buffer = '';
        } else if (e.key.length === 1) { // Only capture printable characters
            buffer += e.key;
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onScanSuccess]);

  // Automatic Device Detection (Plug and Play)
  useEffect(() => {
    const handleDeviceChange = async () => {
        console.log("Device change detected");
        // If we are currently scanning, simple way to "refresh" is to notify user or 
        // the library might handle it. But to be safe, if we see a new device,
        // we could potentially restart.
        // For now, we'll just log it. Html5Qrcode might need a restart to see new cams.
        if (isScannerActive) {
            // Optional: Restart scanner logic could go here
            // But doing it automatically might interrupt the user.
        }
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    return () => navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
  }, [isScannerActive]);


  // Effect to manage the scanner lifecycle (start/stop)
  useEffect(() => {
    if (isScannerActive) {
      // The div#reader is in the DOM, so it's safe to create the instance.
      const scanner = new Html5Qrcode("reader");
      scannerRef.current = scanner;

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      
      const startScanner = async () => {
          try {
              // Attempt 1: Standard way with facingMode, most compatible
              await scanner.start({ facingMode: "environment" }, config, onScanSuccess, onScanFailure);
          } catch (err) {
              console.warn("Standard camera start failed, trying fallback.", err);
              try {
                  // Attempt 2: Manually select a camera as a fallback
                  const cameras = await Html5Qrcode.getCameras();
                  if (cameras && cameras.length) {
                      const rearCamera = cameras.find((c: any) => c.label.toLowerCase().includes('back') || c.label.toLowerCase().includes('rear'));
                      // Fallback to the last camera, often the main one
                      const cameraId = rearCamera ? rearCamera.id : cameras[cameras.length - 1].id; 
                      await scanner.start(cameraId, config, onScanSuccess, onScanFailure);
                  } else {
                      throw new Error("No cameras found on this device.");
                  }
              } catch (fallbackErr) {
                  console.error("Camera fallback also failed.", fallbackErr);
                  setScanResult({ 
                      studentName: "", 
                      status: 'error', 
                      message: "Failed to start camera. Please check browser permissions and try again." 
                  });
                  setIsScannerActive(false);
              }
          }
      };
      
      startScanner();

      return () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
            scannerRef.current.stop()
                .then(() => {
                    scannerRef.current = null;
                })
                .catch((error: any) => {
                    console.error("Failed to stop the scanner.", error);
                });
        }
      };
    }
  }, [isScannerActive, onScanSuccess, onScanFailure, setIsScannerActive, setScanResult]);


  const handleStartScanner = () => {
    setScanResult(null); // Clear previous results
    setIsScannerActive(true);
  };

  const ResultNotification = () => {
      if (!scanResult) return null;
      const { studentName, status, message } = scanResult;

      const bgColor = status === 'success' ? 'bg-green-100' : status === 'error' ? 'bg-red-100' : 'bg-yellow-100';
      const textColor = status === 'success' ? 'text-green-800' : status === 'error' ? 'text-red-800' : 'text-yellow-800';
      const Icon = status === 'success' ? CheckCircleIcon : XCircleIcon;

      return (
          <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 w-11/12 max-w-md p-4 rounded-lg shadow-lg flex items-center ${bgColor} ${textColor} transition-transform duration-300 transform animate-bounce z-50`}>
              <Icon className="w-8 h-8 mr-3" />
              <div>
                  {studentName && <p className="font-bold">{studentName}</p>}
                  <p>{message}</p>
              </div>
          </div>
      );
  }

  return (
    <div className="flex flex-col items-center text-center">
        <h2 className="text-2xl font-bold text-primary-700 mb-2">Scan Student QR Code</h2>
        
        {/* Hardware Detection Status */}
        <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-gray-500 bg-white/50 px-3 py-1 rounded-full border border-gray-200">
           <BoltIcon className={`w-4 h-4 ${hardwareDetected ? 'text-yellow-500 animate-pulse' : 'text-gray-400'}`} />
           <span>External Scanners Supported</span>
        </div>

        {!isScannerActive ? (
            <div className="flex flex-col items-center justify-center bg-white/80 backdrop-blur-md p-8 rounded-xl shadow-sm border border-red-100 w-full max-w-md">
                <div className="p-4 bg-primary-50 rounded-full mb-4">
                     <CameraIcon className="w-12 h-12 text-primary-500"/>
                </div>
                <p className="text-gray-600 mb-6">Use your camera OR an external USB scanner.</p>
                <button onClick={handleStartScanner} className="w-full bg-primary-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center shadow-md shadow-primary-200">
                    <CameraIcon className="w-5 h-5 mr-2" /> Start Camera
                </button>
            </div>
        ) : (
            <div className="w-full max-w-md mx-auto">
                <div id="reader" className="w-full rounded-lg overflow-hidden shadow-lg border-4 border-gray-300 bg-black"></div>
                <button onClick={() => setIsScannerActive(false)} className="mt-4 w-full bg-white text-red-600 border-2 border-red-100 font-bold py-3 px-4 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center">
                    <XCircleIcon className="w-5 h-5 mr-2" /> Stop Scanner
                </button>
                <p className="mt-4 text-gray-500 text-sm">Point camera or use external hardware.</p>
            </div>
        )}

        <ResultNotification />
    </div>
  );
};

export default AttendanceScanner;
