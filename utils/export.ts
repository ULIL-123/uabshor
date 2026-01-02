
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { Student } from '../types';

declare var XLSX: any;

// Fix: Use 'extends' keyword instead of ':' for interface inheritance in TypeScript.
interface StudentWithQr extends Student {
  qrDataUrl: string;
}

/**
 * Converts an SVG element to a PNG data URL.
 * @param svgElement The SVG element to convert.
 * @returns A promise that resolves with the PNG data URL.
 */
export const svgToPngDataUrl = (svgElement: SVGElement): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      const img = new Image();
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        // Fix: Cast svgElement to SVGSVGElement to access its width and height properties.
        const svg = svgElement as SVGSVGElement;
        canvas.width = svg.width.baseVal.value || 256;
        canvas.height = svg.height.baseVal.value || 256;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pngDataUrl = canvas.toDataURL('image/png');
        URL.revokeObjectURL(url);
        resolve(pngDataUrl);
      };
      
      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        reject(err);
      }
      
      img.src = url;
    } catch (error) {
        reject(error);
    }
  });
};

/**
 * Generates a PDF document containing all student QR codes.
 * @param studentsWithQr An array of student objects, each including their QR code data URL.
 */
export const generatePdf = async (studentsWithQr: StudentWithQr[]): Promise<void> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const qrSize = 40;
  const margin = 15;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  let x = margin;
  let y = margin;

  doc.setFontSize(18);
  doc.text('Student QR Codes', pageWidth / 2, y, { align: 'center' });
  y += 20;

  studentsWithQr.forEach((student) => {
    if (y + qrSize + 10 > pageHeight - margin) {
      doc.addPage();
      y = margin;
      doc.setFontSize(18);
      doc.text('Student QR Codes (Continued)', pageWidth / 2, y, { align: 'center' });
      y += 20;
    }
    
    doc.addImage(student.qrDataUrl, 'PNG', x, y, qrSize, qrSize);
    
    doc.setFontSize(10);
    const textX = x + qrSize + 5;
    const textY = y + (qrSize / 2);
    doc.text(student.name, textX, textY - 3);
    doc.setFontSize(8);
    doc.text(`ID: ${student.rollNumber}`, textX, textY + 3);
    
    x += (pageWidth / 2) - margin;

    if (x + qrSize > pageWidth - margin) {
        x = margin;
        y += qrSize + 15;
    }
  });

  doc.save('student-qr-codes.pdf');
};

/**
 * Generates a styled PDF with Student ID Cards.
 * @param studentsWithQr An array of student objects with QR code data.
 */
export const generateIdCardPdf = async (studentsWithQr: StudentWithQr[]): Promise<void> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const cardWidth = 85.6; // Standard ID Card width
  const cardHeight = 54;  // Standard ID Card height
  const gap = 10;
  const startX = 15;
  const startY = 15;
  
  let x = startX;
  let y = startY;

  studentsWithQr.forEach((student) => {
    // Check page break
    if (y + cardHeight > 280) {
      doc.addPage();
      x = startX;
      y = startY;
    }

    // Card Background/Border
    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, y, cardWidth, cardHeight, 4, 4, 'FD');

    // Header (Digital Slate Theme)
    doc.setFillColor(15, 23, 42); // Slate-900 (Digital portal theme)
    doc.rect(x, y, cardWidth, 14, 'F'); 
    
    // Accent Line
    doc.setFillColor(34, 211, 238); // Cyan-400
    doc.rect(x, y + 13.5, cardWidth, 0.5, 'F');

    // School Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("SD NEGERI 4 KRONGGEN", x + cardWidth / 2, y + 6, { align: "center" });
    doc.setFontSize(6);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(34, 211, 238); // Cyan Accent
    doc.text("TOWARDS LITERATE SCHOOL", x + cardWidth / 2, y + 10, { align: "center" });

    // Photo Area (Enhanced Rounded)
    const photoSize = 26;
    const photoX = x + 5;
    const photoY = y + 19;
    
    doc.setDrawColor(241, 245, 249); // Slate-100
    doc.setFillColor(248, 250, 252); // Slate-50
    doc.roundedRect(photoX - 1, photoY - 1, photoSize + 2, photoSize + 2, 2, 2, 'FD');

    if (student.profilePicture) {
        try {
            const format = student.profilePicture.includes('image/png') ? 'PNG' : 'JPEG';
            doc.addImage(student.profilePicture, format, photoX, photoY, photoSize, photoSize);
        } catch (e) {
            doc.setFillColor(240, 240, 240);
            doc.rect(photoX, photoY, photoSize, photoSize, 'F');
        }
    } else {
        doc.setTextColor(203, 213, 225);
        doc.setFontSize(6);
        doc.text("FOTO SISWA", photoX + photoSize / 2, photoY + photoSize / 2, { align: "center" });
    }

    // Student Details
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    const displayName = student.name.length > 18 ? student.name.substring(0, 16) + '...' : student.name;
    doc.text(displayName.toUpperCase(), x + 35, y + 25);
    
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(8, 145, 178); // Cyan-600 Label
    doc.text("NOMOR INDUK", x + 35, y + 31);
    doc.text("KELAS", x + 35, y + 41);

    doc.setTextColor(51, 65, 85); // Slate-700 Value
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(student.rollNumber, x + 35, y + 35);
    doc.text(student.className || '-', x + 35, y + 45);
    
    // QR Code Position
    const qrSize = 20;
    const qrX = x + cardWidth - qrSize - 4;
    const qrY = y + cardHeight - qrSize - 4;
    doc.addImage(student.qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

    // CENTRAL QR BRANDING: "4KRO" Logo in the middle
    const centerX = qrX + qrSize / 2;
    const centerY = qrY + qrSize / 2;
    const logoBoxSize = 5.5; 
    
    // White Box with rounded corners for the logo background
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(255, 255, 255);
    doc.roundedRect(centerX - logoBoxSize / 2, centerY - logoBoxSize / 2, logoBoxSize, logoBoxSize, 0.8, 0.8, 'F');
    
    // "4KRO" Text in center of QR
    doc.setTextColor(8, 145, 178); // Cyan-600
    doc.setFontSize(4);
    doc.setFont("helvetica", "bold");
    doc.text("4KRO", centerX, centerY + 1.2, { align: "center" });

    // Footer Tag
    doc.setFontSize(5);
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text("E-ABSENCE SYSTEM PORTAL", x + 5, y + cardHeight - 3);

    // Update positions for next card (2 columns grid)
    if (x + (cardWidth * 2) + gap < 210) {
        x += cardWidth + gap;
    } else {
        x = startX;
        y += cardHeight + gap;
    }
  });

  doc.save('ID_CARD_SISWA_SDN4KRO.pdf');
};

/**
 * Generates a ZIP archive containing individual PNG files for each student's QR code.
 * @param studentsWithQr An array of student objects, each including their QR code data URL.
 */
export const generateZip = async (studentsWithQr: StudentWithQr[]): Promise<void> => {
  const zip = new JSZip();

  for (const student of studentsWithQr) {
    const fileName = `${student.name.replace(/\s/g, '_')}_${student.rollNumber}.png`;
    const base64Content = student.qrDataUrl.split(',')[1];
    zip.file(fileName, base64Content, { base64: true });
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(zipBlob);
  link.download = 'student-qr-codes.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

export const exportAttendanceToExcel = (data: any[], fileName: string) => {
  if (typeof XLSX === 'undefined') {
    console.error('XLSX library not loaded');
    return;
  }
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Attendance");
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};
