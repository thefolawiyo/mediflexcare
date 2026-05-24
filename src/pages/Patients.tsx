import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, Column } from '@/components/ui/data-table';
import { StatusBadge, getStatusVariant } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Plus, Mail, Phone, Calendar } from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type Row = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  blood_type: string | null;
  address: string | null;
  emergency_contact: string | null;
  insurance_provider: string | null;
  insurance_id: string | null;
  status: string;
  registered_at: string;
};

const empty = {
  firstName: '', lastName: '', email: '', phone: '', dob: '', gender: '',
  bloodType: '', emergency: '', address: '', insurance: '', insuranceId: '',
};

export default function Patients() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<Row | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState(empty);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('registered_at', { ascending: false });
    if (error) toast.error(error.message);
    setRows((data as Row[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = rows.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.email ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName) return toast.error('First and last name required');
    const { error } = await supabase.from('patients').insert({
      name: `${form.firstName} ${form.lastName}`,
      email: form.email || null,
      phone: form.phone || null,
      date_of_birth: form.dob || null,
      gender: form.gender || null,
      blood_type: form.bloodType || null,
      address: form.address || null,
      emergency_contact: form.emergency || null,
      insurance_provider: form.insurance || null,
      insurance_id: form.insuranceId || null,
    });
    if (error) return toast.error(error.message);
    toast.success('Patient registered');
    setIsDialogOpen(false);
    setForm(empty);
    load();
  };

  const columns: Column<Row>[] = [
    { key: 'id', header: 'Patient ID', className: 'font-mono text-xs', render: (v) => String(v).slice(0, 8) },
    {
      key: 'name', header: 'Name',
      render: (_, r) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">{r.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
          </div>
          <div>
            <p className="font-medium">{r.name}</p>
            <p className="text-xs text-muted-foreground">{r.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'phone', header: 'Phone', render: (v) => v || '-' },
    { key: 'date_of_birth', header: 'DOB', render: (v) => v ? new Date(v as string).toLocaleDateString() : '-' },
    {
      key: 'blood_type', header: 'Blood Type',
      render: (v) => v ? <span className="inline-flex items-center justify-center h-7 w-10 rounded bg-destructive/10 text-destructive text-sm font-semibold">{v}</span> : '-',
    },
    { key: 'status', header: 'Status', render: (v) => <StatusBadge variant={getStatusVariant(v as string)}>{v}</StatusBadge> },
  ];

  return (
    <DashboardLayout title="Patients" subtitle={`${rows.length} registered patient${rows.length === 1 ? '' : 's'}`}>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by name or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Add Patient</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Register New Patient</DialogTitle>
                <DialogDescription>Enter patient information to create a new record.</DialogDescription>
              </DialogHeader>
              <form className="grid gap-4 py-4" onSubmit={handleAdd}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>First Name *</Label><Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Last Name *</Label><Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Date of Birth</Label><Input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Gender</Label>
                    <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Blood Type</Label>
                    <Select value={form.bloodType} onValueChange={(v) => setForm({ ...form, bloodType: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Emergency Contact</Label><Input value={form.emergency} onChange={(e) => setForm({ ...form, emergency: e.target.value })} /></div>
                </div>
                <div className="space-y-2"><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Insurance Provider</Label><Input value={form.insurance} onChange={(e) => setForm({ ...form, insurance: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Insurance ID</Label><Input value={form.insuranceId} onChange={(e) => setForm({ ...form, insuranceId: e.target.value })} /></div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Register Patient</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-0">
            <DataTable
              data={filtered}
              columns={columns}
              onRowClick={(r) => setSelected(r)}
              emptyMessage={loading ? 'Loading...' : 'No patients found'}
            />
          </CardContent>
        </Card>

        {selected && (
          <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Patient Details</DialogTitle></DialogHeader>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xl font-semibold text-primary">{selected.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{selected.name}</h3>
                    <StatusBadge variant={getStatusVariant(selected.status)} className="mt-1">{selected.status}</StatusBadge>
                  </div>
                </div>
                <div className="grid gap-3">
                  {selected.email && <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"><Mail className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{selected.email}</span></div>}
                  {selected.phone && <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"><Phone className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{selected.phone}</span></div>}
                  {selected.date_of_birth && <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"><Calendar className="h-4 w-4 text-muted-foreground" /><span className="text-sm">DOB: {new Date(selected.date_of_birth).toLocaleDateString()}{selected.blood_type && ` • Blood: ${selected.blood_type}`}</span></div>}
                </div>
                {selected.address && <div className="pt-4 border-t"><h4 className="text-sm font-medium mb-1">Address</h4><p className="text-sm text-muted-foreground">{selected.address}</p></div>}
                {selected.insurance_provider && <div className="pt-4 border-t"><h4 className="text-sm font-medium mb-1">Insurance</h4><p className="text-sm text-muted-foreground">{selected.insurance_provider} • {selected.insurance_id}</p></div>}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}
