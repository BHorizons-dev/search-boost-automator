
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
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface WebsiteFormProps {
  onWebsiteAdded: () => void;
  onCancel: () => void;
}

export function WebsiteForm({ onWebsiteAdded, onCancel }: WebsiteFormProps) {
  const [name, setName] = React.useState('');
  const [domain, setDomain] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [debugInfo, setDebugInfo] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !domain.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    setDebugInfo(null);
    
    // Format domain (remove protocol if present)
    let formattedDomain = domain.trim().toLowerCase();
    if (formattedDomain.startsWith('http://')) {
      formattedDomain = formattedDomain.substring(7);
    } else if (formattedDomain.startsWith('https://')) {
      formattedDomain = formattedDomain.substring(8);
    }
    
    // Remove trailing slash
    if (formattedDomain.endsWith('/')) {
      formattedDomain = formattedDomain.slice(0, -1);
    }
    
    try {
      // Get the current user
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Error getting session: ' + sessionError.message);
      }
      
      if (!session || !session.user) {
        throw new Error('You must be logged in to add a website');
      }

      console.log('Creating website with user_id:', session.user.id);
      setDebugInfo(`User ID: ${session.user.id}`);
      
      // Set schema explicitly in request to ensure it's using 'public'
      const { data, error } = await supabase
        .from('websites')
        .insert({
          name: name.trim(),
          domain: formattedDomain,
          user_id: session.user.id
        })
        .select();
        
      if (error) {
        console.error('Insert error:', error);
        setDebugInfo(prev => `${prev || ''}\nInsert error: ${JSON.stringify(error)}`);
        throw error;
      }

      console.log('Website added successfully:', data);
      
      toast({
        title: 'Website Added',
        description: `${name} has been added successfully.`,
      });
      
      onWebsiteAdded();
    } catch (error: any) {
      console.error('Error adding website:', error);
      
      // Enhanced error message with more helpful information
      let errorMessage = error.message || 'An unknown error occurred';
      if (error.code === 'PGRST106') {
        errorMessage = "Database schema configuration error. Please contact support.";
        setDebugInfo(prev => `${prev || ''}\nThis is a configuration issue with the Supabase client.`);
      }
      
      toast({
        title: 'Error Adding Website',
        description: errorMessage,
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
                Website Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="My Client Website"
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
                placeholder="example.com"
                required
              />
            </div>

            {debugInfo && (
              <div className="text-xs text-red-500 bg-red-50 p-2 rounded mt-2">
                <p>Debug info (please share this if reporting an issue):</p>
                <pre className="whitespace-pre-wrap">{debugInfo}</pre>
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Website'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
