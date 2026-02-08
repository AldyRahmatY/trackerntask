import { useState } from "react";
import { useTracker, type TaskType } from "@/context/TrackerContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus, Sparkles, HelpCircle, Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function SettingsPage() {
  const { habits, tasks, addHabit, addTask, deleteItem } = useTracker();
  
  const [taskType, setTaskType] = useState<TaskType>('Harian');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newItem, setNewItem] = useState("");
  const [activeTab, setActiveTab] = useState("habit");

  // State AI
  const [aiGoal, setAiGoal] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  const handleAdd = () => {
    if (!newItem.trim()) return;
    if (activeTab === 'habit') {
      addHabit(newItem);
    } else {
      // Pastikan Context sudah diupdate untuk menerima 3 argumen ini!
      addTask(newItem, taskType, priority);
    }
    setNewItem("");
  };

  const handleAiGenerate = async () => {
    setAiSuggestions(["Minum Air 2L", "Olahraga 30 Menit", "Maksimal Screen Time 2 Jam"]);
  };

  // Helper untuk opsi tipe tugas (Mapping ID ke Label Indonesia)
  const taskTypeOptions = [
    { id: 'daily', label: 'Harian' },
    { id: 'weekly', label: 'Mingguan' },
    { id: 'monthly', label: 'Bulanan' },
    { id: 'onetime', label: 'Sekali Waktu' },
  ];

  const helpContent = {
    habit: {
      title: "Apa itu Kebiasaan?",
      description: "Kegiatan rutin untuk membangun konsistensi jangka panjang."
    },
    task: {
      title: "Apa itu Tugas?",
      description: "Kegiatan dengan target spesifik yang harus diselesaikan.",
      types: [
        { label: "Harian", desc: "Reset otomatis saat ganti hari." },
        { label: "Mingguan", desc: "Reset setiap hari Senin." },
        { label: "Bulanan", desc: "Reset setiap awal bulan." },
        { label: "Sekali Waktu", desc: "Dihapus otomatis setelah selesai." },
      ]
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-400 mx-auto p-4 md:p-6 lg:p-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Jadwal</h1>
        <p className="text-muted-foreground">Buat jadwalmu dan mulai konsisten untuk perubahanmu.</p>
      </div>

      <Tabs defaultValue="habit" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="habit">Kebiasaan</TabsTrigger>
          <TabsTrigger value="task">Tugas</TabsTrigger>
        </TabsList>
        
        {/* INPUT AREA */}
        <div className="mt-4 p-5 bg-card rounded-xl border shadow-sm space-y-4">
          
          {/* Header Input & Help Button */}
          <div className="flex justify-between items-center">
             <label className="text-xs font-bold uppercase text-muted-foreground">
               Tambah {activeTab === 'habit' ? 'Kebiasaan' : 'Tugas'} Baru
             </label>
             <Popover>
               <PopoverTrigger asChild>
                 <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary">
                   <HelpCircle size={16} />
                 </Button>
               </PopoverTrigger>
               <PopoverContent className="w-80" align="end">
                 <div className="space-y-3">
                   <h4 className="font-semibold leading-none flex items-center gap-2">
                     <Sparkles size={16} className="text-indigo-500"/> 
                     {activeTab === 'habit' ? helpContent.habit.title : helpContent.task.title}
                   </h4>
                   <p className="text-sm text-muted-foreground">
                     {activeTab === 'habit' ? helpContent.habit.description : helpContent.task.description}
                   </p>
                   {activeTab === 'task' && (
                     <div className="grid gap-2 mt-2 pt-2 border-t">
                       {helpContent.task.types.map((type, i) => (
                         <div key={i} className="text-xs grid grid-cols-3 gap-2 items-start">
                           <span className="font-bold text-primary text-right">{type.label}:</span>
                           <span className="col-span-2 text-muted-foreground">{type.desc}</span>
                         </div>
                       ))}
                     </div>
                   )}
                 </div>
               </PopoverContent>
             </Popover>
          </div>

          <Input 
             value={newItem} 
             onChange={(e) => setNewItem(e.target.value)} 
             placeholder={activeTab === 'habit' ? "Cth: Lari Pagi" : "Cth: Bayar Listrik"} 
          />
          
          {/* 2. OPSI KHUSUS TUGAS (Tipe & Prioritas) */}
          {activeTab === 'task' && (
            <div className="space-y-4 pt-2 border-t">
              
              {/* Pilihan Tipe Tugas */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {taskTypeOptions.map((opt) => (
                  <button 
                   key={opt.id} 
                   onClick={() => setTaskType(opt.id as TaskType)}
                   className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border flex items-center gap-1.5 transition-all ${
                     taskType === opt.id 
                       ? 'bg-primary/10 border-primary text-primary' 
                       : 'bg-background border-border text-muted-foreground hover:bg-muted'
                   }`}>
                   <Clock size={14} /> {opt.label}
                  </button>
                ))}
              </div>

              {/* Pilihan Prioritas (Dipindah kesini agar rapi) */}
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Prioritas</label>
                 <div className="flex gap-2">
                   {[
                     { id: 'low', label: 'Rendah', color: 'bg-blue-100 text-blue-700 border-blue-200 ring-blue-400' },
                     { id: 'medium', label: 'Sedang', color: 'bg-amber-100 text-amber-700 border-amber-200 ring-amber-400' },
                     { id: 'high', label: 'Tinggi', color: 'bg-rose-100 text-rose-700 border-rose-200 ring-rose-400' }
                   ].map(p => (
                     <button
                       key={p.id}
                       onClick={() => setPriority(p.id as any)}
                       className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                         priority === p.id 
                           ? `${p.color} ring-2 ring-offset-1` 
                           : 'bg-white border-gray-200 text-muted-foreground hover:bg-muted'
                       }`}
                     >
                       {p.label}
                     </button>
                   ))}
                 </div>
               </div>
            </div>
          )}

          <Button onClick={handleAdd} className="w-full gap-2 font-bold"><Plus size={16}/> Tambah</Button>
        </div>

        {/* List Content: Kebiasaan */}
        <TabsContent value="habit" className="space-y-3 mt-4">
          <h3 className="font-semibold ml-1">Daftar Kebiasaan</h3>
          {habits.map(h => (
            <div key={h.id} className="flex justify-between items-center bg-card p-3 rounded-xl border shadow-sm">
              <span className="text-sm font-medium">{h.name}</span>
              <button onClick={() => deleteItem(h.id, 'habit')} className="text-muted-foreground hover:text-red-500"><Trash2 size={16}/></button>
            </div>
          ))}

          {/* AI Section */}
          <Card className="mt-6 bg-teal-50 dark:bg-teal-900/20 border-teal-100 dark:border-teal-800">
             <CardContent className="p-4">
                <h4 className="font-bold text-teal-700 dark:text-teal-400 text-sm flex gap-2 mb-2 items-center"><Sparkles size={16}/> Ide AI</h4>
                <div className="flex gap-2 mb-3">
                   <Input value={aiGoal} onChange={e => setAiGoal(e.target.value)} placeholder="Goals kamu..." className="h-8 text-xs bg-white dark:bg-zinc-900"/>
                   <Button onClick={handleAiGenerate} size="sm" className="h-8 bg-teal-600 hover:bg-teal-700 text-white">Saran</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                   {aiSuggestions.map((s, i) => (
                      <button key={i} onClick={() => {setNewItem(s); addHabit(s)}} className="text-xs bg-white dark:bg-zinc-900 border px-2 py-1 rounded-md cursor-pointer hover:text-teal-600 transition-colors">
                        + {s}
                      </button>
                   ))}
                </div>
             </CardContent>
          </Card>
        </TabsContent>

        {/* List Content: Tugas */}
        <TabsContent value="task" className="space-y-3 mt-4">
           <h3 className="font-semibold ml-1">Daftar Tugas</h3>
           {tasks.map(t => (
            <div key={t.id} className="flex justify-between items-center bg-card p-3 rounded-xl border shadow-sm">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">{t.name}</span>
                <div className="flex gap-2">
                  <span className="text-[10px] text-muted-foreground uppercase bg-slate-100 px-1.5 py-0.5 rounded font-bold tracking-wide">{t.type}</span>
                  {/* 3. Tampilkan Badge Prioritas disini */}
                  <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded font-bold tracking-wide ${
                    t.priority === 'high' ? 'bg-rose-100 text-rose-600' :
                    t.priority === 'low' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {t.priority || 'medium'}
                  </span>
                </div>
              </div>
              <button onClick={() => deleteItem(t.id, 'task')} className="text-muted-foreground hover:text-red-500"><Trash2 size={16}/></button>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}