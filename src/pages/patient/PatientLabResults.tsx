import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge, getStatusVariant } from '@/components/ui/status-badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FlaskConical } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Row {
  id: string;
  test_type: string;
  ordered_by_name: string | null;
  status: string;
  priority: string;
  ordered_at: string;
  completed_at: string | null;
  results: string | null;
}

export default function PatientLabResults() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: patient } = await supabase.from('patients').select('id').eq('user_id', user.id).maybeSingle();
      if (!patient) { setLoading(false); return; }
      const { data } = await supabase
        .from('lab_tests')
        .select('id, test_type, ordered_by_name, status, priority, ordered_at, completed_at, results')
        .eq('patient_id', patient.id)
        .order('ordered_at', { ascending: false });
      setRows((data as Row[]) || []);
      setLoading(false);
    })();
  }, [user]);

  return (
    <DashboardLayout title="My Lab Results" subtitle={`${rows.length} test${rows.length === 1 ? '' : 's'} on record`}>
      <div className="space-y-4 animate-fade-in">
        {loading ? (
          <>{[1, 2].map((i) => <Skeleton key={i} className="h-28 w-full" />)}</>
        ) : rows.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">No lab tests on record.</CardContent></Card>
        ) : (
          rows.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                      <FlaskConical className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{r.test_type}</h3>
                      <p className="text-xs text-muted-foreground">
                        Ordered by {r.ordered_by_name || 'Doctor'} • {new Date(r.ordered_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge variant={getStatusVariant(r.status)} pulse={r.priority === 'stat'}>
                      {r.status.replace('-', ' ')}
                    </StatusBadge>
                    {r.priority !== 'routine' && (
                      <span className="text-xs uppercase font-medium text-destructive">{r.priority}</span>
                    )}
                  </div>
                </div>
                {r.status === 'completed' && r.results && (
                  <div className="rounded-md bg-muted/50 p-3 text-sm">
                    <p className="font-medium mb-1">Results</p>
                    <p className="text-muted-foreground whitespace-pre-line">{r.results}</p>
                    {r.completed_at && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Completed {new Date(r.completed_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
