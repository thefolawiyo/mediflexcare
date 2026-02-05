import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, Column } from '@/components/ui/data-table';
import { StatusBadge, getStatusVariant } from '@/components/ui/status-badge';
 import { mockStaff as initialStaff } from '@/data/mockData';
import { StaffMember, UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, 
  Plus, 
  Filter,
  Users,
  Stethoscope,
  Heart,
  UserCog,
  FlaskConical,
  Pill
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
 import { Label } from '@/components/ui/label';
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from '@/components/ui/select';
 import { toast } from 'sonner';

export default function AdminStaff() {
  const [searchQuery, setSearchQuery] = useState('');
   const [staff, setStaff] = useState<StaffMember[]>(initialStaff);
   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
   const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
   const [formData, setFormData] = useState({
     name: '',
     email: '',
     role: '' as UserRole | '',
     department: '',
     phone: '',
     specialization: '',
   });

   const filteredStaff = staff.filter(s =>
     s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
     s.department.toLowerCase().includes(searchQuery.toLowerCase())
  );
 
   const handleAddStaff = () => {
     if (!formData.name || !formData.email || !formData.role || !formData.department) {
       toast.error('Please fill in required fields');
       return;
     }
 
     const newStaff: StaffMember = {
       id: `S00${staff.length + 1}`,
       name: formData.name,
       email: formData.email,
       role: formData.role as UserRole,
       department: formData.department,
       phone: formData.phone || '+1 (555) 000-0000',
       status: 'active',
       joinedAt: new Date().toISOString().split('T')[0],
       specialization: formData.specialization || undefined,
     };
 
     setStaff([newStaff, ...staff]);
     setIsAddDialogOpen(false);
     resetForm();
     toast.success('Staff member added successfully');
   };
 
   const handleEditStaff = () => {
     if (!editingStaff) return;
 
     setStaff(staff.map(s =>
       s.id === editingStaff.id
         ? { 
             ...s, 
             name: formData.name || s.name,
             email: formData.email || s.email,
             department: formData.department || s.department,
             phone: formData.phone || s.phone,
             specialization: formData.specialization || s.specialization,
           }
         : s
     ));
     setEditingStaff(null);
     resetForm();
     toast.success('Staff member updated successfully');
   };
 
   const openEditDialog = (s: StaffMember) => {
     setEditingStaff(s);
     setFormData({
       name: s.name,
       email: s.email,
       role: s.role,
       department: s.department,
       phone: s.phone,
       specialization: s.specialization || '',
     });
   };
 
   const resetForm = () => {
     setFormData({
       name: '',
       email: '',
       role: '',
       department: '',
       phone: '',
       specialization: '',
     });
   };

  const getRoleIcon = (role: UserRole) => {
    const icons = {
      doctor: Stethoscope,
      nurse: Heart,
      admin: UserCog,
      receptionist: Users,
      lab: FlaskConical,
      pharmacy: Pill,
      patient: Users,
    };
    return icons[role] || Users;
  };

  const getRoleColor = (role: UserRole) => {
    const colors = {
      doctor: 'bg-info/10 text-info',
      nurse: 'bg-accent/10 text-accent',
      admin: 'bg-primary/10 text-primary',
      receptionist: 'bg-success/10 text-success',
      lab: 'bg-warning/10 text-warning',
      pharmacy: 'bg-destructive/10 text-destructive',
      patient: 'bg-muted text-muted-foreground',
    };
    return colors[role] || 'bg-muted text-muted-foreground';
  };

  const columns: Column<StaffMember>[] = [
    { 
      key: 'name', 
      header: 'Staff Member',
      render: (_, row) => {
        const Icon = getRoleIcon(row.role);
        return (
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getRoleColor(row.role)}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">{row.name}</p>
              <p className="text-xs text-muted-foreground">{row.email}</p>
            </div>
          </div>
        )
      }
    },
    { 
      key: 'role', 
      header: 'Role',
      render: (v) => <span className="capitalize font-medium">{v}</span>
    },
    { 
      key: 'department', 
      header: 'Department',
    },
    { 
      key: 'specialization', 
      header: 'Specialization',
      render: (v) => v || '-'
    },
    { 
      key: 'phone', 
      header: 'Phone',
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
           <Button size="sm" variant="outline" onClick={() => openEditDialog(row)}>Edit</Button>
           <Button size="sm" variant="ghost" onClick={() => toast.info(`Viewing ${row.name}'s profile`)}>View</Button>
        </div>
      )
    }
  ];

  const roleCounts = {
     doctor: staff.filter(s => s.role === 'doctor').length,
     nurse: staff.filter(s => s.role === 'nurse').length,
     receptionist: staff.filter(s => s.role === 'receptionist').length,
     lab: staff.filter(s => s.role === 'lab').length,
     admin: staff.filter(s => s.role === 'admin').length,
  };

  return (
    <DashboardLayout 
      title="Staff Management" 
       subtitle={`${staff.length} staff members`}
    >
      <div className="space-y-6 animate-fade-in">
        {/* Role Stats */}
        <div className="grid gap-4 md:grid-cols-5">
          {Object.entries(roleCounts).map(([role, count]) => {
            const Icon = getRoleIcon(role as UserRole);
            return (
              <Card key={role} className="card-interactive">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${getRoleColor(role as UserRole)}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-sm text-muted-foreground capitalize">{role === 'lab' ? 'Lab Staff' : role}s</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
             <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
               <DialogTrigger asChild>
                 <Button>
                   <Plus className="h-4 w-4 mr-2" />
                   Add Staff
                 </Button>
               </DialogTrigger>
               <DialogContent>
                 <DialogHeader>
                   <DialogTitle>Add New Staff Member</DialogTitle>
                   <DialogDescription>Create a new staff account</DialogDescription>
                 </DialogHeader>
                 <div className="grid gap-4 py-4">
                   <div className="space-y-2">
                     <Label>Full Name *</Label>
                     <Input
                       value={formData.name}
                       onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                       placeholder="Dr. John Doe"
                     />
                   </div>
                   <div className="space-y-2">
                     <Label>Email *</Label>
                     <Input
                       type="email"
                       value={formData.email}
                       onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                       placeholder="john.doe@mediflex.com"
                     />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <Label>Role *</Label>
                       <Select 
                         value={formData.role}
                         onValueChange={(v) => setFormData({ ...formData, role: v as UserRole })}
                       >
                         <SelectTrigger>
                           <SelectValue placeholder="Select role" />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="doctor">Doctor</SelectItem>
                           <SelectItem value="nurse">Nurse</SelectItem>
                           <SelectItem value="receptionist">Receptionist</SelectItem>
                           <SelectItem value="lab">Lab Staff</SelectItem>
                           <SelectItem value="pharmacy">Pharmacy</SelectItem>
                           <SelectItem value="admin">Admin</SelectItem>
                         </SelectContent>
                       </Select>
                     </div>
                     <div className="space-y-2">
                       <Label>Department *</Label>
                       <Select 
                         value={formData.department}
                         onValueChange={(v) => setFormData({ ...formData, department: v })}
                       >
                         <SelectTrigger>
                           <SelectValue placeholder="Select department" />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="Cardiology">Cardiology</SelectItem>
                           <SelectItem value="General Medicine">General Medicine</SelectItem>
                           <SelectItem value="Laboratory">Laboratory</SelectItem>
                           <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                           <SelectItem value="Front Desk">Front Desk</SelectItem>
                           <SelectItem value="Administration">Administration</SelectItem>
                         </SelectContent>
                       </Select>
                     </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <Label>Phone</Label>
                       <Input
                         value={formData.phone}
                         onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                         placeholder="+1 (555) 000-0000"
                       />
                     </div>
                     <div className="space-y-2">
                       <Label>Specialization</Label>
                       <Input
                         value={formData.specialization}
                         onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                         placeholder="e.g., Cardiology"
                       />
                     </div>
                   </div>
                 </div>
                 <DialogFooter>
                   <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                   <Button onClick={handleAddStaff}>Add Staff</Button>
                 </DialogFooter>
               </DialogContent>
             </Dialog>
          </div>
        </div>

        {/* Staff Table */}
        <Card>
          <CardContent className="p-0">
            <DataTable
              data={filteredStaff}
              columns={columns}
              emptyMessage="No staff members found"
            />
          </CardContent>
        </Card>
         
         {/* Edit Staff Dialog */}
         <Dialog open={!!editingStaff} onOpenChange={() => setEditingStaff(null)}>
           <DialogContent>
             <DialogHeader>
               <DialogTitle>Edit Staff Member</DialogTitle>
               <DialogDescription>Update staff information</DialogDescription>
             </DialogHeader>
             <div className="grid gap-4 py-4">
               <div className="space-y-2">
                 <Label>Full Name</Label>
                 <Input
                   value={formData.name}
                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                 />
               </div>
               <div className="space-y-2">
                 <Label>Email</Label>
                 <Input
                   type="email"
                   value={formData.email}
                   onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                 />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label>Department</Label>
                   <Select 
                     value={formData.department}
                     onValueChange={(v) => setFormData({ ...formData, department: v })}
                   >
                     <SelectTrigger>
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="Cardiology">Cardiology</SelectItem>
                       <SelectItem value="General Medicine">General Medicine</SelectItem>
                       <SelectItem value="Laboratory">Laboratory</SelectItem>
                       <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                       <SelectItem value="Front Desk">Front Desk</SelectItem>
                       <SelectItem value="Administration">Administration</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
                 <div className="space-y-2">
                   <Label>Phone</Label>
                   <Input
                     value={formData.phone}
                     onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                   />
                 </div>
               </div>
               <div className="space-y-2">
                 <Label>Specialization</Label>
                 <Input
                   value={formData.specialization}
                   onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                 />
               </div>
             </div>
             <DialogFooter>
               <Button variant="outline" onClick={() => setEditingStaff(null)}>Cancel</Button>
               <Button onClick={handleEditStaff}>Save Changes</Button>
             </DialogFooter>
           </DialogContent>
         </Dialog>
      </div>
    </DashboardLayout>
  );
}
