// src/context/TrackerContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// --- TYPES ---
export type TaskType = 'Harian' | 'Mingguan' | 'Bulanan' | 'Sekali Waktu';

export interface Habit {
  id: string;
  name: string;
  color: string;
  timeGateStart?: string;
  timeGateEnd?: string;
  level: number;
  currentXp: number;
  maxXp: number;
  lastClaimedDate?: string; 
  missedDaysStreak: number;  
  isArchived?: boolean;
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

  completeHabit: (habitId: string) => void;
  applyMissedHabitPenalties: () => void;
  archiveHabit: (habitId: string) => void;

  addSavingGoal: (title: string, targetAmount: number, deadlineDate: string, frequencyType: SavingFrequency, frequencyCount: number, savingMode?: 'date' | 'amount', plannedAmount?: number) => void;
  addSavingTransaction: (goalId: string, amount: number, note: string) => void;
  deleteSavingGoal: (id: string) => void;
  editSavingGoal: (id: string, updatedGoal: Partial<SavingGoal>) => void;
  
  setResetHour: (hour: number) => void;
  addHabit: (name: string, timeGateStart?: string, timeGateEnd?: string) => void;
  addTask: (name: string, type: TaskType, priority?: 'low' | 'medium' | 'high') => void;  
  deleteItem: (id: string, type: 'habit' | 'task') => void;
  editHabit: (id: string, newName: string, timeGateStart?: string, timeGateEnd?: string) => void;
  editTask: (id: string, updatedTask: Partial<Task>) => void;

  toggleDailyItem: (id: string) => void;
  toggleWeeklyItem: (id: string) => void;
  toggleMonthlyItem: (id: string) => void;
  toggleOneTimeTask: (id: string) => void;

  getTodayDate: () => string;
  getCurrentWeekKey: () => string;
  getCurrentMonthKey: () => string;
  getHabitStreak: (id: string) => number;
  getHabitRank: (level: number) => { title: string; color: string };
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


// Ubah menjadi seperti ini:
  const [habits, setHabits] = useState<Habit[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dailyHistory, setDailyHistory] = useState<Record<string, string[]>>({});
  const [weeklyHistory, setWeeklyHistory] = useState<Record<string, string[]>>({});
  const [monthlyHistory, setMonthlyHistory] = useState<Record<string, string[]>>({});
  const [savings, setSavings] = useState<SavingGoal[]>([]);

