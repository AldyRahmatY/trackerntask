// import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
// import Page from "@/app/dashboard/page" 

// function App() {
//   return (
//     <SidebarProvider>
//       <main className="w-full">
//         <div className="">
//             {/* Panggil konten halaman di sini */}
//             <Page /> 
//         </div>
//       </main>
//     </SidebarProvider>
//   )
// }

// export default App

import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { TrackerProvider } from "@/context/TrackerContext";
// Pastikan path import ini sesuai dengan lokasi file langkah 1
import { ThemeProvider, useTheme } from "@/components/theme-provider"; 
import DashboardPage from "@/pages/DashboardPage";
import SettingsPage from "@/pages/SettingsPage";
import CalendarPage from "@/pages/CalendarPage";
import ReportPage from "@/pages/ReportPage";
import SchedulePage from "@/pages/SchedulePage";
import { Home, Calendar, BarChart2, Settings, Moon, Sun, NotebookPen } from "lucide-react";

// --- KOMPONEN TOMBOL THEME ---
const ModeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex flex-col items-center justify-center w-full md:w-16 md:h-16 md:rounded-xl transition-all text-muted-foreground hover:bg-muted/50 hover:text-primary md:mt-auto"
      title="Ganti Tema"
    >
      <div className="p-1 transition-transform relative">
        {/* Logika Icon Berubah */}
        {theme === 'dark' ? (
             <Moon size={24} className="transition-all" />
        ) : (
             <Sun size={24} className="transition-all text-orange-500" />
        )}
      </div>
      <span className="text-[10px] font-medium mt-1">
        {theme === 'dark' ? 'Gelap' : 'Terang'}
      </span>
    </button>
  );
};

// --- NAVBAR ---
const Navbar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  
  const navItems = [
    { path: "/", icon: <Home size={24}/>, label: "Tugasmu" },
    { path: "/calendar", icon: <Calendar size={24}/>, label: "Kalender" },
    { path: "/report", icon: <BarChart2 size={24}/>, label: "Rapor" },
    { path: "/schedule", icon: <NotebookPen size={24}/>, label: "Jadwal" },
  ];

  const linkClass = (path: string) => `flex flex-col items-center justify-center w-full md:w-16 md:h-16 md:rounded-md transition-all ${
    isActive(path) 
      ? 'text-teal-500 font-bold' 
      : 'text-muted-foreground hover:text-teal-500 hover:bg-muted/50'
  }`;

  return (
    
    <nav className="fixed bottom-0 left-0 w-full bg-background border-t h-20 flex justify-around items-center z-50 md:w-24 md:h-screen md:flex-col md:border-t-0 md:border-r md:justify-start md:pt-10 md:gap-4 md:top-0">
      
      {/* Menu Items */}
      {navItems.map((item) => (
        <Link 
          key={item.path} 
          to={item.path}
          // --- DISINI YANG MENGATUR ROUNDED (md:rounded-xl) ---
          className={`flex flex-col items-center justify-center w-full md:w-16 md:h-16 md:rounded-md transition-all ${
            isActive(item.path) 
              ? 'text-teal-500 font-bold' 
              : 'text-muted-foreground hover:text-teal-500 hover:bg-muted/50'
          }`}
        >
          <div className={`p-1 ${isActive(item.path) ? 'md:-translate-y-0' : ''} transition-transform`}>
            {item.icon}
          </div>
          <span className="text-[10px] font-medium mt-1">{item.label}</span>
        </Link>
      ))}

      {/* Separator / Spacer di Desktop supaya Toggle ke bawah */}
      <div className="hidden md:block flex-1"></div>
      <Link 
        to="/settings"
        className={linkClass("/settings")}
      >
        <div className={`p-1 ${isActive("/settings") ? 'md:-translate-y-0' : ''} transition-transform`}>
          <Settings size={24}/>
        </div>
        <span className="text-[10px] font-medium mt-1">Settings</span>
      </Link>

      {/* Theme Toggle Button */}
      <div className="md:mb-10 w-full md:w-auto flex justify-center border-l md:border-l-0 pl-2 md:pl-0 ml-2 md:ml-0">
        <ModeToggle />
        
      </div>

    </nav>
  );
};

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <TrackerProvider>
        <BrowserRouter>
          {/* Container Luar: Mengatur Background & Layout Dasar */}
          <div className="min-h-screen bg-gray-50/50 dark:bg-zinc-950 font-sans text-foreground flex flex-col md:flex-row transition-colors duration-300 md:pl-20">
            
            {/* Navbar: Di Bawah (Mobile) atau Di Samping (Desktop) */}
            <Navbar />
            <main className="flex-1 w-full min-h-screen relative">
              
              {/* Scrollable Area */}
              {/* Tambahkan 'max-w-6xl' agar di layar raksasa tidak terlalu lebar ke samping */}
              <div className="h-full w-full max-w-6xl mx-auto p-4 pb-24 md:p-8 lg:p-12 overflow-y-auto">
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/report" element={<ReportPage />} />
                  <Route path="/schedule" element={<SchedulePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Routes>
              </div>
            
            </main>
          </div>
        </BrowserRouter>
      </TrackerProvider>
    </ThemeProvider>
  );
}

export default App;