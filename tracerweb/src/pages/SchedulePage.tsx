import { useState } from "react";
import { useTracker, type TaskType, type Task } from "@/context/TrackerContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus, Sparkles, HelpCircle, Check, Clock, Edit2, X, NotebookPen } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const isValidTimeRange = (start: string, end: string) => start <= end;

export default function SettingsPage() {
  const { habits, tasks, addHabit, addTask, deleteItem, editHabit, editTask } = useTracker();
  
  const [timeGateStart, setTimeGateStart] = useState("");
  const [timeGateEnd, setTimeGateEnd] = useState("");
  const [taskType, setTaskType] = useState<TaskType>('Harian');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newItem, setNewItem] = useState("");
  const [activeTab, setActiveTab] = useState("habit");

  // State AI
  const [aiGoal, setAiGoal] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  // ✨ STATE UNTUK EDIT KEBIASAAN
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editTimeStart, setEditTimeStart] = useState("");
  const [editTimeEnd, setEditTimeEnd] = useState("");
  const [editHabitName, setEditHabitName] = useState("");

  // ✨ STATE UNTUK EDIT TUGAS
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskName, setEditTaskName] = useState("");
  const [editTaskTypeObj, setEditTaskTypeObj] = useState<TaskType>('Harian');
  const [editTaskPriority, setEditTaskPriority] = useState<'low'|'medium'|'high'>('medium');




  // Di fungsi handleAdd():
