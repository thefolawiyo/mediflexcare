import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard } from '@/components/ui/stat-card';
import { DataTable, Column } from '@/components/ui/data-table';
import { StatusBadge, getStatusVariant } from '@/components/ui/status-badge';
import { mockAppointments, mockPatients, mockLabTests, mockPrescriptions, mockStaff } from '@/data/mockData';
import { 
  Users, 
  Calendar, 
  FlaskConical, 
  Pill, 
  UserCheck, 
  Clock,
  Activity,
  TrendingUp
} from 'lucide-react';
import { Appointment, LabTest, Prescription } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { useNavigate } from 'react-router-dom';
 import { toast } from 'sonner';

export default function Dashboard() {
  const { user } = useAuth();
   const navigate = useNavigate();

  const todayAppointments = mockAppointments.filter(a => a.date === '2024-12-20');
  const pendingLabTests = mockLabTests.filter(l => l.status === 'pending' || l.status === 'in-progress');
  const pendingPrescriptions = mockPrescriptions.filter(p => p.status === 'pending');
  const checkedInPatients = todayAppointments.filter(a => a.status === 'checked-in' || a.status === 'in-progress');

  const appointmentColumns: Column<Appointment>[] = [
    { key: 'time', header: 'Time', className: 'font-medium' },
    { key: 'patientName', header: 'Patient' },
    { key: 'type', header: 'Type', render: (v) => <span className="capitalize">{v}</span> },
    { 
      key: 'status', 
      header: 'Status', 
      render: (v) => (
        <StatusBadge variant={getStatusVariant(v)} pulse={v === 'in-progress'}>
          {v.replace('-', ' ')}
        </StatusBadge>
      )
    },
  ];

  const labColumns: Column<LabTest>[] = [
    { key: 'patientName', header: 'Patient' },
    { key: 'testType', header: 'Test' },
    { 
      key: 'priority', 
      header: 'Priority', 
      render: (v) => (
        <StatusBadge variant={getStatusVariant(v)} pulse={v === 'stat'}>
          {v.toUpperCase()}
        </StatusBadge>
      )
    },
    { 
      key: 'status', 
      header: 'Status', 
      render: (v) => (
        <StatusBadge variant={getStatusVariant(v)}>
          {v.replace('-', ' ')}
        </StatusBadge>
      )
    },
  ];

  const prescriptionColumns: Column<Prescription>[] = [
    { key: 'patientName', header: 'Patient' },
    { key: 'medication', header: 'Medication' },
    { key: 'dosage', header: 'Dosage' },
    { 
      key: 'status', 
      header: 'Status', 
      render: (v) => (
        <StatusBadge variant={getStatusVariant(v)}>
          {v}
        </StatusBadge>
      )
    },
  ];

   const handleQuickAction = (action: string) => {
     switch (action) {
       case 'check-in':
         toast.info('Select a patient to check in');
         navigate('/appointments');
         break;
       case 'appointment':
         navigate('/appointments');
         break;
       case 'lab':
         navigate('/lab');
         break;
       case 'prescription':
         navigate('/pharmacy');
         break;
       default:
         toast.info('Feature coming soon');
     }
   };
 
   const handleViewAll = (section: string) => {
     switch (section) {
       case 'appointments':
         navigate('/appointments');
         break;
       case 'lab':
         navigate('/lab');
         break;
       case 'pharmacy':
         navigate('/pharmacy');
         break;
       default:
         toast.info('Navigation coming soon');
     }
   };
 
  const getRoleGreeting = () => {
    const greetings: Record<string, string> = {
      admin: 'Hospital Overview',
      doctor: 'Your Practice Today',
      nurse: 'Patient Care Overview',
      receptionist: 'Front Desk Status',
      lab: 'Laboratory Queue',
      pharmacy: 'Pharmacy Queue',
    };
    return greetings[user?.role || 'admin'];
  };

  return (
    <DashboardLayout 
      title={getRoleGreeting()} 
      subtitle={`Welcome back, ${user?.name?.split(' ')[0]}`}
    >
      <div className="space-y-6 animate-fade-in">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Patients"
            value={mockPatients.length}
            subtitle="Registered in system"
            icon={Users}
            variant="primary"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Today's Appointments"
            value={todayAppointments.length}
            subtitle={`${checkedInPatients.length} checked in`}
            icon={Calendar}
            variant="info"
          />
          <StatCard
            title="Pending Lab Tests"
            value={pendingLabTests.length}
            subtitle={`${pendingLabTests.filter(l => l.priority === 'stat').length} urgent`}
            icon={FlaskConical}
            variant="warning"
          />
          <StatCard
            title="Pending Prescriptions"
            value={pendingPrescriptions.length}
            subtitle="Awaiting dispensing"
            icon={Pill}
            variant="success"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Today's Appointments */}
          <Card className="card-interactive">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Today's Appointments</CardTitle>
               <Button variant="ghost" size="sm" onClick={() => handleViewAll('appointments')}>View All</Button>
            </CardHeader>
            <CardContent>
              <DataTable
                data={todayAppointments}
                columns={appointmentColumns}
                emptyMessage="No appointments scheduled for today"
              />
            </CardContent>
          </Card>

          {/* Quick Stats / Activity */}
          <Card className="card-interactive">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                 <Button className="h-auto py-4 flex-col gap-2" variant="outline" onClick={() => handleQuickAction('check-in')}>
                  <UserCheck className="h-5 w-5" />
                  <span>Check-in Patient</span>
                </Button>
                 <Button className="h-auto py-4 flex-col gap-2" variant="outline" onClick={() => handleQuickAction('appointment')}>
                  <Calendar className="h-5 w-5" />
                  <span>New Appointment</span>
                </Button>
                 <Button className="h-auto py-4 flex-col gap-2" variant="outline" onClick={() => handleQuickAction('lab')}>
                  <FlaskConical className="h-5 w-5" />
                  <span>Order Lab Test</span>
                </Button>
                 <Button className="h-auto py-4 flex-col gap-2" variant="outline" onClick={() => handleQuickAction('prescription')}>
                  <Pill className="h-5 w-5" />
                  <span>New Prescription</span>
                </Button>
              </div>

              {/* Activity Feed */}
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Recent Activity</h4>
                <div className="space-y-3">
                  {[
                    { icon: Clock, text: 'Emma Johnson checked in', time: '5 min ago', color: 'text-success' },
                    { icon: Activity, text: 'Vitals recorded for Robert Williams', time: '12 min ago', color: 'text-info' },
                    { icon: FlaskConical, text: 'CBC results ready for John Smith', time: '25 min ago', color: 'text-warning' },
                    { icon: Pill, text: 'Prescription dispensed to Lisa Anderson', time: '1 hr ago', color: 'text-primary' },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <div className={`h-8 w-8 rounded-full bg-muted flex items-center justify-center ${activity.color}`}>
                        <activity.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-foreground">{activity.text}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lab & Pharmacy Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="card-interactive">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Lab Queue</CardTitle>
               <Button variant="ghost" size="sm" onClick={() => handleViewAll('lab')}>View All</Button>
            </CardHeader>
            <CardContent>
              <DataTable
                data={pendingLabTests}
                columns={labColumns}
                emptyMessage="No pending lab tests"
              />
            </CardContent>
          </Card>

          <Card className="card-interactive">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Pharmacy Queue</CardTitle>
               <Button variant="ghost" size="sm" onClick={() => handleViewAll('pharmacy')}>View All</Button>
            </CardHeader>
            <CardContent>
              <DataTable
                data={pendingPrescriptions}
                columns={prescriptionColumns}
                emptyMessage="No pending prescriptions"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
