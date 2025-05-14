
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase, TablesSelect, assertData } from '@/integrations/supabase/client';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface WebsiteSelectorProps {
  selectedWebsiteId: string | null;
  setSelectedWebsiteId: (id: string | null) => void;
  showAddButton?: boolean;
  onAddClick?: () => void;
}

export function WebsiteSelector({ 
  selectedWebsiteId, 
  setSelectedWebsiteId,
  showAddButton = false,
  onAddClick
}: WebsiteSelectorProps) {
  const { toast } = useToast();

  // Fetch websites
  const { data: websites, isLoading } = useQuery({
    queryKey: ['websites'],
    queryFn: async () => {
      try {
        console.log('Fetching websites from database for selector');
        const { data, error } = await supabase
          .from('websites')
          .select('*')
          .order('name');
          
        if (error) {
          console.error('Error fetching websites:', error);
          toast({
            title: 'Error fetching websites',
            description: error.message,
            variant: 'destructive'
          });
          return [];
        }
        
        console.log('Websites data received for selector:', data);
        return assertData<TablesSelect['websites'][]>(data);
      } catch (error: any) {
        console.error('Exception fetching websites:', error);
        toast({
          title: 'Error fetching websites',
          description: error.message || 'An unknown error occurred',
          variant: 'destructive'
        });
        return [] as TablesSelect['websites'][];
      }
    }
  });

  // If there are websites and no website is selected, select the first one
  React.useEffect(() => {
    if (!selectedWebsiteId && websites && websites.length > 0) {
      setSelectedWebsiteId(websites[0].id);
    }
  }, [websites, selectedWebsiteId, setSelectedWebsiteId]);

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <Select value={selectedWebsiteId || ''} onValueChange={setSelectedWebsiteId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a website" />
          </SelectTrigger>
          <SelectContent>
            {isLoading ? (
              <div className="p-2 text-center text-sm text-muted-foreground">
                Loading websites...
              </div>
            ) : websites && websites.length > 0 ? (
              websites.map((website) => (
                <SelectItem key={website.id} value={website.id}>
                  {website.name} ({website.domain})
                </SelectItem>
              ))
            ) : (
              <div className="p-2 text-center text-sm text-muted-foreground">
                No websites found
              </div>
            )}
          </SelectContent>
        </Select>
      </div>

      {showAddButton && (
        <Button variant="outline" size="icon" onClick={onAddClick}>
          <PlusCircle className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
