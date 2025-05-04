
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function DashboardStats() {
  const stats = [
    {
      title: "Active Websites",
      value: "12",
      change: "+2",
      trend: "up",
    },
    {
      title: "Avg. Ranking",
      value: "3.8",
      change: "+0.6",
      trend: "up",
    },
    {
      title: "Monitored Keywords",
      value: "187",
      change: "+23",
      trend: "up",
    },
    {
      title: "Auto-Optimizations",
      value: "42",
      change: "-5",
      trend: "down",
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {stat.trend === 'up' ? (
              <div className="trend-up">
                <TrendingUp className="h-4 w-4" />
                {stat.change}
              </div>
            ) : (
              <div className="trend-down">
                <TrendingDown className="h-4 w-4" />
                {stat.change}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="stats-value">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
