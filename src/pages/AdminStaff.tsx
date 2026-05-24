import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, Column } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Plus, Users, Stethoscope, Heart, UserCog, FlaskConical, Pill, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types';

type StaffRow = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  department: string | null;
  specialization: string | null;
  status: string;
  joined_at: string;
  role: UserRole;
};

const emptyForm = { full_name: '', email: '', password: '', role: '' as UserRole | '', department: '', phone: '', specialization: '' };

export default function AdminStaff() {
  const [rows, setRows] = useState<StaffRow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    // Join profiles with primary user_role
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone, department, specialization, status, joined_at');
    const { data: roles } = await supabase.from('user_roles').select('user_id, role');
    const roleMap = new Map<string, UserRole>();
    (roles ?? []).forEach((r: any) => {
      // staff roles take precedence over patient
      const existing = roleMap.get(r.user_id);
      if (!existing || existing === 'patient') roleMap.set(r.user_id, r.role);
    });
    const merged: StaffRow[] = (profiles ?? [])
      .map((p: any) => ({ ...p, role: roleMap.get(p.id) ?? 'patient' as UserRole }))
      .filter((p) => p.role !== 'patient');
    setRows(merged);
  };
  useEffect(() => { load(); }, []);

  const filtered = rows.filter(s =>
    s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.email ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.department ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = async () => {
    if (!form.full_name || !form.email || !form.password || !form.role || !form.department) {
      return toast.error('Please fill in all required fields');
    }
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setSubmitting(true);
    const { data, error } = await supabase.functions.invoke('admin-create-user', { body: form });
    setSubmitting(false);
    if (error || (data && (data as any).error)) {
      return toast.error((data as any)?.error || error?.message || 'Failed to create staff');
    }
    toast.success('Staff member created');
    setIsAddOpen(false);
    setForm(emptyForm);
    load();
  };

  const getRoleIcon = (role: UserRole) => ({
    doctor: Stethoscope, nurse: Heart, admin: UserCog, receptionist: Users, lab: FlaskConical, pharmacy: Pill, patient: Users,
  }[role] || Users);
  const getRoleColor = (role: UserRole) => ({
    doctor: 'bg-info/10 text-info', nurse: 'bg-accent/10 text-accent', admin: 'bg-primary/10 text-primary',
    receptionist: 'bg-success/10 text-success', lab: 'bg-warning/10 text-warning',
    pharmacy: 'bg-destructive/10 text-destructive', patient: 'bg-muted text-muted-foreground',
  }[role] || 'bg-muted text-muted-foreground');

  const columns: Column<StaffRow>[] = [
    { key: 'full_name', header: 'Staff Member', render: (_, r) => {
      const Icon = getRoleIcon(r.role);
      return (
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getRoleColor(r.role)}`}><Icon className="h-5 w-5" /></div>
          <div><p className="font-medium">{r.full_name}</p><p className="text-xs text-muted-foreground">{r.email}</p></div>
        </div>
      );
    }},
    { key: 'role', header: 'Role', render: (v) => <span className="capitalize font-medium">{v}</span> },
    { key: 'department', header: 'Department', render: (v) => v || '—' },
    { key: 'specialization', header: 'Specialization', render: (v) => v || '—' },
    { key: 'phone', header: 'Phone', render: (v) => v || '—' },
    { key: 'status', header: 'Status', render: (v) => <StatusBadge variant={v === 'active' ? 'success' : 'default'}>{v as string}</StatusBadge> },
  ];

  const roleCounts = {
    doctor: rows.filter(r => r.role === 'doctor').length,
    nurse: rows.filter(r => r.role === 'nurse').length,
    receptionist: rows.filter(r => r.role === 'receptionist').length,
    lab: rows.filter(r => r.role === 'lab').length,
    admin: rows.filter(r => r.role === 'admin').length,
  };

  return (
    <DashboardLayout title="Staff Management" subtitle={`${rows.length} staff member${rows.length === 1 ? '' : 's'}`}>
      <div className="space-y-6 animate-fade-in">
        <div className="grid gap-4 md:grid-cols-5">
          {Object.entries(roleCounts).map(([role, count]) => {
            const Icon = getRoleIcon(role as UserRole);
            return (
              <Card key={role} className="card-interactive">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${getRoleColor(role as UserRole)}`}><Icon className="h-5 w-5" /></div>
                    <div><p className="text-2xl font-bold">{count}</p><p className="text-sm text-muted-foreground capitalize">{role === 'lab' ? 'Lab Staff' : `${role}s`}</p></div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by name, email, or department..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Add Staff</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Staff Member</DialogTitle>
                <DialogDescription>Create a new staff account with login credentials and a role assignment.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2"><Label>Full Name *</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Dr. John Doe" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john.doe@mediflex.com" /></div>
                  <div className="space-y-2"><Label>Temp Password *</Label><Input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Role *</Label>
                    <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as UserRole })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="doctor">Doctor</SelectItem>
                        <SelectItem value="nurse">Nurse</SelectItem>
                        <SelectItem value="receptionist">Receptionist</SelectItem>
                        <SelectItem value="lab">Lab Staff</SelectItem>
                        <SelectItem value="pharmacy">Pharmacy</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Department *</Label>
                    <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {['Cardiology','General Medicine','Laboratory','Pharmacy','Front Desk','Administration'].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Specialization</Label><Input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} /></div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)} disabled={submitting}>Cancel</Button>
                <Button onClick={handleAdd} disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Staff'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card><CardContent className="p-0">
          <DataTable data={filtered} columns={columns} emptyMessage="No staff members found" />
        </CardContent></Card>
      </div>
    </DashboardLayout>
  );
}
