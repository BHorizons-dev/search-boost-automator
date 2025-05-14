
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { TablesInsert } from '@/integrations/supabase/client';

interface WebsiteFormProps {
  onWebsiteAdded: () => void;
  onCancel: () => void;
}

export function WebsiteForm({ onWebsiteAdded, onCancel }: WebsiteFormProps) {
  const { toast } = useToast();
  const { session } = useAuth();
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !domain) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a name and domain.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!session?.user?.id) {
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to add a website.',
        variant: 'destructive',
      });
      return;
    }
    
    // Clean up domain input - ensure it starts with a protocol
    let cleanDomain = domain.trim().toLowerCase();
    if (!cleanDomain.startsWith('http://') && !cleanDomain.startsWith('https://')) {
      cleanDomain = 'https://' + cleanDomain;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Adding website with user ID:', session.user.id);
      
      // Create a properly typed website object
      const websiteData: TablesInsert['websites'] = {
        name: name.trim(),
        domain: cleanDomain,
        user_id: session.user.id
      };
      
      const { data, error } = await supabase
        .from('websites')
        .insert(websiteData)
        .select();
        
      if (error) {
        console.error('Error response from Supabase:', error);
        throw error;
      }
      
      console.log('Website added successfully:', data);
      
      toast({
        title: 'Website Added',
        description: `"${name}" has been added successfully.`,
      });
      
      onWebsiteAdded();
    } catch (error: any) {
      console.error('Error adding website:', error);
      toast({
        title: 'Error Adding Website',
        description: error.message || 'An unknown error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Website</DialogTitle>
          <DialogDescription>
            Enter the details of the website you want to track.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="My Company Website"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="domain" className="text-right">
                Domain
              </Label>
              <Input
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="col-span-3"
                placeholder="mycompany.com"
                required
              />
            </div>
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Website'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
