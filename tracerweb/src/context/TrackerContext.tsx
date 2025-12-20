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
  completedAt: number | null; // Timestamp
}

interface TrackerContextType {
  habits: Habit[];
  tasks: Task[];
  dailyHistory: Record<string, string[]>; // 'YYYY-MM-DD': [habitId1, taskId2]
  weeklyHistory: Record<string, string[]>;
  monthlyHistory: Record<string, string[]>; // 'YYYY-MM': [taskId3]
  addHabit: (name: string) => void;
  addTask: (name: string, type: TaskType) => void;
  deleteItem: (id: string, type: 'habit' | 'task') => void;

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
  // --- STATE ---
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

  const getHabitStreak = (habitId: string) => {
    let streak = 0;
    let daysAgo = 0;

    // Cek apakah hari ini sudah dicentang?
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
      const twelveHours = 12 * 60 * 60 * 1000;
      setTasks(prev => prev.filter(t => {
        if (t.type === 'Sekali Waktu' && t.completedAt) {
          return (now - t.completedAt) < twelveHours;
        }
        return true;
      }));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // --- ACTIONS ---
  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const getCurrentWeekKey = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    const weekNo = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    return `${d.getFullYear()}-W${weekNo}`;
  };

  const getCurrentMonthKey = () => new Date().toISOString().slice(0, 7);

  const addHabit = (name: string) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'];
    setHabits([...habits, { id: `h-${Date.now()}`, name, color: colors[Math.floor(Math.random() * colors.length)] }]);
  };

  const addTask = (name: string, type: TaskType) => {
    setTasks([...tasks, { id: `t-${Date.now()}`, name, type, completedAt: null }]);
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

  return (
    <TrackerContext.Provider value={{ 
      habits, tasks, dailyHistory, weeklyHistory, monthlyHistory, 
      addHabit, addTask, deleteItem, 
      toggleDailyItem, toggleWeeklyItem, toggleMonthlyItem, toggleOneTimeTask,
      getTodayDate, getCurrentWeekKey, getCurrentMonthKey, getHabitStreak,
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