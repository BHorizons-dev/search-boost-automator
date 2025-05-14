
import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WebsiteSelector } from '@/components/rank-tracking/WebsiteSelector';
import { KeywordForm } from '@/components/rank-tracking/KeywordForm';
import { PlusCircle } from 'lucide-react';
import { supabase, TablesSelect, assertData } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';

const Keywords = () => {
  const { toast } = useToast();
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string | null>(null);
  const [showAddKeywordForm, setShowAddKeywordForm] = useState(false);

  // Fetch keywords for the selected website
  const { data: keywords, isLoading, refetch } = useQuery({
    queryKey: ['keywords', selectedWebsiteId],
    queryFn: async () => {
      if (!selectedWebsiteId) return [];
      
      try {
        const { data, error } = await supabase
          .from('keywords')
          .select('*')
          .eq('website_id', selectedWebsiteId)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching keywords:', error);
          toast({
            title: 'Error fetching keywords',
            description: error.message,
            variant: 'destructive'
          });
          return [];
        }
        
        return assertData<TablesSelect['keywords'][]>(data);
      } catch (error: any) {
        console.error('Exception fetching keywords:', error);
        toast({
          title: 'Error fetching keywords',
          description: error.message || 'An unknown error occurred',
          variant: 'destructive'
        });
        return [];
      }
    },
    enabled: !!selectedWebsiteId
  });

  const handleKeywordAdded = () => {
    setShowAddKeywordForm(false);
    refetch();
    toast({
      title: 'Keyword Added',
      description: 'The keyword has been successfully added.'
    });
  };

  // Helper function to map importance to readable text
  const getImportanceLabel = (importance: number) => {
    switch (importance) {
      case 1: return 'Low';
      case 2: return 'Medium';
      case 3: return 'High';
      default: return 'Unknown';
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Keywords</h1>
          <Button 
            onClick={() => setShowAddKeywordForm(true)} 
            disabled={!selectedWebsiteId}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Keyword
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Website Selector</CardTitle>
          </CardHeader>
          <CardContent>
            <WebsiteSelector 
              selectedWebsiteId={selectedWebsiteId}
              setSelectedWebsiteId={setSelectedWebsiteId}
              showAddButton={true}
              onAddClick={() => {
                // This would open a website form
                toast({
                  title: "Add Website",
                  description: "You can add websites from the Rank Tracking page"
                });
              }}
            />
          </CardContent>
        </Card>

        {selectedWebsiteId ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Keyword List</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Loading keywords...</div>
              ) : keywords && keywords.length > 0 ? (
                <div className="grid gap-4">
                  {keywords.map(keyword => (
                    <div 
                      key={keyword.id} 
                      className="p-3 border rounded flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium">{keyword.keyword}</p>
                        <p className="text-sm text-muted-foreground">
                          Importance: {getImportanceLabel(keyword.importance)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {/* Future actions like edit, delete, etc. */}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-lg text-muted-foreground mb-2">No keywords found</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add keywords to track your website's search engine ranking
                  </p>
                  <Button onClick={() => setShowAddKeywordForm(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Your First Keyword
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-lg text-muted-foreground">
                Select a website to view and manage its keywords
              </p>
            </CardContent>
          </Card>
        )}

        {/* Add Keyword Form Dialog */}
        {showAddKeywordForm && selectedWebsiteId && (
          <KeywordForm
            websiteId={selectedWebsiteId}
            onKeywordAdded={handleKeywordAdded}
            onCancel={() => setShowAddKeywordForm(false)}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default Keywords;
