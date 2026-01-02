
import React, { useRef, useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Cog6ToothIcon, FolderArrowDownIcon, ArrowUpTrayIcon, ArrowDownTrayIcon, TrashIcon, ArrowLeftOnRectangleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const Settings: React.FC = () => {
  const { getBackupData, restoreFromBackup, students, attendance } = useData();
  const { logout, updateCredentials } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Security State
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authMessage, setAuthMessage] = useState('');

  // Local Export/Import
  const handleLocalExport = () => {
      const data = getBackupData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `hadirku_backup_${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleLocalImport = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const json = JSON.parse(event.target?.result as string);
              if (json && json.students && json.attendance) {
                  if(confirm("This will overwrite your current data with the backup file. Continue?")) {
                      restoreFromBackup(json);
                      alert("Data restored successfully!");
                  }
              } else {
                  alert("Invalid backup file format.");
              }
          } catch (err) {
              alert("Error parsing backup file.");
          }
      };
      reader.readAsText(file);
      if (e.target) e.target.value = '';
  };
  
  const handleResetApp = () => {
      if(confirm("DANGER: This will delete ALL students and attendance records permanently. This cannot be undone. Are you absolutely sure?")) {
           localStorage.removeItem('students');
           localStorage.removeItem('attendance');
           window.location.reload();
      }
  }

  const handleLogout = () => {
      if(confirm("Are you sure you want to log out?")) {
          logout();
      }
  }

  const handleUpdateCredentials = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newUsername.trim() || !newPassword.trim()) {
          setAuthMessage('Username and Password cannot be empty.');
          return;
      }
      if (newPassword !== confirmPassword) {
          setAuthMessage('Passwords do not match.');
          return;
      }

      updateCredentials(newUsername, newPassword);
      setAuthMessage('Credentials updated successfully!');
      setNewUsername('');
      setNewPassword('');
      setConfirmPassword('');
      
      setTimeout(() => setAuthMessage(''), 3000);
  }

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-sm border border-red-100 flex justify-between items-center">
        <div>
            <h2 className="text-xl font-bold text-primary-700 mb-1 flex items-center">
                <Cog6ToothIcon className="w-6 h-6 mr-2" />
                Settings
            </h2>
            <p className="text-sm text-gray-500">Manage data & preferences.</p>
        </div>
        <button 
            onClick={handleLogout}
            className="flex items-center justify-center p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all duration-200 border border-red-100 shadow-sm active:scale-95"
            title="Log Out (Exit System)"
        >
            <ArrowLeftOnRectangleIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Security Settings */}
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-sm border border-red-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <ShieldCheckIcon className="w-6 h-6 mr-2 text-gray-600" />
            Admin Security
        </h3>
        <p className="text-sm text-gray-600 mb-4">Change your login username and password.</p>
        
        <form onSubmit={handleUpdateCredentials} className="space-y-4">
             <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">New Username</label>
                <input 
                    type="text" 
                    value={newUsername}
                    onChange={e => setNewUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-white/50 sm:text-sm"
                    placeholder="Enter new username"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">New Password</label>
                    <input 
                        type="password" 
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-white/50 sm:text-sm"
                        placeholder="Enter new password"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Confirm Password</label>
                    <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-white/50 sm:text-sm"
                        placeholder="Confirm new password"
                    />
                </div>
            </div>
            
            {authMessage && (
                <p className={`text-sm font-medium ${authMessage.includes('success') ? 'text-green-600' : 'text-red-500'}`}>
                    {authMessage}
                </p>
            )}

            <div className="flex justify-end">
                <button 
                    type="submit" 
                    className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-900 transition-colors"
                >
                    Update Credentials
                </button>
            </div>
        </form>
      </div>

      {/* Local Backup Section */}
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-sm border border-red-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <FolderArrowDownIcon className="w-6 h-6 mr-2 text-gray-600" />
            Local Backup (Offline)
        </h3>
        <p className="text-sm text-gray-600 mb-4">Save your data to a file on your device.</p>
        
        <div className="grid grid-cols-2 gap-4">
            <button 
                onClick={handleLocalExport}
                className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors group"
            >
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <ArrowDownTrayIcon className="w-6 h-6" />
                </div>
                <span className="font-semibold text-gray-700">Export JSON</span>
            </button>

            <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors group"
            >
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <ArrowUpTrayIcon className="w-6 h-6" />
                </div>
                <span className="font-semibold text-gray-700">Import JSON</span>
                <input type="file" ref={fileInputRef} onChange={handleLocalImport} accept=".json" className="hidden" />
            </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-red-200">
          <h3 className="text-lg font-bold text-red-800 mb-2">Danger Zone</h3>
          <button 
            onClick={handleResetApp}
            className="w-full flex items-center justify-center bg-white border border-red-200 text-red-600 font-bold py-2 px-4 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
          >
              <TrashIcon className="w-5 h-5 mr-2" /> Reset Application Data
          </button>
      </div>

      <div className="text-center text-xs text-gray-400 mt-4">
          <p>Current Data: {students.length} Students, {attendance.length} Records</p>
      </div>
    </div>
  );
};

export default Settings;
