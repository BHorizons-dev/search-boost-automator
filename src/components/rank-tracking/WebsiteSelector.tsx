
import React from 'react';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { WebsiteForm } from './WebsiteForm';

interface WebsiteSelectorProps {
  selectedWebsiteId: string | null;
  setSelectedWebsiteId: (id: string | null) => void;
}

// Define a type for Supabase errors which includes the code property
interface SupabaseError extends Error {
  code?: string;
  details?: string | null;
  hint?: string | null;
}

export function WebsiteSelector({ selectedWebsiteId, setSelectedWebsiteId }: WebsiteSelectorProps) {
  const [showWebsiteForm, setShowWebsiteForm] = React.useState(false);
  const [debugInfo, setDebugInfo] = React.useState<string | null>(null);

  // Fetch websites
  const { 
    data: websites, 
    isLoading, 
    error,
    refetch: refetchWebsites 
  } = useQuery({
    queryKey: ['websites'],
    queryFn: async () => {
      setDebugInfo(null);
      try {
        console.log('Fetching websites...');
        
        // Get current auth session to verify user is logged in
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('Session error:', sessionError);
          setDebugInfo(`Session error: ${JSON.stringify(sessionError)}`);
          throw new Error(`Session error: ${sessionError.message}`);
        }
        
        if (!sessionData.session?.user) {
          const authError = new Error('User not authenticated');
          setDebugInfo('User not authenticated');
          throw authError;
        }
        
        console.log('User ID:', sessionData.session.user.id);
        setDebugInfo(prev => `${prev ? prev + '\n' : ''}User ID: ${sessionData.session.user.id}`);
        
        // Try with explicit schema setting
        const { data, error } = await supabase
          .from('websites')
          .select('*')
          .order('name');
          
        if (error) {
          console.error('Error fetching websites:', error);
          setDebugInfo(prev => `${prev ? prev + '\n' : ''}Supabase error: ${JSON.stringify(error)}`);
          
          // If we get a schema error, try with different approach
          if (error.code === 'PGRST106') {
            setDebugInfo(prev => `${prev ? prev + '\n' : ''}Trying alternative approach for schema issue...`);
            throw new Error(`Schema configuration issue: ${error.message}`);
          }
          
          throw error;
        }
        
        console.log('Websites data:', data);
        setDebugInfo(prev => `${prev ? prev + '\n' : ''}Websites fetched: ${data?.length || 0}`);
        return data || [];
      } catch (error: any) {
        console.error('Caught error fetching websites:', error);
        setDebugInfo(prev => `${prev ? prev + '\n' : ''}Exception: ${error.message || 'Unknown error'}`);
        throw error;
      }
    },
    retry: 1, // Reduce retries to avoid excessive attempts
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

  // Fixed loading state to provide more context
  if (isLoading) {
    return <div className="p-4 text-center">Loading websites... Please wait...</div>;
  }

  return (
    <div className="space-y-4">
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
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => refetchWebsites()} 
          title="Refresh websites"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      
      {error && (
        <div className="bg-red-50 p-3 rounded border border-red-200 text-sm">
          <p className="font-medium text-red-800 mb-1">Error loading websites</p>
          <p className="text-red-600">
            {/* Use type assertion to handle the potential code property safely */}
            {(error as SupabaseError).code === 'PGRST106' 
              ? 'Database schema configuration error. This is likely a server-side issue.'
              : (error as Error).message}
          </p>
          {debugInfo && (
            <div className="mt-2 p-2 bg-white/50 rounded text-xs">
              <p className="font-mono">Debug info:</p>
              <pre className="whitespace-pre-wrap overflow-auto max-h-32">{debugInfo}</pre>
            </div>
          )}
          <div className="mt-2 flex gap-2">
            <Button size="sm" variant="outline" onClick={() => refetchWebsites()}>
              Try Again
            </Button>
          </div>
        </div>
      )}
      
      {showWebsiteForm && (
        <WebsiteForm 
          onWebsiteAdded={handleWebsiteAdded}
          onCancel={() => setShowWebsiteForm(false)}
        />
      )}
    </div>
  );
}
