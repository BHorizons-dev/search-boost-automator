
import React from 'react';
import { TablesSelect } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RankingHistoryChart } from './RankingHistoryChart';

interface KeywordDetailsProps {
  keyword: TablesSelect['keywords'];
  latestRanking?: any;
}

export function KeywordDetails({ keyword, latestRanking }: KeywordDetailsProps) {
  // Helper function to map importance to readable text and badge color
  const getImportanceData = (importance: number) => {
    switch (importance) {
      case 1: return { label: 'Low', color: 'bg-slate-400' };
      case 2: return { label: 'Medium', color: 'bg-blue-500' };
      case 3: return { label: 'High', color: 'bg-green-500 hover:bg-green-600' };
      default: return { label: 'Unknown', color: 'bg-slate-300' };
    }
  };

  const importanceData = getImportanceData(keyword.importance);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">{keyword.keyword}</CardTitle>
          <Badge className={importanceData.color}>{importanceData.label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Current Position</h4>
              <p className="text-2xl font-bold">
                {latestRanking ? `#${latestRanking.position}` : 'N/A'}
              </p>
              <p className="text-sm text-muted-foreground">
                {latestRanking ? `on ${latestRanking.search_engine}` : 'No data available'}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Last Updated</h4>
              <p className="text-lg">
                {latestRanking ? new Date(latestRanking.recorded_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
          
          <div className="pt-4">
            <h4 className="text-sm font-medium mb-2">Ranking History</h4>
            <RankingHistoryChart keywordId={keyword.id} />
          </div>
          
          <div className="pt-4">
            <h4 className="text-sm font-medium mb-2">SEO Recommendations</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Include this keyword in page title and H1 tags</li>
              <li>Add this keyword to your meta description</li>
              <li>Ensure keyword density is between 1-2%</li>
              <li>Create related content to boost this keyword's authority</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
