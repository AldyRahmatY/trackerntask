import { useState } from "react";
import { useTracker } from "@/context/TrackerContext";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Award, 
  BarChart3, 
  ThumbsUp, 
  AlertCircle, 
  Star,
  Target,
  Sparkles
} from 'lucide-react';

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


    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // 2. Di dalam loop:
    if (year === today.getFullYear() && month === today.getMonth() && dateStr > todayStr) {
      continue;
    }

    // Pakai Set() agar ID habit unik (maksimal 1x per hari)
    const rawDayItems = dailyHistory[dateStr] || [];
    const completedHabitsOnDay = Array.from(new Set(rawDayItems)).filter(id => habitIds.includes(id));

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

  const monthLabel = selectedMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* 1. HEADER & NAVIGASI BULAN */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Laporan & Analisis</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Evaluasi performa dan tingkat konsistensi kebiasaanmu.
          </p>
        </div>

        {/* Control Pindah Bulan */}
        <div className="flex items-center gap-2 bg-card border px-2 py-1 rounded-lg shadow-sm">
          <button 
            onClick={prevMonth}
            className="p-1 hover:bg-muted rounded-md transition-colors"
            title="Bulan Sebelumnya"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-1.5 px-2 text-sm font-semibold min-w-[130px] justify-center">
            <Calendar size={14} className="text-muted-foreground" />
            <span>{monthLabel}</span>
          </div>
          <button 
            onClick={nextMonth}
            className="p-1 hover:bg-muted rounded-md transition-colors"
            title="Bulan Berikutnya"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* 2. SUMMARY & GRADE HERO CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* HERO CARD: Grade & Progress Utama */}
        <div className="lg:col-span-2 bg-card border rounded-xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-xs font-black text-muted-foreground uppercase tracking-wider">
                Performa Bulan Ini
              </span>
              <h2 className="text-lg font-semibold mt-1">{message}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Kamu telah menyelesaikan <span className="text-foreground">{totalCompleted}</span> dari <span className=" text-foreground">{totalPossibleHabits}</span> target kebiasaan.
              </p>
            </div>

            {/* Badge Grade */}
            <div className="flex flex-col items-center justify-center bg-muted/50 border px-5 py-3 rounded-xl min-w-[80px]">
              <span className="text-xs font-medium text-muted-foreground">Grade</span>
              <span className={`text-4xl font-black ${gradeColor}`}>{grade}</span>
            </div>
          </div>

          {/* Progress Bar Visual */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-xs font-light text-muted-foreground">
              <span className="flex items-center gap-1">Progressmu</span>
              <span>{percentage}%</span>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden p-0.5 border">
              <div 
                className={`h-full rounded-full bg-gradient-to-r ${gradientBar} transition-all duration-500`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* METRIK TAMBAHAN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          {/* Perfect Days */}
          <div className="bg-card border rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-bold text-muted-foreground">Hari Sempurna (100%)</p>
              <p className="text-2xl font-normal mt-1">{perfectDays} <span className="text-sm font-normal text-muted-foreground">Hari</span></p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Semua habit selesai dalam sehari</p>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
              <Award size={24} />
            </div>
          </div>

          {/* Total Kebiasaan Aktif */}
          <div className="bg-card border rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-bold text-muted-foreground">Kebiasaan Dipantau</p>
              <p className="text-2xl font-normal mt-1">{habits.length} <span className="text-sm font-normal text-muted-foreground">Habit</span></p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Aktif di periode bulan ini</p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-xl">
              <Target size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. GRAFIK MINGGUAN & HIGHLIGHT (BEST/WORST) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GRAFIK MINGGUAN */}
        <div className="lg:col-span-2 bg-card border rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-primary" />
              <h3 className="font-normal text-base">Konsistensi Per Minggu</h3>
            </div>
            <span className="text-xs text-muted-foreground">Persentase Sukses</span>
          </div>

          {/* Visual Custom Bar Chart */}
          <div className="pt-4 pb-2 grid grid-cols-4 gap-3 items-end h-48 border-b">
            {chartData.map((item, index) => (
              <div key={index} className="flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-xs font-normal-muted-foreground opacity-80 group-hover:opacity-100 transition-opacity">
                  {item.score}%
                </span>
                <div className="w-full max-w-[48px] bg-muted rounded-t-md h-full flex items-end overflow-hidden p-1">
                  <div 
                    className="w-full bg-primary/80 group-hover:bg-primary transition-all duration-300 rounded-t-sm"
                    style={{ height: `${item.score}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground font-medium">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* HIGHLIGHT HABIT (BEST & WORST) */}
        <div className="bg-card border rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <h3 className="text-base flex items-center gap-2">
            <Star size={18} className="text-amber-500" />
            Sorotan Kebiasaan
          </h3>

          <div className="space-y-3">
            {/* Best Habit */}
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <div className="flex items-center gap-1.5 text-xs font-semi-bold text-emerald-700 dark:text-emerald-400">
                <ThumbsUp size={14} /> Paling Konsisten
              </div>
              {bestHabit ? (
                <div className="mt-1">
                  <p className="text-sm text-foreground">{bestHabit.name || bestHabit.name || 'Kebiasaan'}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                    Selesai <span className="text-decoration: underline">{bestHabit.count} kali</span> bulan ini
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">Belum ada data</p>
              )}
            </div>

            {/* Worst Habit */}
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400">
                <AlertCircle size={14} /> Perlu Ditingkatkan
              </div>
              {worstHabit ? (
                <div className="mt-1">
                  <p className="text-sm text-foreground">{worstHabit.name || worstHabit.name || 'Kebiasaan'}</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                    Baru selesai <span className="text-decoration: underline">{worstHabit.count} kali</span> bulan ini
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">Belum ada data</p>
              )}
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground text-center tracking-loose font-light mt-2">
            "Fokus tingkatkan kebiasaan yang masih rendah di bulan berikutnya!"
          </p>
        </div>
      </div>

      {/* 4. DETAIL PERFORMA SETIAP HABIT */}
      <div className="bg-card border rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-base">Rincian Performa per Kebiasaan</h3>
          <span className="text-xs text-muted-foreground">Diurutkan dari yang tersering</span>
        </div>

        {sortedHabits.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Belum ada kebiasaan yang ditambahkan.
          </div>
        ) : (
          <div className="space-y-3">
            {sortedHabits.map((item) => {
              // Hitung persentase habit terhadap total hari berjalannya bulan ini
              const itemPercentage = daysInMonth > 0 ? Math.round((item.count / daysInMonth) * 100) : 0;

              return (
                <div 
                  key={item.id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg gap-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{item.name || item.name}</span>
                      {item.level && (
                        <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-medium text-muted-foreground">
                          Level {item.level}
                        </span>
                      )}
                    </div>

                    {/* Progress Bar Kebiasaan */}
                    <div className="w-full max-w-md h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${Math.min(itemPercentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Statistik Angka */}
                  <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
                    <div className="text-right">
                      <div className="font-bold text-foreground">{item.count} Hari</div>
                      <div className="text-[10px]">Total Selesai</div>
                    </div>
                    <div className="text-right border-l pl-4">
                      <div className="font-bold text-primary">{itemPercentage}%</div>
                      <div className="text-[10px]">Konsistensi</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}