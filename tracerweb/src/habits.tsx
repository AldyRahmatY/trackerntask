import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { 
  Check, Plus, Trash2, Calendar, Settings, BarChart2, 
  Home, Sparkles, Clock, CalendarDays, ListTodo, Repeat 
} from 'lucide-react';

// --- 1. TIPE DATA ---
type TaskType = 'daily' | 'monthly' | 'onetime';

interface Habit {
  id: string;
  name: string;
  color: string;
}

interface Task {
  id: string;
  name: string;
  type: TaskType;
  completedAt: number | null; // Timestamp
}

type HistoryRecord = Record<string, string[]>;

interface GeminiResponse {
  candidates?:Array<{ content?: { parts?: Array<{ text?: string }> } }>
}

// --- 2. HELPER (Safe Storage) ---
// Mencegah error jika data di localStorage corrupt
const safeParse = (key: string, fallback: any) => {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error reading ${key}`, e);
    return fallback;
  }
};

// --- 3. KOMPONEN UTAMA ---
const App: React.FC = () => {
  // GANTI API KEY DISINI JIKA MAU FITUR AI
  const apiKey = ""; 

  // --- STATE ---
  const [view, setView] = useState<'today' | 'calendar' | 'settings' | 'report'>('today');
  const [settingTab, setSettingTab] = useState<'habit' | 'task'>('habit');

  const [habits, setHabits] = useState<Habit[]>(() => safeParse('myHabits', [
    { id: 'h-1', name: 'Minum Air', color: 'bg-blue-500' }
  ]));

  const [tasks, setTasks] = useState<Task[]>(() => safeParse('myTasks', []));
  const [dailyHistory, setDailyHistory] = useState<HistoryRecord>(() => safeParse('dailyHistory', {}));
  const [monthlyHistory, setMonthlyHistory] = useState<HistoryRecord>(() => safeParse('monthlyHistory', {}));

  // UI State
  const [newItemName, setNewItemName] = useState('');
  const [taskType, setTaskType] = useState<TaskType>('daily');
  const [aiGoal, setAiGoal] = useState('');
  const [suggestedHabits, setSuggestedHabits] = useState<string[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [motivationMsg, setMotivationMsg] = useState('');

  // --- LOGIC EFFECT ---

  // 1. Simpan ke LocalStorage setiap ada perubahan
  useEffect(() => {
    localStorage.setItem('myHabits', JSON.stringify(habits));
    localStorage.setItem('myTasks', JSON.stringify(tasks));
    localStorage.setItem('dailyHistory', JSON.stringify(dailyHistory));
    localStorage.setItem('monthlyHistory', JSON.stringify(monthlyHistory));
  }, [habits, tasks, dailyHistory, monthlyHistory]);

  // 2. Logic Hapus Otomatis Tugas 1x (12 Jam)
  useEffect(() => {
    const checkTasks = () => {
      const now = Date.now();
      const twelveHours = 12 * 60 * 60 * 1000;
      
      setTasks(currentTasks => {
        const active = currentTasks.filter(t => {
          if (t.type === 'onetime' && t.completedAt) {
            // Hapus jika sudah selesai lebih dari 12 jam yang lalu
            return (now - t.completedAt) < twelveHours;
          }
          return true;
        });
        
        // Hanya update jika ada perubahan (mencegah render loop)
        if (active.length !== currentTasks.length) return active;
        return currentTasks;
      });
    };

    checkTasks(); // Jalankan saat aplikasi dibuka
    const interval = setInterval(checkTasks, 60000); // Cek tiap 1 menit
    return () => clearInterval(interval);
  }, []);

  // --- CORE FUNCTIONS ---

  const getTodayDate = () => new Date().toISOString().split('T')[0];
  const getCurrentMonthKey = () => new Date().toISOString().slice(0, 7);

  const addItem = () => {
    if (!newItemName.trim()) return;
    
    if (settingTab === 'habit') {
      const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
      setHabits([...habits, {
        id: `h-${Date.now()}`,
        name: newItemName,
        color: colors[Math.floor(Math.random() * colors.length)]
      }]);
    } else {
      setTasks([...tasks, {
        id: `t-${Date.now()}`,
        name: newItemName,
        type: taskType,
        completedAt: null
      }]);
    }
    setNewItemName('');
  };

  const deleteItem = (id: string, isHabit: boolean) => {
    if (confirm('Hapus item ini?')) {
      if (isHabit) setHabits(habits.filter(h => h.id !== id));
      else setTasks(tasks.filter(t => t.id !== id));
    }
  };

  const toggleStatus = (id: string, type: 'daily' | 'monthly') => {
    const key = type === 'daily' ? getTodayDate() : getCurrentMonthKey();
    const setter = type === 'daily' ? setDailyHistory : setMonthlyHistory;
    
    setter(prev => {
      const list = prev[key] || [];
      const updated = list.includes(id) ? list.filter(i => i !== id) : [...list, id];
      return { ...prev, [key]: updated };
    });
  };

  const toggleOneTime = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completedAt: t.completedAt ? null : Date.now() } : t));
  };

  // --- AI LOGIC (Optional) ---
  const callAI = async (prompt: string, type: 'habit' | 'motivation') => {
    if (!apiKey) { alert("API Key belum diisi di kode!"); return; }
    setIsLoadingAI(true);
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data: GeminiResponse = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
      if (type === 'habit') {
        try { setSuggestedHabits(JSON.parse(text)); } catch { alert("Gagal parsing AI"); }
      } else {
        setMotivationMsg(text);
      }
    } catch (e) { alert("Gagal koneksi AI"); }
    setIsLoadingAI(false);
  };

  // --- VIEWS ---

  const TodayView = () => {
    const today = getTodayDate();
    const month = getCurrentMonthKey();
    const doneHabits = dailyHistory[today] || [];
    const doneTasks = dailyHistory[today] || []; // Menggunakan state yang sama utk daily tasks
    const doneMonthly = monthlyHistory[month] || [];

    const habitProgress = habits.length ? Math.round((doneHabits.filter(id => id.startsWith('h-')).length / habits.length) * 100) : 0;

    return (
      <div className="space-y-6 animate-fade-in pb-20">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Hari Ini</h2>
            <p className="text-gray-500 text-xs">{new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
          </div>
          <div className="text-right">
             <span className="text-3xl font-black text-indigo-600">{habitProgress}%</span>
          </div>
        </div>

        {/* Motivasi AI Box */}
        <div className="bg-indigo-600 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-sm flex items-center gap-2"><Sparkles size={14}/> Motivasi</h3>
            <button 
              onClick={() => callAI(`User progress: ${habitProgress}%. Beri 1 kalimat motivasi singkat gaul Indonesia.`, 'motivation')}
              className="bg-white/20 px-2 py-1 rounded text-[10px] font-bold hover:bg-white/30"
              disabled={isLoadingAI}
            >
              {isLoadingAI ? '...' : 'Refresh'}
            </button>
          </div>
          <p className="mt-2 text-sm italic opacity-90">"{motivationMsg || 'Mulai hari dengan semangat!'}"</p>
        </div>

        {/* List Kebiasaan */}
        <div>
          <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><Repeat size={16}/> Kebiasaan</h3>
          <div className="space-y-2">
            {habits.map(h => {
              const isDone = doneHabits.includes(h.id);
              return (
                <div key={h.id} onClick={() => toggleStatus(h.id, 'daily')}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${isDone ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-8 rounded-full ${h.color}`}></div>
                    <span className={`text-sm font-medium ${isDone ? 'line-through text-gray-400' : 'text-gray-700'}`}>{h.name}</span>
                  </div>
                  {isDone && <Check size={16} className="text-green-600"/>}
                </div>
              )
            })}
            {habits.length === 0 && <p className="text-xs text-gray-400 text-center py-2">Belum ada kebiasaan.</p>}
          </div>
        </div>

        {/* List Tugas */}
        <div>
          <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2 mt-6"><ListTodo size={16}/> Daftar Tugas</h3>
          <div className="space-y-2">
            {tasks.map(t => {
              // Tentukan status Done berdasarkan tipe
              let isDone = false;
              let toggleFn = () => {};
              let icon = <Clock size={14}/>;
              let badge = "Harian";

              if (t.type === 'daily') {
                isDone = doneTasks.includes(t.id);
                toggleFn = () => toggleStatus(t.id, 'daily');
              } else if (t.type === 'monthly') {
                isDone = doneMonthly.includes(t.id);
                toggleFn = () => toggleStatus(t.id, 'monthly');
                icon = <CalendarDays size={14}/>;
                badge = "Bulanan";
              } else {
                isDone = !!t.completedAt;
                toggleFn = () => toggleOneTime(t.id);
                icon = <Check size={14}/>;
                badge = "Sekali";
              }

              return (
                <div key={t.id} onClick={toggleFn}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${isDone ? 'opacity-50 bg-gray-50' : 'bg-white hover:shadow-sm'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isDone ? 'bg-gray-200' : 'bg-indigo-50 text-indigo-600'}`}>{icon}</div>
                    <div>
                      <p className={`text-sm font-medium ${isDone ? 'line-through text-gray-400' : 'text-gray-800'}`}>{t.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{badge} {t.type === 'onetime' && isDone ? '(Auto hapus 12j)' : ''}</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isDone ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300'}`}>
                    {isDone && <Check size={12} className="text-white"/>}
                  </div>
                </div>
              )
            })}
            {tasks.length === 0 && <p className="text-xs text-gray-400 text-center py-2">Tidak ada tugas.</p>}
          </div>
        </div>
      </div>
    );
  };

  const SettingsView = () => (
    <div className="animate-fade-in pb-20">
      <h2 className="text-xl font-bold mb-4">Pengaturan</h2>
      
      {/* Switch Tab */}
      <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
        <button onClick={() => setSettingTab('habit')} className={`flex-1 py-2 text-xs font-bold rounded ${settingTab === 'habit' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}>Kebiasaan</button>
        <button onClick={() => setSettingTab('task')} className={`flex-1 py-2 text-xs font-bold rounded ${settingTab === 'task' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}>Tugas</button>
      </div>

      {/* Input Form */}
      <div className="bg-white p-4 rounded-xl border shadow-sm mb-4">
        <input 
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder={settingTab === 'habit' ? "Nama Kebiasaan..." : "Nama Tugas..."}
          className="w-full p-3 bg-gray-50 rounded-lg text-sm border focus:outline-indigo-500 mb-3"
        />
        
        {settingTab === 'task' && (
          <div className="flex gap-2 mb-3 overflow-x-auto">
            {['daily', 'monthly', 'onetime'].map(type => (
              <button key={type} onClick={() => setTaskType(type as TaskType)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize border ${taskType === type ? 'bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white'}`}
              >
                {type === 'onetime' ? 'Sekali' : type === 'daily' ? 'Harian' : 'Bulanan'}
              </button>
            ))}
          </div>
        )}

        <button onClick={addItem} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold text-sm flex justify-center gap-2 hover:bg-indigo-700">
          <Plus size={18}/> Tambah
        </button>
      </div>

      {/* List Manager */}
      <div className="space-y-2">
        {(settingTab === 'habit' ? habits : tasks).map((item: any) => (
          <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-lg border">
            <span className="text-sm font-medium truncate w-3/4">{item.name} <span className="text-[10px] text-gray-400">{item.type}</span></span>
            <button onClick={() => deleteItem(item.id, settingTab === 'habit')} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
          </div>
        ))}
      </div>

      {/* AI Generator (Habit only) */}
      {settingTab === 'habit' && (
        <div className="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
          <h4 className="text-xs font-bold text-blue-800 mb-2 flex gap-1"><Sparkles size={14}/> Generate AI</h4>
          <div className="flex gap-2 mb-2">
            <input value={aiGoal} onChange={e => setAiGoal(e.target.value)} placeholder="Misal: Ingin kurus" className="flex-1 text-xs p-2 rounded border"/>
            <button onClick={() => callAI(`Saya ingin "${aiGoal}". Berikan 3 kebiasaan harian pendek (max 4 kata) JSON array string ["A", "B"].`, 'habit')} disabled={isLoadingAI} className="bg-blue-600 text-white px-3 rounded text-xs font-bold">Ask</button>
          </div>
          <div className="space-y-1">
            {suggestedHabits.map((h, i) => (
              <div key={i} onClick={() => { setNewItemName(h); addItem(); }} className="text-xs bg-white p-2 rounded border cursor-pointer hover:bg-gray-100">+ {h}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // --- RENDER LAYOUT UTAMA ---
  return (
    // CONTAINER UTAMA (BACKGROUND ABU-ABU UNTUK PC)
    <div className="min-h-screen bg-gray-200 flex items-center justify-center md:p-6 font-sans">
      
      {/* FRAME APLIKASI (MOBILE SIMULATOR) */}
      <div className="w-full h-screen md:h-[85vh] md:max-w-[400px] bg-white md:rounded-[2.5rem] shadow-2xl overflow-hidden relative flex flex-col">
        
        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {view === 'today' && <TodayView />}
          {view === 'calendar' && <div className="text-center pt-20 text-gray-400">Kalender Coming Soon</div>}
          {view === 'report' && <div className="text-center pt-20 text-gray-400">Rapor Coming Soon</div>}
          {view === 'settings' && <SettingsView />}
        </div>

        {/* BOTTOM NAVIGATION (STICKY DALAM FRAME) */}
        <div className="h-[80px] bg-white border-t flex justify-around items-center px-2 z-10 shrink-0">
          <NavBtn icon={<Home size={22}/>} label="Home" active={view === 'today'} onClick={() => setView('today')} />
          <NavBtn icon={<Calendar size={22}/>} label="Jadwal" active={view === 'calendar'} onClick={() => setView('calendar')} />
          <NavBtn icon={<BarChart2 size={22}/>} label="Rapor" active={view === 'report'} onClick={() => setView('report')} />
          <NavBtn icon={<Settings size={22}/>} label="Atur" active={view === 'settings'} onClick={() => setView('settings')} />
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

// Component Kecil
const NavBtn = ({ icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${active ? 'text-indigo-600' : 'text-gray-300'}`}>
    <div className={`p-1.5 rounded-2xl transition-all ${active ? 'bg-indigo-50 -translate-y-1' : ''}`}>{icon}</div>
    <span className="text-[10px] font-bold mt-1">{label}</span>
  </button>
);

    <div className="flex min-h-svh flex-col items-center justify-center">
      <Button>Click me</Button>
    </div>

export default App;