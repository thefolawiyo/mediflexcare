import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, Column } from '@/components/ui/data-table';
import { StatusBadge, getStatusVariant } from '@/components/ui/status-badge';
import { mockPrescriptions } from '@/data/mockData';
import { Prescription } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { 
  Search, 
  Filter,
  Pill,
  Clock,
  CheckCircle,
  Package
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Pharmacy() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredPrescriptions = mockPrescriptions.filter(rx => {
    const matchesSearch = rx.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rx.medication.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && rx.status === activeTab;
  });

  const columns: Column<Prescription>[] = [
    { 
      key: 'id', 
      header: 'RX ID',
      className: 'font-mono text-sm',
    },
    { 
      key: 'patientName', 
      header: 'Patient',
      render: (v) => <span className="font-medium">{v}</span>
    },
    { 
      key: 'medication', 
      header: 'Medication',
      render: (_, row) => (
        <div>
          <p className="font-medium">{row.medication}</p>
          <p className="text-xs text-muted-foreground">{row.dosage} - {row.frequency}</p>
        </div>
      )
    },
    { 
      key: 'duration', 
      header: 'Duration',
    },
    { 
      key: 'prescribedBy', 
      header: 'Prescribed By',
      render: (v) => <span className="text-sm text-muted-foreground">{v}</span>
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
          {row.status === 'pending' && (
            <Button size="sm">Dispense</Button>
          )}
          {row.status === 'dispensed' && (
            <Button size="sm" variant="ghost">View Details</Button>
          )}
        </div>
      )
    }
  ];

  const statusCounts = {
    all: mockPrescriptions.length,
    pending: mockPrescriptions.filter(p => p.status === 'pending').length,
    dispensed: mockPrescriptions.filter(p => p.status === 'dispensed').length,
  };

  return (
    <DashboardLayout 
      title="Pharmacy" 
      subtitle="Manage prescriptions and dispensing"
    >
      <div className="space-y-6 animate-fade-in">
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
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
          <Card className="bg-success/5 border-success/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{statusCounts.dispensed}</p>
                  <p className="text-sm text-muted-foreground">Dispensed Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{statusCounts.all}</p>
                  <p className="text-sm text-muted-foreground">Total Prescriptions</p>
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
              placeholder="Search by patient or medication..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs & Table */}
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <CardHeader className="pb-0">
              <TabsList>
                <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({statusCounts.pending})</TabsTrigger>
                <TabsTrigger value="dispensed">Dispensed ({statusCounts.dispensed})</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className="p-0 pt-4">
              <DataTable
                data={filteredPrescriptions}
                columns={columns}
                emptyMessage="No prescriptions found"
              />
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </DashboardLayout>
  );
}
