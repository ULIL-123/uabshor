
import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { Student } from '../types';
import Modal from './common/Modal';
import QRCode from "react-qr-code";
import { UserPlusIcon, TrashIcon, QrCodeIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, UserCircleIcon, PencilIcon, XMarkIcon, PrinterIcon } from '@heroicons/react/24/outline';
import { svgToPngDataUrl, generatePdf, generateZip, generateIdCardPdf } from '../utils/export';

declare var XLSX: any;

type ExportJob = {
  type: 'pdf' | 'zip' | 'id-card';
  status: 'pending' | 'generating';
  scope: 'all' | 'selected';
}

const StudentManagement: React.FC = () => {
  const { students, addStudent, deleteStudent, updateStudentPicture, updateStudent, importStudents, bulkUpdateStudents, bulkDeleteStudents } = useData();
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [customId, setCustomId] = useState('');
  const [className, setClassName] = useState('');
  const [parentContact, setParentContact] = useState('');
  const [pictureFile, setPictureFile] = useState<File | null>(null);
  const [picturePreview, setPicturePreview] = useState<string | null>(null);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [exportJob, setExportJob] = useState<ExportJob | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const importFileInputRef = useRef<HTMLInputElement>(null);
  const selectAllRef = useRef<HTMLInputElement>(null);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [bulkClassName, setBulkClassName] = useState('');


  const isGenerating = exportJob?.status === 'generating';

  useEffect(() => {
    if (exportJob?.status !== 'pending') return;

    setExportJob(prev => prev ? { ...prev, status: 'generating' } : null);

    const generateAndDownload = async () => {
      try {
        // Determine which students to process based on scope
        const studentsToProcess = exportJob.scope === 'selected' 
            ? students.filter(s => selectedIds.has(s.id))
            : students;

        const qrCodeElements = studentsToProcess.map(student => 
            document.getElementById(`qr-export-${student.id}`)
        );
        
        const pngDataUrls = await Promise.all(
            qrCodeElements.map(el => {
                if (el) return svgToPngDataUrl(el as unknown as SVGElement);
                return Promise.resolve('');
            })
        );

        const studentDataWithQr = studentsToProcess.map((student, index) => ({
            ...student,
            qrDataUrl: pngDataUrls[index],
        })).filter(s => s.qrDataUrl);
        
        if (exportJob.type === 'pdf') {
            await generatePdf(studentDataWithQr);
        } else if (exportJob.type === 'zip') {
            await generateZip(studentDataWithQr);
        } else if (exportJob.type === 'id-card') {
            await generateIdCardPdf(studentDataWithQr);
        }

      } catch (error) {
          console.error("Failed to generate export:", error);
          alert("An error occurred while generating the file.");
      } finally {
          setExportJob(null);
      }
    };

    setTimeout(generateAndDownload, 100); 

  }, [exportJob, students, selectedIds]);

  // Indeterminate checkbox effect
  useEffect(() => {
    if (selectAllRef.current) {
        selectAllRef.current.indeterminate = selectedIds.size > 0 && selectedIds.size < students.length;
    }
  }, [selectedIds, students]);

  // Pre-fill bulk class name if all selected students have the same class
  useEffect(() => {
    if (isBulkEditModalOpen && selectedIds.size > 0) {
        const selectedStudents = students.filter(s => selectedIds.has(s.id));
        const firstClass = selectedStudents[0]?.className;
        const allSame = selectedStudents.every(s => s.className === firstClass);
        if (allSame && firstClass) {
            setBulkClassName(firstClass);
        } else {
            setBulkClassName('');
        }
    }
  }, [isBulkEditModalOpen, selectedIds, students]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPictureFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && rollNumber.trim() && className.trim()) {
      addStudent(name, rollNumber, className, picturePreview || undefined, parentContact || undefined, customId || undefined);
      setName('');
      setRollNumber('');
      setCustomId('');
      setClassName('');
      setParentContact('');
      setPictureFile(null);
      setPicturePreview(null);
    }
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (studentToEdit) {
      const formData = new FormData(e.currentTarget);
      const updatedData = {
        name: formData.get('name') as string,
        rollNumber: formData.get('rollNumber') as string,
        customId: formData.get('customId') as string,
        className: formData.get('className') as string,
        parentContact: formData.get('parentContact') as string,
      };
      updateStudent(studentToEdit.id, updatedData);
      setIsEditModalOpen(false);
      setStudentToEdit(null);
    }
  };

  // Bulk Handlers
  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
        newSet.delete(id);
    } else {
        newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === students.length && students.length > 0) {
        setSelectedIds(new Set());
    } else {
        setSelectedIds(new Set(students.map(s => s.id)));
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.size} students?`)) {
        bulkDeleteStudents(Array.from(selectedIds));
        setSelectedIds(new Set());
    }
  };

  const handleDeleteStudent = (student: Student) => {
      if(window.confirm(`Are you sure you want to delete student "${student.name}"?`)) {
          deleteStudent(student.id);
      }
  };

  const handleBulkEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkClassName.trim()) {
        const count = selectedIds.size;
        bulkUpdateStudents(Array.from(selectedIds), { className: bulkClassName });
        setIsBulkEditModalOpen(false);
        setBulkClassName('');
        setSelectedIds(new Set());
        alert(`Successfully updated class for ${count} students.`);
    }
  };

  const viewQrCode = (student: Student) => {
    setSelectedStudent(student);
    setIsQrModalOpen(true);
  };
  
  const openEditModal = (student: Student) => {
    setStudentToEdit(student);
    setIsEditModalOpen(true);
  };

  const handleDownload = (type: 'pdf' | 'zip' | 'id-card', scope: 'all' | 'selected' = 'all') => {
    if (scope === 'all' && students.length === 0) {
      alert("Please add students before exporting.");
      return;
    }
    if (scope === 'selected' && selectedIds.size === 0) {
        alert("Please select students first.");
        return;
    }
    setExportJob({ type, status: 'pending', scope });
  };

  const generateQrValue = (student: Student) => {
    return JSON.stringify({
      id: student.id,
      name: student.name,
      rollNumber: student.rollNumber,
      studentId: student.customId || student.rollNumber, // Use customId if exists, else NIS
      class: student.className,
    });
  };

  const handleUpdatePictureClick = (studentId: string) => {
    setEditingStudentId(studentId);
    fileInputRef.current?.click();
  };

  const handlePictureUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingStudentId) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        updateStudentPicture(editingStudentId, dataUrl);
        setEditingStudentId(null);
      };
      reader.readAsDataURL(file);
    }
     if(e.target) e.target.value = '';
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        setImportFile(e.target.files[0]);
    }
  };

  const handleImport = () => {
    if (!importFile) {
        alert("Please select an Excel file to import.");
        return;
    }
    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);

            const newStudents: Omit<Student, 'id' | 'profilePicture'>[] = json.map((row: any) => {
                const normalizedRow: { [key: string]: any } = {};
                for (const key in row) {
                    normalizedRow[key.toLowerCase().replace(/[^a-z0-9]/gi, '')] = row[key];
                }

                const name = normalizedRow['nama'];
                const rollNumber = String(normalizedRow['nisnisn'] || '');
                const className = normalizedRow['kelas'];
                const parentContact = String(normalizedRow['nowaorangtua'] || '');
                const customId = String(normalizedRow['studentid'] || '');

                if (!name || !rollNumber) return null;

                return {
                    name,
                    rollNumber,
                    className: className ? String(className) : undefined,
                    parentContact: parentContact || undefined,
                    customId: customId || undefined
                };
            }).filter(Boolean) as Omit<Student, 'id' | 'profilePicture'>[];

            if (newStudents.length > 0) {
                const result = importStudents(newStudents);
                let alertMessage = `Successfully imported ${result.imported} new students.`;
                if (result.duplicates > 0) {
                    alertMessage += `\n${result.duplicates} students were skipped because their NIS/NISN already exists.`;
                }
                alert(alertMessage);
            } else {
                alert("No valid student data found. Please check the file format.\nRequired columns: NAMA, NIS/NISN");
            }

        } catch (error) {
            console.error("Error importing file:", error);
            alert("An error occurred while importing the file. Please ensure it's a valid Excel file and the format is correct.");
        } finally {
            setIsImporting(false);
            setImportFile(null);
            if (importFileInputRef.current) {
                importFileInputRef.current.value = '';
            }
        }
    };
    reader.readAsArrayBuffer(importFile);
  };


  return (
    <div className="space-y-6 pb-20">
      <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePictureUpdate} className="hidden" />

      {/* Hidden container to render all QRs for export generation */}
      {(exportJob?.status === 'pending' || exportJob?.status === 'generating') && (
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', zIndex: -1 }}>
            {students.map(student => (
                <QRCode 
                  key={`export-${student.id}`} 
                  value={generateQrValue(student)} 
                  id={`qr-export-${student.id}`} 
                  size={256} 
                  level="H"
                />
            ))}
        </div>
      )}

      {/* Add Student Section */}
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-sm border border-red-100">
        <h2 className="text-xl font-bold text-primary-700 mb-4 flex items-center">
            <UserPlusIcon className="w-6 h-6 mr-2" />
            Add New Student
        </h2>
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-3 bg-white/50 border border-red-200 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" placeholder="e.g., John Doe" required />
            </div>
            <div>
              <label htmlFor="className" className="block text-sm font-medium text-gray-700">Class</label>
              <input type="text" id="className" value={className} onChange={(e) => setClassName(e.target.value)} className="mt-1 block w-full px-3 py-3 bg-white/50 border border-red-200 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" placeholder="e.g., 4A" required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700">NIS/NISN</label>
                <input type="text" id="rollNumber" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} className="mt-1 block w-full px-3 py-3 bg-white/50 border border-red-200 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" placeholder="e.g., 12345" required />
             </div>
             <div>
                <label htmlFor="customId" className="block text-sm font-medium text-gray-700">Student ID (Optional)</label>
                <input type="text" id="customId" value={customId} onChange={(e) => setCustomId(e.target.value)} className="mt-1 block w-full px-3 py-3 bg-white/50 border border-red-200 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" placeholder="e.g., STD-001" />
             </div>
          </div>
           <div>
            <label htmlFor="parentContact" className="block text-sm font-medium text-gray-700">Parent's WhatsApp Number (Optional)</label>
            <input type="tel" id="parentContact" value={parentContact} onChange={(e) => setParentContact(e.target.value)} className="mt-1 block w-full px-3 py-3 bg-white/50 border border-red-200 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" placeholder="e.g., 6281234567890" title="Enter number with country code, without '+' or spaces." />
          </div>
          <div>
            <label htmlFor="picture" className="block text-sm font-medium text-gray-700">Profile Picture (Optional)</label>
            <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="flex-shrink-0">
                   {picturePreview ? <img src={picturePreview} alt="Preview" className="w-16 h-16 rounded-full object-cover border border-gray-200" /> : <UserCircleIcon className="w-16 h-16 text-gray-300" />}
                </div>
                <input type="file" id="picture" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"/>
            </div>
          </div>
          <button type="submit" className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-primary-500/20 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none active:scale-[0.98] transition-all">
            <UserPlusIcon className="w-5 h-5 mr-2" /> Add Student
          </button>
        </form>
      </div>

      {/* Student List Section */}
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-sm border border-red-100">
        <div className="flex flex-col gap-4 mb-4">
            {/* Bulk Selection Header */}
            {selectedIds.size > 0 ? (
                <div className="flex flex-col gap-3 w-full bg-primary-50 p-3 rounded-lg border border-primary-100 animate-fade-in">
                    <div className="flex items-center justify-between">
                         <div className="flex items-center">
                            <input 
                                ref={selectAllRef}
                                type="checkbox" 
                                checked={selectedIds.size === students.length && students.length > 0} 
                                onChange={toggleSelectAll}
                                className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500 mr-3 cursor-pointer"
                            />
                            <span className="font-bold text-primary-800 text-sm sm:text-base mr-2">{selectedIds.size} Selected</span>
                        </div>
                        <button 
                            onClick={() => setSelectedIds(new Set())}
                            className="text-primary-700 hover:text-primary-900 bg-white p-1 rounded-full shadow-sm"
                            title="Clear Selection"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                    
                    {/* Bulk Actions Buttons - Wrap on mobile */}
                    <div className="flex flex-wrap gap-2">
                         <button onClick={() => handleDownload('id-card', 'selected')} className="flex-1 sm:flex-none justify-center text-xs bg-white border border-primary-200 text-primary-700 px-3 py-2 rounded-md font-semibold shadow-sm hover:bg-primary-100 flex items-center">
                            <PrinterIcon className="w-4 h-4 mr-1"/> Print IDs
                        </button>
                        <button onClick={() => setIsBulkEditModalOpen(true)} className="flex-1 sm:flex-none justify-center text-xs bg-white border border-primary-200 text-primary-700 px-3 py-2 rounded-md font-semibold shadow-sm hover:bg-primary-100 flex items-center">
                            <PencilIcon className="w-4 h-4 mr-1"/> Edit Class
                        </button>
                        <button onClick={handleBulkDelete} className="flex-1 sm:flex-none justify-center text-xs bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md font-semibold shadow-sm hover:bg-red-100 flex items-center">
                            <TrashIcon className="w-4 h-4 mr-1"/> Delete
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-between w-full pb-2 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-primary-700">Student List ({students.length})</h2>
                    {students.length > 0 && (
                         <button onClick={toggleSelectAll} className="text-sm font-medium text-gray-500 hover:text-primary-600 bg-gray-50 px-3 py-1 rounded-full">
                             Select All
                         </button>
                    )}
                </div>
            )}
        </div>

        {/* List Items */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 scrollbar-hide">
          {students.length > 0 ? (
            students.map(student => (
              <div key={student.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all duration-200 ${selectedIds.has(student.id) ? 'bg-primary-50 border-primary-200 shadow-sm' : 'bg-white/60 border-gray-100 hover:bg-white hover:shadow-md'}`}>
                
                {/* Top Part: Info (Flex Row) */}
                <div className="flex items-start sm:items-center w-full">
                    <div className="pt-1 sm:pt-0">
                        <input 
                            type="checkbox"
                            checked={selectedIds.has(student.id)}
                            onChange={() => toggleSelection(student.id)}
                            className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500 mr-3 cursor-pointer"
                        />
                    </div>
                    
                    <div className="flex-shrink-0 mr-3">
                         {student.profilePicture ? <img src={student.profilePicture} alt={student.name} className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-sm" /> : <UserCircleIcon className="w-12 h-12 text-gray-300" />}
                    </div>

                    <div className="flex-grow">
                        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
                            <p className={`font-bold text-base ${selectedIds.has(student.id) ? 'text-primary-900' : 'text-gray-800'}`}>{student.name}</p>
                            <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full mt-1 sm:mt-0 sm:ml-2 w-fit">
                                {student.className || 'No Class'}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                            NIS: <span className="font-mono">{student.rollNumber}</span>
                            {student.customId && <span className="ml-2 opacity-75">| Ref: {student.customId}</span>}
                        </p>
                         {student.parentContact && <p className="text-xs text-gray-400 mt-0.5 flex items-center">WA: {student.parentContact}</p>}
                    </div>
                </div>

                {/* Bottom Part: Actions (Row of buttons) */}
                {/* On mobile: Margin top, border top, padding top. On desktop: no border, auto margin left */}
                <div className="flex items-center justify-between sm:justify-end gap-2 mt-3 pt-3 border-t border-gray-100 sm:mt-0 sm:pt-0 sm:border-0 sm:w-auto w-full">
                  <button onClick={() => handleUpdatePictureClick(student.id)} className="flex-1 sm:flex-none flex items-center justify-center p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors border border-transparent hover:border-primary-100" title="Upload Photo">
                      <ArrowUpTrayIcon className="w-5 h-5" />
                  </button>
                  <button onClick={() => openEditModal(student)} className="flex-1 sm:flex-none flex items-center justify-center p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100" title="Edit Student">
                      <PencilIcon className="w-5 h-5" />
                  </button>
                  <button onClick={() => viewQrCode(student)} className="flex-1 sm:flex-none flex items-center justify-center p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors border border-transparent hover:border-purple-100" title="View QR Code">
                      <QrCodeIcon className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDeleteStudent(student)} className="flex-1 sm:flex-none flex items-center justify-center p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100" title="Delete Student">
                      <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white/50 rounded-xl border border-dashed border-gray-300">
                <UserCircleIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 font-medium">No students added yet.</p>
                <p className="text-xs text-gray-400">Add a student or import from Excel.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Import Section */}
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-sm border border-red-100">
        <h2 className="text-xl font-bold text-primary-700 mb-4">Import Students</h2>
        <p className="text-sm text-gray-600 mb-4 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
            <strong>Format:</strong> .xlsx or .xls file. <br/>
            <strong>Columns:</strong> NOMOR, KELAS, NAMA, NIS/NISN, NO.WA ORANG TUA, STUDENTID.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
            <input 
                type="file" 
                ref={importFileInputRef}
                accept=".xlsx, .xls" 
                onChange={handleFileSelect} 
                className="flex-1 block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer border border-dashed border-gray-300 rounded-lg p-2"
            />
            <button 
                onClick={handleImport} 
                disabled={!importFile || isImporting}
                className="w-full sm:w-auto flex justify-center items-center py-3 px-6 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-gray-800 hover:bg-gray-900 disabled:bg-gray-300 transition-colors"
            >
                <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
                {isImporting ? 'Importing...' : 'Import'}
            </button>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-sm border border-red-100">
        <h2 className="text-xl font-bold text-primary-700 mb-4">Export & Print</h2>
        <p className="text-sm text-gray-600 mb-4">Download student QR codes or print ID cards.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
           <button onClick={() => handleDownload('id-card', 'all')} disabled={isGenerating} className="flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-300 transition-colors">
            <PrinterIcon className="w-5 h-5 mr-2" /> {isGenerating ? 'Wait...' : 'Print ID Cards'}
          </button>
           <button onClick={() => handleDownload('pdf', 'all')} disabled={isGenerating} className="flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-300 transition-colors">
            <ArrowDownTrayIcon className="w-5 h-5 mr-2" /> {isGenerating ? 'Wait...' : 'QR Codes (PDF)'}
          </button>
          <button onClick={() => handleDownload('zip', 'all')} disabled={isGenerating} className="flex justify-center items-center py-3 px-4 border border-gray-200 rounded-xl shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:text-gray-400 transition-colors">
            <ArrowDownTrayIcon className="w-5 h-5 mr-2" /> {isGenerating ? 'Wait...' : 'QR Codes (ZIP)'}
          </button>
        </div>
      </div>
      
      {/* Modals remain mostly the same structure, ensuring responsive inputs */}
      {selectedStudent && (
        <Modal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)}>
          <div className="flex flex-col items-center p-4">
            <h3 className="text-2xl font-bold mb-2 text-primary-700 text-center">{selectedStudent.name}</h3>
            <p className="text-gray-600 mb-4">ID: {selectedStudent.rollNumber}</p>
            <div className="bg-white p-4 border rounded-lg shadow-inner"><QRCode value={generateQrValue(selectedStudent)} size={200} level="H" /></div>
            <p className="text-sm text-gray-500 mt-4 text-center">Scan this code to mark attendance.</p>
          </div>
        </Modal>
      )}

      {studentToEdit && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4 text-primary-700">Edit Student</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" name="name" id="edit-name" defaultValue={studentToEdit.name} className="mt-1 block w-full px-3 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="edit-rollNumber" className="block text-sm font-medium text-gray-700">NIS/NISN</label>
                    <input type="text" name="rollNumber" id="edit-rollNumber" defaultValue={studentToEdit.rollNumber} className="mt-1 block w-full px-3 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" required />
                </div>
                <div>
                    <label htmlFor="edit-customId" className="block text-sm font-medium text-gray-700">Student ID (Optional)</label>
                    <input type="text" name="customId" id="edit-customId" defaultValue={studentToEdit.customId} className="mt-1 block w-full px-3 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                </div>
              </div>
               <div>
                <label htmlFor="edit-className" className="block text-sm font-medium text-gray-700">Class</label>
                <input type="text" name="className" id="edit-className" defaultValue={studentToEdit.className} className="mt-1 block w-full px-3 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" required />
              </div>
              <div>
                <label htmlFor="edit-parentContact" className="block text-sm font-medium text-gray-700">Parent's WhatsApp Number</label>
                <input type="tel" name="parentContact" id="edit-parentContact" defaultValue={studentToEdit.parentContact} className="mt-1 block w-full px-3 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" placeholder="e.g., 6281234567890" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
                <button type="submit" className="py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">Save Changes</button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      <Modal isOpen={isBulkEditModalOpen} onClose={() => setIsBulkEditModalOpen(false)}>
        <div className="p-6">
            <h3 className="text-xl font-bold mb-2 text-primary-700">Change Class</h3>
            <p className="text-sm text-gray-500 mb-4">Enter the new class for {selectedIds.size} selected student{selectedIds.size !== 1 ? 's' : ''}.</p>
            <form onSubmit={handleBulkEditSubmit} className="space-y-4">
                <div>
                    <label htmlFor="bulk-className" className="block text-sm font-medium text-gray-700">New Class</label>
                    <input type="text" id="bulk-className" value={bulkClassName} onChange={(e) => setBulkClassName(e.target.value)} className="mt-1 block w-full px-3 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" placeholder="e.g., 4B" required />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={() => setIsBulkEditModalOpen(false)} className="py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
                    <button type="submit" className="py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">Update All</button>
                </div>
            </form>
        </div>
      </Modal>

    </div>
  );
};

export default StudentManagement;
