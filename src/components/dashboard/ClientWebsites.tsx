
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function ClientWebsites() {
  const websites = [
    {
      name: "Tech Solutions Inc.",
      domain: "client1.com",
      status: "healthy",
      averageRank: 2.7,
      rankChange: "+1.2",
      trend: "up",
    },
    {
      name: "Modern Marketing",
      domain: "client2.com",
      status: "warning",
      averageRank: 5.3,
      rankChange: "-0.8",
      trend: "down",
    },
    {
      name: "Global Retail",
      domain: "client3.com",
      status: "healthy",
      averageRank: 3.1,
      rankChange: "+0.5",
      trend: "up",
    },
    {
      name: "Local Services",
      domain: "client4.com",
      status: "healthy",
      averageRank: 4.2,
      rankChange: "+0.3",
      trend: "up",
    },
  ];

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

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Client Websites</CardTitle>
        <Button size="sm" variant="outline">Add Website</Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {websites.map((website) => (
            <div key={website.domain} className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
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
                      <TrendingUp className="h-4 w-4" />
                      {website.rankChange}
                    </div>
                  ) : (
                    <div className="trend-down">
                      <TrendingDown className="h-4 w-4" />
                      {website.rankChange}
                    </div>
                  )}
                </div>
                <Button size="sm">Details</Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
