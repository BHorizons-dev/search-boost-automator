
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { RankingChart } from '@/components/dashboard/RankingChart';
import { ClientWebsites } from '@/components/dashboard/ClientWebsites';
import { AutomationTasks } from '@/components/dashboard/AutomationTasks';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

const Index = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome to your SEO Boost Automator dashboard</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Last 7 Days</Button>
            <Button>
              <Search className="mr-2 h-4 w-4" /> Quick Analysis
            </Button>
          </div>
        </div>
        
        <DashboardStats />
        
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-5">
          <RankingChart />
          <ClientWebsites />
        </div>
        
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          <AutomationTasks />
          <div className="dashboard-card">
            <h3 className="text-lg font-medium mb-4">Recent Alerts</h3>
            <div className="space-y-2">
              <div className="p-3 border-l-4 border-seo-orange bg-orange-50 rounded-r-md">
                <p className="font-medium">Ranking Drop Alert</p>
                <p className="text-sm text-gray-600">client2.com has dropped 5 positions for keyword "digital marketing"</p>
                <p className="text-xs text-gray-500 mt-1">Today, 10:23 AM</p>
              </div>
              <div className="p-3 border-l-4 border-seo-teal bg-teal-50 rounded-r-md">
                <p className="font-medium">Opportunity Detected</p>
                <p className="text-sm text-gray-600">New backlink opportunity found for client1.com</p>
                <p className="text-xs text-gray-500 mt-1">Yesterday, 4:17 PM</p>
              </div>
              <div className="p-3 border-l-4 border-gray-300 bg-gray-50 rounded-r-md">
                <p className="font-medium">Weekly Report Generated</p>
                <p className="text-sm text-gray-600">Weekly performance reports are ready for all clients</p>
                <p className="text-xs text-gray-500 mt-1">Apr 28, 9:00 AM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
