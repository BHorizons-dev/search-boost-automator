
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase, TablesSelect, assertData } from '@/integrations/supabase/client';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface WebsiteAssignmentDialogProps {
  clientId: string;
  onWebsitesAssigned: () => void;
  onCancel: () => void;
}

// Define specific types to avoid deep type instantiation
type ClientWebsite = {
  id: string;
  website_id: string;
};

type Website = TablesSelect['websites'];

export function WebsiteAssignmentDialog({
  clientId,
  onWebsitesAssigned,
  onCancel,
}: WebsiteAssignmentDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedWebsiteIds, setSelectedWebsiteIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all websites
  const { data: websites, isLoading: isLoadingWebsites } = useQuery({
    queryKey: ['websites-for-assignment'],
    queryFn: async () => {
      try {
        console.log('Fetching websites from API schema for assignment');
        const { data, error } = await supabase
          .from('websites')
          .select('*')
          .order('name');

        if (error) {
          console.error('Error fetching websites for assignment:', error);
          throw error;
        }
        console.log('Websites data received for assignment:', data);
        return assertData<Website[]>(data);
      } catch (error: any) {
        console.error('Error fetching websites:', error);
        toast({
          title: 'Error fetching websites',
          description: error.message,
          variant: 'destructive',
        });
        return [] as Website[];
      }
    },
  });

  // Fetch websites already assigned to this client
  const { data: clientWebsites } = useQuery({
    queryKey: ['client-websites', clientId],
    queryFn: async () => {
      try {
        console.log(`Fetching assigned websites for client ${clientId}`);
        const { data, error } = await supabase
          .from('client_websites')
          .select('id, website_id')
          .eq('client_id', clientId);

        if (error) {
          console.error('Error fetching client websites:', error);
          throw error;
        }
        console.log('Client websites data:', data);
        return assertData<ClientWebsite[]>(data);
      } catch (error: any) {
        console.error('Error fetching client websites:', error);
        return [] as ClientWebsite[];
      }
    },
  });

  // Set initially selected website IDs based on what's already assigned
  useEffect(() => {
    if (clientWebsites && clientWebsites.length > 0) {
      const websiteIds = clientWebsites.map(cw => cw.website_id);
      console.log('Initially selected website IDs:', websiteIds);
      setSelectedWebsiteIds(websiteIds);
    }
  }, [clientWebsites]);

  const filteredWebsites = websites?.filter(website => 
    website.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    website.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if a website is currently assigned
  const isWebsiteAssigned = (websiteId: string) => {
    return selectedWebsiteIds.includes(websiteId);
  };

  // Toggle website selection
  const toggleWebsiteSelection = (websiteId: string) => {
    setSelectedWebsiteIds(prev => {
      if (prev.includes(websiteId)) {
        return prev.filter(id => id !== websiteId);
      } else {
        return [...prev, websiteId];
      }
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // First, get currently assigned websites
      console.log('Updating website assignments for client', clientId);
      console.log('Selected website IDs:', selectedWebsiteIds);
      
      const { data: currentAssignments, error: fetchError } = await supabase
        .from('client_websites')
        .select('id, website_id')
        .eq('client_id', clientId);

      if (fetchError) {
        console.error('Error getting current assignments:', fetchError);
        throw fetchError;
      }
      
      const currentWebsiteIds = assertData<ClientWebsite[]>(currentAssignments, [])
        .map(cw => cw.website_id);
      console.log('Current website IDs:', currentWebsiteIds);

      // Determine websites to add and remove
      const websitesToAdd = selectedWebsiteIds.filter(id => !currentWebsiteIds.includes(id));
      const websitesToRemove = currentWebsiteIds.filter(id => !selectedWebsiteIds.includes(id));
      
      console.log('Websites to add:', websitesToAdd);
      console.log('Websites to remove:', websitesToRemove);

      // Add new assignments
      if (websitesToAdd.length > 0) {
        const newAssignments = websitesToAdd.map(websiteId => ({
          client_id: clientId,
          website_id: websiteId,
        }));

        const { error: insertError } = await supabase
          .from('client_websites')
          .insert(newAssignments);
          
        if (insertError) {
          console.error('Error inserting new assignments:', insertError);
          throw insertError;
        }
        console.log('New assignments added successfully');
      }

      // Remove old assignments
      if (websitesToRemove.length > 0) {
        for (const websiteId of websitesToRemove) {
          const { error: deleteError } = await supabase
            .from('client_websites')
            .delete()
            .eq('client_id', clientId)
            .eq('website_id', websiteId);
          
          if (deleteError) {
            console.error(`Error removing assignment for website ${websiteId}:`, deleteError);
            throw deleteError;
          }
        }
        console.log('Old assignments removed successfully');
      }

      toast({
        title: 'Websites Assigned',
        description: 'Website assignments have been updated successfully.',
      });
      
      onWebsitesAssigned();
    } catch (error: any) {
      console.error('Error updating website assignments:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update website assignments',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Assign Websites to Client</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <div className="relative mb-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search websites..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {isLoadingWebsites ? (
            <div className="text-center py-8 text-muted-foreground">Loading websites...</div>
          ) : filteredWebsites && filteredWebsites.length > 0 ? (
            <div className="max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Website Name</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>SEO Health</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWebsites.map((website) => (
                    <TableRow key={website.id}>
                      <TableCell>
                        <Checkbox 
                          checked={isWebsiteAssigned(website.id)}
                          onCheckedChange={() => toggleWebsiteSelection(website.id)}
                        />
                      </TableCell>
                      <TableCell>{website.name}</TableCell>
                      <TableCell>{website.domain}</TableCell>
                      <TableCell>{website.seo_health_score || 'Not assessed'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No websites found. Please add websites first.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || isLoadingWebsites}>
            {isSubmitting ? 'Saving...' : 'Save Assignments'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
