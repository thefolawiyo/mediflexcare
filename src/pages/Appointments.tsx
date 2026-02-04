import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, Column } from '@/components/ui/data-table';
import { StatusBadge, getStatusVariant } from '@/components/ui/status-badge';
import { mockAppointments, mockPatients } from '@/data/mockData';
import { Appointment } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, 
  Plus, 
  Filter,
  Calendar as CalendarIcon,
  Clock,
  User,
  Stethoscope
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Appointments() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const filteredAppointments = mockAppointments.filter(apt => {
    const matchesSearch = apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.doctorName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && apt.status === activeTab;
  });

  const columns: Column<Appointment>[] = [
    { 
      key: 'time', 
      header: 'Time',
      className: 'font-mono',
      render: (v, row) => (
        <div>
          <p className="font-medium">{v}</p>
          <p className="text-xs text-muted-foreground">{row.date}</p>
        </div>
      )
    },
    { 
      key: 'patientName', 
      header: 'Patient',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <span className="font-medium">{row.patientName}</span>
        </div>
      )
    },
    { 
      key: 'doctorName', 
      header: 'Doctor',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-info/10 flex items-center justify-center">
            <Stethoscope className="h-4 w-4 text-info" />
          </div>
          <div>
            <p className="font-medium">{row.doctorName}</p>
            <p className="text-xs text-muted-foreground">{row.department}</p>
          </div>
        </div>
      )
    },
    { 
      key: 'type', 
      header: 'Type',
      render: (v) => (
        <span className="capitalize text-sm">{v}</span>
      )
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (v) => (
        <StatusBadge variant={getStatusVariant(v)} pulse={v === 'in-progress'}>
          {v.replace('-', ' ')}
        </StatusBadge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          {row.status === 'scheduled' && (
            <Button size="sm" variant="outline">Check In</Button>
          )}
          {row.status === 'checked-in' && (
            <Button size="sm">Start</Button>
          )}
          {row.status === 'in-progress' && (
            <Button size="sm" variant="outline">Complete</Button>
          )}
        </div>
      )
    }
  ];

  const statusCounts = {
    all: mockAppointments.length,
    scheduled: mockAppointments.filter(a => a.status === 'scheduled').length,
    'checked-in': mockAppointments.filter(a => a.status === 'checked-in').length,
    'in-progress': mockAppointments.filter(a => a.status === 'in-progress').length,
    completed: mockAppointments.filter(a => a.status === 'completed').length,
  };

  return (
    <DashboardLayout 
      title="Appointments" 
      subtitle="Manage patient appointments and queue"
    >
      <div className="space-y-6 animate-fade-in">
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-info/5 border-info/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                  <CalendarIcon className="h-5 w-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{statusCounts.scheduled}</p>
                  <p className="text-sm text-muted-foreground">Scheduled</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-warning/5 border-warning/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{statusCounts['checked-in']}</p>
                  <p className="text-sm text-muted-foreground">Waiting</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-success/5 border-success/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Stethoscope className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{statusCounts['in-progress']}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{statusCounts.completed}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by patient or doctor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Appointment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Schedule New Appointment</DialogTitle>
                  <DialogDescription>
                    Create a new appointment for a patient.
                  </DialogDescription>
                </DialogHeader>
                <form className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient">Patient</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockPatients.map(patient => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input id="date" type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Time</Label>
                      <Input id="time" type="time" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cardiology">Cardiology</SelectItem>
                        <SelectItem value="general">General Medicine</SelectItem>
                        <SelectItem value="orthopedics">Orthopedics</SelectItem>
                        <SelectItem value="pediatrics">Pediatrics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Appointment Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consultation">Consultation</SelectItem>
                        <SelectItem value="follow-up">Follow-up</SelectItem>
                        <SelectItem value="procedure">Procedure</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" placeholder="Add any relevant notes..." />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Schedule</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tabs & Table */}
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <CardHeader className="pb-0">
              <TabsList>
                <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
                <TabsTrigger value="scheduled">Scheduled ({statusCounts.scheduled})</TabsTrigger>
                <TabsTrigger value="checked-in">Waiting ({statusCounts['checked-in']})</TabsTrigger>
                <TabsTrigger value="in-progress">In Progress ({statusCounts['in-progress']})</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className="p-0 pt-4">
              <DataTable
                data={filteredAppointments}
                columns={columns}
                emptyMessage="No appointments found"
              />
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </DashboardLayout>
  );
}
