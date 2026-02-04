import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { 
  Stethoscope, 
  Heart, 
  UserCog, 
  Users, 
  FlaskConical, 
  Pill,
  Activity,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoleOption {
  role: UserRole;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const roleOptions: RoleOption[] = [
  {
    role: 'admin',
    label: 'Administrator',
    description: 'System settings, staff management, reports',
    icon: UserCog,
    color: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20',
  },
  {
    role: 'doctor',
    label: 'Doctor',
    description: 'Patient consultations, prescriptions, lab orders',
    icon: Stethoscope,
    color: 'bg-info/10 text-info border-info/20 hover:bg-info/20',
  },
  {
    role: 'nurse',
    label: 'Nurse',
    description: 'Patient vitals, care tasks, monitoring',
    icon: Heart,
    color: 'bg-accent/10 text-accent border-accent/20 hover:bg-accent/20',
  },
  {
    role: 'receptionist',
    label: 'Front Desk',
    description: 'Check-in, appointments, billing status',
    icon: Users,
    color: 'bg-success/10 text-success border-success/20 hover:bg-success/20',
  },
  {
    role: 'lab',
    label: 'Lab Staff',
    description: 'Test requests, results, sample tracking',
    icon: FlaskConical,
    color: 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20',
  },
  {
    role: 'pharmacy',
    label: 'Pharmacy',
    description: 'Prescriptions, dispensing, inventory',
    icon: Pill,
    color: 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20',
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRoleSelect = (role: UserRole) => {
    login(role);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDI0di0yaDF6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
              <Activity className="h-9 w-9 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Mediflex</h1>
              <p className="text-white/80">Hospital Management System</p>
            </div>
          </div>
          
          <h2 className="text-3xl font-semibold text-white mb-4">
            Streamline Your Healthcare Operations
          </h2>
          <p className="text-lg text-white/80 max-w-md mb-8">
            A comprehensive platform for managing patients, appointments, 
            lab workflows, and hospital operations efficiently and securely.
          </p>

          <div className="space-y-4">
            {[
              'Patient registration & management',
              'Appointment scheduling & queue',
              'Lab & pharmacy integration',
              'Role-based secure access',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-white/90">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                  <Shield className="h-3.5 w-3.5" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Role Selection */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-16">
        <div className="max-w-lg mx-auto w-full">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Activity className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Mediflex</h1>
              <p className="text-sm text-muted-foreground">Hospital Management</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Welcome back</h2>
            <p className="text-muted-foreground">Select your role to access the dashboard</p>
          </div>

          <div className="grid gap-3">
            {roleOptions.map((option) => (
              <button
                key={option.role}
                onClick={() => handleRoleSelect(option.role)}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200',
                  'text-left group',
                  option.color
                )}
              >
                <div className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-xl',
                  'bg-current/10 transition-transform duration-200 group-hover:scale-110'
                )}>
                  <option.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{option.label}</h3>
                  <p className="text-sm opacity-80">{option.description}</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </div>
              </button>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            This is a demo. Select any role to explore the system.
          </p>
        </div>
      </div>
    </div>
  );
}
