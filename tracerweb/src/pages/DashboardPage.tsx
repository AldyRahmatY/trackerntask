import { useTracker } from "@/context/TrackerContext";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Check, 
  // Sparkles, 
  Clock, CalendarDays, Zap, Flame } from "lucide-react";
import { useEffect, 
  // useState
        } from "react";
import confetti from "canvas-confetti";


export default function DashboardPage() {
  const { habits, tasks, dailyHistory, weeklyHistory, monthlyHistory, toggleDailyItem, toggleWeeklyItem, toggleMonthlyItem, toggleOneTimeTask, getTodayDate, getCurrentWeekKey, getCurrentMonthKey, getHabitStreak } = useTracker();
  
  const today = getTodayDate();

  const currentWeek = getCurrentWeekKey();
  
  const rawCompleted = dailyHistory[today] || [];

  // 2. Ambil semua ID habit yang MASIH AKTIF (belum dihapus)
  const activeHabitIds = habits.map(h => h.id);

  // 3. Filter history: Hanya hitung jika ID-nya ada di daftar activeHabitIds
  const validCompletedHabits = rawCompleted.filter(id => 
    activeHabitIds.includes(id) && id.startsWith('h-')
  );

  // 4. Hitung progress baru
  const progress = habits.length > 0 
    ? Math.round((validCompletedHabits.length / habits.length) * 100) 
    : 0;
// --- EFEK CONFETTI ---
  useEffect(() => {
    if ((progress === 50 || progress === 100) && habits.length > 0) {
      // Tembakkan confetti
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        // Confetti dari kiri dan kanan layar
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
    }
  }, [progress, habits.length]);

  const currentMonth = getCurrentMonthKey();
  // const [motivation, setMotivation] = useState("");

  // Logic Progress
  const completedHabits = dailyHistory[today] || [];

  // const handleAiMotivation = async () => {
  //   setMotivation("Loading...");
  //   // Simulasi Gemini AI
  //   setTimeout(() => setMotivation("Jangan lupa napas, tugas numpuk itu biasa! 🚀"), 1000);
  // };
  

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-400">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Hari Ini</h1>
          <p className="text-muted-foreground">{new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
        </div>
        <Badge variant="outline" className="text-lg px-3 py-1">{progress}%</Badge>
      </div>

      {/* AI Card */}
      {/* <Card className="dark:bg-teal-800/60 bg-teal-600/80 text-white border-none">
        <CardContent className="p-4 flex flex-col gap-2">
           <div className="flex justify-between items-center">
             <div className="flex items-center gap-2 font-bold"><Sparkles size={16}/> AI Motivator</div>
             <button onClick={handleAiMotivation} className="text-xs bg-white/20 px-2 py-1 rounded hover:bg-white/30">Generate</button>
           </div>
           <p className="text-sm italic opacity-90">{motivation || "Tekan generate untuk semangat!"}</p>
        </CardContent>
      </Card> */}

      {/* Kebiasaan */}
      <section className="space-y-3">
        <h3 className="font-semibold text-lg flex items-center gap-2"><Zap className="text-yellow-500" size={18}/> Kebiasaan</h3>
        <Progress value={progress} className="h-2" />
        {habits.map(h => {
          const isDone = completedHabits.includes(h.id);
          // Panggil fungsi logic streak disini
          const streak = getHabitStreak(h.id); 

          return (
            <div 
              key={h.id} 
              onClick={() => toggleDailyItem(h.id)} 
              className={`relative flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-200 group
                ${isDone 
                  ? 'bg-muted/50 border-muted opacity-80' // Style saat selesai
                  : 'bg-card border-border hover:border-primary hover:shadow-md' // Style saat belum
                }`}
            >
              
              {/* BAGIAN KIRI: Warna & Teks */}
              <div className="flex items-center gap-4">
                {/* Indikator Warna (Garis Tegak) */}
                <div className={`w-1.5 h-10 rounded-full ${h.color}`}></div>
                
                <div className="flex flex-col">
                  {/* Nama Kebiasaan */}
                  <span className={`font-semibold text-base ${isDone ? 'line-through text-muted-foreground' : ''}`}>
                    {h.name}
                  </span>

                  {/* --- POSISI STREAK (DI DALAM KOTAK, BAWAH NAMA) --- */}
                  {streak > 0 ? (
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="flex items-center gap-1 text-xs font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                        <Flame size={12} className="fill-orange-500 animate-pulse" /> 
                        {streak} Hari Beruntun
                      </span>
                    </div>
                  ) : (
                    // (Opsional) Teks penyemangat jika streak 0
                    <span className="text-[10px] text-muted-foreground mt-0.5">
                      Mulai streak barumu hari ini!
                    </span>
                  )}
                </div>
              </div>

              {/* BAGIAN KANAN: Checkmark */}
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all
                ${isDone 
                  ? 'bg-green-500 border-green-500 scale-110' 
                  : 'border-muted-foreground/20 group-hover:border-primary/50'
                }
              `}>
                {isDone && <Check size={16} className="text-white font-bold" strokeWidth={4} />}
              </div>

            </div>
          );
        })}
      </section>

      {/* Tugas */}
      <section className="space-y-3">
        <h3 className="font-semibold text-lg flex items-center gap-2"><Clock className="text-blue-500" size={18}/> Tugas</h3>
        
        {tasks.map(t => {
          let isDone = false;
          let toggleFn = () => {};
          let Icon = Clock;
          
          if (t.type === 'Harian') {
            isDone = (dailyHistory[today] || []).includes(t.id);
            toggleFn = () => toggleDailyItem(t.id);
          } else if (t.type === 'Mingguan') { 
            isDone = (weeklyHistory[currentWeek] || []).includes(t.id);
            toggleFn = () => toggleWeeklyItem(t.id);
          } else if (t.type === 'Bulanan') {
            isDone = (monthlyHistory[currentMonth] || []).includes(t.id);
            toggleFn = () => toggleMonthlyItem(t.id);
            Icon = CalendarDays;
          } else if (t.type === 'Sekali Waktu') {
            isDone = !!t.completedAt;
            toggleFn = () => toggleOneTimeTask(t.id);
            Icon = Check;
          }

          return (
            <Card key={t.id} onClick={toggleFn} className={`cursor-pointer transition-all ${isDone ? 'bg-muted opacity-50' : 'hover:border-primary'}`}>
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary"><Icon size={16}/></div>
                  <div>
                    <p className={`font-medium text-sm ${isDone ? 'line-through' : ''}`}>{t.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{t.type === 'Sekali Waktu' && isDone ? 'Tugas Akan terhapus otomatis dalam 5 jam' : t.type}</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isDone ? 'bg-primary border-primary' : ''}`}>
                  {isDone && <Check size={12} className="text-white"/>}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </section>
    </div>
  );
}