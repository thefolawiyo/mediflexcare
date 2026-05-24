import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, Column } from '@/components/ui/data-table';
import { StatusBadge, getStatusVariant } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Search, Plus, Calendar as CalendarIcon, Clock, User, Stethoscope } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type Appt = {
  id: string;
  patient_id: string;
  doctor_id: string | null;
  doctor_name: string | null;
  department: string | null;
  appt_date: string;
  appt_time: string;
  status: string;
  type: string;
  notes: string | null;
  patients?: { name: string } | null;
};
type Patient = { id: string; name: string };

export default function Appointments() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Appt[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [form, setForm] = useState({ patient_id: '', date: '', time: '', department: '', type: 'consultation', notes: '' });

  const load = async () => {
    const [{ data: a }, { data: p }] = await Promise.all([
      supabase.from('appointments').select('*, patients(name)').order('appt_date', { ascending: false }).order('appt_time', { ascending: false }),
      supabase.from('patients').select('id, name').order('name'),
    ]);
    setRows((a as Appt[]) ?? []);
    setPatients((p as Patient[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const filtered = rows.filter(r => {
    const matches = (r.patients?.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.doctor_name ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'all') return matches;
    return matches && r.status === activeTab;
  });

  const handleStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('appointments').update({ status: status as any }).eq('id', id);
    if (error) return toast.error(error.message);
    toast.success(`Marked as ${status}`);
    load();
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patient_id || !form.date || !form.time) return toast.error('Patient, date, and time are required');
    const { error } = await supabase.from('appointments').insert({
      patient_id: form.patient_id,
      doctor_id: user?.role === 'doctor' ? user.id : null,
      doctor_name: user?.role === 'doctor' ? user.name : 'TBD',
      department: form.department || null,
      appt_date: form.date,
      appt_time: form.time,
      type: form.type as any,
      notes: form.notes || null,
    });
    if (error) return toast.error(error.message);
    toast.success('Appointment scheduled');
    setIsDialogOpen(false);
    setForm({ patient_id: '', date: '', time: '', department: '', type: 'consultation', notes: '' });
    load();
  };

  const columns: Column<Appt>[] = [
    { key: 'appt_time', header: 'Time', render: (v, r) => (
      <div><p className="font-medium font-mono">{(v as string).slice(0,5)}</p><p className="text-xs text-muted-foreground">{r.appt_date}</p></div>
    )},
    { key: 'patients', header: 'Patient', render: (_, r) => (
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center"><User className="h-4 w-4 text-primary" /></div>
        <span className="font-medium">{r.patients?.name || '—'}</span>
      </div>
    )},
    { key: 'doctor_name', header: 'Doctor', render: (_, r) => (
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-info/10 flex items-center justify-center"><Stethoscope className="h-4 w-4 text-info" /></div>
        <div><p className="font-medium">{r.doctor_name || 'TBD'}</p><p className="text-xs text-muted-foreground">{r.department}</p></div>
      </div>
    )},
    { key: 'type', header: 'Type', render: (v) => <span className="capitalize text-sm">{v}</span> },
    { key: 'status', header: 'Status', render: (v) => <StatusBadge variant={getStatusVariant(v as string)} pulse={v === 'in-progress'}>{(v as string).replace('-', ' ')}</StatusBadge> },
    { key: 'actions', header: 'Actions', render: (_, r) => (
      <div className="flex gap-2">
        {r.status === 'scheduled' && <Button size="sm" variant="outline" onClick={() => handleStatus(r.id, 'checked-in')}>Check In</Button>}
        {r.status === 'checked-in' && <Button size="sm" onClick={() => handleStatus(r.id, 'in-progress')}>Start</Button>}
        {r.status === 'in-progress' && <Button size="sm" variant="outline" onClick={() => handleStatus(r.id, 'completed')}>Complete</Button>}
      </div>
    )},
  ];

  const counts = {
    all: rows.length,
    scheduled: rows.filter(r => r.status === 'scheduled').length,
    'checked-in': rows.filter(r => r.status === 'checked-in').length,
    'in-progress': rows.filter(r => r.status === 'in-progress').length,
    completed: rows.filter(r => r.status === 'completed').length,
  };

  return (
    <DashboardLayout title="Appointments" subtitle="Manage patient appointments and queue">
      <div className="space-y-6 animate-fade-in">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: 'Scheduled', count: counts.scheduled, icon: CalendarIcon, color: 'info' },
            { label: 'Waiting', count: counts['checked-in'], icon: Clock, color: 'warning' },
            { label: 'In Progress', count: counts['in-progress'], icon: Stethoscope, color: 'success' },
            { label: 'Completed', count: counts.completed, icon: User, color: 'primary' },
          ].map((s) => (
            <Card key={s.label} className={`bg-${s.color}/5 border-${s.color}/20`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg bg-${s.color}/10 flex items-center justify-center`}>
                    <s.icon className={`h-5 w-5 text-${s.color}`} />
                  </div>
                  <div><p className="text-2xl font-bold">{s.count}</p><p className="text-sm text-muted-foreground">{s.label}</p></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by patient or doctor..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> New Appointment</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Schedule New Appointment</DialogTitle><DialogDescription>Create a new appointment.</DialogDescription></DialogHeader>
              <form className="grid gap-4 py-4" onSubmit={handleAdd}>
                <div className="space-y-2"><Label>Patient *</Label>
                  <Select value={form.patient_id} onValueChange={(v) => setForm({ ...form, patient_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                    <SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Date *</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Time *</Label><Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
                </div>
                <div className="space-y-2"><Label>Department</Label>
                  <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cardiology">Cardiology</SelectItem>
                      <SelectItem value="General Medicine">General Medicine</SelectItem>
                      <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                      <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="follow-up">Follow-up</SelectItem>
                      <SelectItem value="procedure">Procedure</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Schedule</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <CardHeader className="pb-0">
              <TabsList>
                <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
                <TabsTrigger value="scheduled">Scheduled ({counts.scheduled})</TabsTrigger>
                <TabsTrigger value="checked-in">Waiting ({counts['checked-in']})</TabsTrigger>
                <TabsTrigger value="in-progress">In Progress ({counts['in-progress']})</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className="p-0 pt-4">
              <DataTable data={filtered} columns={columns} emptyMessage="No appointments found" />
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </DashboardLayout>
  );
}
