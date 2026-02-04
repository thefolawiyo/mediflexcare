import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, Column } from '@/components/ui/data-table';
import { StatusBadge, getStatusVariant } from '@/components/ui/status-badge';
import { mockStaff } from '@/data/mockData';
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

export default function AdminStaff() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStaff = mockStaff.filter(staff =>
    staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      render: () => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline">Edit</Button>
          <Button size="sm" variant="ghost">View</Button>
        </div>
      )
    }
  ];

  const roleCounts = {
    doctor: mockStaff.filter(s => s.role === 'doctor').length,
    nurse: mockStaff.filter(s => s.role === 'nurse').length,
    receptionist: mockStaff.filter(s => s.role === 'receptionist').length,
    lab: mockStaff.filter(s => s.role === 'lab').length,
    admin: mockStaff.filter(s => s.role === 'admin').length,
  };

  return (
    <DashboardLayout 
      title="Staff Management" 
      subtitle={`${mockStaff.length} staff members`}
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
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Staff
            </Button>
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
      </div>
    </DashboardLayout>
  );
}
