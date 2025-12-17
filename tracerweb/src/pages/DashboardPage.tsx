import { useTracker } from "@/context/TrackerContext";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Clock, CalendarDays, Zap } from "lucide-react";
import { useState } from "react";

export default function DashboardPage() {
  const { habits, tasks, dailyHistory, monthlyHistory, toggleDailyItem, toggleMonthlyItem, toggleOneTimeTask, getTodayDate, getCurrentMonthKey } = useTracker();
  
  const today = getTodayDate();
  // 1. Ambil data history mentah hari ini
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

  const currentMonth = getCurrentMonthKey();
  const [motivation, setMotivation] = useState("");

  // Logic Progress
  const completedHabits = dailyHistory[today] || [];

  const handleAiMotivation = async () => {
    setMotivation("Loading...");
    // Simulasi API Call (Ganti dengan fetch Gemini kamu yang asli)
    setTimeout(() => setMotivation("Jangan lupa napas, tugas numpuk itu biasa! 🚀"), 1000);
  };

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
      <Card className="dark:bg-teal-800/60 bg-teal-600/80 text-white border-none">
        <CardContent className="p-4 flex flex-col gap-2">
           <div className="flex justify-between items-center">
             <div className="flex items-center gap-2 font-bold"><Sparkles size={16}/> AI Motivator</div>
             <button onClick={handleAiMotivation} className="text-xs bg-white/20 px-2 py-1 rounded hover:bg-white/30">Generate</button>
           </div>
           <p className="text-sm italic opacity-90">{motivation || "Tekan generate untuk semangat!"}</p>
        </CardContent>
      </Card>

      {/* Kebiasaan */}
      <section className="space-y-3">
        <h3 className="font-semibold text-lg flex items-center gap-2"><Zap className="text-yellow-500" size={18}/> Kebiasaan</h3>
        <Progress value={progress} className="h-2" />
        {habits.map(h => {
          const isDone = completedHabits.includes(h.id);
          return (
            <div key={h.id} onClick={() => toggleDailyItem(h.id)} 
              className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${isDone ? 'bg-muted opacity-60' : 'bg-card hover:shadow-md'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-1.5 h-8 rounded-full ${h.color}`}></div>
                <span className={isDone ? 'line-through' : ''}>{h.name}</span>
              </div>
              {isDone && <Check className="text-green-500" size={20}/>}
            </div>
          )
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
                    <p className="text-[10px] text-muted-foreground uppercase">{t.type === 'Sekali Waktu' && isDone ? 'Auto-delete in 12h' : t.type}</p>
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