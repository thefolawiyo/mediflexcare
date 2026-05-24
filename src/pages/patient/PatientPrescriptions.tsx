import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge, getStatusVariant } from '@/components/ui/status-badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Pill } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Row {
  id: string;
  medication: string;
  dosage: string | null;
  frequency: string | null;
  duration: string | null;
  status: string;
  prescribed_at: string;
  dispensed_at: string | null;
  prescribed_by_name: string | null;
  notes: string | null;
}

export default function PatientPrescriptions() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: patient } = await supabase.from('patients').select('id').eq('user_id', user.id).maybeSingle();
      if (!patient) { setLoading(false); return; }
      const { data } = await supabase
        .from('prescriptions')
        .select('id, medication, dosage, frequency, duration, status, prescribed_at, dispensed_at, prescribed_by_name, notes')
        .eq('patient_id', patient.id)
        .order('prescribed_at', { ascending: false });
      setRows((data as Row[]) || []);
      setLoading(false);
    })();
  }, [user]);

  return (
    <DashboardLayout title="My Prescriptions" subtitle={`${rows.length} prescription${rows.length === 1 ? '' : 's'} on record`}>
      <div className="space-y-4 animate-fade-in">
        {loading ? (
          <>{[1, 2].map((i) => <Skeleton key={i} className="h-28 w-full" />)}</>
        ) : rows.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">No prescriptions on record.</CardContent></Card>
        ) : (
          rows.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <Pill className="h-5 w-5 text-destructive" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{r.medication}</h3>
                      <p className="text-sm text-muted-foreground">
                        {[r.dosage, r.frequency, r.duration].filter(Boolean).join(' • ')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Prescribed by {r.prescribed_by_name || 'Doctor'} on {new Date(r.prescribed_at).toLocaleDateString()}
                        {r.dispensed_at && ` • Dispensed ${new Date(r.dispensed_at).toLocaleDateString()}`}
                      </p>
                      {r.notes && <p className="text-sm italic text-muted-foreground mt-2">Note: {r.notes}</p>}
                    </div>
                  </div>
                  <StatusBadge variant={getStatusVariant(r.status)}>{r.status}</StatusBadge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
