import { useState } from "react";
import { useTracker, type TaskType } from "@/context/TrackerContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus, Sparkles } from "lucide-react";

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

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-400">
      <h1 className="text-2xl font-bold">Pengaturan</h1>

      <Tabs defaultValue="habit" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="habit">Kebiasaan</TabsTrigger>
          <TabsTrigger value="task">Tugas</TabsTrigger>
        </TabsList>
        
        {/* Input Area */}
        <div className="mt-4 space-y-4">
          <div className="bg-card p-4 rounded-xl border shadow-sm space-y-3">
             <label className="text-xs font-bold uppercase text-muted-foreground">Tambah Baru</label>
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