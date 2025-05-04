
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

const data = [
  { 
    name: 'Apr 20', 
    google: 8, 
    bing: 12, 
    yahoo: 10 
  },
  { 
    name: 'Apr 21', 
    google: 7, 
    bing: 10, 
    yahoo: 9 
  },
  { 
    name: 'Apr 22', 
    google: 6, 
    bing: 8, 
    yahoo: 7 
  },
  { 
    name: 'Apr 23', 
    google: 5, 
    bing: 8, 
    yahoo: 6 
  },
  { 
    name: 'Apr 24', 
    google: 5, 
    bing: 7, 
    yahoo: 5 
  },
  { 
    name: 'Apr 25', 
    google: 3, 
    bing: 5, 
    yahoo: 4 
  },
  { 
    name: 'Apr 26', 
    google: 2, 
    bing: 4, 
    yahoo: 3 
  },
];

export function RankingChart() {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Ranking Trends (Top 5 Keywords)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 10,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#888888" fontSize={12} />
              <YAxis 
                stroke="#888888" 
                fontSize={12} 
                reversed 
                domain={[1, 'dataMax']} 
                label={{ value: 'Position', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }} 
              />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="google" stroke="#4285F4" activeDot={{ r: 8 }} strokeWidth={2} />
              <Line type="monotone" dataKey="bing" stroke="#00A4EF" strokeWidth={2} />
              <Line type="monotone" dataKey="yahoo" stroke="#720E9E" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
