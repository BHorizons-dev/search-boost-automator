
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';

interface WebsiteAssignmentDialogProps {
  clientId: string;
  onWebsitesAssigned: () => void;
  onCancel: () => void;
}

// Define a type for the website data
interface Website {
  id: string;
  name: string;
  domain: string;
}

// Define a type for the client data
interface Client {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
}

export function WebsiteAssignmentDialog({ 
  clientId, 
  onWebsitesAssigned, 
  onCancel 
}: WebsiteAssignmentDialogProps) {
  const [selectedWebsites, setSelectedWebsites] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch client data
  const { data: client } = useQuery<Client | null>({
    queryKey: ['client', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch websites
  const { data: websites, isLoading: isLoadingWebsites } = useQuery<Website[]>({
    queryKey: ['websites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('websites')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch existing assignments
  const { data: existingAssignments, isLoading: isLoadingAssignments } = useQuery<string[]>({
    queryKey: ['client-websites', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_websites')
        .select('website_id')
        .eq('client_id', clientId);
      
      if (error) throw error;
      
      // Extract website IDs safely
      if (data) {
        return data.map(row => {
          // Check if row is a valid object with website_id property
          if (row && typeof row === 'object' && row !== null && 'website_id' in row) {
            return row.website_id;
          }
          return '';
        }).filter(id => id !== '');
      }
      return [];
    }
  });
  
  // Set initial selected websites when existing assignments load
  useEffect(() => {
    if (existingAssignments) {
      setSelectedWebsites(existingAssignments);
    }
  }, [existingAssignments]);

  const handleToggleWebsite = (websiteId: string) => {
    setSelectedWebsites(prev => 
      prev.includes(websiteId)
        ? prev.filter(id => id !== websiteId)
        : [...prev, websiteId]
    );
  };

  const handleSubmit = async () => {
    if (!clientId) return;
    
    setIsSubmitting(true);
    
    try {
      // Get existing assignments
      const currentAssignments = existingAssignments || [];
      
      // Determine which ones to remove
      const websitesToRemove = currentAssignments.filter(
        websiteId => !selectedWebsites.includes(websiteId)
      );
      
      // Determine which ones to add
      const websitesToAdd = selectedWebsites.filter(
        websiteId => !currentAssignments.includes(websiteId)
      );
      
      // Remove unselected assignments
      if (websitesToRemove.length > 0) {
        const { error: removeError } = await supabase
          .from('client_websites')
          .delete()
          .eq('client_id', clientId)
          .in('website_id', websitesToRemove);
          
        if (removeError) throw removeError;
      }
      
      // Add new assignments
      if (websitesToAdd.length > 0) {
        const newAssignments = websitesToAdd.map(websiteId => ({
          client_id: clientId,
          website_id: websiteId
        }));
        
        const { error: addError } = await supabase
          .from('client_websites')
          .insert(newAssignments);
          
        if (addError) throw addError;
      }
      
      toast({
        title: 'Websites Assigned',
        description: 'Website assignments have been updated successfully.'
      });
      
      onWebsitesAssigned();
    } catch (error: any) {
      console.error('Error assigning websites:', error);
      toast({
        title: 'Error Assigning Websites',
        description: error.message || 'An unknown error occurred.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Assign Websites to Client</DialogTitle>
          <DialogDescription>
            {client ? `Select websites to assign to ${client.name}` : 'Loading client...'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-h-[400px] overflow-y-auto mt-4">
          {isLoadingWebsites || isLoadingAssignments ? (
            <div className="text-center py-4">Loading websites...</div>
          ) : websites && websites.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Domain</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {websites.map((website) => (
                  <TableRow key={website.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedWebsites.includes(website.id)}
                        onCheckedChange={() => handleToggleWebsite(website.id)}
                      />
                    </TableCell>
                    <TableCell>{website.name}</TableCell>
                    <TableCell>{website.domain}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No websites available. Please add websites first.
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !websites?.length}
          >
            {isSubmitting ? 'Saving...' : 'Save Assignments'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
