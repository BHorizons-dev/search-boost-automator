
import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { TrendingUp, TrendingDown, Search, RefreshCw, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RankingHistoryChart } from '@/components/rank-tracking/RankingHistoryChart';
import { KeywordForm } from '@/components/rank-tracking/KeywordForm';
import { WebsiteSelector } from '@/components/rank-tracking/WebsiteSelector';

const searchEngines = ['google', 'bing', 'yahoo'];

const RankTracking = () => {
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string | null>(null);
  const [showKeywordForm, setShowKeywordForm] = useState(false);
  const [selectedKeywordId, setSelectedKeywordId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  // Fetch keywords for the selected website
  const { 
    data: keywords, 
    isLoading: keywordsLoading, 
    refetch: refetchKeywords 
  } = useQuery({
    queryKey: ['keywords', selectedWebsiteId],
    queryFn: async () => {
      if (!selectedWebsiteId) return [];
      
      const { data, error } = await supabase
        .from('keywords')
        .select('*')
        .eq('website_id', selectedWebsiteId);
        
      if (error) {
        toast({
          title: 'Error fetching keywords',
          description: error.message,
          variant: 'destructive'
        });
        return [];
      }
      
      return data || [];
    },
    enabled: !!selectedWebsiteId
  });

  // Fetch rankings for all keywords of the selected website
  const { 
    data: rankings, 
    isLoading: rankingsLoading,
    refetch: refetchRankings 
  } = useQuery({
    queryKey: ['rankings', selectedWebsiteId],
    queryFn: async () => {
      if (!selectedWebsiteId || !keywords?.length) return [];
      
      const keywordIds = keywords.map(k => k.id);
      
      const { data, error } = await supabase
        .from('rankings')
        .select(`
          id,
          keyword_id,
          search_engine,
          position,
          url,
          recorded_at,
          keywords(keyword)
        `)
        .in('keyword_id', keywordIds)
        .order('recorded_at', { ascending: false });
        
      if (error) {
        toast({
          title: 'Error fetching rankings',
          description: error.message,
          variant: 'destructive'
        });
        return [];
      }
      
      // Group by keyword_id and search_engine to get the latest rankings
      const latestRankings: Record<string, Record<string, any>> = {};
      data.forEach(ranking => {
        const keywordId = ranking.keyword_id;
        const searchEngine = ranking.search_engine;
        
        if (!latestRankings[keywordId]) {
          latestRankings[keywordId] = {};
        }
        
        if (!latestRankings[keywordId][searchEngine] || 
            new Date(ranking.recorded_at) > new Date(latestRankings[keywordId][searchEngine].recorded_at)) {
          latestRankings[keywordId][searchEngine] = ranking;
        }
      });
      
      return data;
    },
    enabled: !!selectedWebsiteId && !!keywords?.length
  });

  // Filter rankings by search engine based on active tab
  const filteredRankings = rankings?.filter(ranking => 
    activeTab === "all" || ranking.search_engine === activeTab
  );

  const handleRefreshRankings = async () => {
    // In a real application, this would trigger a ranking check
    // For now, we'll just refetch the data
    toast({
      title: "Refresh requested",
      description: "Rankings refresh has been requested. This would trigger actual rank checking in a production environment.",
    });
    
    await refetchRankings();
  };

  const handleKeywordAdded = () => {
    setShowKeywordForm(false);
    refetchKeywords();
  };

  // Calculate the change in position compared to previous ranking
  const calculateRankChange = (keywordId: string, searchEngine: string) => {
    if (!rankings) return null;
    
    // Sort rankings for this keyword and search engine by date
    const keywordRankings = rankings
      .filter(r => r.keyword_id === keywordId && r.search_engine === searchEngine)
      .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());
    
    if (keywordRankings.length < 2) return null;
    
    const current = keywordRankings[0].position;
    const previous = keywordRankings[1].position;
    
    return previous - current; // Positive means improvement (moved up in rankings)
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Rank Tracking</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => handleRefreshRankings()}
              disabled={!selectedWebsiteId}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Rankings
            </Button>
            <Button 
              onClick={() => setShowKeywordForm(true)}
              disabled={!selectedWebsiteId}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Keyword
            </Button>
          </div>
        </div>
        
        <WebsiteSelector 
          selectedWebsiteId={selectedWebsiteId}
          setSelectedWebsiteId={setSelectedWebsiteId}
        />

        {showKeywordForm && selectedWebsiteId && (
          <KeywordForm 
            websiteId={selectedWebsiteId} 
            onKeywordAdded={handleKeywordAdded}
            onCancel={() => setShowKeywordForm(false)}
          />
        )}

        {selectedWebsiteId && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Keyword Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  {searchEngines.map(engine => (
                    <TabsTrigger key={engine} value={engine} className="capitalize">
                      {engine}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                <TabsContent value={activeTab} className="mt-0">
                  {keywordsLoading || rankingsLoading ? (
                    <div className="text-center py-4">Loading rankings data...</div>
                  ) : keywords?.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">No keywords found for this website.</p>
                      <Button variant="outline" onClick={() => setShowKeywordForm(true)} className="mt-2">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Your First Keyword
                      </Button>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Keyword</TableHead>
                          <TableHead>Engine</TableHead>
                          <TableHead>Position</TableHead>
                          <TableHead>Change</TableHead>
                          <TableHead>URL</TableHead>
                          <TableHead>Last Updated</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRankings?.length ? (
                          filteredRankings.map((ranking) => {
                            const change = calculateRankChange(ranking.keyword_id, ranking.search_engine);
                            
                            return (
                              <TableRow 
                                key={ranking.id}
                                className={selectedKeywordId === ranking.keyword_id ? "bg-muted/50" : ""}
                                onClick={() => setSelectedKeywordId(ranking.keyword_id)}
                              >
                                <TableCell className="font-medium">
                                  {ranking.keywords?.keyword}
                                </TableCell>
                                <TableCell className="capitalize">{ranking.search_engine}</TableCell>
                                <TableCell>{ranking.position}</TableCell>
                                <TableCell>
                                  {change !== null && (
                                    <div className={`flex items-center ${change > 0 ? "text-green-500" : change < 0 ? "text-red-500" : "text-gray-500"}`}>
                                      {change > 0 ? (
                                        <>
                                          <TrendingUp className="h-4 w-4 mr-1" />
                                          +{change}
                                        </>
                                      ) : change < 0 ? (
                                        <>
                                          <TrendingDown className="h-4 w-4 mr-1" />
                                          {change}
                                        </>
                                      ) : (
                                        "0"
                                      )}
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell className="max-w-xs truncate">
                                  {ranking.url ? (
                                    <a href={ranking.url} target="_blank" rel="noopener noreferrer" 
                                      className="text-blue-500 hover:underline">
                                      {ranking.url}
                                    </a>
                                  ) : (
                                    <span className="text-muted-foreground">N/A</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {new Date(ranking.recorded_at).toLocaleString()}
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center">No rankings data available.</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {selectedKeywordId && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Ranking History</CardTitle>
            </CardHeader>
            <CardContent>
              <RankingHistoryChart keywordId={selectedKeywordId} />
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default RankTracking;
