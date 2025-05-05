
import React from 'react';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { WebsiteForm } from './WebsiteForm';

interface WebsiteSelectorProps {
  selectedWebsiteId: string | null;
  setSelectedWebsiteId: (id: string | null) => void;
}

export function WebsiteSelector({ selectedWebsiteId, setSelectedWebsiteId }: WebsiteSelectorProps) {
  const [showWebsiteForm, setShowWebsiteForm] = React.useState(false);

  // Fetch websites
  const { 
    data: websites, 
    isLoading, 
    error,
    refetch: refetchWebsites 
  } = useQuery({
    queryKey: ['websites'],
    queryFn: async () => {
      try {
        console.log('Fetching websites...');
        const { data, error } = await supabase
          .from('websites')
          .select('*')
          .order('name');
          
        if (error) {
          console.error('Error fetching websites:', error);
          throw error;
        }
        
        console.log('Websites data:', data);
        return data || [];
      } catch (error: any) {
        console.error('Caught error fetching websites:', error);
        toast({
          title: 'Error fetching websites',
          description: error.message || 'Failed to fetch websites',
          variant: 'destructive'
        });
        return [];
      }
    },
    retry: 3,
    retryDelay: 1000
  });

  React.useEffect(() => {
    // Set the first website as selected if there are websites and none selected
    if (websites?.length && !selectedWebsiteId) {
      setSelectedWebsiteId(websites[0].id);
    }
  }, [websites, selectedWebsiteId, setSelectedWebsiteId]);

  const handleWebsiteAdded = () => {
    setShowWebsiteForm(false);
    refetchWebsites();
  };

  if (isLoading) {
    return <div>Loading websites...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col gap-3">
        <div className="text-red-500">
          Error loading websites. Please check your connection and authentication.
        </div>
        <Button variant="outline" onClick={() => refetchWebsites()}>
          Try Again
        </Button>
        <Button variant="outline" onClick={() => setShowWebsiteForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Website
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        {websites?.length > 0 ? (
          <Select 
            value={selectedWebsiteId || ''}
            onValueChange={(value) => setSelectedWebsiteId(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a website" />
            </SelectTrigger>
            <SelectContent>
              {websites.map((website) => (
                <SelectItem key={website.id} value={website.id}>
                  {website.name} ({website.domain})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="text-muted-foreground">No websites found. Add your first website.</div>
        )}
      </div>
      
      <Button variant="outline" onClick={() => setShowWebsiteForm(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Add Website
      </Button>
      
      {showWebsiteForm && (
        <WebsiteForm 
          onWebsiteAdded={handleWebsiteAdded}
          onCancel={() => setShowWebsiteForm(false)}
        />
      )}
    </div>
  );
}
