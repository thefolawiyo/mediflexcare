import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge, getStatusVariant } from '@/components/ui/status-badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Clock, Stethoscope, Building2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Row {
  id: string;
  doctor_name: string | null;
  department: string | null;
  appt_date: string;
  appt_time: string;
  status: string;
  type: string;
  notes: string | null;
}

export default function PatientAppointments() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: patient } = await supabase.from('patients').select('id').eq('user_id', user.id).maybeSingle();
      if (!patient) { setLoading(false); return; }
      const { data } = await supabase
        .from('appointments')
        .select('id, doctor_name, department, appt_date, appt_time, status, type, notes')
        .eq('patient_id', patient.id)
        .order('appt_date', { ascending: false })
        .order('appt_time', { ascending: false });
      setRows((data as Row[]) || []);
      setLoading(false);
    })();
  }, [user]);

  return (
    <DashboardLayout title="My Appointments" subtitle={`${rows.length} appointment${rows.length === 1 ? '' : 's'} on record`}>
      <div className="space-y-4 animate-fade-in">
        {loading ? (
          <>{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}</>
        ) : rows.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">No appointments yet.</CardContent></Card>
        ) : (
          rows.map((r) => (
            <Card key={r.id} className="card-interactive">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="inline-flex items-center gap-1.5 font-medium"><Calendar className="h-4 w-4 text-primary" /> {new Date(r.appt_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground"><Clock className="h-4 w-4" /> {r.appt_time.slice(0, 5)}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5"><Stethoscope className="h-4 w-4" /> {r.doctor_name || 'TBD'}</span>
                      <span className="inline-flex items-center gap-1.5"><Building2 className="h-4 w-4" /> {r.department || '—'}</span>
                      <span className="capitalize">{r.type}</span>
                    </div>
                    {r.notes && <p className="text-sm text-muted-foreground italic">{r.notes}</p>}
                  </div>
                  <StatusBadge variant={getStatusVariant(r.status)} pulse={r.status === 'in-progress'}>
                    {r.status.replace('-', ' ')}
                  </StatusBadge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
