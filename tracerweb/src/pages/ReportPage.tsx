import { useState } from "react";
import { useTracker } from "@/context/TrackerContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Trophy, CalendarDays, Target } from "lucide-react";

export default function ReportPage() {
  const { habits, dailyHistory } = useTracker();
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // --- LOGIC PERHITUNGAN ---
  const year = selectedMonth.getFullYear();
  const month = selectedMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Variabel penampung statistik
  let totalPossibleHabits = 0;
  let totalCompleted = 0;
  let perfectDays = 0;

  // List ID Habit yang valid (untuk memastikan kita tidak menghitung 'Task' biasa)
  const habitIds = habits.map(h => h.id);

  // Iterasi setiap hari dalam bulan ini
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    
    // Skip hari di masa depan
    if (new Date(dateStr) > new Date()) continue;

    const dayItems = dailyHistory[dateStr] || [];
    
    // Filter: Hanya hitung item yang ada di daftar Habits (bukan Task)
    const completedHabitsOnDay = dayItems.filter(id => habitIds.includes(id));

    if (habits.length > 0) {
      totalPossibleHabits += habits.length;
      totalCompleted += completedHabitsOnDay.length;
      
      // Cek apakah hari ini Perfect (semua habit selesai)
      if (completedHabitsOnDay.length === habits.length) {
        perfectDays++;
      }
    }
  }

  // Hitung Persentase Total
  const percentage = totalPossibleHabits > 0 
    ? Math.round((totalCompleted / totalPossibleHabits) * 100) 
    : 0;

  // --- LOGIC NILAI (GRADE) ---
  let grade = 'F';
  let gradeColor = 'text-red-500';
  let gradientBar = 'from-red-400 to-red-600';
  let message = 'Ayo mulai berjuang!';

  if (percentage >= 50) { 
    grade = 'C'; 
    gradeColor = 'text-yellow-500'; 
    gradientBar = 'from-yellow-400 to-orange-500';
    message = 'Cukup baik, tingkatkan!'; 
  }
  if (percentage >= 70) { 
    grade = 'B'; 
    gradeColor = 'text-blue-500'; 
    gradientBar = 'from-blue-400 to-indigo-500';
    message = 'Bagus sekali!'; 
  }
  if (percentage >= 90) { 
    grade = 'A'; 
    gradeColor = 'text-green-500'; 
    gradientBar = 'from-green-400 to-emerald-600';
    message = 'Sempurna! Pertahankan!'; 
  }

  // Navigasi Bulan
  const prevMonth = () => setSelectedMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setSelectedMonth(new Date(year, month + 1, 1));

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-400">
      
      {/* HEADER & NAVIGASI */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Rapor</h1>
          <p className="text-muted-foreground">Evaluasi bulanan kamu.</p>
        </div>
        <div className="flex items-center gap-1 bg-card border p-1 rounded-lg shadow-sm">
          <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8"><ChevronLeft className="h-4 w-4" /></Button>
          <span className="font-semibold text-sm w-24 text-center capitalize">
            {selectedMonth.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
          </span>
          <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* 1. KARTU NILAI UTAMA (BIG CARD) */}
      <Card className="relative overflow-hidden border-none shadow-lg">
        {/* Garis Gradient di Atas */}
        <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${gradientBar}`}></div>
        
        <CardContent className="pt-8 text-center flex flex-col items-center">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Nilai Keseluruhan</span>
          <div className={`text-8xl font-black ${gradeColor} drop-shadow-sm leading-none`}>
            {grade}
          </div>
          <div className="text-3xl font-bold mt-2">{percentage}%</div>
          <p className="text-muted-foreground italic mt-1">"{message}"</p>
        </CardContent>
      </Card>

      {/* 2. GRID STATISTIK KECIL */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <Target className="text-indigo-500 mb-2" size={24} />
            <div className="text-2xl font-bold">{totalCompleted}</div>
            <span className="text-xs text-muted-foreground uppercase font-bold">Total Selesai</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center text-center">
            <Trophy className="text-yellow-500 mb-2" size={24} />
            <div className="text-2xl font-bold">{perfectDays}</div>
            <span className="text-xs text-muted-foreground uppercase font-bold">Hari Sempurna</span>
          </CardContent>
        </Card>
      </div>

      {/* 3. DETAIL PER KEBIASAAN */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays size={18} className="text-primary"/> Detail Kebiasaan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {habits.length === 0 && <p className="text-sm text-muted-foreground text-center">Belum ada kebiasaan.</p>}
          
          {habits.map(habit => {
            // Hitung performa habit spesifik ini
            let count = 0;
            let passedDays = 0;
            
            for (let d = 1; d <= daysInMonth; d++) {
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
              if (new Date(dateStr) > new Date()) continue;
              
              passedDays++;
              if (dailyHistory[dateStr]?.includes(habit.id)) count++;
            }
            
            const habitPercent = passedDays > 0 ? Math.round((count / passedDays) * 100) : 0;

            return (
              <div key={habit.id} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-medium flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${habit.color}`}></div>
                    {habit.name}
                  </span>
                  <span className="font-bold text-muted-foreground">{habitPercent}%</span>
                </div>
                {/* Progress Bar Shadcn */}
                <Progress value={habitPercent} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}