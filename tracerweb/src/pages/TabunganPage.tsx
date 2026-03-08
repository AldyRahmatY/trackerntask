import { useState } from "react";
import { useTracker, type SavingFrequency, type SavingGoal } from "@/context/TrackerContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wallet, Target, Calendar, Plus, Minus, ArrowRight, Trash2, Edit2, X, Check, Timer, Coins } from "lucide-react";

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);
};

const formatRibuan = (value: string) => {
  const rawValue = value.replace(/\D/g, "");
  return rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export default function TabunganPage() {
  const { savings, addSavingGoal, addSavingTransaction, deleteSavingGoal, editSavingGoal } = useTracker();

  // --- STATE FORM TAMBAH BARU ---
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [freqType, setFreqType] = useState<SavingFrequency>("Harian");
  const [freqCount, setFreqCount] = useState("1");
  const [savingMode, setSavingMode] = useState<'date' | 'amount'>('amount');
  const [deadline, setDeadline] = useState("");
  const [plannedAmount, setPlannedAmount] = useState("");

  const [trxAmounts, setTrxAmounts] = useState<{ [key: string]: string }>({});

  // --- ✨ STATE MODE EDIT ---
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editTargetAmount, setEditTargetAmount] = useState("");
  const [editFreqType, setEditFreqType] = useState<SavingFrequency>("Harian");
  const [editFreqCount, setEditFreqCount] = useState("1");
  const [editSavingMode, setEditSavingMode] = useState<'date' | 'amount'>('amount');
  const [editDeadline, setEditDeadline] = useState("");
  const [editPlannedAmount, setEditPlannedAmount] = useState("");

  // --- FUNGSI TAMBAH ---
  const handleAddGoal = () => {
    const rawTargetAmount = Number(targetAmount.replace(/\./g, ""));
    const rawPlannedAmount = Number(plannedAmount.replace(/\./g, ""));
    
    if (!title || rawTargetAmount <= 0) return;
    if (savingMode === 'date' && !deadline) return;
    if (savingMode === 'amount' && rawPlannedAmount <= 0) return;

    addSavingGoal(
      title, rawTargetAmount, savingMode === 'date' ? deadline : new Date().toISOString(), 
      freqType, Number(freqCount), savingMode, rawPlannedAmount
    );

    setTitle(""); setTargetAmount(""); setDeadline(""); setPlannedAmount("");
  };

  // --- FUNGSI TRANSAKSI ---
  const handleTransaction = (goalId: string, type: "setor" | "tarik") => {
    const rawInput = trxAmounts[goalId] || "0";
    const amountVal = Number(rawInput.replace(/\./g, ""));
    if (amountVal <= 0) return;
    addSavingTransaction(goalId, type === "setor" ? amountVal : -amountVal, type === "setor" ? "Setor" : "Tarik");
    setTrxAmounts({ ...trxAmounts, [goalId]: "" });
  };

  // --- ✨ FUNGSI MULAI EDIT ---
  const startEditing = (goal: SavingGoal) => {
    setEditingGoalId(goal.id);
    setEditTitle(goal.title);
    setEditTargetAmount(formatRibuan(goal.targetAmount.toString()));
    setEditFreqType(goal.frequencyType);
    setEditFreqCount(goal.frequencyCount.toString());
    setEditSavingMode(goal.savingMode || 'date'); // Fallback ke date untuk data lama
    setEditDeadline(goal.deadlineDate);
    setEditPlannedAmount(goal.plannedAmount ? formatRibuan(goal.plannedAmount.toString()) : "");
  };

  // --- ✨ FUNGSI SIMPAN EDIT ---
  const saveEdit = () => {
    if (!editingGoalId) return;
    const rawTargetAmount = Number(editTargetAmount.replace(/\./g, ""));
    const rawPlannedAmount = Number(editPlannedAmount.replace(/\./g, ""));

    if (!editTitle || rawTargetAmount <= 0) return;
    if (editSavingMode === 'date' && !editDeadline) return;
    if (editSavingMode === 'amount' && rawPlannedAmount <= 0) return;

    editSavingGoal(editingGoalId, {
      title: editTitle,
      targetAmount: rawTargetAmount,
      deadlineDate: editSavingMode === 'date' ? editDeadline : new Date().toISOString(),
      frequencyType: editFreqType,
      frequencyCount: Number(editFreqCount),
      savingMode: editSavingMode,
      plannedAmount: rawPlannedAmount
    });
    setEditingGoalId(null);
  };

  const calculateSuggestion = (target: number, current: number, deadlineDate: string, type: string, count: number) => {
    const remainingMoney = target - current;
    if (remainingMoney <= 0) return 0;
    const diffDays = Math.ceil((new Date(deadlineDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return remainingMoney;
    if (type === "Harian") return remainingMoney / diffDays;
    if (type === "Mingguan") {
      const remainingWeeks = diffDays / 7;
      const totalSessions = Math.ceil(remainingWeeks * count);
      return totalSessions > 0 ? remainingMoney / totalSessions : remainingMoney;
    }
    return 0;
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500 mx-auto p-4 md:p-6 lg:p-8 max-w-3xl">
      
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wallet className="text-emerald-500" /> Tabungan
        </h1>
        <p className="text-muted-foreground text-sm">Rencanakan target finansialmu dengan cara yang paling nyaman.</p>
      </div>

      {/* FORM TAMBAH TARGET BARU */}
      <Card className="bg-slate-50 dark:bg-slate-900/50 border-dashed border-2">
        <CardContent className="p-5 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Target size={16} /> Buat Target Baru
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
               <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Nama Target</label>
               <Input placeholder="Cth: Beli Tiket Konser" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
               <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total yang ingin dicapai (Rp)</label>
               <Input type="text" placeholder="Cth: 1.500.000" value={targetAmount} onChange={(e) => setTargetAmount(formatRibuan(e.target.value))} />
            </div>
            <div className="space-y-1.5">
               <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Frekuensi Nabung</label>
               <div className="flex gap-2">
                 <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm" value={freqType} onChange={(e) => setFreqType(e.target.value as SavingFrequency)}>
                   <option value="Harian">Harian</option>
                   <option value="Mingguan">Mingguan</option>
                   <option value="Bebas">Bebas</option>
                 </select>
                 {freqType === "Mingguan" && <Input type="number" className="w-24" value={freqCount} onChange={(e) => setFreqCount(e.target.value)} />}
               </div>
            </div>

            {/* TOGGLE MODE MENABUNG (TAMBAH) */}
            <div className="md:col-span-2 mt-2 space-y-3 p-4 bg-white dark:bg-slate-950 rounded-xl border">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pilih Gaya Nabungmu:</label>
              <div className="flex gap-2">
                <Button variant={savingMode === 'amount' ? 'default' : 'outline'} onClick={() => setSavingMode('amount')} className={`flex-1 gap-2 ${savingMode === 'amount' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}>
                  <Coins size={16}/> Nominal Rutin
                </Button>
                <Button variant={savingMode === 'date' ? 'default' : 'outline'} onClick={() => setSavingMode('date')} className={`flex-1 gap-2 ${savingMode === 'date' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}>
                  <Timer size={16}/> Tentukan Deadline
                </Button>
              </div>

              {savingMode === 'amount' ? (
                <div className="space-y-1.5 pt-2 animate-in fade-in">
                  <label className="text-xs font-semibold">Rencana nabung per {freqType === 'Harian' ? 'hari' : 'sesi'} (Rp)</label>
                  <Input type="text" placeholder="Cth: 5.000" value={plannedAmount} onChange={(e) => setPlannedAmount(formatRibuan(e.target.value))} />
                </div>
              ) : (
                <div className="space-y-1.5 pt-2 animate-in fade-in">
                  <label className="text-xs font-semibold">Tenggat Waktu / Deadline</label>
                  <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                </div>
              )}
            </div>
          </div>
          <Button onClick={handleAddGoal} className="w-full gap-2 mt-2 font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300">
            <Plus size={18} /> Buat Target Tabungan
          </Button>
        </CardContent>
      </Card>

      {/* LIST KARTU TABUNGAN */}
      <div className="space-y-6">
        {savings.map((goal) => {
          
          // ✨ JIKA KARTU SEDANG DI-EDIT
          if (editingGoalId === goal.id) {
            return (
              <Card key={goal.id} className="border-emerald-500 shadow-md ring-2 ring-emerald-500/20">
                <CardContent className="p-5 space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="font-bold text-emerald-600 flex items-center gap-2"><Edit2 size={16}/> Edit Target</h3>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setEditingGoalId(null)} className="h-8 w-8 text-slate-500 hover:text-rose-500"><X size={16}/></Button>
                      <Button variant="ghost" size="icon" onClick={saveEdit} className="h-8 w-8 bg-emerald-100 text-emerald-700 hover:bg-emerald-200"><Check size={16}/></Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Nama Target</label>
                      <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total yang ingin dicapai (Rp)</label>
                      <Input type="text" value={editTargetAmount} onChange={(e) => setEditTargetAmount(formatRibuan(e.target.value))} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Frekuensi</label>
                      <div className="flex gap-2">
                        <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm" value={editFreqType} onChange={(e) => setEditFreqType(e.target.value as SavingFrequency)}>
                          <option value="Harian">Harian</option>
                          <option value="Mingguan">Mingguan</option>
                          <option value="Bebas">Bebas</option>
                        </select>
                        {editFreqType === "Mingguan" && <Input type="number" placeholder="brp kali/minggu" className="w-80" value={editFreqCount} onChange={(e) => setEditFreqCount(e.target.value)} />}
                      </div>
                    </div>

                    {/* TOGGLE MODE MENABUNG (EDIT) */}
                    <div className="md:col-span-2 mt-2 space-y-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Gaya Nabung:</label>
                      <div className="flex gap-2">
                        <Button variant={editSavingMode === 'amount' ? 'default' : 'outline'} onClick={() => setEditSavingMode('amount')} className={`flex-1 gap-2 ${editSavingMode === 'amount' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}>
                          <Coins size={14}/> Nominal Rutin
                        </Button>
                        <Button variant={editSavingMode === 'date' ? 'default' : 'outline'} onClick={() => setEditSavingMode('date')} className={`flex-1 gap-2 ${editSavingMode === 'date' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}>
                          <Timer size={14}/> Deadline
                        </Button>
                      </div>

                      {editSavingMode === 'amount' ? (
                        <div className="space-y-1.5 pt-2">
                          <label className="text-xs font-semibold">Rencana nabung per {editFreqType === 'Harian' ? 'hari' : 'sesi'} (Rp)</label>
                          <Input type="text" value={editPlannedAmount} onChange={(e) => setEditPlannedAmount(formatRibuan(e.target.value))} />
                        </div>
                      ) : (
                        <div className="space-y-1.5 pt-2">
                          <label className="text-xs font-semibold">Tenggat Waktu / Deadline</label>
                          <Input type="date" value={editDeadline} onChange={(e) => setEditDeadline(e.target.value)} />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          }

          // TAMPILAN KARTU NORMAL (TIDAK DI-EDIT)
          const progressPercent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
          const isComplete = progressPercent >= 100;
          const remainingAmount = goal.targetAmount - goal.currentAmount;
          
          let estimatedDays = 0;
          if (goal.savingMode === 'amount' && goal.plannedAmount) {
            estimatedDays = Math.ceil(remainingAmount / goal.plannedAmount);
            if (goal.frequencyType === 'Mingguan') estimatedDays = Math.ceil((estimatedDays / goal.frequencyCount) * 7);
          }

          const diffDays = Math.ceil((new Date(goal.deadlineDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          const suggestion = calculateSuggestion(goal.targetAmount, goal.currentAmount, goal.deadlineDate, goal.frequencyType, goal.frequencyCount);

          return (
            <Card key={goal.id} className="overflow-hidden shadow-md group">
              <CardContent className="">
                <div className="p-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{goal.title}</h3>
                      {goal.savingMode === 'amount' ? (
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1 mt-1 font-bold">
                          <Timer size={12} /> {isComplete ? "Selesai!" : `Estimasi selesai: ± ${estimatedDays} hari lagi`}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 font-medium">
                          <Calendar size={12} /> {diffDays > 0 ? `Sisa waktu: ${diffDays} hari lagi` : isComplete ? "Selesai tepat waktu" : "Tenggat Waktu Lewat"}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => startEditing(goal)} className="text-slate-400 hover:text-blue-500 h-8 w-8">
                        <Edit2 size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteSavingGoal(goal.id)} className="text-slate-400 hover:text-red-500 h-8 w-8">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-emerald-600">{formatRupiah(goal.currentAmount)}</span>
                      <span className="text-muted-foreground">{formatRupiah(goal.targetAmount)}</span>
                    </div>
                    <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                      <div className={`h-full transition-all duration-1000 ease-out ${isComplete ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-gradient-to-r from-blue-400 to-indigo-500'}`} style={{ width: `${progressPercent}%` }} />
                    </div>
                    <p className="text-[10px] text-right text-muted-foreground uppercase font-bold tracking-wider">{progressPercent.toFixed(1)}% Terkumpul</p>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/30 border-t p-5 space-y-4">
                  {!isComplete && goal.savingMode === 'date' && goal.frequencyType !== "Bebas" && (
                     <div className="flex items-start gap-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                       <ArrowRight size={18} className="mt-0.5 shrink-0" />
                       <div className="text-sm leading-snug">
                         Kamu perlu menyisihkan <strong className="font-black text-indigo-900 dark:text-indigo-100">{formatRupiah(suggestion)}</strong> / {goal.frequencyType === 'Mingguan' ? 'Sesi' : 'Hari'} agar target tercapai tepat waktu.
                       </div>
                     </div>
                  )}

                  {!isComplete && goal.savingMode === 'amount' && (
                     <div className="flex items-start gap-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
                       <Coins size={18} className="mt-0.5 shrink-0" />
                       <div className="text-sm leading-snug">
                         Rencana menabung: <strong className="font-black text-emerald-900 dark:text-emerald-100">{formatRupiah(goal.plannedAmount || 0)}</strong> / {goal.frequencyType === 'Mingguan' ? 'Sesi' : 'Hari'}.
                       </div>
                     </div>
                  )}

                  {isComplete && (
                    <div className="bg-emerald-50 text-emerald-700 p-3.5 rounded-xl text-sm font-bold border border-emerald-200 flex items-center gap-2">
                      <Target size={18}/> Target Tercapai! Kerja bagus!
                    </div>
                  )}

                  <div className="flex gap-2 items-center pt-2">
                    <Input type="text" placeholder="Nominal (Cth: 50.000)" className="bg-white dark:bg-slate-950 font-medium" value={trxAmounts[goal.id] || ""} onChange={(e) => setTrxAmounts({ ...trxAmounts, [goal.id]: formatRibuan(e.target.value) })} />
                    <Button onClick={() => handleTransaction(goal.id, "tarik")} variant="outline" className="border-rose-200 text-rose-600 hover:bg-rose-50"><Minus size={16} /></Button>
                    <Button onClick={() => handleTransaction(goal.id, "setor")} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"><Plus size={16} className="mr-1" /> Setor</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}