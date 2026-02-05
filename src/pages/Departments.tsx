 import { useState } from 'react';
 import { DashboardLayout } from '@/components/layout/DashboardLayout';
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Textarea } from '@/components/ui/textarea';
 import { 
   Building2, 
   Plus, 
   Search,
   Users,
   Stethoscope,
   Edit,
   Trash2,
   Phone,
   Mail,
   MapPin
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
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
   AlertDialogTrigger,
 } from '@/components/ui/alert-dialog';
 import { StatusBadge } from '@/components/ui/status-badge';
 import { toast } from 'sonner';
 
 interface Department {
   id: string;
   name: string;
   head: string;
   staffCount: number;
   location: string;
   phone: string;
   email: string;
   status: 'active' | 'inactive';
   description: string;
 }
 
 const initialDepartments: Department[] = [
   {
     id: 'D001',
     name: 'Cardiology',
     head: 'Dr. Sarah Chen',
     staffCount: 15,
     location: 'Building A, Floor 3',
     phone: '+1 (555) 100-0001',
     email: 'cardiology@mediflex.com',
     status: 'active',
     description: 'Heart and cardiovascular system care',
   },
   {
     id: 'D002',
     name: 'General Medicine',
     head: 'Dr. James Wilson',
     staffCount: 22,
     location: 'Building A, Floor 1',
     phone: '+1 (555) 100-0002',
     email: 'general@mediflex.com',
     status: 'active',
     description: 'Primary care and general health services',
   },
   {
     id: 'D003',
     name: 'Orthopedics',
     head: 'Dr. Robert Miller',
     staffCount: 12,
     location: 'Building B, Floor 2',
     phone: '+1 (555) 100-0003',
     email: 'ortho@mediflex.com',
     status: 'active',
     description: 'Bone, joint, and muscle care',
   },
   {
     id: 'D004',
     name: 'Pediatrics',
     head: 'Dr. Emily Davis',
     staffCount: 18,
     location: 'Building C, Floor 1',
     phone: '+1 (555) 100-0004',
     email: 'pediatrics@mediflex.com',
     status: 'active',
     description: 'Healthcare for infants, children, and adolescents',
   },
   {
     id: 'D005',
     name: 'Neurology',
     head: 'Dr. Michael Ross',
     staffCount: 10,
     location: 'Building A, Floor 4',
     phone: '+1 (555) 100-0005',
     email: 'neuro@mediflex.com',
     status: 'active',
     description: 'Brain and nervous system disorders',
   },
   {
     id: 'D006',
     name: 'Radiology',
     head: 'Dr. Lisa Anderson',
     staffCount: 8,
     location: 'Building B, Ground Floor',
     phone: '+1 (555) 100-0006',
     email: 'radiology@mediflex.com',
     status: 'active',
     description: 'Medical imaging and diagnostics',
   },
 ];
 
 export default function Departments() {
   const [departments, setDepartments] = useState<Department[]>(initialDepartments);
   const [searchQuery, setSearchQuery] = useState('');
   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
   const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
   const [formData, setFormData] = useState({
     name: '',
     head: '',
     location: '',
     phone: '',
     email: '',
     description: '',
   });
 
   const filteredDepartments = departments.filter(dept =>
     dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     dept.head.toLowerCase().includes(searchQuery.toLowerCase())
   );
 
   const handleAddDepartment = () => {
     if (!formData.name || !formData.head) {
       toast.error('Please fill in required fields');
       return;
     }
 
     const newDepartment: Department = {
       id: `D00${departments.length + 1}`,
       name: formData.name,
       head: formData.head,
       staffCount: 0,
       location: formData.location,
       phone: formData.phone,
       email: formData.email,
       status: 'active',
       description: formData.description,
     };
 
     setDepartments([...departments, newDepartment]);
     setIsAddDialogOpen(false);
     setFormData({ name: '', head: '', location: '', phone: '', email: '', description: '' });
     toast.success('Department created successfully');
   };
 
   const handleEditDepartment = () => {
     if (!editingDepartment) return;
 
     setDepartments(departments.map(dept =>
       dept.id === editingDepartment.id
         ? { ...dept, ...formData }
         : dept
     ));
     setEditingDepartment(null);
     setFormData({ name: '', head: '', location: '', phone: '', email: '', description: '' });
     toast.success('Department updated successfully');
   };
 
   const handleDeleteDepartment = (id: string) => {
     setDepartments(departments.filter(dept => dept.id !== id));
     toast.success('Department deleted successfully');
   };
 
   const openEditDialog = (dept: Department) => {
     setEditingDepartment(dept);
     setFormData({
       name: dept.name,
       head: dept.head,
       location: dept.location,
       phone: dept.phone,
       email: dept.email,
       description: dept.description,
     });
   };
 
   const totalStaff = departments.reduce((sum, dept) => sum + dept.staffCount, 0);
 
   return (
     <DashboardLayout 
       title="Departments" 
       subtitle={`${departments.length} departments • ${totalStaff} total staff`}
     >
       <div className="space-y-6 animate-fade-in">
         {/* Summary Stats */}
         <div className="grid gap-4 md:grid-cols-3">
           <Card>
             <CardContent className="p-4">
               <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                   <Building2 className="h-5 w-5 text-primary" />
                 </div>
                 <div>
                   <p className="text-2xl font-bold">{departments.length}</p>
                   <p className="text-sm text-muted-foreground">Total Departments</p>
                 </div>
               </div>
             </CardContent>
           </Card>
           <Card>
             <CardContent className="p-4">
               <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                   <Users className="h-5 w-5 text-info" />
                 </div>
                 <div>
                   <p className="text-2xl font-bold">{totalStaff}</p>
                   <p className="text-sm text-muted-foreground">Total Staff</p>
                 </div>
               </div>
             </CardContent>
           </Card>
           <Card>
             <CardContent className="p-4">
               <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                   <Stethoscope className="h-5 w-5 text-success" />
                 </div>
                 <div>
                   <p className="text-2xl font-bold">{departments.filter(d => d.status === 'active').length}</p>
                   <p className="text-sm text-muted-foreground">Active Departments</p>
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
               placeholder="Search departments..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="pl-9"
             />
           </div>
           <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
             <DialogTrigger asChild>
               <Button>
                 <Plus className="h-4 w-4 mr-2" />
                 Add Department
               </Button>
             </DialogTrigger>
             <DialogContent>
               <DialogHeader>
                 <DialogTitle>Add New Department</DialogTitle>
                 <DialogDescription>Create a new hospital department</DialogDescription>
               </DialogHeader>
               <div className="grid gap-4 py-4">
                 <div className="space-y-2">
                   <Label htmlFor="name">Department Name *</Label>
                   <Input
                     id="name"
                     value={formData.name}
                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                     placeholder="e.g., Cardiology"
                   />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="head">Department Head *</Label>
                   <Input
                     id="head"
                     value={formData.head}
                     onChange={(e) => setFormData({ ...formData, head: e.target.value })}
                     placeholder="e.g., Dr. John Doe"
                   />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="location">Location</Label>
                   <Input
                     id="location"
                     value={formData.location}
                     onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                     placeholder="e.g., Building A, Floor 3"
                   />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label htmlFor="phone">Phone</Label>
                     <Input
                       id="phone"
                       value={formData.phone}
                       onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                       placeholder="+1 (555) 000-0000"
                     />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="email">Email</Label>
                     <Input
                       id="email"
                       type="email"
                       value={formData.email}
                       onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                       placeholder="dept@mediflex.com"
                     />
                   </div>
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="description">Description</Label>
                   <Textarea
                     id="description"
                     value={formData.description}
                     onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                     placeholder="Brief description of the department..."
                   />
                 </div>
               </div>
               <DialogFooter>
                 <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                 <Button onClick={handleAddDepartment}>Create Department</Button>
               </DialogFooter>
             </DialogContent>
           </Dialog>
         </div>
 
         {/* Department Cards */}
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
           {filteredDepartments.map((dept) => (
             <Card key={dept.id} className="card-interactive">
               <CardHeader className="pb-3">
                 <div className="flex items-start justify-between">
                   <div className="flex items-center gap-3">
                     <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                       <Building2 className="h-5 w-5 text-primary" />
                     </div>
                     <div>
                       <CardTitle className="text-base">{dept.name}</CardTitle>
                       <CardDescription>{dept.head}</CardDescription>
                     </div>
                   </div>
                   <StatusBadge variant={dept.status === 'active' ? 'success' : 'default'}>
                     {dept.status}
                   </StatusBadge>
                 </div>
               </CardHeader>
               <CardContent className="space-y-3">
                 <p className="text-sm text-muted-foreground">{dept.description}</p>
                 
                 <div className="space-y-2 text-sm">
                   <div className="flex items-center gap-2 text-muted-foreground">
                     <Users className="h-4 w-4" />
                     <span>{dept.staffCount} staff members</span>
                   </div>
                   <div className="flex items-center gap-2 text-muted-foreground">
                     <MapPin className="h-4 w-4" />
                     <span>{dept.location}</span>
                   </div>
                   <div className="flex items-center gap-2 text-muted-foreground">
                     <Phone className="h-4 w-4" />
                     <span>{dept.phone}</span>
                   </div>
                   <div className="flex items-center gap-2 text-muted-foreground">
                     <Mail className="h-4 w-4" />
                     <span>{dept.email}</span>
                   </div>
                 </div>
 
                 <div className="flex gap-2 pt-3 border-t">
                   <Dialog open={editingDepartment?.id === dept.id} onOpenChange={(open) => !open && setEditingDepartment(null)}>
                     <DialogTrigger asChild>
                       <Button size="sm" variant="outline" className="flex-1" onClick={() => openEditDialog(dept)}>
                         <Edit className="h-4 w-4 mr-2" />
                         Edit
                       </Button>
                     </DialogTrigger>
                     <DialogContent>
                       <DialogHeader>
                         <DialogTitle>Edit Department</DialogTitle>
                         <DialogDescription>Update department information</DialogDescription>
                       </DialogHeader>
                       <div className="grid gap-4 py-4">
                         <div className="space-y-2">
                           <Label>Department Name</Label>
                           <Input
                             value={formData.name}
                             onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                           />
                         </div>
                         <div className="space-y-2">
                           <Label>Department Head</Label>
                           <Input
                             value={formData.head}
                             onChange={(e) => setFormData({ ...formData, head: e.target.value })}
                           />
                         </div>
                         <div className="space-y-2">
                           <Label>Location</Label>
                           <Input
                             value={formData.location}
                             onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                           />
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                             <Label>Phone</Label>
                             <Input
                               value={formData.phone}
                               onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                             />
                           </div>
                           <div className="space-y-2">
                             <Label>Email</Label>
                             <Input
                               value={formData.email}
                               onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                             />
                           </div>
                         </div>
                         <div className="space-y-2">
                           <Label>Description</Label>
                           <Textarea
                             value={formData.description}
                             onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                           />
                         </div>
                       </div>
                       <DialogFooter>
                         <Button variant="outline" onClick={() => setEditingDepartment(null)}>Cancel</Button>
                         <Button onClick={handleEditDepartment}>Save Changes</Button>
                       </DialogFooter>
                     </DialogContent>
                   </Dialog>
                   
                   <AlertDialog>
                     <AlertDialogTrigger asChild>
                       <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                         <Trash2 className="h-4 w-4" />
                       </Button>
                     </AlertDialogTrigger>
                     <AlertDialogContent>
                       <AlertDialogHeader>
                         <AlertDialogTitle>Delete Department?</AlertDialogTitle>
                         <AlertDialogDescription>
                           This action cannot be undone. This will permanently delete the {dept.name} department.
                         </AlertDialogDescription>
                       </AlertDialogHeader>
                       <AlertDialogFooter>
                         <AlertDialogCancel>Cancel</AlertDialogCancel>
                         <AlertDialogAction 
                           onClick={() => handleDeleteDepartment(dept.id)}
                           className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                         >
                           Delete
                         </AlertDialogAction>
                       </AlertDialogFooter>
                     </AlertDialogContent>
                   </AlertDialog>
                 </div>
               </CardContent>
             </Card>
           ))}
         </div>
 
         {filteredDepartments.length === 0 && (
           <Card>
             <CardContent className="flex flex-col items-center justify-center py-12">
               <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
               <p className="text-lg font-medium text-muted-foreground">No departments found</p>
               <p className="text-sm text-muted-foreground">Try adjusting your search or add a new department</p>
             </CardContent>
           </Card>
         )}
       </div>
     </DashboardLayout>
   );
 }