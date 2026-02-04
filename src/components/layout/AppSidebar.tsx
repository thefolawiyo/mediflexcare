import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Stethoscope, 
  Heart,
  FlaskConical,
  Pill,
  Settings,
  FileText,
  UserCog,
  ClipboardList,
  Building2,
  LogOut,
  Activity
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'doctor', 'nurse', 'receptionist', 'lab', 'pharmacy'] },
  { title: 'Patients', href: '/patients', icon: Users, roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
  { title: 'Appointments', href: '/appointments', icon: Calendar, roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
  { title: 'My Patients', href: '/doctor/patients', icon: Stethoscope, roles: ['doctor'] },
  { title: 'Patient Care', href: '/nurse/care', icon: Heart, roles: ['nurse'] },
  { title: 'Vitals', href: '/nurse/vitals', icon: Activity, roles: ['nurse'] },
  { title: 'Lab Tests', href: '/lab', icon: FlaskConical, roles: ['admin', 'doctor', 'lab'] },
  { title: 'Pharmacy', href: '/pharmacy', icon: Pill, roles: ['admin', 'doctor', 'pharmacy'] },
  { title: 'Staff', href: '/admin/staff', icon: UserCog, roles: ['admin'] },
  { title: 'Reports', href: '/admin/reports', icon: FileText, roles: ['admin'] },
  { title: 'Departments', href: '/admin/departments', icon: Building2, roles: ['admin'] },
  { title: 'Audit Logs', href: '/admin/audit', icon: ClipboardList, roles: ['admin'] },
  { title: 'Settings', href: '/settings', icon: Settings, roles: ['admin', 'doctor', 'nurse', 'receptionist', 'lab', 'pharmacy'] },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const filteredNavItems = navItems.filter(item => item.roles.includes(user.role));

  const getRoleBadge = (role: UserRole) => {
    const roleLabels: Record<UserRole, string> = {
      admin: 'Administrator',
      doctor: 'Doctor',
      nurse: 'Nurse',
      receptionist: 'Front Desk',
      lab: 'Lab Staff',
      pharmacy: 'Pharmacy',
      patient: 'Patient',
    };
    return roleLabels[role];
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-gradient-sidebar border-r border-sidebar-border">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
            <Activity className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">Mediflex</h1>
            <p className="text-xs text-sidebar-foreground/60">Hospital Management</p>
          </div>
        </div>

        {/* User Info */}
        <div className="border-b border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-accent">
              <span className="text-sm font-medium text-sidebar-accent-foreground">
                {user.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
              <span className="inline-flex items-center rounded-full bg-sidebar-primary/20 px-2 py-0.5 text-xs font-medium text-sidebar-primary">
                {getRoleBadge(user.role)}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4 scrollbar-thin">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.title}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-sidebar-border p-4">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-destructive/20 hover:text-destructive"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
