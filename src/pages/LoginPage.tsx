import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Activity, Shield, Loader2, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const demoAccounts = [
  { label: 'Administrator', email: 'admin@mediflex.com', password: 'admin123' },
  { label: 'Doctor', email: 'doctor@mediflex.com', password: 'doctor123' },
  { label: 'Nurse', email: 'nurse@mediflex.com', password: 'nurse123' },
  { label: 'Front Desk', email: 'frontdesk@mediflex.com', password: 'frontdesk123' },
  { label: 'Lab Staff', email: 'lab@mediflex.com', password: 'lab123' },
  { label: 'Pharmacy', email: 'pharmacy@mediflex.com', password: 'pharmacy123' },
  { label: 'Patient', email: 'patient@mediflex.com', password: 'patient123' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleLogin = async (e: React.FormEvent, overrideEmail?: string, overridePassword?: string) => {
    e?.preventDefault?.();
    const em = overrideEmail ?? email;
    const pw = overridePassword ?? password;
    if (!em || !pw) return toast.error('Enter email and password');
    setLoading(true);
    let { error } = await signIn(em, pw);

    // If a demo account doesn't exist yet, seed it then retry once.
    if (error && demoAccounts.some(a => a.email === em)) {
      try {
        await supabase.functions.invoke('seed-demo-users');
        const retry = await signIn(em, pw);
        error = retry.error;
      } catch (e) { /* ignore */ }
    }

    setLoading(false);
    if (error) return toast.error(error);
    toast.success('Welcome back');
    navigate('/dashboard');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) return toast.error('All fields are required');
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);
    if (error) return toast.error(error);
    // New signups default to patient role (no role assigned until admin adds one — we treat absence as patient)
    toast.success('Account created. You can now sign in.');
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-primary relative overflow-hidden">
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
            A comprehensive platform for managing patients, appointments, lab workflows, and hospital operations.
          </p>
          <div className="space-y-4">
            {['Patient registration & management', 'Appointment scheduling & queue', 'Lab & pharmacy integration', 'Role-based secure access'].map((f) => (
              <div key={f} className="flex items-center gap-3 text-white/90">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                  <Shield className="h-3.5 w-3.5" />
                </div>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 py-12 overflow-y-auto">
        <div className="max-w-md mx-auto w-full">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Activity className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Mediflex</h1>
          </div>

          <h2 className="text-2xl font-semibold text-foreground mb-1">Welcome back</h2>
          <p className="text-muted-foreground mb-6">Sign in to access your dashboard</p>

          <Tabs defaultValue="signin" className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={(e) => handleLogin(e)} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@mediflex.com" autoComplete="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign in'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="suEmail">Email</Label>
                  <Input id="suEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="suPassword">Password</Label>
                  <Input id="suPassword" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create account'}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  New accounts default to patient access. Staff accounts must be created by an administrator.
                </p>
              </form>
            </TabsContent>
          </Tabs>

          <Card className="border-info/30 bg-info/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm text-info">
                <Info className="h-4 w-4" /> Demo accounts (click to sign in)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-1.5">
              {demoAccounts.map((a) => (
                <button
                  key={a.email}
                  type="button"
                  disabled={loading}
                  onClick={(e) => handleLogin(e as any, a.email, a.password)}
                  className="w-full flex items-center justify-between text-xs rounded-md px-2.5 py-1.5 hover:bg-info/10 transition-colors text-left"
                >
                  <span className="font-medium">{a.label}</span>
                  <span className="text-muted-foreground font-mono">{a.email}</span>
                </button>
              ))}
              <p className="text-xs text-muted-foreground pt-2">
                Password follows the pattern <code className="bg-muted px-1 rounded">[role]123</code>.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
