import { useTracker } from "@/context/TrackerContext";
import { Card, CardContent } from "@/components/ui/card";
import { isWithinTimeGate } from "@/context/TrackerContext";
import { Check, Clock, CalendarDays, Flame, ArrowUp, Minus, ArrowDown, Trophy } from "lucide-react";


export default function DashboardPage() {
  const { habits, tasks, dailyHistory, weeklyHistory, monthlyHistory, toggleDailyItem, toggleWeeklyItem, toggleMonthlyItem, toggleOneTimeTask, getTodayDate, getCurrentWeekKey, getCurrentMonthKey, getHabitStreak, getHabitRank } = useTracker();
  
  const today = getTodayDate();

  const currentWeek = getCurrentWeekKey();

  const rawCompleted = dailyHistory[today] || [];

  // 2. Ambil semua ID habit yang MASIH AKTIF (belum dihapus)
  const activeHabitIds = habits.map(h => h.id);
  const activeHabits = habits.filter((h) => !h.isArchived);
  
  // 3. Filter history: Hanya hitung jika ID-nya ada di daftar activeHabitIds
  const validCompletedHabits = rawCompleted.filter(id => 
    activeHabitIds.includes(id) && id.startsWith('h-')
  );

  // 4. Hitung progress baru
//   const progress = activeHabits.length > 0 
//     ? Math.round((validCompletedHabits.length / activeHabits.length) * 100) 
//     : 0;

// // --- EFEK CONFETTI ---
//   useEffect(() => {
//     if ((progress === 50 || progress === 100) && habits.length > 0) {
//       // Tembakkan confetti
//       const duration = 3 * 1000;
//       const animationEnd = Date.now() + duration;
//       const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

//       const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

//       const interval: any = setInterval(function() {
//         const timeLeft = animationEnd - Date.now();

//         if (timeLeft <= 0) {
//           return clearInterval(interval);
//         }

//         const particleCount = 50 * (timeLeft / duration);
        
//         // Confetti dari kiri dan kanan layar
//         confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
//         confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
//       }, 250);
//     }
//   }, [progress, habits.length]);

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
    // <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 mx-auto p-4 md:p-6 lg:p-8">      
    //   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    //     <div>
    //       <h1 className="text-2xl font-bold tracking-tight">Hari Ini</h1>
    //       <p className="text-muted-foreground">
    //          {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
    //       </p>
    //     </div>
    //   </div>

    <div className="p-4 max-w-md mx-auto space-y-6 pb-20">
      {/* Header Level Global / Ringkasan Singkat */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between">
        <div>
          <p className="text-md uppercase font-bold">Status Kebiasaan Aktif</p>
          <h2 className="text-sm font-medium flex items-center gap-2 mt-1">
            {activeHabits.length} / 10 Slot Digunakan
          </h2>
        </div>
        <div className="text-right">
          <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-mono">
            +10 EXP / Selesai
          </span>
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
      <div className="grid grid-cols-1 gap-6">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
              <h3 className="text-lg flex items-center gap-2">
                Kebiasaan
              </h3>
              <span className="text-sm text-muted-foreground">
                {validCompletedHabits.length}/{habits.length} Selesai
              </span>
            </div>

      {/* --- CUSTOM PROGRESS BAR --- */}
        {/* <div className="relative w-full">
          <div className="flex justify-between text-xs font-bold mb-1.5 uppercase tracking-wide">
            <span className={`${progress === 100 ? 'text-emerald-600' : 'text-slate-500'}`}>
              {progress === 0 ? "Ayo Mulai!" : 
              progress < 50 ? "Sedikit lagi..." : 
              progress < 100 ? "Hampir Selesai!" : "Sempurna! 🎉"}
            </span>
            <span className="text-primary">{progress}%</span>
          </div>

          <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner border border-slate-200 dark:border-slate-700">
            <div 
              className={`h-full transition-all duration-1000 ease-out flex items-center justify-end pr-1 shadow-md
                ${progress === 100 
                  ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' // Hijau Sukses
                  : 'bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400' // Gradasi Keren
                }
              `}
              style={{ width: `${progress}%` }}
            >
              {progress > 0 && (
                <div className="w-full h-full opacity-20 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.5)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer"></div>
              )}
            </div>
          </div>
        </div> */}
        {/* --- END CUSTOM PROGRESS BAR --- */}
          
          {/* <Progress value={progress} className="h-2" /> */}

          {habits.map(h => {
            const isDone = completedHabits.includes(h.id);
            const streak = getHabitStreak(h.id); 
            const { isAllowed, message } = isWithinTimeGate(h.timeGateStart, h.timeGateEnd);
            const isLocked = !isAllowed;
            const rank = getHabitRank(h.level ?? 1);

            return (
              <div 
                key={h.id} 
                onClick={() => {
                  // Mencegah klik APAPUN jika waktu sudah habis (isLocked = true)
                  if (!isLocked) toggleDailyItem(h.id);
                }} 
                className={`relative flex items-center justify-between p-4 rounded-xl border transition-all duration-200 group
                  ${isLocked 
                    ? 'bg-slate-100/60 border-slate-200 opacity-60 cursor-not-allowed' // Tampilan jika Waktu Habis (Terkunci)
                    : isDone 
                      ? 'bg-muted/50 border-muted opacity-80 cursor-pointer' // Tampilan Selesai & Masih Ada Waktu
                      : 'bg-card border-border hover:border-primary hover:shadow-md cursor-pointer' // Tampilan Belum Selesai & Masih Ada Waktu
                  }`}
              >
                <div className="flex items-center justify-between w-full">
                  {/* BAGIAN KIRI: Info Utama Kebiasaan */}
                  <div className="flex items-center gap-4 flex-1 pr-3">
                    <div className="flex flex-col w-full">
                      {/* Baris 1: Nama Kebiasaan + Badge Level */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-base tracking-wide ${isDone ? 'line-through text-muted-foreground' : ''}`}>
                          {h.name}
                        </span>
                        
                        {/* Badge Level / Rank */}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${rank.color}`}>
                          {rank.title}
                        </span>
                      </div>

                      {/* Baris 2: Sub-info (Time Gate, Streak, & Peringatan Penalti) */}
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {/* Status Jendela Waktu */}
                        {(h.timeGateStart && h.timeGateEnd) && (
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                            isAllowed 
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                              : 'bg-amber-50 text-amber-600 border-amber-200'
                          }`}>
                            {isAllowed ? '🔓' : '🔒'} {message}
                          </span>
                        )}

                        {/* Indikator Streak */}
                        {streak > 0 ? (
                          <span className="flex items-center gap-1 text-xs font-medium text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                            <Flame size={12} className="fill-orange-500 animate-pulse" /> 
                            {streak} Hari Beruntun
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">
                            Mulai streak barumu hari ini!
                          </span>
                        )}

                        {/* Indikator Penalti Beruntun */}
                        {(h.missedDaysStreak ?? 0) > 0 && !isDone && (
                          <span className="text-[10px] font-medium text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                            ⚠ Potensi Penalti: -{(h.missedDaysStreak ?? 0) * 10} EXP
                          </span>
                        )}
                      </div>

                      {/* Baris 3: Progress Bar EXP Mini */}
                      <div className="mt-2 w-full max-w-[200px] space-y-0.5">
                        <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                          <span>{h.currentXp ?? 0} / {h.maxXp ?? 100} EXP</span>
                          <span>{Math.min(100, Math.round(((h.currentXp ?? 0) / (h.maxXp ?? 100)) * 100))}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 transition-all duration-300"
                            style={{ 
                              width: `${Math.min(100, Math.round(((h.currentXp ?? 0) / (h.maxXp ?? 100)) * 100))}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BAGIAN KANAN: Tombol Status Check-in */}
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all flex-shrink-0
                    ${isDone 
                      ? isLocked
                        ? 'bg-green-600/50 border-green-600/50' // Terkunci & Sudah Selesai (Centang Redup)
                        : 'bg-green-500 border-green-500 scale-110' // Masih Buka & Sudah Selesai (Bisa di-uncheck)
                      : isLocked
                        ? 'bg-slate-200 border-slate-300' // Terkunci & Belum Selesai (Gembok)
                        : 'border-muted-foreground/20 group-hover:border-primary/50' // Masih Buka & Belum Selesai
                    }
                  `}>
                    {/* Tampilkan centang jika sudah selesai */}
                    {isDone && <Check size={16} className="text-white font-bold" strokeWidth={4} />}
                    
                    {/* Tampilkan gembok HANYA jika waktu habis DAN belum selesai */}
                    {isLocked && !isDone && <span className="text-xs">🔒</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </section>


        {/* Tugas */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-lg flex items-center gap-2">Tugas</h3>
            
            {/* Info Chip Kecil */}
            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-full font-medium">
               Diurutkan berdasarkan Prioritas
            </span>
          </div>
          
          {sortedTasks.map(t => {
            let isDone = false;
            let toggleFn = () => {};
            
            if (t.type === 'Harian') {
              isDone = (dailyHistory[today] || []).includes(t.id);
              toggleFn = () => toggleDailyItem(t.id);
            } else if (t.type === 'Mingguan') { 
              isDone = (weeklyHistory[currentWeek] || []).includes(t.id);
              toggleFn = () => toggleWeeklyItem(t.id);
            } else if (t.type === 'Bulanan') {
              isDone = (monthlyHistory[currentMonth] || []).includes(t.id);
              toggleFn = () => toggleMonthlyItem(t.id);
            } else if (t.type === 'Sekali Waktu') {
              isDone = !!t.completedAt;
              toggleFn = () => toggleOneTimeTask(t.id);
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
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <p className={`font-medium text-sm ${isDone ? 'line-through text-muted-foreground' : ''}`}>
                          {t.name}
                        </p>
                        
                        {/* BADGE PRIORITAS */}
                        {!isDone && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5 uppercase ${style.bg} ${style.text}`}>
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