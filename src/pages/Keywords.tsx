
import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WebsiteSelector } from '@/components/rank-tracking/WebsiteSelector';
import { KeywordForm } from '@/components/rank-tracking/KeywordForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, TrendingUp, ChevronRight } from 'lucide-react';
import { supabase, TablesSelect, assertData } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { AddRankingForm } from '@/components/rank-tracking/AddRankingForm';
import { RankingHistoryChart } from '@/components/rank-tracking/RankingHistoryChart';
import { Badge } from '@/components/ui/badge';

const Keywords = () => {
  const { toast } = useToast();
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string | null>(null);
  const [showAddKeywordForm, setShowAddKeywordForm] = useState(false);
  const [selectedKeyword, setSelectedKeyword] = useState<TablesSelect['keywords'] | null>(null);
  const [showRankingForm, setShowRankingForm] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

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

  // Fetch latest rankings for keywords
  const { data: latestRankings } = useQuery({
    queryKey: ['latest-rankings', selectedWebsiteId],
    queryFn: async () => {
      if (!selectedWebsiteId || !keywords || keywords.length === 0) return {};
      
      try {
        const keywordIds = keywords.map(k => k.id);
        
        const { data, error } = await supabase
          .from('rankings')
          .select('*')
          .in('keyword_id', keywordIds)
          .order('recorded_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching rankings:', error);
          return {};
        }
        
        // Group the latest ranking for each keyword by keyword_id
        const latestByKeyword: Record<string, any> = {};
        if (data) {
          data.forEach(ranking => {
            if (!latestByKeyword[ranking.keyword_id] || 
                new Date(ranking.recorded_at) > new Date(latestByKeyword[ranking.keyword_id].recorded_at)) {
              latestByKeyword[ranking.keyword_id] = ranking;
            }
          });
        }
        
        return latestByKeyword;
      } catch (error: any) {
        console.error('Exception fetching rankings:', error);
        return {};
      }
    },
    enabled: !!selectedWebsiteId && !!keywords && keywords.length > 0
  });

  const handleKeywordAdded = () => {
    setShowAddKeywordForm(false);
    refetch();
    toast({
      title: 'Keyword Added',
      description: 'The keyword has been successfully added.'
    });
  };

  const handleRankingAdded = () => {
    setShowRankingForm(false);
    setSelectedKeyword(null);
    refetch();
  };

  // Helper function to map importance to readable text and badge color
  const getImportanceData = (importance: number) => {
    switch (importance) {
      case 1: return { label: 'Low', color: 'bg-slate-400' };
      case 2: return { label: 'Medium', color: 'bg-blue-500' };
      case 3: return { label: 'High', color: 'bg-green-500 hover:bg-green-600' };
      default: return { label: 'Unknown', color: 'bg-slate-300' };
    }
  };

  // Filter keywords based on active tab
  const filteredKeywords = keywords?.filter(keyword => {
    if (activeTab === 'all') return true;
    if (activeTab === 'high') return keyword.importance === 3;
    if (activeTab === 'medium') return keyword.importance === 2;
    if (activeTab === 'low') return keyword.importance === 1;
    return true;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Keyword Manager</h1>
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
            />
          </CardContent>
        </Card>

        {selectedWebsiteId ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Keyword Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="all">All Keywords</TabsTrigger>
                  <TabsTrigger value="high">High Priority</TabsTrigger>
                  <TabsTrigger value="medium">Medium Priority</TabsTrigger>
                  <TabsTrigger value="low">Low Priority</TabsTrigger>
                </TabsList>
                
                <TabsContent value={activeTab}>
                  {isLoading ? (
                    <div className="text-center py-4">Loading keywords...</div>
                  ) : filteredKeywords && filteredKeywords.length > 0 ? (
                    <div className="grid gap-4">
                      {filteredKeywords.map(keyword => {
                        const importanceData = getImportanceData(keyword.importance);
                        const latestRanking = latestRankings?.[keyword.id];
                        
                        return (
                          <div 
                            key={keyword.id}
                            className="p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium text-lg">{keyword.keyword}</h3>
                                  <Badge className={importanceData.color}>
                                    {importanceData.label}
                                  </Badge>
                                </div>
                                
                                <div className="mt-2 text-sm text-muted-foreground">
                                  {latestRanking ? (
                                    <div className="flex items-center gap-4">
                                      <span>
                                        Latest position: 
                                        <span className="font-semibold ml-1">
                                          #{latestRanking.position}
                                        </span> 
                                        on {latestRanking.search_engine}
                                      </span>
                                      <span>
                                        Recorded: 
                                        <span className="ml-1">
                                          {new Date(latestRanking.recorded_at).toLocaleDateString()}
                                        </span>
                                      </span>
                                    </div>
                                  ) : (
                                    <span>No ranking data available</span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedKeyword(keyword);
                                    setShowRankingForm(true);
                                  }}
                                >
                                  <TrendingUp className="h-4 w-4 mr-1" />
                                  Add Ranking
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => setSelectedKeyword(keyword)}
                                >
                                  <ChevronRight className="h-4 w-4" />
                                  View History
                                </Button>
                              </div>
                            </div>
                            
                            {selectedKeyword?.id === keyword.id && !showRankingForm && (
                              <div className="mt-4 pt-4 border-t">
                                <RankingHistoryChart keywordId={keyword.id} />
                              </div>
                            )}
                          </div>
                        );
                      })}
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
                </TabsContent>
              </Tabs>
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

        {/* Add Ranking Form Dialog */}
        {showRankingForm && selectedKeyword && (
          <AddRankingForm
            keywordId={selectedKeyword.id}
            keywordText={selectedKeyword.keyword}
            onRankingAdded={handleRankingAdded}
            onCancel={() => {
              setShowRankingForm(false);
            }}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default Keywords;
