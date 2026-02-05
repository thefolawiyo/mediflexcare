 import { useState } from 'react';
 import { DashboardLayout } from '@/components/layout/DashboardLayout';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { DataTable, Column } from '@/components/ui/data-table';
 import { StatusBadge, getStatusVariant } from '@/components/ui/status-badge';
 import { mockPatients, mockAppointments, mockVitals } from '@/data/mockData';
 import { Patient } from '@/types';
 import { 
   Search, 
   User,
   Calendar,
   FileText,
   Activity,
   Pill,
   Phone,
   Mail
 } from 'lucide-react';
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
 } from '@/components/ui/dialog';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { Textarea } from '@/components/ui/textarea';
 import { Label } from '@/components/ui/label';
 import { toast } from 'sonner';
 
 export default function DoctorPatients() {
   const [searchQuery, setSearchQuery] = useState('');
   const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
   const [visitNotes, setVisitNotes] = useState('');
 
   // Get patients with appointments for the current doctor
   const myPatients = mockPatients.filter(patient => 
     mockAppointments.some(apt => apt.patientId === patient.id)
   );
 
   const filteredPatients = myPatients.filter(patient =>
     patient.name.toLowerCase().includes(searchQuery.toLowerCase())
   );
 
   const getPatientVitals = (patientId: string) => {
     return mockVitals.find(v => v.patientId === patientId);
   };
 
   const getPatientAppointments = (patientId: string) => {
     return mockAppointments.filter(apt => apt.patientId === patientId);
   };
 
   const handleSaveNotes = () => {
     toast.success('Visit notes saved successfully');
     setVisitNotes('');
   };
 
   const handleOrderLabTest = () => {
     toast.success('Lab test order created');
   };
 
   const handleCreatePrescription = () => {
     toast.success('Prescription created');
   };
 
   const columns: Column<Patient>[] = [
     { 
       key: 'name', 
       header: 'Patient',
       render: (_, row) => (
         <div className="flex items-center gap-3">
           <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
             <span className="text-sm font-medium text-primary">
               {row.name.split(' ').map(n => n[0]).join('')}
             </span>
           </div>
           <div>
             <p className="font-medium">{row.name}</p>
             <p className="text-xs text-muted-foreground">{row.id}</p>
           </div>
         </div>
       )
     },
     { 
       key: 'phone', 
       header: 'Contact',
       render: (v, row) => (
         <div className="text-sm">
           <p>{v}</p>
           <p className="text-muted-foreground">{row.email}</p>
         </div>
       )
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
     {
       key: 'actions',
       header: 'Actions',
       render: (_, row) => (
         <div className="flex gap-2">
           <Button size="sm" onClick={() => setSelectedPatient(row)}>View</Button>
           <Button size="sm" variant="outline" onClick={handleOrderLabTest}>Lab</Button>
           <Button size="sm" variant="outline" onClick={handleCreatePrescription}>Rx</Button>
         </div>
       )
     }
   ];
 
   return (
     <DashboardLayout 
       title="My Patients" 
       subtitle="Manage your assigned patients"
     >
       <div className="space-y-6 animate-fade-in">
         {/* Summary Stats */}
         <div className="grid gap-4 md:grid-cols-4">
           <Card>
             <CardContent className="p-4">
               <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                   <User className="h-5 w-5 text-primary" />
                 </div>
                 <div>
                   <p className="text-2xl font-bold">{myPatients.length}</p>
                   <p className="text-sm text-muted-foreground">My Patients</p>
                 </div>
               </div>
             </CardContent>
           </Card>
           <Card>
             <CardContent className="p-4">
               <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                   <Calendar className="h-5 w-5 text-info" />
                 </div>
                 <div>
                   <p className="text-2xl font-bold">{mockAppointments.length}</p>
                   <p className="text-sm text-muted-foreground">Appointments</p>
                 </div>
               </div>
             </CardContent>
           </Card>
           <Card>
             <CardContent className="p-4">
               <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                   <Activity className="h-5 w-5 text-warning" />
                 </div>
                 <div>
                   <p className="text-2xl font-bold">{mockAppointments.filter(a => a.status === 'in-progress').length}</p>
                   <p className="text-sm text-muted-foreground">In Progress</p>
                 </div>
               </div>
             </CardContent>
           </Card>
           <Card>
             <CardContent className="p-4">
               <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                   <FileText className="h-5 w-5 text-success" />
                 </div>
                 <div>
                   <p className="text-2xl font-bold">{mockAppointments.filter(a => a.status === 'completed').length}</p>
                   <p className="text-sm text-muted-foreground">Completed Today</p>
                 </div>
               </div>
             </CardContent>
           </Card>
         </div>
 
         {/* Search */}
         <div className="relative max-w-md">
           <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
           <Input
             placeholder="Search patients..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="pl-9"
           />
         </div>
 
         {/* Patients Table */}
         <Card>
           <CardContent className="p-0">
             <DataTable
               data={filteredPatients}
               columns={columns}
               emptyMessage="No patients found"
             />
           </CardContent>
         </Card>
 
         {/* Patient Detail Dialog */}
         {selectedPatient && (
           <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
             <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
               <DialogHeader>
                 <DialogTitle>Patient Details - {selectedPatient.name}</DialogTitle>
               </DialogHeader>
               
               <Tabs defaultValue="overview" className="w-full">
                 <TabsList className="grid w-full grid-cols-4">
                   <TabsTrigger value="overview">Overview</TabsTrigger>
                   <TabsTrigger value="vitals">Vitals</TabsTrigger>
                   <TabsTrigger value="history">History</TabsTrigger>
                   <TabsTrigger value="notes">Visit Notes</TabsTrigger>
                 </TabsList>
 
                 <TabsContent value="overview" className="space-y-4 pt-4">
                   <div className="flex items-center gap-4">
                     <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                       <span className="text-xl font-semibold text-primary">
                         {selectedPatient.name.split(' ').map(n => n[0]).join('')}
                       </span>
                     </div>
                     <div>
                       <h3 className="text-xl font-semibold">{selectedPatient.name}</h3>
                       <p className="text-sm text-muted-foreground">ID: {selectedPatient.id}</p>
                     </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                       <Phone className="h-4 w-4 text-muted-foreground" />
                       <span className="text-sm">{selectedPatient.phone}</span>
                     </div>
                     <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                       <Mail className="h-4 w-4 text-muted-foreground" />
                       <span className="text-sm">{selectedPatient.email}</span>
                     </div>
                   </div>
                   <div className="flex gap-2">
                     <Button onClick={handleOrderLabTest} className="flex-1">
                       <Activity className="h-4 w-4 mr-2" />
                       Order Lab Test
                     </Button>
                     <Button onClick={handleCreatePrescription} variant="outline" className="flex-1">
                       <Pill className="h-4 w-4 mr-2" />
                       New Prescription
                     </Button>
                   </div>
                 </TabsContent>
 
                 <TabsContent value="vitals" className="pt-4">
                   {(() => {
                     const vitals = getPatientVitals(selectedPatient.id);
                     if (!vitals) return <p className="text-muted-foreground">No vitals recorded</p>;
                     return (
                       <div className="grid grid-cols-2 gap-4">
                         <Card>
                           <CardContent className="p-4">
                             <p className="text-sm text-muted-foreground">Temperature</p>
                             <p className="text-2xl font-bold">{vitals.temperature}°F</p>
                           </CardContent>
                         </Card>
                         <Card>
                           <CardContent className="p-4">
                             <p className="text-sm text-muted-foreground">Blood Pressure</p>
                             <p className="text-2xl font-bold">{vitals.bloodPressureSystolic}/{vitals.bloodPressureDiastolic}</p>
                           </CardContent>
                         </Card>
                         <Card>
                           <CardContent className="p-4">
                             <p className="text-sm text-muted-foreground">Heart Rate</p>
                             <p className="text-2xl font-bold">{vitals.heartRate} bpm</p>
                           </CardContent>
                         </Card>
                         <Card>
                           <CardContent className="p-4">
                             <p className="text-sm text-muted-foreground">O2 Saturation</p>
                             <p className="text-2xl font-bold">{vitals.oxygenSaturation}%</p>
                           </CardContent>
                         </Card>
                       </div>
                     );
                   })()}
                 </TabsContent>
 
                 <TabsContent value="history" className="pt-4">
                   <div className="space-y-3">
                     {getPatientAppointments(selectedPatient.id).map((apt) => (
                       <div key={apt.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                         <div>
                           <p className="font-medium">{apt.type}</p>
                           <p className="text-sm text-muted-foreground">{apt.date} at {apt.time}</p>
                         </div>
                         <StatusBadge variant={getStatusVariant(apt.status)}>
                           {apt.status.replace('-', ' ')}
                         </StatusBadge>
                       </div>
                     ))}
                   </div>
                 </TabsContent>
 
                 <TabsContent value="notes" className="pt-4 space-y-4">
                   <div className="space-y-2">
                     <Label>Add Visit Notes</Label>
                     <Textarea
                       placeholder="Enter visit notes, observations, diagnosis..."
                       value={visitNotes}
                       onChange={(e) => setVisitNotes(e.target.value)}
                       rows={6}
                     />
                   </div>
                   <Button onClick={handleSaveNotes} disabled={!visitNotes}>
                     Save Notes
                   </Button>
                 </TabsContent>
               </Tabs>
             </DialogContent>
           </Dialog>
         )}
       </div>
     </DashboardLayout>
   );
 }