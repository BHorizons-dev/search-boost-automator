
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { supabase, TablesSelect, assertData } from '@/integrations/supabase/client';
import { WebsiteForm } from '@/components/rank-tracking/WebsiteForm';

export function ClientWebsites() {
  const { toast } = useToast();
  const [showWebsiteForm, setShowWebsiteForm] = useState(false);
  
  // Fetch websites from the database directly
  const { data: websites, isLoading, refetch } = useQuery({
    queryKey: ['client-websites'],
    queryFn: async () => {
      try {
        console.log('Fetching websites from database');
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
        
        console.log('Websites data received:', data);
        return assertData<TablesSelect['websites'][]>(data, []).map(website => ({
          ...website,
          status: getSEOHealthStatus(website.seo_health_score),
          averageRank: 4.2, // This would come from actual ranking data
          rankChange: "+0.3", // This would come from actual ranking data
          trend: "up", // This would come from actual ranking data
        }));
      } catch (error: any) {
        console.error('Exception fetching websites:', error);
        toast({
          title: 'Error fetching websites',
          description: error.message || 'An unknown error occurred',
          variant: 'destructive'
        });
        return [];
      }
    }
  });

  const getSEOHealthStatus = (score: number | null): 'healthy' | 'warning' | 'critical' => {
    if (score === null) return 'warning';
    if (score >= 70) return 'healthy';
    if (score >= 40) return 'warning';
    return 'critical';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-500">Healthy</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-amber-500 hover:bg-amber-600">Warning</Badge>;
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      default:
        return null;
    }
  };

  const handleWebsiteAdded = () => {
    setShowWebsiteForm(false);
    refetch();
    toast({
      title: 'Website Added',
      description: 'The website has been successfully added.',
    });
  };

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Client Websites</CardTitle>
        <Button size="sm" variant="outline" onClick={() => setShowWebsiteForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Website
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">Loading websites...</div>
        ) : websites && websites.length > 0 ? (
          <div className="space-y-4">
            {websites.map((website) => (
              <div key={website.id} className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{website.name}</p>
                    <p className="text-sm text-muted-foreground">{website.domain}</p>
                  </div>
                  <div>{getStatusBadge(website.status)}</div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Rank</p>
                    <p className="font-semibold">{website.averageRank}</p>
                  </div>
                  <div>
                    {website.trend === 'up' ? (
                      <div className="trend-up">
                        <TrendingUp className="h-4 w-4 inline mr-1 text-green-600" />
                        <span className="text-green-600">{website.rankChange}</span>
                      </div>
                    ) : (
                      <div className="trend-down">
                        <TrendingDown className="h-4 w-4 inline mr-1 text-red-600" />
                        <span className="text-red-600">{website.rankChange}</span>
                      </div>
                    )}
                  </div>
                  <Button size="sm">Details</Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-lg text-muted-foreground mb-2">No websites found</p>
            <p className="text-sm text-muted-foreground mb-4">Add your first website to start tracking SEO performance</p>
            <Button onClick={() => setShowWebsiteForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Website
            </Button>
          </div>
        )}
      </CardContent>

      {showWebsiteForm && (
        <WebsiteForm 
          onWebsiteAdded={handleWebsiteAdded} 
          onCancel={() => setShowWebsiteForm(false)} 
        />
      )}
    </Card>
  );
}
