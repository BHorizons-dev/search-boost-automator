
import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiSchema, TablesSelect } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { ClientForm } from '@/components/client/ClientForm';
import { WebsiteAssignmentDialog } from '@/components/client/WebsiteAssignmentDialog';
import { Plus, Search, RefreshCw, Link } from 'lucide-react';

const Clients = () => {
  const { toast } = useToast();
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [showWebsiteAssignmentDialog, setShowWebsiteAssignmentDialog] = useState(false);

  // Fetch clients
  const { data: clients, isLoading: isLoadingClients, refetch: refetchClients } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      try {
        const { data, error } = await apiSchema('clients')
          .select('*')
          .order('name');
          
        if (error) {
          console.error('Error fetching clients:', error);
          toast({
            title: 'Error fetching clients',
            description: error.message,
            variant: 'destructive'
          });
          return [] as TablesSelect['clients'][];
        }
        
        return data as TablesSelect['clients'][];
      } catch (error: any) {
        console.error('Caught error fetching clients:', error);
        toast({
          title: 'Error fetching clients',
          description: error.message || 'Failed to fetch clients',
          variant: 'destructive'
        });
        return [] as TablesSelect['clients'][];
      }
    }
  });

  // Filter clients by search query
  const filteredClients = clients?.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.company && client.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleClientAdded = () => {
    setIsAddClientDialogOpen(false);
    refetchClients();
  };

  const handleWebsitesAssigned = () => {
    setShowWebsiteAssignmentDialog(false);
    toast({
      title: 'Websites Assigned',
      description: 'The websites have been successfully assigned to the client.'
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Clients</h1>
          <Button onClick={() => setIsAddClientDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Client Management</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search clients..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" onClick={() => refetchClients()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingClients ? (
              <div className="text-center py-4">Loading clients...</div>
            ) : filteredClients && filteredClients.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.company || '-'}</TableCell>
                      <TableCell>{client.email || '-'}</TableCell>
                      <TableCell>{client.phone || '-'}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedClientId(client.id);
                            setShowWebsiteAssignmentDialog(true);
                          }}
                        >
                          <Link className="h-4 w-4 mr-2" />
                          Assign Websites
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-lg text-muted-foreground mb-2">No clients found</p>
                <p className="text-sm text-muted-foreground mb-4">Add your first client to start managing your client relationships</p>
                <Button onClick={() => setIsAddClientDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Client
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Client Dialog */}
        {isAddClientDialogOpen && (
          <ClientForm 
            onClientAdded={handleClientAdded} 
            onCancel={() => setIsAddClientDialogOpen(false)} 
          />
        )}

        {/* Website Assignment Dialog */}
        {showWebsiteAssignmentDialog && selectedClientId && (
          <WebsiteAssignmentDialog 
            clientId={selectedClientId}
            onWebsitesAssigned={handleWebsitesAssigned}
            onCancel={() => setShowWebsiteAssignmentDialog(false)}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default Clients;
