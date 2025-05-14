
import React, { useState } from 'react';
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
import { supabase, apiSchema } from '@/integrations/supabase/client';

interface ClientFormProps {
  onClientAdded: () => void;
  onCancel: () => void;
  existingClient?: {
    id: string;
    name: string;
    company?: string | null;
    email?: string | null;
    phone?: string | null;
  };
}

export function ClientForm({ onClientAdded, onCancel, existingClient }: ClientFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientData, setClientData] = useState({
    name: existingClient?.name || '',
    company: existingClient?.company || '',
    email: existingClient?.email || '',
    phone: existingClient?.phone || ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClientData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!clientData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Client name is required',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let response;
      
      if (existingClient) {
        // Update existing client
        response = await apiSchema('clients')
          .update({
            name: clientData.name,
            company: clientData.company || null,
            email: clientData.email || null,
            phone: clientData.phone || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingClient.id);
      } else {
        // Add new client
        response = await apiSchema('clients')
          .insert({
            name: clientData.name,
            company: clientData.company || null,
            email: clientData.email || null,
            phone: clientData.phone || null,
            user_id: (await supabase.auth.getUser()).data.user?.id || '',
          });
      }

      if (response.error) throw response.error;

      toast({
        title: existingClient ? 'Client Updated' : 'Client Added',
        description: `${clientData.name} was ${existingClient ? 'updated' : 'added'} successfully.`
      });
      
      onClientAdded();
    } catch (error: any) {
      console.error('Error adding client:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save client',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{existingClient ? 'Edit Client' : 'Add New Client'}</DialogTitle>
          <DialogDescription>
            {existingClient 
              ? 'Update client information' 
              : 'Create a new client to manage websites and SEO tasks'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Client Name *</Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter client name"
              value={clientData.name}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company (Optional)</Label>
            <Input
              id="company"
              name="company"
              placeholder="Company name"
              value={clientData.company}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="client@example.com"
              value={clientData.email}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone (Optional)</Label>
            <Input
              id="phone"
              name="phone"
              placeholder="Phone number"
              value={clientData.phone}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : (existingClient ? 'Update Client' : 'Add Client')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