  // Tambahkan state penanda ini:
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // 3. LOAD DATA DARI LOCALSTORAGE SAAT COMPONENT MOUNT
  useEffect(() => {
    const loadData = () => {
      const localHabits = localStorage.getItem('myHabits');
      const localTasks = localStorage.getItem('myTasks');
      const localDaily = localStorage.getItem('dailyHistory');
      const localWeekly = localStorage.getItem('weeklyHistory');
      const localMonthly = localStorage.getItem('monthlyHistory');
      const localSavings = localStorage.getItem('mySavings');

      if (localHabits) setHabits(JSON.parse(localHabits));
      if (localTasks) setTasks(JSON.parse(localTasks));
      if (localDaily) setDailyHistory(JSON.parse(localDaily));
      if (localWeekly) setWeeklyHistory(JSON.parse(localWeekly));
      if (localMonthly) setMonthlyHistory(JSON.parse(localMonthly));
      if (localSavings) setSavings(JSON.parse(localSavings));

      setIsDataLoaded(true); // Beri tanda bahwa semua data sudah selesai masuk
    };

    // Jeda 50 milidetik agar layar tidak blank / nge-lag di HP
    setTimeout(loadData, 50);
  }, []);

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
    if (isDataLoaded) {
      localStorage.setItem('myHabits', JSON.stringify(habits));
      localStorage.setItem('myTasks', JSON.stringify(tasks));
      localStorage.setItem('dailyHistory', JSON.stringify(dailyHistory));
      localStorage.setItem('weeklyHistory', JSON.stringify(weeklyHistory));
      localStorage.setItem('monthlyHistory', JSON.stringify(monthlyHistory));
    }
  }, [habits, tasks, dailyHistory, weeklyHistory, monthlyHistory, isDataLoaded]);

  useEffect(() => {
    if (isDataLoaded) {
      localStorage.setItem('mySavings', JSON.stringify(savings));
    }
  }, [savings, isDataLoaded]);

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

  const addHabit = (name: string, timeGateStart?: string, timeGateEnd?: string) => {
  const activeHabitsCount = habits.filter(h => !h.isArchived).length;
    if (activeHabitsCount > 10) {
      alert("Batas maksimal 10 kebiasaan aktif telah tercapai. Arsipkan kebiasaan lama untuk menambah baru!");
      return;
    }

    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'];
    setHabits((prev) => [
      ...prev,
      {
        id: `h-${Date.now()}`,
        name,
        color: colors[Math.floor(Math.random() * colors.length)],
        timeGateStart,
        timeGateEnd,
        level: 1,
        currentXp: 0,
        maxXp: 100, // Starting Target EXP Level 1 -> 2
        missedDaysStreak: 0,
        isArchived: false,
      },
    ]);
  };

  const editHabit = (id: string, newName: string, timeGateStart?: string, timeGateEnd?: string) => {
    setHabits(prevHabits => 
      prevHabits.map(h => 
        h.id === id ? { ...h, name: newName, timeGateStart, timeGateEnd } : h
      )
    );
  };

  const completeHabit = (habitId: string) => {
    const todayStr = getTodayDate(); // Format YYYY-MM-DD

    setHabits((prevHabits) =>
      prevHabits.map((habit) => {
        if (habit.id !== habitId) return habit;

        // 1. Guard Anti-Cheat: Mencegah penambahan EXP jika sudah diklaim hari ini
        if (habit.lastClaimedDate === todayStr) {
          return habit;
        }

        // 2. Ambil nilai saat ini
        let newXp = (habit.currentXp ?? 0) + 10; // Tambah +10 EXP
        let newLevel = habit.level ?? 1;
        let newMaxXp = habit.maxXp ?? 100;

        // 3. Perulangan WHILE untuk menangani Level Up berantai & Multiplier 1.5x
        while (newXp >= newMaxXp) {
          newXp = newXp - newMaxXp;          // Kurangi EXP dengan target level saat ini
          newLevel += 1;                       // Naikkan level +1
          newMaxXp = Math.round(newMaxXp * 1.5); // Target level baru naik 1.5x
        }

        // 4. Simpan status terbaru beserta tanggal klaim hari ini
        return {
          ...habit,
          level: newLevel,
          currentXp: newXp,
          maxXp: newMaxXp,
          lastClaimedDate: todayStr,
        };
      })
    );
  };

  const applyMissedHabitPenalties = () => {
    setHabits((prevHabits) =>
      prevHabits.map((habit) => {
        if (habit.isArchived) return habit;

        // Hitung streak hari yang terlewat (misal dihitung dari sistem reset harian)
        const newStreak = habit.missedDaysStreak + 1;
        const penaltyAmount = newStreak * 10; // Rumus: Total Hari Absen Beruntun x 10 EXP

        // Safety Net: Minimal 0 EXP pada level berjalan (Lantai Checkpoint, Tidak Turun Level)
        const newXp = Math.max(0, habit.currentXp - penaltyAmount);

        return {
          ...habit,
          currentXp: newXp,
          missedDaysStreak: newStreak,
        };
      })
    );
  };

  const archiveHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, isArchived: true } : h))
    );
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

  // 1. Cek apakah ID ini milik Kebiasaan (Habit)
  const isHabit = habits.some(h => h.id === id);

  if (isHabit) {
    // Jika Kebiasaan, panggil logika EXP & Leveling
    completeHabit(id);
  }

  // 2. Tetap update histori harian (untuk centang UI)
  setDailyHistory(prev => {
    const current = prev[dateStr] || [];
    const updated = current.includes(id) 
      ? current.filter(i => i !== id) 
      : [...current, id];
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
      getHabitRank,
      resetHour, setResetHour, savings, addSavingGoal, addSavingTransaction, deleteSavingGoal, editSavingGoal, completeHabit, applyMissedHabitPenalties, archiveHabit
    }}>
      {children}
    </TrackerContext.Provider>
  );
};


export const isWithinTimeGate = (startTime?: string, endTime?: string): { isAllowed: boolean; message: string } => {
  // Jika tidak ada pembatasan waktu, quest bebas diklaim kapan saja
  if (!startTime || !endTime) {
    return { isAllowed: true, message: "Bebas klaim" };
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);

  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (currentMinutes < startMinutes) {
    return { isAllowed: false, message: `Belum dibuka (Buka jam ${startTime})` };
  }

  if (currentMinutes > endMinutes) {
    return { isAllowed: false, message: `Sudah kedaluwarsa (Tutup jam ${endTime})` };
  }

  return { isAllowed: true, message: `Aktif sampai ${endTime}` };
};

export const useTracker = () => {
  const context = useContext(TrackerContext);
  if (!context) throw new Error("useTracker must be used within a TrackerProvider");
  return context;
};

export const getHabitRank = (level: number = 1): { title: string; color: string } => {
  if (level >= 30) return { title: 'Mythic', color: 'text-purple-500 bg-purple-500/10 border-purple-500/30' };
  if (level >= 20) return { title: 'Legend', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' };
  if (level >= 15) return { title: 'Master', color: 'text-rose-500 bg-rose-500/10 border-rose-500/30' };
  if (level >= 10) return { title: 'Diamond', color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/30' };
  if (level >= 7)  return { title: 'Gold', color: 'text-yellow-600 bg-yellow-500/10 border-yellow-500/30' };
  if (level >= 4)  return { title: 'Silver', color: 'text-slate-400 bg-slate-500/10 border-slate-500/30' };
  if (level >= 2)  return { title: 'Bronze', color: 'text-amber-700 bg-amber-700/10 border-amber-700/30' };
  
  return { title: 'Novice', color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30' };
};