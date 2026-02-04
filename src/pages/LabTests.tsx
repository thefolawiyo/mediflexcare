import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, Column } from '@/components/ui/data-table';
import { StatusBadge, getStatusVariant } from '@/components/ui/status-badge';
import { mockLabTests } from '@/data/mockData';
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

export default function LabTests() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredTests = mockLabTests.filter(test => {
    const matchesSearch = test.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.testType.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && test.status === activeTab;
  });

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
            <Button size="sm">Start Processing</Button>
          )}
          {row.status === 'in-progress' && (
            <Button size="sm" variant="outline">Enter Results</Button>
          )}
          {row.status === 'completed' && (
            <Button size="sm" variant="ghost">View Results</Button>
          )}
        </div>
      )
    }
  ];

  const statusCounts = {
    all: mockLabTests.length,
    pending: mockLabTests.filter(t => t.status === 'pending').length,
    'in-progress': mockLabTests.filter(t => t.status === 'in-progress').length,
    completed: mockLabTests.filter(t => t.status === 'completed').length,
  };

  const urgentCount = mockLabTests.filter(t => t.priority === 'stat' && t.status !== 'completed').length;

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
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Test Order
            </Button>
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
      </div>
    </DashboardLayout>
  );
}
