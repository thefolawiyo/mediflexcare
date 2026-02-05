 import { useState } from 'react';
 import { DashboardLayout } from '@/components/layout/DashboardLayout';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { DataTable, Column } from '@/components/ui/data-table';
 import { StatusBadge, getStatusVariant } from '@/components/ui/status-badge';
 import { mockPatients, mockAppointments, mockVitals } from '@/data/mockData';
 import { 
   Search, 
   Heart,
   Activity,
   Clipboard,
   CheckCircle,
   Clock,
   AlertTriangle,
   User
 } from 'lucide-react';
 import { Checkbox } from '@/components/ui/checkbox';
 import { toast } from 'sonner';
 
 interface CareTask {
   id: string;
   patientId: string;
   patientName: string;
   task: string;
   priority: 'high' | 'medium' | 'low';
   dueTime: string;
   status: 'pending' | 'completed';
 }
 
 const initialCareTasks: CareTask[] = [
   { id: 'CT001', patientId: 'P001', patientName: 'John Smith', task: 'Administer medication - Lisinopril 10mg', priority: 'high', dueTime: '09:00', status: 'completed' },
   { id: 'CT002', patientId: 'P002', patientName: 'Emma Johnson', task: 'Check vital signs', priority: 'medium', dueTime: '10:30', status: 'completed' },
   { id: 'CT003', patientId: 'P003', patientName: 'Robert Williams', task: 'Wound dressing change', priority: 'high', dueTime: '11:00', status: 'pending' },
   { id: 'CT004', patientId: 'P001', patientName: 'John Smith', task: 'Post-procedure monitoring', priority: 'medium', dueTime: '12:00', status: 'pending' },
   { id: 'CT005', patientId: 'P004', patientName: 'Lisa Anderson', task: 'Blood glucose check', priority: 'high', dueTime: '14:00', status: 'pending' },
   { id: 'CT006', patientId: 'P005', patientName: 'David Brown', task: 'Physical therapy assistance', priority: 'low', dueTime: '15:00', status: 'pending' },
 ];
 
 export default function NurseCare() {
   const [searchQuery, setSearchQuery] = useState('');
   const [careTasks, setCareTasks] = useState<CareTask[]>(initialCareTasks);
   const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
 
   const filteredTasks = careTasks.filter(task => {
     const matchesSearch = task.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
       task.task.toLowerCase().includes(searchQuery.toLowerCase());
     const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
     return matchesSearch && matchesStatus;
   });
 
   const handleToggleTask = (taskId: string) => {
     setCareTasks(tasks => tasks.map(task => {
       if (task.id === taskId) {
         const newStatus = task.status === 'pending' ? 'completed' : 'pending';
         toast.success(newStatus === 'completed' ? 'Task marked as completed' : 'Task marked as pending');
         return { ...task, status: newStatus };
       }
       return task;
     }));
   };
 
   const getPriorityColor = (priority: string) => {
     const colors: Record<string, string> = {
       high: 'bg-destructive/10 text-destructive',
       medium: 'bg-warning/10 text-warning',
       low: 'bg-info/10 text-info',
     };
     return colors[priority] || 'bg-muted text-muted-foreground';
   };
 
   const columns: Column<CareTask>[] = [
     {
       key: 'status',
       header: '',
       render: (v, row) => (
         <Checkbox 
           checked={v === 'completed'}
           onCheckedChange={() => handleToggleTask(row.id)}
         />
       )
     },
     { 
       key: 'patientName', 
       header: 'Patient',
       render: (v, row) => (
         <div className="flex items-center gap-3">
           <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
             <User className="h-4 w-4 text-primary" />
           </div>
           <span className="font-medium">{v}</span>
         </div>
       )
     },
     { 
       key: 'task', 
       header: 'Care Task',
       render: (v, row) => (
         <span className={row.status === 'completed' ? 'line-through text-muted-foreground' : ''}>
           {v}
         </span>
       )
     },
     { 
       key: 'priority', 
       header: 'Priority',
       render: (v) => (
         <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium capitalize ${getPriorityColor(v)}`}>
           {v}
         </span>
       )
     },
     { 
       key: 'dueTime', 
       header: 'Due Time',
       render: (v) => (
         <div className="flex items-center gap-2">
           <Clock className="h-4 w-4 text-muted-foreground" />
           <span className="font-mono">{v}</span>
         </div>
       )
     },
     { 
       key: 'status', 
       header: 'Status',
       render: (v) => (
         <StatusBadge variant={v === 'completed' ? 'success' : 'warning'}>
           {v}
         </StatusBadge>
       )
     },
   ];
 
   const stats = {
     totalTasks: careTasks.length,
     completedTasks: careTasks.filter(t => t.status === 'completed').length,
     pendingTasks: careTasks.filter(t => t.status === 'pending').length,
     highPriorityPending: careTasks.filter(t => t.priority === 'high' && t.status === 'pending').length,
   };
 
   return (
     <DashboardLayout 
       title="Patient Care" 
       subtitle="Manage care tasks and patient monitoring"
     >
       <div className="space-y-6 animate-fade-in">
         {/* Summary Stats */}
         <div className="grid gap-4 md:grid-cols-4">
           <Card>
             <CardContent className="p-4">
               <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                   <Clipboard className="h-5 w-5 text-primary" />
                 </div>
                 <div>
                   <p className="text-2xl font-bold">{stats.totalTasks}</p>
                   <p className="text-sm text-muted-foreground">Total Tasks</p>
                 </div>
               </div>
             </CardContent>
           </Card>
           <Card>
             <CardContent className="p-4">
               <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                   <CheckCircle className="h-5 w-5 text-success" />
                 </div>
                 <div>
                   <p className="text-2xl font-bold">{stats.completedTasks}</p>
                   <p className="text-sm text-muted-foreground">Completed</p>
                 </div>
               </div>
             </CardContent>
           </Card>
           <Card>
             <CardContent className="p-4">
               <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                   <Clock className="h-5 w-5 text-warning" />
                 </div>
                 <div>
                   <p className="text-2xl font-bold">{stats.pendingTasks}</p>
                   <p className="text-sm text-muted-foreground">Pending</p>
                 </div>
               </div>
             </CardContent>
           </Card>
           <Card>
             <CardContent className="p-4">
               <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                   <AlertTriangle className="h-5 w-5 text-destructive" />
                 </div>
                 <div>
                   <p className="text-2xl font-bold">{stats.highPriorityPending}</p>
                   <p className="text-sm text-muted-foreground">High Priority</p>
                 </div>
               </div>
             </CardContent>
           </Card>
         </div>
 
         {/* Filters */}
         <div className="flex flex-col sm:flex-row gap-4 justify-between">
           <div className="relative flex-1 max-w-md">
             <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
             <Input
               placeholder="Search tasks or patients..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="pl-9"
             />
           </div>
           <div className="flex gap-2">
             <Button 
               variant={filterStatus === 'all' ? 'default' : 'outline'} 
               size="sm"
               onClick={() => setFilterStatus('all')}
             >
               All
             </Button>
             <Button 
               variant={filterStatus === 'pending' ? 'default' : 'outline'} 
               size="sm"
               onClick={() => setFilterStatus('pending')}
             >
               Pending
             </Button>
             <Button 
               variant={filterStatus === 'completed' ? 'default' : 'outline'} 
               size="sm"
               onClick={() => setFilterStatus('completed')}
             >
               Completed
             </Button>
           </div>
         </div>
 
         {/* Tasks Table */}
         <Card>
           <CardContent className="p-0">
             <DataTable
               data={filteredTasks}
               columns={columns}
               emptyMessage="No care tasks found"
             />
           </CardContent>
         </Card>
       </div>
     </DashboardLayout>
   );
 }