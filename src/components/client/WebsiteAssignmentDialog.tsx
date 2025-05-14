
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase, TablesSelect, assertData } from '@/integrations/supabase/client';

interface WebsiteAssignmentDialogProps {
  clientId: string;
  onWebsitesAssigned: () => void;
  onCancel: () => void;
}

export function WebsiteAssignmentDialog({
  clientId,
  onWebsitesAssigned,
  onCancel,
}: WebsiteAssignmentDialogProps) {
  const { toast } = useToast();
  const [websites, setWebsites] = useState<TablesSelect['websites'][]>([]);
  const [assignedWebsiteIds, setAssignedWebsiteIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all websites and the ones already assigned to this client
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch all websites
        const { data: allWebsites, error: websitesError } = await supabase
          .from('websites')
          .select('*')
          .order('name');

        if (websitesError) {
          throw new Error(`Error fetching websites: ${websitesError.message}`);
        }

        // Fetch currently assigned websites for this client
        const { data: assignedWebsites, error: assignedError } = await supabase
          .from('client_websites')
          .select('website_id')
          .eq('client_id', clientId);

        if (assignedError) {
          throw new Error(`Error fetching assigned websites: ${assignedError.message}`);
        }

        // Set the data
        setWebsites(assertData<TablesSelect['websites'][]>(allWebsites, []));
        setAssignedWebsiteIds(
          assertData<{ website_id: string }[]>(assignedWebsites, [])
            .map(item => item.website_id)
        );
      } catch (error: any) {
        console.error('Error loading data:', error);
        toast({
          title: 'Error Loading Data',
          description: error.message || 'Failed to load websites',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [clientId, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Get currently assigned website IDs
      const { data: currentAssignments, error: fetchError } = await supabase
        .from('client_websites')
        .select('website_id')
        .eq('client_id', clientId);
      
      if (fetchError) throw new Error(`Error fetching current assignments: ${fetchError.message}`);
      
      const currentWebsiteIds = assertData<{ website_id: string }[]>(currentAssignments, [])
        .map(item => item.website_id);
      
      // Determine which assignments to add and which to remove
      const websitesToAdd = assignedWebsiteIds.filter(id => !currentWebsiteIds.includes(id));
      const websitesToRemove = currentWebsiteIds.filter(id => !assignedWebsiteIds.includes(id));
      
      // Process removals
      if (websitesToRemove.length > 0) {
        const { error: removeError } = await supabase
          .from('client_websites')
          .delete()
          .eq('client_id', clientId)
          .in('website_id', websitesToRemove);
        
        if (removeError) throw new Error(`Error removing websites: ${removeError.message}`);
      }
      
      // Process additions
      if (websitesToAdd.length > 0) {
        const newAssignments = websitesToAdd.map(websiteId => ({
          client_id: clientId,
          website_id: websiteId
        }));
        
        const { error: addError } = await supabase
          .from('client_websites')
          .insert(newAssignments);
        
        if (addError) throw new Error(`Error assigning websites: ${addError.message}`);
      }
      
      toast({
        title: 'Websites Assigned',
        description: 'Website assignments have been updated successfully',
      });
      
      onWebsitesAssigned();
    } catch (error: any) {
      console.error('Error updating website assignments:', error);
      toast({
        title: 'Error Updating Assignments',
        description: error.message || 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleWebsite = (websiteId: string) => {
    setAssignedWebsiteIds(prev => 
      prev.includes(websiteId)
        ? prev.filter(id => id !== websiteId)
        : [...prev, websiteId]
    );
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Websites to Client</DialogTitle>
          <DialogDescription>
            Select which websites to assign to this client.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          {isLoading ? (
            <div className="py-6 text-center">Loading websites...</div>
          ) : websites.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-muted-foreground">No websites available</p>
              <p className="text-sm mt-2">Create websites first before assigning them to clients</p>
            </div>
          ) : (
            <div className="grid gap-4 py-4">
              {websites.map((website) => (
                <div key={website.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`website-${website.id}`}
                    checked={assignedWebsiteIds.includes(website.id)}
                    onCheckedChange={() => toggleWebsite(website.id)}
                  />
                  <Label htmlFor={`website-${website.id}`} className="flex-1">
                    <span className="font-medium">{website.name}</span>
                    <span className="ml-2 text-sm text-muted-foreground">({website.domain})</span>
                  </Label>
                </div>
              ))}
            </div>
          )}
          
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
              type="submit" 
              disabled={isLoading || isSubmitting || websites.length === 0}
            >
              {isSubmitting ? 'Saving...' : 'Save Assignments'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
