 import { useState } from 'react';
 import { DashboardLayout } from '@/components/layout/DashboardLayout';
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { 
   FileText, 
   Download, 
   Calendar,
   Users,
   DollarSign,
   Activity,
   TrendingUp,
   TrendingDown,
   Filter,
   Printer
 } from 'lucide-react';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { mockPatients, mockAppointments, mockLabTests, mockPrescriptions } from '@/data/mockData';
 import { toast } from 'sonner';
 
 interface ReportCard {
   id: string;
   title: string;
   description: string;
   icon: React.ComponentType<{ className?: string }>;
   color: string;
   category: string;
 }
 
 const reportTypes: ReportCard[] = [
   {
     id: 'patient-census',
     title: 'Patient Census Report',
     description: 'Overview of patient registrations and demographics',
     icon: Users,
     color: 'bg-primary/10 text-primary',
     category: 'patients',
   },
   {
     id: 'appointment-summary',
     title: 'Appointment Summary',
     description: 'Daily, weekly, and monthly appointment statistics',
     icon: Calendar,
     color: 'bg-info/10 text-info',
     category: 'appointments',
   },
   {
     id: 'lab-analytics',
     title: 'Laboratory Analytics',
     description: 'Test volume, turnaround times, and results',
     icon: Activity,
     color: 'bg-warning/10 text-warning',
     category: 'lab',
   },
   {
     id: 'pharmacy-report',
     title: 'Pharmacy Dispensing Report',
     description: 'Medication dispensing and inventory status',
     icon: FileText,
     color: 'bg-success/10 text-success',
     category: 'pharmacy',
   },
   {
     id: 'revenue-report',
     title: 'Revenue Report',
     description: 'Financial summary and billing statistics',
     icon: DollarSign,
     color: 'bg-accent/10 text-accent',
     category: 'finance',
   },
   {
     id: 'staff-performance',
     title: 'Staff Performance',
     description: 'Staff productivity and workload analysis',
     icon: TrendingUp,
     color: 'bg-destructive/10 text-destructive',
     category: 'staff',
   },
 ];
 
 export default function Reports() {
   const [selectedPeriod, setSelectedPeriod] = useState('this-month');
   const [selectedCategory, setSelectedCategory] = useState('all');
 
   const filteredReports = reportTypes.filter(
     report => selectedCategory === 'all' || report.category === selectedCategory
   );
 
   const handleGenerateReport = (reportId: string, reportTitle: string) => {
     toast.success(`Generating ${reportTitle}...`, {
       description: 'Your report will be ready shortly.',
     });
     // Simulate report generation
     setTimeout(() => {
       toast.success(`${reportTitle} is ready!`, {
         description: 'Click to download or view.',
         action: {
           label: 'Download',
           onClick: () => handleDownload(reportId),
         },
       });
     }, 2000);
   };
 
   const handleDownload = (reportId: string) => {
     toast.success('Download started', {
       description: `${reportId}.pdf is being downloaded.`,
     });
   };
 
   const handlePrint = (reportId: string) => {
     toast.info('Preparing print preview...', {
       description: 'The print dialog will open shortly.',
     });
     setTimeout(() => window.print(), 500);
   };
 
   // Calculate summary stats
   const stats = {
     totalPatients: mockPatients.length,
     totalAppointments: mockAppointments.length,
     completedTests: mockLabTests.filter(t => t.status === 'completed').length,
     dispensedRx: mockPrescriptions.filter(p => p.status === 'dispensed').length,
   };
 
   return (
     <DashboardLayout 
       title="Reports" 
       subtitle="Generate and view hospital reports"
     >
       <div className="space-y-6 animate-fade-in">
         {/* Summary Stats */}
         <div className="grid gap-4 md:grid-cols-4">
           <Card>
             <CardContent className="p-4">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm text-muted-foreground">Total Patients</p>
                   <p className="text-2xl font-bold">{stats.totalPatients}</p>
                 </div>
                 <div className="flex items-center gap-1 text-success text-sm">
                   <TrendingUp className="h-4 w-4" />
                   <span>+12%</span>
                 </div>
               </div>
             </CardContent>
           </Card>
           <Card>
             <CardContent className="p-4">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm text-muted-foreground">Appointments</p>
                   <p className="text-2xl font-bold">{stats.totalAppointments}</p>
                 </div>
                 <div className="flex items-center gap-1 text-success text-sm">
                   <TrendingUp className="h-4 w-4" />
                   <span>+8%</span>
                 </div>
               </div>
             </CardContent>
           </Card>
           <Card>
             <CardContent className="p-4">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm text-muted-foreground">Lab Tests</p>
                   <p className="text-2xl font-bold">{stats.completedTests}</p>
                 </div>
                 <div className="flex items-center gap-1 text-destructive text-sm">
                   <TrendingDown className="h-4 w-4" />
                   <span>-3%</span>
                 </div>
               </div>
             </CardContent>
           </Card>
           <Card>
             <CardContent className="p-4">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm text-muted-foreground">Prescriptions</p>
                   <p className="text-2xl font-bold">{stats.dispensedRx}</p>
                 </div>
                 <div className="flex items-center gap-1 text-success text-sm">
                   <TrendingUp className="h-4 w-4" />
                   <span>+15%</span>
                 </div>
               </div>
             </CardContent>
           </Card>
         </div>
 
         {/* Filters */}
         <div className="flex flex-col sm:flex-row gap-4 justify-between">
           <div className="flex gap-3">
             <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
               <SelectTrigger className="w-[180px]">
                 <SelectValue placeholder="Select period" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="today">Today</SelectItem>
                 <SelectItem value="this-week">This Week</SelectItem>
                 <SelectItem value="this-month">This Month</SelectItem>
                 <SelectItem value="this-quarter">This Quarter</SelectItem>
                 <SelectItem value="this-year">This Year</SelectItem>
               </SelectContent>
             </Select>
             <Select value={selectedCategory} onValueChange={setSelectedCategory}>
               <SelectTrigger className="w-[180px]">
                 <SelectValue placeholder="Category" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="all">All Categories</SelectItem>
                 <SelectItem value="patients">Patients</SelectItem>
                 <SelectItem value="appointments">Appointments</SelectItem>
                 <SelectItem value="lab">Laboratory</SelectItem>
                 <SelectItem value="pharmacy">Pharmacy</SelectItem>
                 <SelectItem value="finance">Finance</SelectItem>
                 <SelectItem value="staff">Staff</SelectItem>
               </SelectContent>
             </Select>
           </div>
         </div>
 
         {/* Report Cards */}
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
           {filteredReports.map((report) => (
             <Card key={report.id} className="card-interactive">
               <CardHeader>
                 <div className="flex items-start gap-3">
                   <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${report.color}`}>
                     <report.icon className="h-5 w-5" />
                   </div>
                   <div className="flex-1">
                     <CardTitle className="text-base">{report.title}</CardTitle>
                     <CardDescription className="text-sm">{report.description}</CardDescription>
                   </div>
                 </div>
               </CardHeader>
               <CardContent>
                 <div className="flex gap-2">
                   <Button 
                     size="sm" 
                     className="flex-1"
                     onClick={() => handleGenerateReport(report.id, report.title)}
                   >
                     <FileText className="h-4 w-4 mr-2" />
                     Generate
                   </Button>
                   <Button 
                     size="sm" 
                     variant="outline"
                     onClick={() => handleDownload(report.id)}
                   >
                     <Download className="h-4 w-4" />
                   </Button>
                   <Button 
                     size="sm" 
                     variant="outline"
                     onClick={() => handlePrint(report.id)}
                   >
                     <Printer className="h-4 w-4" />
                   </Button>
                 </div>
               </CardContent>
             </Card>
           ))}
         </div>
 
         {/* Recent Reports */}
         <Card>
           <CardHeader>
             <CardTitle>Recently Generated Reports</CardTitle>
             <CardDescription>Your last 5 generated reports</CardDescription>
           </CardHeader>
           <CardContent>
             <div className="space-y-3">
               {[
                 { name: 'Patient Census Report - December 2024', date: '2024-12-20', size: '2.4 MB' },
                 { name: 'Weekly Appointment Summary', date: '2024-12-19', size: '1.1 MB' },
                 { name: 'Laboratory Analytics - Q4', date: '2024-12-18', size: '3.8 MB' },
                 { name: 'Revenue Report - November 2024', date: '2024-12-15', size: '4.2 MB' },
                 { name: 'Staff Performance Review', date: '2024-12-10', size: '1.9 MB' },
               ].map((report, i) => (
                 <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                   <div className="flex items-center gap-3">
                     <FileText className="h-5 w-5 text-muted-foreground" />
                     <div>
                       <p className="font-medium text-sm">{report.name}</p>
                       <p className="text-xs text-muted-foreground">{report.date} • {report.size}</p>
                     </div>
                   </div>
                   <Button 
                     size="sm" 
                     variant="ghost"
                     onClick={() => handleDownload(report.name)}
                   >
                     <Download className="h-4 w-4" />
                   </Button>
                 </div>
               ))}
             </div>
           </CardContent>
         </Card>
       </div>
     </DashboardLayout>
   );
 }