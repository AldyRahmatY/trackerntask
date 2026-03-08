import { useTracker } from "@/context/TrackerContext";
import { Card, CardContent } from "@/components/ui/card";
// import { Progress } from "@/components/ui/progress";
// import { Badge } from "@/components/ui/badge";
import { Check, 
  // Sparkles, 
  Clock, CalendarDays, Zap, Flame, ArrowUp, Minus, ArrowDown } from "lucide-react";
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

  const priorityScore = { high: 3, medium: 2, low: 1 };

  // const handleAiMotivation = async () => {
  //   setMotivation("Loading...");
  //   // Simulasi Gemini AI
  //   setTimeout(() => setMotivation("Jangan lupa napas, tugas numpuk itu biasa! 🚀"), 1000);
  // };
  
  const sortedTasks = [...tasks].sort((a, b) => {
    // 1. Cek status selesai dulu (yang belum selesai di atas)
    // Anggap kita punya logic isDone di dalam map nanti, tapi untuk sorting raw tasks:
    // Kita sort berdasarkan Priority Score dulu
    const scoreA = priorityScore[a.priority || 'medium']; // Default medium jika data lama
    const scoreB = priorityScore[b.priority || 'medium'];
    return scoreB - scoreA; // Descending (3, 2, 1)
  });


  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 mx-auto p-4 md:p-6 lg:p-8">      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hari Ini</h1>
          <p className="text-muted-foreground">
             {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        

        <div className="w-full md:w-64">
           {/* ... Kode Progress Bar & Grade ... */}
           {/* Masukkan kode progress bar lingkaran/text grade disini */}
        </div>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Zap className="text-yellow-500 fill-yellow-500" size={20}/> Kebiasaan
              </h3>
              <span className="text-sm font-semibold text-muted-foreground">
                {validCompletedHabits.length}/{habits.length} Selesai
              </span>
            </div>

      {/* --- CUSTOM PROGRESS BAR --- */}
        <div className="relative w-full">
          
          {/* Label Motivasi (Berubah sesuai progress) */}
          <div className="flex justify-between text-xs font-bold mb-1.5 uppercase tracking-wide">
            <span className={`${progress === 100 ? 'text-emerald-600' : 'text-slate-500'}`}>
              {progress === 0 ? "Ayo Mulai!" : 
              progress < 50 ? "Sedikit lagi..." : 
              progress < 100 ? "Hampir Selesai!" : "Sempurna! 🎉"}
            </span>
            <span className="text-primary">{progress}%</span>
          </div>

          {/* Batang Progress (Background) */}
          <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner border border-slate-200 dark:border-slate-700">
            {/* Batang Progress (Isi / Fill) */}
            <div 
              className={`h-full transition-all duration-1000 ease-out flex items-center justify-end pr-1 shadow-md
                ${progress === 100 
                  ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' // Hijau Sukses
                  : 'bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400' // Gradasi Keren
                }
              `}
              style={{ width: `${progress}%` }}
            >
              {/* Efek Kilau/Shine (Garis putih tipis miring) */}
              {progress > 0 && (
                <div className="w-full h-full opacity-20 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.5)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer"></div>
              )}
            </div>
          </div>
        </div>
        {/* --- END CUSTOM PROGRESS BAR --- */}
          
          {/* <Progress value={progress} className="h-2" /> */}
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
                    <span className={`font-semibold text-base tracking-wide ${isDone ? 'line-through text-muted-foreground' : ''}`}>
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
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg flex items-center gap-2">🕒 Tugas</h3>
            
            {/* Info Chip Kecil */}
            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-full font-medium">
               Diurutkan berdasarkan Prioritas
            </span>
          </div>
          
          {sortedTasks.map(t => {
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

          const priorityStyles = {
              high: { border: 'border-l-rose-500, dark:border-l-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/20', text: 'text-rose-600 dark:text-rose-400', icon: ArrowUp },
              medium: { border: 'border-l-amber-500 dark:border-l-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/20', text: 'text-amber-600 dark:text-amber-400', icon: Minus },
              low: { border: 'border-l-blue-500 dark:border-l-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-400', icon: ArrowDown },
            };
          const style = priorityStyles[t.priority || 'medium'];
          const PriorityIcon = style.icon;

            return (
              <Card key={t.id} onClick={toggleFn} 
                className={`cursor-pointer transition-all hover:shadow-md border-l-4 ${style.border} ${isDone ? 'opacity-60 grayscale' : ''}`}
              >
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    
                    {/* Icon Tipe Tugas (Harian/Mingguan) */}
                    <div className={`p-2 rounded-lg ${isDone ? 'bg-slate-100 text-slate-400' : 'bg-primary/5 text-primary'}`}>
                      <Icon size={18}/>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <p className={`font-medium text-sm ${isDone ? 'line-through text-muted-foreground' : ''}`}>
                          {t.name}
                        </p>
                        
                        {/* BADGE PRIORITAS */}
                        {!isDone && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5 font-bold uppercase ${style.bg} ${style.text}`}>
                            <PriorityIcon size={10} strokeWidth={3} /> 
                            {t.priority === 'high' ? 'Prioritas Tinggi' : t.priority === 'low' ? 'Santai': 'Segera'}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-[10px] text-muted-foreground uppercase mt-0.5 font-medium tracking-wide">
                          {t.type}
                      </p>
                    </div>
                  </div>

                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${isDone ? 'bg-primary border-primary' : 'border-slate-300'}`}>
                    {isDone && <Check size={12} className="text-white"/>}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </section>
      </div>
    </div>
  );
}