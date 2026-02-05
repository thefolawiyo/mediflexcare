 import { useState } from 'react';
 import { DashboardLayout } from '@/components/layout/DashboardLayout';
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { DataTable, Column } from '@/components/ui/data-table';
 import { mockPatients, mockVitals } from '@/data/mockData';
 import { Vital } from '@/types';
 import { 
   Search, 
   Plus,
   Thermometer,
   Heart,
   Activity,
   Wind,
   User,
   Clock
 } from 'lucide-react';
 import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
   DialogFooter,
 } from '@/components/ui/dialog';
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from '@/components/ui/select';
 import { toast } from 'sonner';
 
 export default function NurseVitals() {
   const [searchQuery, setSearchQuery] = useState('');
   const [vitals, setVitals] = useState<Vital[]>(mockVitals);
   const [isDialogOpen, setIsDialogOpen] = useState(false);
   const [formData, setFormData] = useState({
     patientId: '',
     temperature: '',
     bloodPressureSystolic: '',
     bloodPressureDiastolic: '',
     heartRate: '',
     respiratoryRate: '',
     oxygenSaturation: '',
     weight: '',
     height: '',
   });
 
   const getPatientName = (patientId: string) => {
     const patient = mockPatients.find(p => p.id === patientId);
     return patient?.name || 'Unknown';
   };
 
   const filteredVitals = vitals.filter(vital => {
     const patientName = getPatientName(vital.patientId);
     return patientName.toLowerCase().includes(searchQuery.toLowerCase());
   });
 
   const handleAddVitals = () => {
     if (!formData.patientId || !formData.temperature || !formData.heartRate) {
       toast.error('Please fill in required fields');
       return;
     }
 
     const newVital: Vital = {
       id: `V00${vitals.length + 1}`,
       patientId: formData.patientId,
       recordedBy: 'Nurse James Wilson',
       recordedAt: new Date().toISOString(),
       temperature: parseFloat(formData.temperature),
       bloodPressureSystolic: parseInt(formData.bloodPressureSystolic) || 120,
       bloodPressureDiastolic: parseInt(formData.bloodPressureDiastolic) || 80,
       heartRate: parseInt(formData.heartRate),
       respiratoryRate: parseInt(formData.respiratoryRate) || 16,
       oxygenSaturation: parseInt(formData.oxygenSaturation) || 98,
       weight: formData.weight ? parseFloat(formData.weight) : undefined,
       height: formData.height ? parseFloat(formData.height) : undefined,
     };
 
     setVitals([newVital, ...vitals]);
     setIsDialogOpen(false);
     setFormData({
       patientId: '',
       temperature: '',
       bloodPressureSystolic: '',
       bloodPressureDiastolic: '',
       heartRate: '',
       respiratoryRate: '',
       oxygenSaturation: '',
       weight: '',
       height: '',
     });
     toast.success('Vitals recorded successfully');
   };
 
   const isAbnormal = (type: string, value: number) => {
     const ranges: Record<string, { min: number; max: number }> = {
       temperature: { min: 97, max: 99.5 },
       heartRate: { min: 60, max: 100 },
       oxygenSaturation: { min: 95, max: 100 },
       systolic: { min: 90, max: 140 },
       diastolic: { min: 60, max: 90 },
     };
     const range = ranges[type];
     if (!range) return false;
     return value < range.min || value > range.max;
   };
 
   const columns: Column<Vital>[] = [
     { 
       key: 'patientId', 
       header: 'Patient',
       render: (v) => (
         <div className="flex items-center gap-3">
           <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
             <User className="h-4 w-4 text-primary" />
           </div>
           <div>
             <p className="font-medium">{getPatientName(v)}</p>
             <p className="text-xs text-muted-foreground">{v}</p>
           </div>
         </div>
       )
     },
     { 
       key: 'temperature', 
       header: 'Temp (°F)',
       render: (v) => (
         <span className={isAbnormal('temperature', v) ? 'text-destructive font-semibold' : ''}>
           {v}°F
         </span>
       )
     },
     { 
       key: 'bloodPressureSystolic', 
       header: 'Blood Pressure',
       render: (_, row) => (
         <span className={isAbnormal('systolic', row.bloodPressureSystolic) || isAbnormal('diastolic', row.bloodPressureDiastolic) ? 'text-destructive font-semibold' : ''}>
           {row.bloodPressureSystolic}/{row.bloodPressureDiastolic}
         </span>
       )
     },
     { 
       key: 'heartRate', 
       header: 'Heart Rate',
       render: (v) => (
         <span className={isAbnormal('heartRate', v) ? 'text-destructive font-semibold' : ''}>
           {v} bpm
         </span>
       )
     },
     { 
       key: 'oxygenSaturation', 
       header: 'O2 Sat',
       render: (v) => (
         <span className={isAbnormal('oxygenSaturation', v) ? 'text-destructive font-semibold' : ''}>
           {v}%
         </span>
       )
     },
     { 
       key: 'respiratoryRate', 
       header: 'Resp Rate',
       render: (v) => <span>{v}/min</span>
     },
     { 
       key: 'recordedAt', 
       header: 'Recorded',
       render: (v) => (
         <div className="flex items-center gap-2">
           <Clock className="h-4 w-4 text-muted-foreground" />
           <span className="text-sm">{new Date(v).toLocaleTimeString()}</span>
         </div>
       )
     },
   ];
 
   return (
     <DashboardLayout 
       title="Vitals Recording" 
       subtitle="Record and monitor patient vital signs"
     >
       <div className="space-y-6 animate-fade-in">
         {/* Summary Stats */}
         <div className="grid gap-4 md:grid-cols-4">
           <Card>
             <CardContent className="p-4">
               <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                   <Activity className="h-5 w-5 text-primary" />
                 </div>
                 <div>
                   <p className="text-2xl font-bold">{vitals.length}</p>
                   <p className="text-sm text-muted-foreground">Total Records</p>
                 </div>
               </div>
             </CardContent>
           </Card>
           <Card>
             <CardContent className="p-4">
               <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                   <Thermometer className="h-5 w-5 text-info" />
                 </div>
                 <div>
                   <p className="text-2xl font-bold">
                     {vitals.length > 0 ? (vitals.reduce((sum, v) => sum + v.temperature, 0) / vitals.length).toFixed(1) : 0}°F
                   </p>
                   <p className="text-sm text-muted-foreground">Avg Temp</p>
                 </div>
               </div>
             </CardContent>
           </Card>
           <Card>
             <CardContent className="p-4">
               <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                   <Heart className="h-5 w-5 text-accent" />
                 </div>
                 <div>
                   <p className="text-2xl font-bold">
                     {vitals.length > 0 ? Math.round(vitals.reduce((sum, v) => sum + v.heartRate, 0) / vitals.length) : 0}
                   </p>
                   <p className="text-sm text-muted-foreground">Avg Heart Rate</p>
                 </div>
               </div>
             </CardContent>
           </Card>
           <Card>
             <CardContent className="p-4">
               <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                   <Wind className="h-5 w-5 text-success" />
                 </div>
                 <div>
                   <p className="text-2xl font-bold">
                     {vitals.length > 0 ? Math.round(vitals.reduce((sum, v) => sum + v.oxygenSaturation, 0) / vitals.length) : 0}%
                   </p>
                   <p className="text-sm text-muted-foreground">Avg O2 Sat</p>
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
               placeholder="Search by patient name..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="pl-9"
             />
           </div>
           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
             <DialogTrigger asChild>
               <Button>
                 <Plus className="h-4 w-4 mr-2" />
                 Record Vitals
               </Button>
             </DialogTrigger>
             <DialogContent className="max-w-lg">
               <DialogHeader>
                 <DialogTitle>Record Patient Vitals</DialogTitle>
                 <DialogDescription>Enter vital signs for a patient</DialogDescription>
               </DialogHeader>
               <div className="grid gap-4 py-4">
                 <div className="space-y-2">
                   <Label>Patient *</Label>
                   <Select 
                     value={formData.patientId} 
                     onValueChange={(v) => setFormData({ ...formData, patientId: v })}
                   >
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
                     <Label>Temperature (°F) *</Label>
                     <Input
                       type="number"
                       step="0.1"
                       value={formData.temperature}
                       onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                       placeholder="98.6"
                     />
                   </div>
                   <div className="space-y-2">
                     <Label>Heart Rate (bpm) *</Label>
                     <Input
                       type="number"
                       value={formData.heartRate}
                       onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
                       placeholder="72"
                     />
                   </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label>BP Systolic</Label>
                     <Input
                       type="number"
                       value={formData.bloodPressureSystolic}
                       onChange={(e) => setFormData({ ...formData, bloodPressureSystolic: e.target.value })}
                       placeholder="120"
                     />
                   </div>
                   <div className="space-y-2">
                     <Label>BP Diastolic</Label>
                     <Input
                       type="number"
                       value={formData.bloodPressureDiastolic}
                       onChange={(e) => setFormData({ ...formData, bloodPressureDiastolic: e.target.value })}
                       placeholder="80"
                     />
                   </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label>O2 Saturation (%)</Label>
                     <Input
                       type="number"
                       value={formData.oxygenSaturation}
                       onChange={(e) => setFormData({ ...formData, oxygenSaturation: e.target.value })}
                       placeholder="98"
                     />
                   </div>
                   <div className="space-y-2">
                     <Label>Respiratory Rate</Label>
                     <Input
                       type="number"
                       value={formData.respiratoryRate}
                       onChange={(e) => setFormData({ ...formData, respiratoryRate: e.target.value })}
                       placeholder="16"
                     />
                   </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label>Weight (lbs)</Label>
                     <Input
                       type="number"
                       value={formData.weight}
                       onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                       placeholder="150"
                     />
                   </div>
                   <div className="space-y-2">
                     <Label>Height (in)</Label>
                     <Input
                       type="number"
                       value={formData.height}
                       onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                       placeholder="68"
                     />
                   </div>
                 </div>
               </div>
               <DialogFooter>
                 <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                 <Button onClick={handleAddVitals}>Save Vitals</Button>
               </DialogFooter>
             </DialogContent>
           </Dialog>
         </div>
 
         {/* Vitals Table */}
         <Card>
           <CardContent className="p-0">
             <DataTable
               data={filteredVitals}
               columns={columns}
               emptyMessage="No vitals recorded"
             />
           </CardContent>
         </Card>
       </div>
     </DashboardLayout>
   );
 }