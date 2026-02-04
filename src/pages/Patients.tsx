import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, Column } from '@/components/ui/data-table';
import { StatusBadge, getStatusVariant } from '@/components/ui/status-badge';
import { mockPatients } from '@/data/mockData';
import { Patient } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, 
  Plus, 
  Filter,
  Download,
  Mail,
  Phone,
  Calendar
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

export default function Patients() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredPatients = mockPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: Column<Patient>[] = [
    { 
      key: 'id', 
      header: 'Patient ID',
      className: 'font-mono text-sm',
    },
    { 
      key: 'name', 
      header: 'Name',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {row.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <p className="font-medium">{row.name}</p>
            <p className="text-xs text-muted-foreground">{row.email}</p>
          </div>
        </div>
      )
    },
    { 
      key: 'phone', 
      header: 'Phone',
      render: (v) => <span className="text-sm">{v}</span>
    },
    { 
      key: 'dateOfBirth', 
      header: 'Date of Birth',
      render: (v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    },
    { 
      key: 'bloodType', 
      header: 'Blood Type',
      render: (v) => v ? (
        <span className="inline-flex items-center justify-center h-7 w-10 rounded bg-destructive/10 text-destructive text-sm font-semibold">
          {v}
        </span>
      ) : '-'
    },
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

  return (
    <DashboardLayout 
      title="Patients" 
      subtitle={`${mockPatients.length} registered patients`}
    >
      <div className="space-y-6 animate-fade-in">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Patient
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Register New Patient</DialogTitle>
                  <DialogDescription>
                    Enter patient information to create a new record.
                  </DialogDescription>
                </DialogHeader>
                <form className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="John" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Smith" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="john@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" placeholder="+1 (555) 000-0000" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dob">Date of Birth</Label>
                      <Input id="dob" type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bloodType">Blood Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select blood type" />
                        </SelectTrigger>
                        <SelectContent>
                          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergency">Emergency Contact</Label>
                      <Input id="emergency" placeholder="+1 (555) 000-0000" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" placeholder="123 Main Street, City, State, ZIP" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="insurance">Insurance Provider</Label>
                      <Input id="insurance" placeholder="Provider name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="insuranceId">Insurance ID</Label>
                      <Input id="insuranceId" placeholder="Policy number" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Register Patient</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Patient Table */}
        <Card>
          <CardContent className="p-0">
            <DataTable
              data={filteredPatients}
              columns={columns}
              onRowClick={(patient) => setSelectedPatient(patient)}
              emptyMessage="No patients found"
            />
          </CardContent>
        </Card>

        {/* Patient Detail Sidebar */}
        {selectedPatient && (
          <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Patient Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xl font-semibold text-primary">
                      {selectedPatient.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedPatient.name}</h3>
                    <p className="text-sm text-muted-foreground">ID: {selectedPatient.id}</p>
                    <StatusBadge variant={getStatusVariant(selectedPatient.status)} className="mt-1">
                      {selectedPatient.status}
                    </StatusBadge>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedPatient.email}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedPatient.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      DOB: {new Date(selectedPatient.dateOfBirth).toLocaleDateString()}
                      {selectedPatient.bloodType && ` • Blood Type: ${selectedPatient.bloodType}`}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Address</h4>
                  <p className="text-sm text-muted-foreground">{selectedPatient.address}</p>
                </div>

                {selectedPatient.insuranceProvider && (
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium mb-2">Insurance</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedPatient.insuranceProvider} • {selectedPatient.insuranceId}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button className="flex-1">Schedule Appointment</Button>
                  <Button variant="outline" className="flex-1">View History</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}
