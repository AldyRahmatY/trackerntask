import { useState, useMemo } from "react"; // Tambah useMemo untuk performa
import { useTracker } from "@/context/TrackerContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Trophy, CalendarDays, Target, TrendingUp, AlertCircle, Award } from "lucide-react"; // Icon baru
import { LineChart, Line, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function ReportPage() {
  const { habits, dailyHistory } = useTracker();
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const year = selectedMonth.getFullYear();
  const month = selectedMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // --- LOGIC PERHITUNGAN DASAR (SAMA SEPERTI SEBELUMNYA) ---
  let totalPossibleHabits = 0;
  let totalCompleted = 0;
  let perfectDays = 0;
  const habitIds = habits.map(h => h.id);

  // Variable untuk menghitung performa per habit
  const habitCounts: Record<string, number> = {};
  habits.forEach(h => habitCounts[h.id] = 0);

  // ✨ FITUR BARU: Logic Data Grafik Mingguan
  // Kita bagi bulan ini menjadi 4 minggu (sederhana) untuk grafik
  const weeklyData = [
    { name: 'Minggu 1', total: 0, completed: 0 },
    { name: 'Minggu 2', total: 0, completed: 0 },
    { name: 'Minggu 3', total: 0, completed: 0 },
    { name: 'Minggu 4', total: 0, completed: 0 }, // Sisanya masuk sini
  ];

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    
    // Skip masa depan
    if (new Date(dateStr) > new Date()) continue;

    const dayItems = dailyHistory[dateStr] || [];
    const completedHabitsOnDay = dayItems.filter(id => habitIds.includes(id));

    if (habits.length > 0) {
      totalPossibleHabits += habits.length;
      totalCompleted += completedHabitsOnDay.length;
      if (completedHabitsOnDay.length === habits.length) perfectDays++;

      // Hitung per habit (untuk insight Best/Worst)
      completedHabitsOnDay.forEach(id => {
        if (habitCounts[id] !== undefined) habitCounts[id]++;
      });

      // Masukkan ke data Mingguan
      let weekIndex = Math.floor((d - 1) / 7);
      if (weekIndex > 3) weekIndex = 3; // Mentok di minggu ke-4
      weeklyData[weekIndex].total += habits.length;
      weeklyData[weekIndex].completed += completedHabitsOnDay.length;
    }
  }

  // Finalisasi Data Grafik (Ubah jadi Persentase 0-100)
  const chartData = weeklyData.map(w => ({
    name: w.name,
    score: w.total > 0 ? Math.round((w.completed / w.total) * 100) : 0
  }));

  // ✨ FITUR BARU: Cari Habit Terbaik & Terburuk
  const sortedHabits = habits.map(h => ({
    ...h,
    count: habitCounts[h.id] || 0
  })).sort((a, b) => b.count - a.count); // Urutkan dari yg paling banyak selesai

  const bestHabit = sortedHabits.length > 0 ? sortedHabits[0] : null;
  const worstHabit = sortedHabits.length > 0 ? sortedHabits[sortedHabits.length - 1] : null;

  // --- LOGIC GRADE (SAMA SEPERTI SEBELUMNYA) ---
  const percentage = totalPossibleHabits > 0 
    ? Math.round((totalCompleted / totalPossibleHabits) * 100) 
    : 0;

  let grade = 'F';
  let gradeColor = 'text-red-500';
  let gradientBar = 'from-red-400 to-red-600';
  let message = 'Ayo mulai berjuang!';

  if (percentage >= 50) { grade = 'C'; gradeColor = 'text-yellow-500'; gradientBar = 'from-yellow-400 to-orange-500'; message = 'Cukup baik, tingkatkan!'; }
  if (percentage >= 70) { grade = 'B'; gradeColor = 'text-blue-500'; gradientBar = 'from-blue-400 to-indigo-500'; message = 'Bagus sekali!'; }
  if (percentage >= 90) { grade = 'A'; gradeColor = 'text-green-500'; gradientBar = 'from-green-400 to-emerald-600'; message = 'Sempurna! Pertahankan!'; }

  const prevMonth = () => setSelectedMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setSelectedMonth(new Date(year, month + 1, 1));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 mx-auto p-4 md:p-6 lg:p-8">      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Rapor</h1>
          <p className="text-muted-foreground">Analisa performa bulanan.</p>
        </div>
        <div className="flex items-center gap-1 bg-card border p-1 rounded-lg shadow-sm">
          <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8"><ChevronLeft className="h-4 w-4" /></Button>
          <span className="font-semibold text-sm w-24 text-center capitalize">
            {selectedMonth.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
          </span>
          <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* KARTU NILAI UTAMA (TETAP DIPERTAHANKAN) */}
        <Card className="relative overflow-hidden">
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

      {/* DETAIL PER KEBIASAAN (SAMA SEPERTI SEBELUMNYA) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays size={18} className="text-primary"/> Detail Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {habits.length === 0 && <p className="text-sm text-muted-foreground text-center">Belum ada kebiasaan.</p>}
          
          {habits.map(habit => {
            const count = habitCounts[habit.id] || 0;
            // Hitung persentase berdasarkan hari yang sudah berlalu saja (agar adil)
            const passedDays = daysInMonth; // Atau mau pakai logic 'date <= today' ? Disini saya pakai total bulan biar jadi target
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
                <Progress value={habitPercent} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>
      </div>


      {/* ✨ FITUR BARU: GRAFIK TREN */}
      <Card>
        <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <TrendingUp size={16} className="text-primary"/> Tren Mingguan
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="h-[180px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6"/>
                    <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 12, fill: '#9ca3af'}} 
                        dy={10}
                        interval={0} 
                      padding={{ left: 20, right: 20 }}
                    />
                    <RechartsTooltip 
                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                        labelStyle={{fontWeight: 'bold', color: '#374151'}}
                    />
                    <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#0d9488" // Warna Teal
                        strokeWidth={3} 
                        dot={{r: 4, fill: '#0d9488', strokeWidth: 2, stroke: '#fff'}} 
                        activeDot={{r: 6}}
                    />
                  </LineChart>
              </ResponsiveContainer>
            </div>
        </CardContent>
      </Card>

      {/* ✨ FITUR BARU: INSIGHT CARDS (Grid 2 Kolom) */}
      <div className="grid grid-cols-2 gap-4">
          {/* TERBAIK */}
          <Card className="bg-emerald-50 dark:bg-emerald-900 border-emerald-100 shadow-sm">
            <CardContent className="p-4 flex flex-col gap-2">
                <div className="bg-emerald-100 w-8 h-8 rounded-full flex items-center justify-center text-emerald-600">
                  <Award size={16} />
                </div>
                <div>
                  <span className="text-[13px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Paling Rajin</span>
                  <p className="font-semibold text-sm truncate text-emerald-950 dark:text-white">
                      {bestHabit ? bestHabit.name : "-"}
                  </p>
                </div>
            </CardContent>
          </Card>

          {/* TERBURUK */}
          <Card className="bg-rose-50 dark:bg-rose-800 border-rose-100 shadow-sm">
            <CardContent className="p-4 flex flex-col gap-2">
                <div className="bg-rose-100 w-8 h-8 rounded-full flex items-center justify-center text-rose-600">
                  <AlertCircle size={16} />
                </div>
                <div>
                  <span className="text-[13px] text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider">Jarang Dilakukan</span>
                  <p className="font-semibold text-sm truncate text-rose-950 dark:text-white">
                      {worstHabit ? worstHabit.name : "-"}
                  </p>
                </div>
            </CardContent>
          </Card>
      </div>

      {/* GRID STATISTIK KECIL (SAMA SEPERTI SEBELUMNYA) */}
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
    </div>
  );
  }