import { useState } from "react";
import { useTracker } from "@/context/TrackerContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Check, ChevronLeft, ChevronRight, Trophy, X } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

export default function CalendarPage() {
  const { dailyHistory, habits, getTodayDate } = useTracker();
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // --- LOGIC KALENDER ---
  const year = selectedMonth.getFullYear();
  const month = selectedMonth.getMonth(); // 0-indexed (Jan = 0)

  // Mencari jumlah hari dalam bulan tersebut
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Mencari hari pertama bulan itu jatuh di hari apa (0 = Minggu, 1 = Senin, dst)
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // Generate array angka hari
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  // Generate array kosong untuk padding sebelum tanggal 1
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  let bestDay = { date: 0, count: 0 };
  let totalCompletedMonth = 0;

  days.forEach(day => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayData = dailyHistory[dateStr] || [];
    // Hanya hitung habit (h-...)
    const count = dayData.filter(id => id.startsWith('h-')).length;
    
    totalCompletedMonth += count;

    if (count > bestDay.count) {
        bestDay = { date: day, count: count };
    }
  });

  // Navigasi Bulan
  const prevMonth = () => setSelectedMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setSelectedMonth(new Date(year, month + 1, 1));

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-400 mx-auto p-4 md:p-6 lg:p-8 max-w-3xl">
      {/* HEADER KALENDER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Kalender</h1>
          <p className="text-muted-foreground">Riwayat konsistensi kamu.</p>
        </div>
        
        {/* Navigasi Bulan */}
        <div className="flex items-center gap-1 bg-card border p-1 rounded-sm shadow-sm">
          <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-semibold text-sm w-32 text-center capitalize">
            {selectedMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
          </span>
          <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
         <Card className="bg-amber-50 border-amber-300 dark:bg-amber-600/10 dark:border-amber-300">
            <CardContent className="p-4 flex items-center gap-3">
               <div className="bg-amber-200 p-2 rounded-full text-amber-800 dark:bg-amber-600/60 dark:text-amber-300">
                <Trophy size={20} />
               </div>
               <div>
                  <p className="text-xs text-amber-700 dark:text-amber-400 font-bold uppercase">Hari Terbaik</p>
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                     {bestDay.count > 0 ? `Tanggal ${bestDay.date} (${bestDay.count} Selesai)` : "Belum ada data"}
                  </p>
               </div>
            </CardContent>
         </Card>
         <Card className="bg-sky-50 border-sky-300 dark:bg-sky-900/30 dark:border-sky-300">
            <CardContent className="p-4 flex items-center gap-3">
               <div className="bg-sky-100 p-2 rounded-full text-sky-600 dark:bg-sky-600/60 dark:text-sky-300">
                  <Check size={20} />
               </div>
               <div>
                  <p className="text-xs text-sky-700 dark:text-sky-400 font-bold uppercase">Total Bulan Ini</p>
                  <p className="text-sm font-medium text-sky-900 dark:text-sky-100">
                     {totalCompletedMonth} Kebiasaan
                  </p>
               </div>
            </CardContent>
         </Card>
      </div>

      {/* BODY KALENDER */}
      <Card className="border-none shadow-md">
        <CardHeader className="pb-2">
           {/* Nama Hari */}
          <div className="grid grid-cols-7 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d) => (
              <div key={d} className="py-2">{d}</div>
            ))}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {/* Slot Kosong */}
            {blanks.map((_, i) => (
              <div key={`blank-${i}`} className="bg-transparent"></div>
            ))}

            {/* Tanggal */}
            {days.map((day) => {
              // Format YYYY-MM-DD manual agar sesuai key di object history
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              
              // Ambil data dari Context
              const dayData = dailyHistory[dateStr] || [];
              
              // Hitung persentase habits yang selesai hari itu
              // Filter habits agar hanya menghitung ID yang berawalan 'h-' (agar Task tidak ikut terhitung di kalender warna)
              const completedHabitIds = dayData.filter(id => id.startsWith('h-'));
              const completedCount = completedHabitIds.length;
              const totalHabits = habits.length;
              const completionRate = totalHabits > 0 ? completedCount / totalHabits : 0;

              // Tentukan Warna
              let bgColor = "bg-secondary text-secondary-foreground"; // Default (abu-abu/putih)
              if (completionRate > 0) bgColor = "bg-teal-100 text-teal-700";
              if (completionRate > 0.4) bgColor = "bg-teal-300 text-teal-900";
              if (completionRate > 0.7) bgColor = "bg-teal-500 text-white";
              if (completionRate === 1) bgColor = "bg-teal-700 text-white";

            const isToday = dateStr === getTodayDate();

              // ✨ FITUR BARU: Logic List Habit untuk Popover
              const completedList = habits.filter(h => completedHabitIds.includes(h.id));
              const missedList = habits.filter(h => !completedHabitIds.includes(h.id));

              return (
                // ✨ GANTI DIV BIASA DENGAN HOVERCARD
                <HoverCard key={day} openDelay={100} closeDelay={100}>
                  <HoverCardTrigger asChild>
                    <div
                      className={`flex items-center justify-center h-10 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer ${bgColor} ${isToday ? "ring-2 ring-primary ring-offset-2" : ""}`}
                    >
                      {day}
                    </div>
                  </HoverCardTrigger>
                  
                  {/* ✨ ISI POPUP SAAT DI-HOVER */}
                  <HoverCardContent className="w-64 p-3 z-50 shadow-xl border-teal-100">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center border-b pb-2">
                          <h4 className="font-bold text-sm">
                            {new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                          </h4>
                          <span className="text-xs font-mono bg-slate-100 px-1.5 rounded text-slate-600">
                            {Math.round(completionRate * 100)}%
                          </span>
                      </div>

                      {/* List Selesai */}
                      <div>
                          <p className="text-[10px] font-bold text-teal-600 uppercase mb-1 flex items-center gap-1">
                            <Check size={10} strokeWidth={4}/> Selesai ({completedList.length})
                          </p>
                          {completedList.length > 0 ? (
                            <ul className="text-xs space-y-1 text-slate-700">
                                {completedList.map(h => (
                                  <li key={h.id} className="truncate">• {h.name}</li>
                                ))}
                            </ul>
                          ) : <span className="text-xs text-muted-foreground italic">- Tidak ada -</span>}
                      </div>

                      {/* List Terlewat */}
                      <div>
                          <p className="text-[10px] font-bold text-rose-500 uppercase mb-1 flex items-center gap-1">
                            <X size={10} strokeWidth={4}/> Terlewat ({missedList.length})
                          </p>
                          {missedList.length > 0 ? (
                            <ul className="text-xs space-y-1 text-slate-500 line-through decoration-slate-300">
                                {missedList.map(h => (
                                  <li key={h.id} className="truncate">• {h.name}</li>
                                ))}
                            </ul>
                          ) : <span className="text-xs text-teal-600 font-medium">Sempurna! 🎉</span>}
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              );
            })}
          </div>

          {/* Keterangan Warna (Legend) */}
          <div className="mt-6 flex justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-secondary border"></div> 0%
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-teal-300"></div> 50%
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-teal-700"></div> 100%
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}