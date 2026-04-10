import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Calendar, Settings, 
  LogOut, Menu, ChevronLeft, HelpCircle, Bell, MessageSquare
} from 'lucide-react';

const menuItems = [
  { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/patients', icon: Users, label: 'Patients' },
  { path: '/admin/appointments', icon: Calendar, label: 'Appointments' },
  { path: '/admin/conversations', icon: MessageSquare, label: 'Conversations' },
  { path: '/admin/faqs', icon: HelpCircle, label: 'FAQs' },
  { path: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [admin, setAdmin] = useState<any>(null);

  useEffect(() => {
    const adminData = localStorage.getItem('admin');
    if (!adminData) {
      navigate('/admin');
    } else {
      setAdmin(JSON.parse(adminData));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    navigate('/admin');
  };

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Responsive */}
      <aside className={`
        fixed lg:relative z-50 h-screen
        ${sidebarCollapsed ? 'w-16' : 'w-64'}
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        bg-gradient-to-b from-teal-700 to-teal-900 text-white transition-all duration-300 flex flex-col
      `}>
        <div className="p-3 md:p-4 flex items-center justify-between">
          {!sidebarCollapsed && (
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <div className="w-8 md:w-10 h-8 md:h-10 rounded-lg md:rounded-xl bg-white/20 flex items-center justify-center">
                <span className="font-bold text-sm md:text-base">AS</span>
              </div>
              <span className="font-bold text-lg hidden md:block">Admin</span>
            </Link>
          )}
          <button 
            onClick={() => setMobileMenuOpen(false)} 
            className="p-2 hover:bg-white/10 rounded-lg lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)} 
            className="p-2 hover:bg-white/10 rounded-lg hidden lg:block"
          >
            {sidebarCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 px-2 md:px-3 py-2 md:py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 md:gap-3 px-2 md:px-4 py-2.5 md:py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
                title={item.label}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-2 md:p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 md:gap-3 px-2 md:px-4 py-2.5 md:py-3 w-full text-white/70 hover:bg-white/10 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && (
              <span>Logout</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - Responsive */}
        <header className="bg-white shadow-sm border-b border-slate-100 px-3 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 hover:bg-slate-100 rounded-lg lg:hidden"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-slate-800">
                {menuItems.find(item => item.path === location.pathname)?.label || 'Admin'}
              </h1>
              <p className="text-xs md:text-sm text-slate-500 hidden sm:block">Welcome back, {admin.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl">
              <Bell className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </header>

        {/* Content - Responsive padding */}
        <main className="flex-1 p-3 md:p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}