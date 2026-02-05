import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, Column } from '@/components/ui/data-table';
import { StatusBadge, getStatusVariant } from '@/components/ui/status-badge';
 import { mockLabTests as initialLabTests, mockPatients } from '@/data/mockData';
import { LabTest } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, 
  Plus, 
  Filter,
  FlaskConical,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
   DialogFooter,
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
 import { toast } from 'sonner';

export default function LabTests() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
   const [labTests, setLabTests] = useState<LabTest[]>(initialLabTests);
   const [isDialogOpen, setIsDialogOpen] = useState(false);
   const [resultsDialogOpen, setResultsDialogOpen] = useState(false);
   const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
   const [results, setResults] = useState('');
   const [formData, setFormData] = useState({
     patientId: '',
     testType: '',
     priority: 'routine',
   });

   const filteredTests = labTests.filter(test => {
    const matchesSearch = test.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.testType.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && test.status === activeTab;
  });
 
   const handleStatusChange = (testId: string, newStatus: LabTest['status']) => {
     setLabTests(labTests.map(test => {
       if (test.id === testId) {
         toast.success(`Test ${newStatus === 'in-progress' ? 'started' : 'completed'}`);
         return { 
           ...test, 
           status: newStatus,
           completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
         };
       }
       return test;
     }));
   };
 
   const handleAddTest = (e: React.FormEvent) => {
     e.preventDefault();
     if (!formData.patientId || !formData.testType) {
       toast.error('Please fill in required fields');
       return;
     }
 
     const patient = mockPatients.find(p => p.id === formData.patientId);
     const newTest: LabTest = {
       id: `L00${labTests.length + 1}`,
       patientId: formData.patientId,
       patientName: patient?.name || 'Unknown',
       orderedBy: 'Dr. Sarah Chen',
       testType: formData.testType,
       status: 'pending',
       priority: formData.priority as LabTest['priority'],
       orderedAt: new Date().toISOString(),
     };
 
     setLabTests([newTest, ...labTests]);
     setIsDialogOpen(false);
     setFormData({ patientId: '', testType: '', priority: 'routine' });
     toast.success('Lab test ordered successfully');
   };
 
   const handleEnterResults = () => {
     if (!selectedTest || !results) {
       toast.error('Please enter results');
       return;
     }
 
     setLabTests(labTests.map(test => {
       if (test.id === selectedTest.id) {
         return { 
           ...test, 
           status: 'completed' as const,
           results,
           completedAt: new Date().toISOString(),
         };
       }
       return test;
     }));
     
     setResultsDialogOpen(false);
     setSelectedTest(null);
     setResults('');
     toast.success('Results saved successfully');
   };
 
   const openResultsDialog = (test: LabTest) => {
     setSelectedTest(test);
     setResults(test.results || '');
     setResultsDialogOpen(true);
   };

  const columns: Column<LabTest>[] = [
    { 
      key: 'id', 
      header: 'Test ID',
      className: 'font-mono text-sm',
    },
    { 
      key: 'patientName', 
      header: 'Patient',
      render: (v) => <span className="font-medium">{v}</span>
    },
    { 
      key: 'testType', 
      header: 'Test Type',
    },
    { 
      key: 'orderedBy', 
      header: 'Ordered By',
      render: (v) => <span className="text-sm text-muted-foreground">{v}</span>
    },
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
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          {row.status === 'pending' && (
             <Button size="sm" onClick={() => handleStatusChange(row.id, 'in-progress')}>Start Processing</Button>
          )}
          {row.status === 'in-progress' && (
             <Button size="sm" variant="outline" onClick={() => openResultsDialog(row)}>Enter Results</Button>
          )}
          {row.status === 'completed' && (
             <Button size="sm" variant="ghost" onClick={() => openResultsDialog(row)}>View Results</Button>
          )}
        </div>
      )
    }
  ];

  const statusCounts = {
     all: labTests.length,
     pending: labTests.filter(t => t.status === 'pending').length,
     'in-progress': labTests.filter(t => t.status === 'in-progress').length,
     completed: labTests.filter(t => t.status === 'completed').length,
  };

   const urgentCount = labTests.filter(t => t.priority === 'stat' && t.status !== 'completed').length;

  return (
    <DashboardLayout 
      title="Laboratory" 
      subtitle="Manage lab test requests and results"
    >
      <div className="space-y-6 animate-fade-in">
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-warning/5 border-warning/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{statusCounts.pending}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-info/5 border-info/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                  <FlaskConical className="h-5 w-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{statusCounts['in-progress']}</p>
                  <p className="text-sm text-muted-foreground">Processing</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-success/5 border-success/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{statusCounts.completed}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-destructive/5 border-destructive/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{urgentCount}</p>
                  <p className="text-sm text-muted-foreground">Urgent (STAT)</p>
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
              placeholder="Search by patient or test type..."
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
                   New Test Order
                 </Button>
               </DialogTrigger>
               <DialogContent>
                 <DialogHeader>
                   <DialogTitle>Order New Lab Test</DialogTitle>
                   <DialogDescription>Create a new lab test order for a patient</DialogDescription>
                 </DialogHeader>
                 <form className="grid gap-4 py-4" onSubmit={handleAddTest}>
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
                   <div className="space-y-2">
                     <Label>Test Type *</Label>
                     <Select 
                       value={formData.testType}
                       onValueChange={(v) => setFormData({ ...formData, testType: v })}
                     >
                       <SelectTrigger>
                         <SelectValue placeholder="Select test type" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="Complete Blood Count (CBC)">Complete Blood Count (CBC)</SelectItem>
                         <SelectItem value="Lipid Panel">Lipid Panel</SelectItem>
                         <SelectItem value="Cardiac Enzymes">Cardiac Enzymes</SelectItem>
                         <SelectItem value="Troponin Test">Troponin Test</SelectItem>
                         <SelectItem value="Basic Metabolic Panel">Basic Metabolic Panel</SelectItem>
                         <SelectItem value="Liver Function Tests">Liver Function Tests</SelectItem>
                         <SelectItem value="Urinalysis">Urinalysis</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                   <div className="space-y-2">
                     <Label>Priority</Label>
                     <Select 
                       value={formData.priority}
                       onValueChange={(v) => setFormData({ ...formData, priority: v })}
                     >
                       <SelectTrigger>
                         <SelectValue placeholder="Select priority" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="routine">Routine</SelectItem>
                         <SelectItem value="urgent">Urgent</SelectItem>
                         <SelectItem value="stat">STAT</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                   <DialogFooter>
                     <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                     <Button type="submit">Order Test</Button>
                   </DialogFooter>
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
                <TabsTrigger value="pending">Pending ({statusCounts.pending})</TabsTrigger>
                <TabsTrigger value="in-progress">Processing ({statusCounts['in-progress']})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({statusCounts.completed})</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className="p-0 pt-4">
              <DataTable
                data={filteredTests}
                columns={columns}
                emptyMessage="No lab tests found"
              />
            </CardContent>
          </Tabs>
        </Card>
         
         {/* Results Dialog */}
         <Dialog open={resultsDialogOpen} onOpenChange={setResultsDialogOpen}>
           <DialogContent>
             <DialogHeader>
               <DialogTitle>
                 {selectedTest?.status === 'completed' ? 'View Results' : 'Enter Results'}
               </DialogTitle>
               <DialogDescription>
                 {selectedTest?.testType} for {selectedTest?.patientName}
               </DialogDescription>
             </DialogHeader>
             <div className="space-y-4 py-4">
               <div className="space-y-2">
                 <Label>Results</Label>
                 <Textarea
                   value={results}
                   onChange={(e) => setResults(e.target.value)}
                   placeholder="Enter test results..."
                   rows={6}
                   readOnly={selectedTest?.status === 'completed'}
                 />
               </div>
             </div>
             <DialogFooter>
               <Button variant="outline" onClick={() => setResultsDialogOpen(false)}>Close</Button>
               {selectedTest?.status !== 'completed' && (
                 <Button onClick={handleEnterResults}>Save Results</Button>
               )}
             </DialogFooter>
           </DialogContent>
         </Dialog>
      </div>
    </DashboardLayout>
  );
}
