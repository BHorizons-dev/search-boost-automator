
import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface RankingHistoryChartProps {
  keywordId: string;
}

export function RankingHistoryChart({ keywordId }: RankingHistoryChartProps) {
  const { data: keyword } = useQuery({
    queryKey: ['keyword', keywordId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('keywords')
          .select('keyword')
          .eq('id', keywordId)
          .single();
          
        if (error) {
          console.error('Error fetching keyword:', error);
          toast({
            title: 'Error fetching keyword',
            description: error.message,
            variant: 'destructive'
          });
          return { keyword: '' };
        }
        
        return data;
      } catch (err: any) {
        console.error('Exception fetching keyword:', err);
        toast({
          title: 'Error fetching keyword',
          description: err.message || 'An unknown error occurred',
          variant: 'destructive'
        });
        return { keyword: '' };
      }
    },
    retry: 3,
    retryDelay: 1000
  });

  const { data: rankingHistory, isLoading } = useQuery({
    queryKey: ['ranking-history', keywordId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('rankings')
          .select('search_engine, position, recorded_at')
          .eq('keyword_id', keywordId)
          .order('recorded_at', { ascending: true });
          
        if (error) {
          console.error('Error fetching ranking history:', error);
          toast({
            title: 'Error fetching ranking history',
            description: error.message,
            variant: 'destructive'
          });
          return [];
        }
        
        return data || [];
      } catch (err: any) {
        console.error('Exception fetching ranking history:', err);
        toast({
          title: 'Error fetching ranking history',
          description: err.message || 'An unknown error occurred',
          variant: 'destructive'
        });
        return [];
      }
    },
    retry: 3,
    retryDelay: 1000
  });
  
  // Transform data for the chart
  const chartData = React.useMemo(() => {
    if (!rankingHistory) return [];
    
    // Create map of dates to help collect data points by date
    const dateMap: Record<string, any> = {};
    
    rankingHistory.forEach(record => {
      const date = new Date(record.recorded_at).toLocaleDateString();
      
      if (!dateMap[date]) {
        dateMap[date] = { date };
      }
      
      // Add the position for this search engine
      dateMap[date][record.search_engine] = record.position;
    });
    
    // Convert the map to an array for the chart
    return Object.values(dateMap);
  }, [rankingHistory]);

  if (isLoading) {
    return <div className="h-[300px] flex items-center justify-center">Loading chart data...</div>;
  }

  if (!rankingHistory?.length) {
    return <div className="h-[300px] flex items-center justify-center">No historical data available for this keyword.</div>;
  }

  return (
    <div className="h-[400px] w-full">
      <h3 className="text-lg font-medium mb-4">
        Ranking history for: {keyword?.keyword || ''}
      </h3>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis reversed domain={[1, 'auto']} label={{ value: 'Position', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="google" stroke="#4285F4" activeDot={{ r: 8 }} strokeWidth={2} />
          <Line type="monotone" dataKey="bing" stroke="#00A4EF" strokeWidth={2} />
          <Line type="monotone" dataKey="yahoo" stroke="#720E9E" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
