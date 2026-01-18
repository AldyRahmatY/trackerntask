import { useState } from "react";
import { useTracker, type TaskType } from "@/context/TrackerContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus, Sparkles, HelpCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";

export default function SettingsPage() {
  const { habits, tasks, addHabit, addTask, deleteItem } = useTracker();
  const [newItem, setNewItem] = useState("");
  const [taskType, setTaskType] = useState<TaskType>('Harian');
  const [activeTab, setActiveTab] = useState("habit");

  // State AI
  const [aiGoal, setAiGoal] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  const handleAdd = () => {
    if (!newItem.trim()) return;
    if (activeTab === 'habit') addHabit(newItem);
    else addTask(newItem, taskType);
    setNewItem("");
  };

  const handleAiGenerate = async () => {
    // Simulasi Gemini AI
    setAiSuggestions(["Minum Air 2L", "Olahraga 30 Menit", "Maksimal Screen Time 2 Jam"]);
  };

  const helpContent = {
    habit: {
      title: "Apa itu Kebiasaan?",
      description: "Kegiatan rutin untuk membangun konsistensi jangka panjang. Tidak ada kata 'selesai', tujuannya untuk dilakukan setiap hari."
    },
    task: {
      title: "Apa itu Tugas?",
      description: "Kegiatan dengan target spesifik yang harus diselesaikan.",
      types: [
        { label: "Harian", desc: "Harus diselesaikan hari ini. Reset otomatis saat ganti hari." },
        { label: "Mingguan", desc: "Target 1x seminggu. Reset setiap hari Senin." },
        { label: "Bulanan", desc: "Target 1x sebulan. Reset setiap awal bulan." },
        { label: "Sekali Waktu", desc: "Tugas sekali selesai. Tugas akan dihapus otomatis 5 jam setelah dicentang." },
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
        
        {/* Input Area */}
        <div className="mt-4 space-y-4">
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
                   
                   {/* Jika Tab Tugas aktif, tampilkan detail tipe-tipenya */}
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
             
             {activeTab === 'task' && (
               <div className="flex gap-2">
                 {(['Harian', 'Mingguan', 'Bulanan', 'Sekali Waktu'] as TaskType[]).map(type => (
                   <button 
                    key={type} 
                    onClick={() => setTaskType(type)}
                    className={`px-3 py-1 rounded text-xs border ${taskType === type ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>
                    {type}
                   </button>
                 ))}
               </div>
             )}

             <Button onClick={handleAdd} className="w-full gap-2"><Plus size={16}/> Tambah</Button>
          </div>

        {/* List Content */}
        <TabsContent value="habit" className="space-y-3 mt-4">
          <h3 className="font-semibold">Daftar Kebiasaan</h3>
          {habits.map(h => (
            <div key={h.id} className="flex justify-between items-center bg-card p-3 rounded-lg border">
              <span className="text-sm">{h.name}</span>
              <button onClick={() => deleteItem(h.id, 'habit')} className="text-muted-foreground hover:text-red-500"><Trash2 size={16}/></button>
            </div>
          ))}

          {/* AI Section Specific to Habit */}
          <Card className="mt-6 bg-teal-400/40 dark:bg-teal-700/60">
             <CardContent className="p-4">
                <h4 className="font-bold text-teal-800 dark:text-teal-200 text-sm flex gap-2 mb-2"><Sparkles size={16}/> AI Ideas</h4>
                <div className="flex gap-2 mb-2">
                   <Input value={aiGoal} onChange={e => setAiGoal(e.target.value)} placeholder="Goals kamu..." className="h-8 text-xs bg-white dark:bg-teal-800"/>
                   <Button onClick={handleAiGenerate} size="sm" className="h-8 bg-teal-600 text-white">Saran</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                   {aiSuggestions.map((s, i) => (
                      <span key={i} onClick={() => {setNewItem(s); addHabit(s)}} className="text-xs bg-white text-teal-600 border px-2 py-1 rounded cursor-pointer hover:text-teal-950">+ {s}</span>
                   ))}
                </div>
             </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="task" className="space-y-3 mt-4">
           <h3 className="font-semibold">Daftar Tugas</h3>
           {tasks.map(t => (
            <div key={t.id} className="flex justify-between items-center bg-card p-3 rounded-lg border">
              <div className="flex flex-col">
                <span className="text-sm font-medium">{t.name}</span>
                <span className="text-[10px] text-muted-foreground uppercase">{t.type}</span>
              </div>
              <button onClick={() => deleteItem(t.id, 'task')} className="text-muted-foreground hover:text-red-500"><Trash2 size={16}/></button>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}