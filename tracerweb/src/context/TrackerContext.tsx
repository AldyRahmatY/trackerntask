// src/context/TrackerContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// --- TYPES ---
export type TaskType = 'Harian' | 'Mingguan' | 'Bulanan' | 'Sekali Waktu';

export interface Habit {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  name: string;
  type: TaskType;
  priority?: 'low' | 'medium' | 'high';
  completedAt: number | null; // Timestamp
}

export interface SavingHistory {
  id: string;
  date: string;
  amount: number; // Bisa positif (nabung) atau negatif (tarik uang)
  note: string;
}

export type SavingFrequency = 'Harian' | 'Mingguan' | 'Bebas';

export interface SavingGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadlineDate: string; // Format: YYYY-MM-DD
  frequencyType: SavingFrequency;
  frequencyCount: number; // Contoh: 3 (untuk 3x seminggu)
  history: SavingHistory[];
  savingMode?: 'date' | 'amount'; // Untuk tahu dia pakai mode tanggal atau nominal
  plannedAmount?: number;         // Untuk menyimpan angka 5.000/hari nya
}

interface TrackerContextType {
  habits: Habit[];
  tasks: Task[];
  dailyHistory: Record<string, string[]>; // 'YYYY-MM-DD': [habitId1, taskId2]
  weeklyHistory: Record<string, string[]>;
  monthlyHistory: Record<string, string[]>; // 'YYYY-MM': [taskId3]
  resetHour: number;
  savings: SavingGoal[];

  addSavingGoal: (title: string, targetAmount: number, deadlineDate: string, frequencyType: SavingFrequency, frequencyCount: number, savingMode?: 'date' | 'amount', plannedAmount?: number) => void;
  addSavingTransaction: (goalId: string, amount: number, note: string) => void;
  deleteSavingGoal: (id: string) => void;
  editSavingGoal: (id: string, updatedGoal: Partial<SavingGoal>) => void;
  
  setResetHour: (hour: number) => void;
  addHabit: (name: string) => void;
  addTask: (name: string, type: TaskType, priority?: 'low' | 'medium' | 'high') => void;  
  deleteItem: (id: string, type: 'habit' | 'task') => void;
  editHabit: (id: string, newName: string) => void;
  editTask: (id: string, updatedTask: Partial<Task>) => void;

  toggleDailyItem: (id: string) => void;
  toggleWeeklyItem: (id: string) => void;
  toggleMonthlyItem: (id: string) => void;
  toggleOneTimeTask: (id: string) => void;

  getTodayDate: () => string;
  getCurrentWeekKey: () => string;
  getCurrentMonthKey: () => string;
  getHabitStreak: (id: string) => number;
}

const TrackerContext = createContext<TrackerContextType | undefined>(undefined);

