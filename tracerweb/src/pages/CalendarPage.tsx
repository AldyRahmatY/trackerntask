import { useState } from "react";
import { useTracker } from "@/context/TrackerContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

  // Navigasi Bulan
  const prevMonth = () => setSelectedMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setSelectedMonth(new Date(year, month + 1, 1));

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-400">
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
              <div key={`blank-${i}`} className="h-10 md:h-14 bg-transparent"></div>
            ))}

            {/* Tanggal */}
            {days.map((day) => {
              // Format YYYY-MM-DD manual agar sesuai key di object history
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              
              // Ambil data dari Context
              const dayData = dailyHistory[dateStr] || [];
              
              // Hitung persentase habits yang selesai hari itu
              // Filter habits agar hanya menghitung ID yang berawalan 'h-' (agar Task tidak ikut terhitung di kalender warna)
              const completedHabitsCount = dayData.filter(id => id.startsWith('h-')).length;
              const totalHabits = habits.length;
              const completionRate = totalHabits > 0 ? completedHabitsCount / totalHabits : 0;

              // Tentukan Warna
              let bgColor = "bg-secondary text-secondary-foreground"; // Default (abu-abu/putih)
              if (completionRate > 0) bgColor = "bg-teal-100 text-teal-700";
              if (completionRate > 0.4) bgColor = "bg-teal-300 text-teal-900";
              if (completionRate > 0.7) bgColor = "bg-teal-500 text-white";
              if (completionRate === 1) bgColor = "bg-teal-700 text-white";

              const isToday = dateStr === getTodayDate();

              return (
                <div
                  key={day}
                  className={`flex items-center justify-center h-5 md:h-14 rounded-sm text-sm font-medium transition-all duration-200 cursor-default
                    ${bgColor} 
                    ${isToday ? "ring-2 ring-primary ring-offset-2" : ""}
                  `}
                  title={`${completedHabitsCount}/${totalHabits} selesai`}
                >
                  {day}
                </div>
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