const handleAdd = () => {
  if (!newItem.trim()) return;

  if (activeTab === 'habit') {
    // Check validasi waktu
    if (timeGateStart && timeGateEnd && !isValidTimeRange(timeGateStart, timeGateEnd)) {
      alert("Jam Tutup tidak boleh lebih awal dari Jam Buka!");
      return;
    }

    addHabit(newItem, timeGateStart || undefined, timeGateEnd || undefined);
    setTimeGateStart("");
    setTimeGateEnd("");
  } else {
    addTask(newItem, taskType, priority);
  }

  setNewItem("");
};

  const handleAiGenerate = async () => {
    setAiSuggestions(["Minum Air 2L", "Olahraga 30 Menit", "Maksimal Screen Time 2 Jam"]);
  };

  // --- ✨ FUNGSI EDIT KEBIASAAN ---
  const startEditHabit = (habit: any) => {
    setEditingHabitId(habit.id);
    setEditHabitName(habit.name);
    setEditTimeStart(habit.timeGateStart || "");
    setEditTimeEnd(habit.timeGateEnd || "");
  };

  const saveEditHabit = () => {
    if (editingHabitId && editHabitName.trim()) {
      // Check validasi waktu edit
      if (editTimeStart && editTimeEnd && !isValidTimeRange(editTimeStart, editTimeEnd)) {
        alert("Jam Tutup tidak boleh lebih awal dari Jam Buka!");
        return;
      }

      editHabit(editingHabitId, editHabitName, editTimeStart || undefined, editTimeEnd || undefined);
      setEditingHabitId(null);
    }
  };

  // --- ✨ FUNGSI EDIT TUGAS ---
  const startEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTaskName(task.name);
    setEditTaskTypeObj(task.type || 'Harian');
    setEditTaskPriority(task.priority || 'medium');
  };

  const saveEditTask = () => {
    if (editingTaskId && editTaskName.trim()) {
      editTask(editingTaskId, { 
        name: editTaskName, 
        type: editTaskTypeObj, 
        priority: editTaskPriority 
      });
      setEditingTaskId(null);
    }
  };

  // Helper untuk UI Tipe Tugas
  const taskTypeOptions = [
    { id: 'Harian', label: 'Harian' },
    { id: 'Mingguan', label: 'Mingguan' },
    { id: 'Bulanan', label: 'Bulanan' },
    { id: 'Sekali Waktu', label: 'Sekali Waktu' },
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
        <h1 className="text-2xl font-bold">
          <NotebookPen size={24} className="inline-block mr-2 text-emerald-500"/>
          Jadwal</h1>
        <p className="text-muted-foreground">Buat jadwalmu dan mulai konsisten untuk perubahanmu.</p>
      </div>

      <Tabs defaultValue="habit" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="habit">Kebiasaan</TabsTrigger>
          <TabsTrigger value="task">Tugas</TabsTrigger>
        </TabsList>
        
        {/* INPUT AREA TAMBAH BARU */}
        <div className="mt-4 p-5 bg-card rounded-xl border shadow-sm space-y-4">
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
          
          {/* OPSI KHUSUS TUGAS */}
          {activeTab === 'task' && (
            <div className="space-y-4 pt-2 border-t">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {taskTypeOptions.map((opt) => (
                  <button 
                   key={opt.id} 
                   onClick={() => setTaskType(opt.id as TaskType)}
                   className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border flex items-center gap-1.5 transition-all ${
                     taskType === opt.id ? 'bg-primary/10 border-primary text-primary' : 'bg-background border-border text-muted-foreground hover:bg-muted'
                   }`}>
                   <Clock size={14} /> {opt.label}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Prioritas</label>
                 <div className="flex gap-2">
                   {[
                     { id: 'low', label: 'Rendah', color: 'bg-blue-100 text-blue-700 border-blue-200 ring-blue-400 dark:bg-blue-500/20 dark:text-blue-400' },
                     { id: 'medium', label: 'Sedang', color: 'bg-amber-100 text-amber-700 border-amber-200 ring-amber-400 dark:bg-amber-500/20 dark:text-amber-400' },
                     { id: 'high', label: 'Tinggi', color: 'bg-rose-100 text-rose-700 border-rose-200 ring-rose-400 dark:bg-rose-500/20 dark:text-rose-400' }
                   ].map(p => (
                     <button
                       key={p.id}
                       onClick={() => setPriority(p.id as any)}
                       className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                         priority === p.id ? `${p.color} ring-2 ring-offset-1` : 'bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-muted-foreground dark:hover:bg-gray-600/50 hover:bg-gray-100'
                       }`}
                     >
                       {p.label}
                     </button>
                   ))}
                 </div>
               </div>
            </div>
          )}


        {/* 2. TARUH DI SINI (Tepat di bawah Form Utama) */}
        {activeTab === 'habit' && (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">Jam Buka</label>
              <Input 
                type="time" 
                value={timeGateStart} 
                onChange={(e) => setTimeGateStart(e.target.value)} 
                onClick={(e) => e.currentTarget.showPicker()}
                className="h-9 text-xs bg-background cursor-pointer"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">Jam Tutup</label>
                <Input 
                  type="time" 
                  value={timeGateEnd} 
                  min={timeGateStart} // Batasi agar tidak bisa memilih jam sebelum Jam Buka
                  onChange={(e) => setTimeGateEnd(e.target.value)} 
                  onClick={(e) => e.currentTarget.showPicker()}
                  className="h-9 text-xs bg-background cursor-pointer"
                />
            </div>
          </div>
        )}
        <Button onClick={handleAdd} className="w-full gap-2 font-bold"><Plus size={16}/> Tambah</Button>
      </div>

        {/* LIST CONTENT: KEBIASAAN */}
        <TabsContent value="habit" className="space-y-3 mt-4">
          <h3 className="font-semibold ml-1">Daftar Kebiasaan</h3>
          {habits.map(h => {
            // ✨ FORM JIKA MODE EDIT KEBIASAAN AKTIF
            if (editingHabitId === h.id) {

            }

            // TAMPILAN KEBIASAAN
            return (
              <div key={h.id} className="p-3 rounded-lg border bg-card flex flex-col gap-2">
                {editingHabitId === h.id ? (
                  /* === JIKA SEDANG DIEDIT === */
                  <div className="flex flex-col gap-2">
                    <Input
                      value={editHabitName}
                      onChange={(e) => setEditHabitName(e.target.value)}
                      placeholder="Nama kebiasaan..."
                    />
                    
                    {/* Form Input Jam 1 Baris */}
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="time"
                        value={editTimeStart}
                        onChange={(e) => setEditTimeStart(e.target.value)}
                        onClick={(e) => e.currentTarget.showPicker()}
                        className="h-8 text-xs cursor-pointer"
                      />
                      <Input
                        type="time"
                        value={editTimeEnd}
                        onChange={(e) => setEditTimeEnd(e.target.value)}
                        onClick={(e) => e.currentTarget.showPicker()}
                        className="h-8 text-xs cursor-pointer"
                      />
                    </div>

                    <div className="flex justify-end gap-2 mt-1">
                      <Button size="sm" variant="outline" onClick={() => setEditingHabitId(null)}>Batal</Button>
                      <Button size="sm" onClick={saveEditHabit}>Simpan</Button>
                    </div>
                  </div>
                ) : (
                  /* === TAMPILAN NORMAL (INFORMATIF) === */
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-sm">{h.name}</span>
                      
                      {/* Badge Informasi Jam */}
                      {(h.timeGateStart || h.timeGateEnd) ? (
                        <span className="text-[11px] text-muted-foreground flex items-center">
                          {h.timeGateStart || "00:00"} - {h.timeGateEnd || "23:59"}
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">
                          Bebas 24 Jam
                        </span>
                      )}
                    </div>

                    {/* Tombol Aksi */}
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => startEditHabit(h)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteItem(h.id, 'habit')}>
                        Hapus
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* AI Section (Tetap ada) */}
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

        {/* LIST CONTENT: TUGAS */}
        <TabsContent value="task" className="space-y-3 mt-4">
           <h3 className="font-semibold ml-1">Daftar Tugas</h3>
           {tasks.map(t => {
            
            // ✨ FORM JIKA MODE EDIT TUGAS AKTIF
            if (editingTaskId === t.id) {
              return (
                <div key={t.id} className="flex flex-col gap-3 bg-card p-4 rounded-xl border border-blue-500 shadow-sm ring-2 ring-blue-500/20">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h4 className="text-xs font-bold text-blue-600 flex items-center gap-1"><Edit2 size={14}/> Edit Tugas</h4>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setEditingTaskId(null)} className="h-6 w-6 text-slate-400 hover:text-rose-500"><X size={14}/></Button>
                      <Button variant="ghost" size="icon" onClick={saveEditTask} className="h-6 w-6 bg-blue-50 text-blue-600 hover:bg-blue-100"><Check size={14}/></Button>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Nama Tugas</label>
                    <Input value={editTaskName} onChange={e => setEditTaskName(e.target.value)} className="h-8 text-sm bg-background" autoFocus />
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tipe</label>
                      <select className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs shadow-sm" value={editTaskTypeObj} onChange={e => setEditTaskTypeObj(e.target.value as TaskType)}>
                        <option value="Harian">Harian</option>
                        <option value="Mingguan">Mingguan</option>
                        <option value="Bulanan">Bulanan</option>
                        <option value="Sekali Waktu">Sekali Waktu</option>
                      </select>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Prioritas</label>
                      <select className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs shadow-sm" value={editTaskPriority} onChange={e => setEditTaskPriority(e.target.value as any)}>
                        <option value="low">Rendah</option>
                        <option value="medium">Sedang</option>
                        <option value="high">Tinggi</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            }

            // TAMPILAN TUGAS NORMAL
            return (
              <div key={t.id} className="flex justify-between items-center bg-card p-3 rounded-xl border shadow-sm group">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">{t.name}</span>
                  <div className="flex gap-2">
                    {/* Label Tipe (Harian/Mingguan dll) */}
                    <span className="text-[10px] uppercase px-1.5 py-0.5 rounded font-bold tracking-wide bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {t.type}
                    </span>
                    
                    {/* Label Prioritas (Tinggi/Sedang/Rendah) dengan Support Dark Mode */}
                    <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded font-bold tracking-wide ${
                      t.priority === 'high' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' :
                      t.priority === 'low' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' : 
                      'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                    }`}>
                      {t.priority === 'high' ? 'Tinggi' : t.priority === 'low' ? 'Rendah' : 'Sedang'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" onClick={() => startEditTask(t)} className="h-8 w-8 text-slate-400 hover:text-blue-500"><Edit2 size={16}/></Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteItem(t.id, 'task')} className="h-8 w-8 text-slate-400 hover:text-red-500"><Trash2 size={16}/></Button>
                </div>
              </div>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}