export const TrackerProvider = ({ children }: { children: ReactNode }) => {
  
  // RESET HOUR LOGIC
// 1. Tambah State untuk Reset Hour (Default 0 = Tengah Malam)
  const [resetHour, setResetHour] = useState<number>(() => 
    parseInt(localStorage.getItem('resetHour') || '0')
  );

  // 2. Simpan ke LocalStorage saat berubah
  useEffect(() => {
    localStorage.setItem('resetHour', resetHour.toString());
  }, [resetHour]);

  // 3. FUNGSI INTI: Tanggal yang sudah disesuaikan dengan Reset Hour
  // Kita buat fungsi helper baru agar bisa dipakai di Daily & Weekly
  const getAdjustedDate = () => {
    const now = new Date();
    // Geser waktu mundur sebanyak resetHour
    now.setHours(now.getHours() - resetHour);
    return now;
  };


  // LOGIC HABITS & TASKS
  const [habits, setHabits] = useState<Habit[]>(() => 
    JSON.parse(localStorage.getItem('myHabits') || '[]'));
  
  const [tasks, setTasks] = useState<Task[]>(() => 
    JSON.parse(localStorage.getItem('myTasks') || '[]'));

  const [dailyHistory, setDailyHistory] = useState<Record<string, string[]>>(() => 
    JSON.parse(localStorage.getItem('dailyHistory') || '{}'));

  const [weeklyHistory, setWeeklyHistory] = useState<Record<string, string[]>>(() => 
    JSON.parse(localStorage.getItem('weeklyHistory') || '{}'));

  const [monthlyHistory, setMonthlyHistory] = useState<Record<string, string[]>>(() => 
    JSON.parse(localStorage.getItem('monthlyHistory') || '{}'));

  const getPreviousDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  // sTREAK LOGIC: Hitung streak berdasarkan dailyHistory
  const getHabitStreak = (habitId: string) => {
    let streak = 0;
    let daysAgo = 0;

    const today = getPreviousDate(0);
    const isDoneToday = (dailyHistory[today] || []).includes(habitId);

    if (isDoneToday) {
      streak++;
    }
    daysAgo = 1;
    while (true) {
      const dateStr = getPreviousDate(daysAgo);
      const isDone = (dailyHistory[dateStr] || []).includes(habitId);
      if (isDone) {
        streak++;
        daysAgo++;
      } else {
        break;
      }
    }
    return streak;
  };

  // --- EFFECTS (Storage & Cleanup) ---
  useEffect(() => {
    localStorage.setItem('myHabits', JSON.stringify(habits));
    localStorage.setItem('myTasks', JSON.stringify(tasks));
    localStorage.setItem('dailyHistory', JSON.stringify(dailyHistory));
    localStorage.setItem('weeklyHistory', JSON.stringify(weeklyHistory));
    localStorage.setItem('monthlyHistory', JSON.stringify(monthlyHistory));
  }, [habits, tasks, dailyHistory, weeklyHistory, monthlyHistory]);

  // Cleanup Tugas 1x (> 12 jam)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const fiveHours = 5 * 60 * 60 * 1000;
      setTasks(prev => prev.filter(t => {
        if (t.type === 'Sekali Waktu' && t.completedAt) {
          return (now - t.completedAt) < fiveHours;
        }
        return true;
      }));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // --- ACTIONS ---
  // const getTodayDate = () => new Date().toISOString().split('T')[0];
  const getTodayDate = () => {
    // Gunakan waktu yang sudah digeser
    const adjusted = getAdjustedDate();
    
    // Format ke YYYY-MM-DD dengan Timezone Jakarta (atau biarkan default local)
    return adjusted.toLocaleDateString('en-CA', {
      timeZone: 'Asia/Jakarta' 
    });
  };

  const getCurrentWeekKey = () => {
    const d = getAdjustedDate(); // Pakai waktu yang sudah digeser juga!
    
    // Paksa ke zona waktu Jakarta untuk perhitungan minggu
    const jakartaTime = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    jakartaTime.setHours(0, 0, 0, 0);
    jakartaTime.setDate(jakartaTime.getDate() + 3 - (jakartaTime.getDay() + 6) % 7);
    const week1 = new Date(jakartaTime.getFullYear(), 0, 4);
    const weekNo = 1 + Math.round(((jakartaTime.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    
    return `${jakartaTime.getFullYear()}-W${weekNo}`;
  };

  const getCurrentMonthKey = () => new Date().toISOString().slice(0, 7);

  const addHabit = (name: string) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'];
    setHabits([...habits, { id: `h-${Date.now()}`, name, color: colors[Math.floor(Math.random() * colors.length)] }]);
  };

  const addTask = (name: string, type: TaskType, priority: 'low' | 'medium' | 'high' = 'medium') => {
      const newTask: Task = {
        id: `t-${Date.now()}`,
        name,
        type,
        priority, // ✨ Simpan prioritas
        completedAt: null, // Default value for completedAt
      };
      setTasks([...tasks, newTask]);
    };

  const editHabit = (id: string, newName: string) => {
    setHabits(prevHabits => 
      prevHabits.map(h => 
        h.id === id ? { ...h, name: newName } : h
      )
    );
  };

  // --- FUNGSI EDIT TUGAS ---
  const editTask = (id: string, updatedTask: Partial<Task>) => {
    setTasks(prevTasks => 
      prevTasks.map(t => 
        t.id === id ? { ...t, ...updatedTask } : t
      )
    );
  };

  const deleteItem = (id: string, type: 'habit' | 'task') => {
      if (confirm('Hapus item ini?')) {
        if (type === 'habit') {
          setHabits(habits.filter(h => h.id !== id));
          setDailyHistory(prev => {
            const newHistory = { ...prev };
            Object.keys(newHistory).forEach(date => {
              newHistory[date] = newHistory[date].filter(itemId => itemId !== id);
            });
            return newHistory;
          });
        } else {
          setTasks(tasks.filter(t => t.id !== id));
        }
      }
    };

  const toggleDailyItem = (id: string) => {
    const dateStr = getTodayDate();
    setDailyHistory(prev => {
      const current = prev[dateStr] || [];
      const updated = current.includes(id) ? current.filter(i => i !== id) : [...current, id];
      return { ...prev, [dateStr]: updated };
    });
  };

  const toggleWeeklyItem = (id: string) => {
    const weekKey = getCurrentWeekKey();
    setWeeklyHistory(prev => {
      const current = prev[weekKey] || [];
      const updated = current.includes(id) ? current.filter(i => i !== id) : [...current, id];
      return { ...prev, [weekKey]: updated };
    });
  };

  const toggleMonthlyItem = (id: string) => {
    const monthKey = getCurrentMonthKey();
    setMonthlyHistory(prev => {
      const current = prev[monthKey] || [];
      const updated = current.includes(id) ? current.filter(i => i !== id) : [...current, id];
      return { ...prev, [monthKey]: updated };
    });
  };

  const toggleOneTimeTask = (id: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, completedAt: t.completedAt ? null : Date.now() } : t
    ));
  };

  // --- LOGIC TABUNGAN ---
  const [savings, setSavings] = useState<SavingGoal[]>(() => {
    if (typeof window !== 'undefined') {
      const localData = localStorage.getItem('mySavings');
      return localData ? JSON.parse(localData) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('mySavings', JSON.stringify(savings));
  }, [savings]);

  // --- FUNGSI TABUNGAN ---
  // 1. Tambah Target Tabungan Baru
  const addSavingGoal = (
    title: string, 
    targetAmount: number, 
    deadlineDate: string, 
    frequencyType: SavingFrequency, 
    frequencyCount: number,
    savingMode: 'date' | 'amount' = 'date', 
    plannedAmount: number = 0       
  ) => {
    const newGoal: SavingGoal = {
      id: `save-${Date.now()}`,
      title,
      targetAmount,
      currentAmount: 0,
      deadlineDate,
      frequencyType,
      frequencyCount,
      savingMode,      
      plannedAmount,   
      history: []
    };
    setSavings([...savings, newGoal]);
  };

  // 2. Catat Transaksi (Tambah/Kurang Saldo)
  const addSavingTransaction = (goalId: string, amount: number, note: string) => {
    setSavings(prevSavings => 
      prevSavings.map(goal => {
        if (goal.id === goalId) {
          const newTransaction: SavingHistory = {
            id: `trx-${Date.now()}`,
            date: new Date().toISOString(),
            amount: amount,
            note: note
          };
          return {
            ...goal,
            currentAmount: goal.currentAmount + amount, // Otomatis update total saldo
            history: [newTransaction, ...goal.history] // Taruh riwayat terbaru di paling atas
          };
        }
        return goal;
      })
    );
  };

  // 3. Hapus Target Tabungan
  const deleteSavingGoal = (id: string) => {
    setSavings(savings.filter(goal => goal.id !== id));
  };

  const editSavingGoal = (id: string, updatedGoal: Partial<SavingGoal>) => {
    setSavings(prevSavings => 
      prevSavings.map(goal => 
        goal.id === id ? { ...goal, ...updatedGoal } : goal
      )
    );
  };

  return (
    <TrackerContext.Provider value={{ 
      habits, tasks, dailyHistory, weeklyHistory, monthlyHistory, 
      addHabit, addTask, deleteItem, editHabit, editTask,
      toggleDailyItem, toggleWeeklyItem, toggleMonthlyItem, toggleOneTimeTask,
      getTodayDate, getCurrentWeekKey, getCurrentMonthKey, getHabitStreak,
      resetHour, setResetHour, savings, addSavingGoal, addSavingTransaction, deleteSavingGoal, editSavingGoal
    }}>
      {children}
    </TrackerContext.Provider>
  );
};

export const useTracker = () => {
  const context = useContext(TrackerContext);
  if (!context) throw new Error("useTracker must be used within a TrackerProvider");
  return context;
};