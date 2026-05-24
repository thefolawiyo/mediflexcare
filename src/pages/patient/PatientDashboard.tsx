import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Calendar, FlaskConical, Pill, ArrowRight } from 'lucide-react';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ upcoming: 0, pendingLabs: 0, activeRx: 0, nextAppt: null as null | { appt_date: string; appt_time: string; doctor_name: string | null } });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: patient } = await supabase.from('patients').select('id').eq('user_id', user.id).maybeSingle();
      if (!patient) return;
      const today = new Date().toISOString().slice(0, 10);
      const [appts, labs, rx, next] = await Promise.all([
        supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('patient_id', patient.id).gte('appt_date', today).neq('status', 'cancelled'),
        supabase.from('lab_tests').select('id', { count: 'exact', head: true }).eq('patient_id', patient.id).in('status', ['pending', 'in-progress']),
        supabase.from('prescriptions').select('id', { count: 'exact', head: true }).eq('patient_id', patient.id).eq('status', 'pending'),
        supabase.from('appointments').select('appt_date, appt_time, doctor_name').eq('patient_id', patient.id).gte('appt_date', today).neq('status', 'cancelled').order('appt_date').order('appt_time').limit(1).maybeSingle(),
      ]);
      setStats({
        upcoming: appts.count ?? 0,
        pendingLabs: labs.count ?? 0,
        activeRx: rx.count ?? 0,
        nextAppt: next.data ?? null,
      });
    })();
  }, [user]);

  const tiles = [
    { label: 'Upcoming Appointments', value: stats.upcoming, icon: Calendar, href: '/portal/appointments', color: 'bg-primary/10 text-primary' },
    { label: 'Lab Tests in Progress', value: stats.pendingLabs, icon: FlaskConical, href: '/portal/labs', color: 'bg-warning/10 text-warning' },
    { label: 'Active Prescriptions', value: stats.activeRx, icon: Pill, href: '/portal/prescriptions', color: 'bg-destructive/10 text-destructive' },
  ];

  return (
    <DashboardLayout title={`Welcome, ${user?.name.split(' ')[0]}`} subtitle="Your health summary at a glance">
      <div className="space-y-6 animate-fade-in">
        <div className="grid gap-4 md:grid-cols-3">
          {tiles.map((t) => (
            <Link key={t.label} to={t.href}>
              <Card className="card-interactive h-full">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${t.color}`}>
                      <t.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <p className="text-3xl font-bold">{t.value}</p>
                      <p className="text-sm text-muted-foreground">{t.label}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {stats.nextAppt && (
          <Card>
            <CardHeader>
              <CardTitle>Your next appointment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-2xl font-semibold">
                    {new Date(stats.nextAppt.appt_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="text-muted-foreground">
                    at {stats.nextAppt.appt_time.slice(0, 5)} with {stats.nextAppt.doctor_name || 'your doctor'}
                  </p>
                </div>
                <Button asChild><Link to="/portal/appointments">View details</Link></Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
