import { useRef } from "react";
import { useTracker } from "@/context/TrackerContext";
import { Button } from "@/components/ui/button";
import { Download, Upload, AlertTriangle, Settings } from "lucide-react";
import { Moon } from "lucide-react";

export default function SettingsPage() {
  const { resetHour, setResetHour } = useTracker();

  const fileInputRef = useRef<HTMLInputElement>(null);
  // --- FUNGSI EXPORT (BACKUP) ---
  const handleExport = () => {
    const data = {
      habits: JSON.parse(localStorage.getItem('myHabits') || '[]'),
      tasks: JSON.parse(localStorage.getItem('myTasks') || '[]'),
      dailyHistory: JSON.parse(localStorage.getItem('dailyHistory') || '{}'),
      weeklyHistory: JSON.parse(localStorage.getItem('weeklyHistory') || '{}'),
      resetHour: localStorage.getItem('resetHour') || '0',
      timestamp: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  // --- FUNGSI IMPORT (RESTORE) ---
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result;
        if (typeof content === 'string') {
          const data = JSON.parse(content);
          
          // Validasi sederhana: Cek apakah ada data habits/tasks
          if (!data.habits || !data.dailyHistory) {
            alert("File tidak valid! Pastikan ini adalah file backup dari aplikasi Tracker.");
            return;
          }

          if (confirm("PERINGATAN: Import akan menimpa/menghapus data saat ini. Lanjutkan?")) {
            // Timpa LocalStorage
            localStorage.setItem('myHabits', JSON.stringify(data.habits));
            localStorage.setItem('myTasks', JSON.stringify(data.tasks));
            localStorage.setItem('dailyHistory', JSON.stringify(data.dailyHistory));
            localStorage.setItem('weeklyHistory', JSON.stringify(data.weeklyHistory));
            localStorage.setItem('resetHour', data.resetHour || '0');
            
            alert("Data berhasil dipulihkan! Halaman akan dimuat ulang.");
            window.location.reload(); // Reload agar Context membaca data baru
          }
        }
      } catch (error) {
        alert("Gagal membaca file. Pastikan format JSON benar.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-400 mx-auto p-4 md:p-6 lg:p-8 max-w-3xl">
      <h1 className="text-2xl font-bold">
        <Settings size={24} className="inline-block mr-2 text-muted-foreground text-emerald-500"/>
        Pengaturan</h1>
  {/* --- MENU BARU: ATUR JAM RESET --- */}
        <div className="bg-card p-4 rounded-xl border shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-full text-indigo-600">
              <Moon size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Waktu Ganti Hari</h3>
              <p className="text-xs text-muted-foreground">Tugas akan reset pada jam ini.</p>
            </div>
          </div>
          
          <select 
            value={resetHour}
            onChange={(e) => setResetHour(Number(e.target.value))}
            className="bg-background border rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary outline-none"
          >
            {Array.from({ length: 24 }).map((_, i) => (
              <option key={i} value={i}>
                {String(i).padStart(2, '0')}:00
              </option>
            ))}
          </select>
        </div>

        {/* --- MENU DATA (BACKUP & RESTORE) --- */}
      <div className="bg-card p-5 rounded-xl border shadow-sm space-y-4">
        <h3 className="font-semibold text-sm flex items-center gap-2">
           💾 Manajemen Data
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={handleExport} variant="outline" className="w-full gap-2 border-dashed border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50">
            <Download size={16} /> Backup Data
          </Button>
          
          <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full gap-2 border-dashed border-gray-300 hover:bg-gray-50">
            <Upload size={16} /> Import Data
          </Button>
          {/* Input file tersembunyi */}
          <input 
            type="file" 
            accept=".json" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleImport}
          />
        </div>
        <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 bg-yellow-50 p-2 rounded text-yellow-700 border border-yellow-100">
           <AlertTriangle size={12}/> 
           Penting: Lakukan Backup rutin. Jika cache browser dihapus, data akan hilang.
        </p>
      </div>
    </div>
  );
}