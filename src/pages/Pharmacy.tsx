import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, Column } from '@/components/ui/data-table';
import { StatusBadge, getStatusVariant } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Search, Clock, CheckCircle, Package } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type Row = {
  id: string;
  medication: string;
  dosage: string | null;
  frequency: string | null;
  duration: string | null;
  prescribed_by_name: string | null;
  status: string;
  prescribed_at: string;
  dispensed_at: string | null;
  notes: string | null;
  patients?: { name: string } | null;
};

export default function Pharmacy() {
  const [rows, setRows] = useState<Row[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selected, setSelected] = useState<Row | null>(null);

  const load = async () => {
    const { data } = await supabase.from('prescriptions').select('*, patients(name)').order('prescribed_at', { ascending: false });
    setRows((data as Row[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const filtered = rows.filter(rx => {
    const m = (rx.patients?.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      rx.medication.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'all') return m;
    return m && rx.status === activeTab;
  });

  const handleDispense = async (id: string) => {
    const { error } = await supabase.from('prescriptions').update({ status: 'dispensed', dispensed_at: new Date().toISOString() }).eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Prescription dispensed');
    load();
  };

  const columns: Column<Row>[] = [
    { key: 'patients', header: 'Patient', render: (_, r) => <span className="font-medium">{r.patients?.name || '—'}</span> },
    { key: 'medication', header: 'Medication', render: (_, r) => (
      <div><p className="font-medium">{r.medication}</p><p className="text-xs text-muted-foreground">{r.dosage} • {r.frequency}</p></div>
    )},
    { key: 'duration', header: 'Duration', render: (v) => v || '—' },
    { key: 'prescribed_by_name', header: 'Prescribed By', render: (v) => <span className="text-sm text-muted-foreground">{v || '—'}</span> },
    { key: 'status', header: 'Status', render: (v) => <StatusBadge variant={getStatusVariant(v as string)}>{v as string}</StatusBadge> },
    { key: 'actions', header: 'Actions', render: (_, r) => (
      <div className="flex gap-2">
        {r.status === 'pending' && <Button size="sm" onClick={() => handleDispense(r.id)}>Dispense</Button>}
        {r.status === 'dispensed' && <Button size="sm" variant="ghost" onClick={() => setSelected(r)}>View</Button>}
      </div>
    )},
  ];

  const counts = {
    all: rows.length,
    pending: rows.filter(r => r.status === 'pending').length,
    dispensed: rows.filter(r => r.status === 'dispensed').length,
  };

  return (
    <DashboardLayout title="Pharmacy" subtitle="Manage prescriptions and dispensing">
      <div className="space-y-6 animate-fade-in">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: 'Pending', value: counts.pending, icon: Clock, color: 'warning' },
            { label: 'Dispensed', value: counts.dispensed, icon: CheckCircle, color: 'success' },
            { label: 'Total', value: counts.all, icon: Package, color: 'primary' },
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

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by patient or medication..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>

        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <CardHeader className="pb-0">
              <TabsList>
                <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
                <TabsTrigger value="dispensed">Dispensed ({counts.dispensed})</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className="p-0 pt-4">
              <DataTable data={filtered} columns={columns} emptyMessage="No prescriptions found" />
            </CardContent>
          </Tabs>
        </Card>

        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Prescription Details</DialogTitle>
              <DialogDescription>For {selected?.patients?.name}</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div><p className="text-sm text-muted-foreground">Medication</p><p className="font-medium">{selected?.medication}</p></div>
              <div><p className="text-sm text-muted-foreground">Dosage</p><p className="font-medium">{selected?.dosage}</p></div>
              <div><p className="text-sm text-muted-foreground">Frequency</p><p className="font-medium">{selected?.frequency}</p></div>
              <div><p className="text-sm text-muted-foreground">Duration</p><p className="font-medium">{selected?.duration}</p></div>
              <div><p className="text-sm text-muted-foreground">Prescribed By</p><p className="font-medium">{selected?.prescribed_by_name}</p></div>
              <div><p className="text-sm text-muted-foreground">Status</p><StatusBadge variant={getStatusVariant(selected?.status || '')}>{selected?.status}</StatusBadge></div>
              {selected?.notes && <div className="col-span-2"><p className="text-sm text-muted-foreground">Notes</p><p>{selected.notes}</p></div>}
              {selected?.dispensed_at && <div className="col-span-2"><p className="text-sm text-muted-foreground">Dispensed at</p><p>{new Date(selected.dispensed_at).toLocaleString()}</p></div>}
            </div>
            <DialogFooter><Button onClick={() => setSelected(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
