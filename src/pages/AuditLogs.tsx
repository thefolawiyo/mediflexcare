 import { useState } from 'react';
 import { DashboardLayout } from '@/components/layout/DashboardLayout';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { DataTable, Column } from '@/components/ui/data-table';
 import { StatusBadge } from '@/components/ui/status-badge';
 import { 
   Search, 
   Filter,
   Download,
   RefreshCw,
   Activity,
   Shield,
   AlertTriangle,
   Info,
   User,
   Calendar,
   FileText
 } from 'lucide-react';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { toast } from 'sonner';
 
 interface AuditLog {
   id: string;
   timestamp: string;
   user: string;
   role: string;
   action: string;
   resource: string;
   details: string;
   ipAddress: string;
   status: 'success' | 'warning' | 'error';
 }
 
 const mockAuditLogs: AuditLog[] = [
   {
     id: 'AL001',
     timestamp: '2024-12-20 14:32:15',
     user: 'Dr. Sarah Chen',
     role: 'doctor',
     action: 'VIEW',
     resource: 'Patient Record',
     details: 'Viewed patient John Smith (P001)',
     ipAddress: '192.168.1.105',
     status: 'success',
   },
   {
     id: 'AL002',
     timestamp: '2024-12-20 14:28:42',
     user: 'Admin Rachel Green',
     role: 'admin',
     action: 'CREATE',
     resource: 'Staff Account',
     details: 'Created new nurse account for Mary Johnson',
     ipAddress: '192.168.1.100',
     status: 'success',
   },
   {
     id: 'AL003',
     timestamp: '2024-12-20 14:15:33',
     user: 'Nurse James Wilson',
     role: 'nurse',
     action: 'UPDATE',
     resource: 'Vitals',
     details: 'Updated vitals for Emma Johnson (P002)',
     ipAddress: '192.168.1.112',
     status: 'success',
   },
   {
     id: 'AL004',
     timestamp: '2024-12-20 13:58:20',
     user: 'Dr. Sarah Chen',
     role: 'doctor',
     action: 'CREATE',
     resource: 'Prescription',
     details: 'Created prescription RX003 for Robert Williams',
     ipAddress: '192.168.1.105',
     status: 'success',
   },
   {
     id: 'AL005',
     timestamp: '2024-12-20 13:45:11',
     user: 'Maria Santos',
     role: 'receptionist',
     action: 'UPDATE',
     resource: 'Appointment',
     details: 'Checked in patient for appointment A002',
     ipAddress: '192.168.1.108',
     status: 'success',
   },
   {
     id: 'AL006',
     timestamp: '2024-12-20 13:30:05',
     user: 'Unknown',
     role: 'unknown',
     action: 'LOGIN_FAILED',
     resource: 'Authentication',
     details: 'Failed login attempt with email test@test.com',
     ipAddress: '203.45.67.89',
     status: 'error',
   },
   {
     id: 'AL007',
     timestamp: '2024-12-20 13:22:18',
     user: 'Dr. Michael Ross',
     role: 'lab',
     action: 'UPDATE',
     resource: 'Lab Test',
     details: 'Completed lab test L001 - CBC',
     ipAddress: '192.168.1.115',
     status: 'success',
   },
   {
     id: 'AL008',
     timestamp: '2024-12-20 12:55:44',
     user: 'Emily Davis',
     role: 'pharmacy',
     action: 'UPDATE',
     resource: 'Prescription',
     details: 'Dispensed prescription RX001',
     ipAddress: '192.168.1.120',
     status: 'success',
   },
   {
     id: 'AL009',
     timestamp: '2024-12-20 12:40:33',
     user: 'Admin Rachel Green',
     role: 'admin',
     action: 'DELETE',
     resource: 'Old Records',
     details: 'Archived patient records older than 7 years',
     ipAddress: '192.168.1.100',
     status: 'warning',
   },
   {
     id: 'AL010',
     timestamp: '2024-12-20 12:15:22',
     user: 'System',
     role: 'system',
     action: 'BACKUP',
     resource: 'Database',
     details: 'Automated daily backup completed',
     ipAddress: 'localhost',
     status: 'success',
   },
 ];
 
 export default function AuditLogs() {
   const [searchQuery, setSearchQuery] = useState('');
   const [selectedAction, setSelectedAction] = useState('all');
   const [selectedStatus, setSelectedStatus] = useState('all');
   const [logs, setLogs] = useState<AuditLog[]>(mockAuditLogs);
 
   const filteredLogs = logs.filter(log => {
     const matchesSearch = 
       log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
       log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
       log.details.toLowerCase().includes(searchQuery.toLowerCase());
     
     const matchesAction = selectedAction === 'all' || log.action === selectedAction;
     const matchesStatus = selectedStatus === 'all' || log.status === selectedStatus;
     
     return matchesSearch && matchesAction && matchesStatus;
   });
 
   const getActionColor = (action: string) => {
     const colors: Record<string, string> = {
       VIEW: 'bg-info/10 text-info',
       CREATE: 'bg-success/10 text-success',
       UPDATE: 'bg-warning/10 text-warning',
       DELETE: 'bg-destructive/10 text-destructive',
       LOGIN_FAILED: 'bg-destructive/10 text-destructive',
       BACKUP: 'bg-primary/10 text-primary',
     };
     return colors[action] || 'bg-muted text-muted-foreground';
   };
 
   const columns: Column<AuditLog>[] = [
     { 
       key: 'timestamp', 
       header: 'Timestamp',
       className: 'font-mono text-sm',
     },
     { 
       key: 'user', 
       header: 'User',
       render: (_, row) => (
         <div className="flex items-center gap-2">
           <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
             <User className="h-4 w-4 text-primary" />
           </div>
           <div>
             <p className="font-medium text-sm">{row.user}</p>
             <p className="text-xs text-muted-foreground capitalize">{row.role}</p>
           </div>
         </div>
       )
     },
     { 
       key: 'action', 
       header: 'Action',
       render: (v) => (
         <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getActionColor(v)}`}>
           {v}
         </span>
       )
     },
     { 
       key: 'resource', 
       header: 'Resource',
     },
     { 
       key: 'details', 
       header: 'Details',
       render: (v) => <span className="text-sm text-muted-foreground">{v}</span>
     },
     { 
       key: 'ipAddress', 
       header: 'IP Address',
       className: 'font-mono text-sm',
     },
     { 
       key: 'status', 
       header: 'Status',
       render: (v) => (
         <StatusBadge variant={v === 'success' ? 'success' : v === 'warning' ? 'warning' : 'error'}>
           {v}
         </StatusBadge>
       )
     },
   ];
 
   const handleRefresh = () => {
     toast.info('Refreshing audit logs...');
     // Simulate refresh
     setTimeout(() => {
       toast.success('Audit logs refreshed');
     }, 1000);
   };
 
   const handleExport = () => {
     toast.success('Exporting audit logs...', {
       description: 'Your download will start shortly.',
     });
   };
 
   const actionCounts = {
     total: logs.length,
     success: logs.filter(l => l.status === 'success').length,
     warning: logs.filter(l => l.status === 'warning').length,
     error: logs.filter(l => l.status === 'error').length,
   };
 
   return (
     <DashboardLayout 
       title="Audit Logs" 
       subtitle="Track all system activities and changes"
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
                   <p className="text-2xl font-bold">{actionCounts.total}</p>
                   <p className="text-sm text-muted-foreground">Total Events</p>
                 </div>
               </div>
             </CardContent>
           </Card>
           <Card>
             <CardContent className="p-4">
               <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                   <Shield className="h-5 w-5 text-success" />
                 </div>
                 <div>
                   <p className="text-2xl font-bold">{actionCounts.success}</p>
                   <p className="text-sm text-muted-foreground">Successful</p>
                 </div>
               </div>
             </CardContent>
           </Card>
           <Card>
             <CardContent className="p-4">
               <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                   <Info className="h-5 w-5 text-warning" />
                 </div>
                 <div>
                   <p className="text-2xl font-bold">{actionCounts.warning}</p>
                   <p className="text-sm text-muted-foreground">Warnings</p>
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
                   <p className="text-2xl font-bold">{actionCounts.error}</p>
                   <p className="text-sm text-muted-foreground">Errors</p>
                 </div>
               </div>
             </CardContent>
           </Card>
         </div>
 
         {/* Filters & Actions */}
         <div className="flex flex-col sm:flex-row gap-4 justify-between">
           <div className="flex flex-1 gap-3">
             <div className="relative flex-1 max-w-md">
               <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
               <Input
                 placeholder="Search logs..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="pl-9"
               />
             </div>
             <Select value={selectedAction} onValueChange={setSelectedAction}>
               <SelectTrigger className="w-[140px]">
                 <SelectValue placeholder="Action" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="all">All Actions</SelectItem>
                 <SelectItem value="VIEW">View</SelectItem>
                 <SelectItem value="CREATE">Create</SelectItem>
                 <SelectItem value="UPDATE">Update</SelectItem>
                 <SelectItem value="DELETE">Delete</SelectItem>
                 <SelectItem value="LOGIN_FAILED">Login Failed</SelectItem>
               </SelectContent>
             </Select>
             <Select value={selectedStatus} onValueChange={setSelectedStatus}>
               <SelectTrigger className="w-[140px]">
                 <SelectValue placeholder="Status" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="all">All Status</SelectItem>
                 <SelectItem value="success">Success</SelectItem>
                 <SelectItem value="warning">Warning</SelectItem>
                 <SelectItem value="error">Error</SelectItem>
               </SelectContent>
             </Select>
           </div>
           <div className="flex gap-2">
             <Button variant="outline" onClick={handleRefresh}>
               <RefreshCw className="h-4 w-4 mr-2" />
               Refresh
             </Button>
             <Button variant="outline" onClick={handleExport}>
               <Download className="h-4 w-4 mr-2" />
               Export
             </Button>
           </div>
         </div>
 
         {/* Logs Table */}
         <Card>
           <CardContent className="p-0">
             <DataTable
               data={filteredLogs}
               columns={columns}
               emptyMessage="No audit logs found"
             />
           </CardContent>
         </Card>
       </div>
     </DashboardLayout>
   );
 }