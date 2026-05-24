import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, Column } from '@/components/ui/data-table';
import { StatusBadge, getStatusVariant } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Search, Plus, FlaskConical, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type Row = {
  id: string;
  patient_id: string;
  test_type: string;
  ordered_by_name: string | null;
  status: string;
  priority: string;
  ordered_at: string;
  completed_at: string | null;
  results: string | null;
  patients?: { name: string } | null;
};

export default function LabTests() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [patients, setPatients] = useState<{ id: string; name: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Row | null>(null);
  const [resultsText, setResultsText] = useState('');
  const [form, setForm] = useState({ patient_id: '', test_type: '', priority: 'routine' });

  const load = async () => {
    const [{ data: t }, { data: p }] = await Promise.all([
      supabase.from('lab_tests').select('*, patients(name)').order('ordered_at', { ascending: false }),
      supabase.from('patients').select('id, name').order('name'),
    ]);
    setRows((t as Row[]) ?? []);
    setPatients((p as any) ?? []);
  };
  useEffect(() => { load(); }, []);

  const filtered = rows.filter(t => {
    const m = (t.patients?.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.test_type.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'all') return m;
    return m && t.status === activeTab;
  });

  const updateStatus = async (id: string, status: string) => {
    const patch: any = { status };
    if (status === 'completed') patch.completed_at = new Date().toISOString();
    const { error } = await supabase.from('lab_tests').update(patch).eq('id', id);
    if (error) return toast.error(error.message);
    toast.success(`Test ${status}`);
    load();
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patient_id || !form.test_type) return toast.error('Patient and test type required');
    const { error } = await supabase.from('lab_tests').insert({
      patient_id: form.patient_id,
      test_type: form.test_type,
      priority: form.priority as any,
      ordered_by: user?.id ?? null,
      ordered_by_name: user?.name ?? null,
    });
    if (error) return toast.error(error.message);
    toast.success('Lab test ordered');
    setIsDialogOpen(false);
    setForm({ patient_id: '', test_type: '', priority: 'routine' });
    load();
  };

  const saveResults = async () => {
    if (!selected || !resultsText) return toast.error('Enter results');
    const { error } = await supabase.from('lab_tests').update({
      results: resultsText, status: 'completed', completed_at: new Date().toISOString(),
    }).eq('id', selected.id);
    if (error) return toast.error(error.message);
    toast.success('Results saved');
    setSelected(null);
    setResultsText('');
    load();
  };

  const columns: Column<Row>[] = [
    { key: 'patients', header: 'Patient', render: (_, r) => <span className="font-medium">{r.patients?.name || '—'}</span> },
    { key: 'test_type', header: 'Test Type' },
    { key: 'ordered_by_name', header: 'Ordered By', render: (v) => <span className="text-sm text-muted-foreground">{v || '—'}</span> },
    { key: 'priority', header: 'Priority', render: (v) => <StatusBadge variant={getStatusVariant(v as string)} pulse={v === 'stat'}>{(v as string).toUpperCase()}</StatusBadge> },
    { key: 'status', header: 'Status', render: (v) => <StatusBadge variant={getStatusVariant(v as string)}>{(v as string).replace('-', ' ')}</StatusBadge> },
    { key: 'actions', header: 'Actions', render: (_, r) => (
      <div className="flex gap-2">
        {r.status === 'pending' && <Button size="sm" onClick={() => updateStatus(r.id, 'in-progress')}>Start</Button>}
        {r.status === 'in-progress' && <Button size="sm" variant="outline" onClick={() => { setSelected(r); setResultsText(r.results ?? ''); }}>Enter Results</Button>}
        {r.status === 'completed' && <Button size="sm" variant="ghost" onClick={() => { setSelected(r); setResultsText(r.results ?? ''); }}>View</Button>}
      </div>
    )},
  ];

  const counts = {
    all: rows.length,
    pending: rows.filter(r => r.status === 'pending').length,
    'in-progress': rows.filter(r => r.status === 'in-progress').length,
    completed: rows.filter(r => r.status === 'completed').length,
  };
  const urgent = rows.filter(r => r.priority === 'stat' && r.status !== 'completed').length;

  return (
    <DashboardLayout title="Laboratory" subtitle="Manage lab test requests and results">
      <div className="space-y-6 animate-fade-in">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: 'Pending', value: counts.pending, icon: Clock, color: 'warning' },
            { label: 'Processing', value: counts['in-progress'], icon: FlaskConical, color: 'info' },
            { label: 'Completed', value: counts.completed, icon: CheckCircle, color: 'success' },
            { label: 'Urgent (STAT)', value: urgent, icon: AlertTriangle, color: 'destructive' },
          ].map((s) => (
            <Card key={s.label} className={`bg-${s.color}/5 border-${s.color}/20`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg bg-${s.color}/10 flex items-center justify-center`}><s.icon className={`h-5 w-5 text-${s.color}`} /></div>
                  <div><p className="text-2xl font-bold">{s.value}</p><p className="text-sm text-muted-foreground">{s.label}</p></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by patient or test type..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> New Test Order</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Order New Lab Test</DialogTitle><DialogDescription>Create a new lab test order.</DialogDescription></DialogHeader>
              <form className="grid gap-4 py-4" onSubmit={handleAdd}>
                <div className="space-y-2"><Label>Patient *</Label>
                  <Select value={form.patient_id} onValueChange={(v) => setForm({ ...form, patient_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                    <SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Test Type *</Label>
                  <Select value={form.test_type} onValueChange={(v) => setForm({ ...form, test_type: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {['Complete Blood Count (CBC)','Lipid Panel','Cardiac Enzymes','Troponin Test','Basic Metabolic Panel','Liver Function Tests','Urinalysis'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Priority</Label>
                  <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="routine">Routine</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="stat">STAT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Order Test</Button>
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
                <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
                <TabsTrigger value="in-progress">Processing ({counts['in-progress']})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({counts.completed})</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className="p-0 pt-4">
              <DataTable data={filtered} columns={columns} emptyMessage="No lab tests found" />
            </CardContent>
          </Tabs>
        </Card>

        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selected?.status === 'completed' ? 'View Results' : 'Enter Results'}</DialogTitle>
              <DialogDescription>{selected?.test_type} for {selected?.patients?.name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-4">
              <Label>Results</Label>
              <Textarea rows={6} value={resultsText} onChange={(e) => setResultsText(e.target.value)} readOnly={selected?.status === 'completed'} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
              {selected?.status !== 'completed' && <Button onClick={saveResults}>Save Results</Button>}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
