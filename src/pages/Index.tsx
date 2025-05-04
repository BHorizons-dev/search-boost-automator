
import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RankingChart } from "@/components/dashboard/RankingChart";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Index = () => {
  const { data: websiteCount } = useQuery({
    queryKey: ['website-count'],
    queryFn: async () => {
      try {
        const { count, error } = await supabase
          .from('websites')
          .select('*', { count: 'exact', head: true });
          
        if (error) throw error;
        return count || 0;
      } catch (error) {
        console.error('Error fetching website count:', error);
        return 0;
      }
    }
  });

  const { data: keywordCount } = useQuery({
    queryKey: ['keyword-count'],
    queryFn: async () => {
      try {
        const { count, error } = await supabase
          .from('keywords')
          .select('*', { count: 'exact', head: true });
          
        if (error) throw error;
        return count || 0;
      } catch (error) {
        console.error('Error fetching keyword count:', error);
        return 0;
      }
    }
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of your SEO performance and insights.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Websites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{websiteCount || 0}</div>
              <p className="text-xs text-muted-foreground mt-2">
                <Link to="/rank-tracking" className="flex items-center gap-1 hover:underline">
                  <span>Manage websites</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Keywords
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{keywordCount || 0}</div>
              <p className="text-xs text-muted-foreground mt-2">
                <Link to="/keywords" className="flex items-center gap-1 hover:underline">
                  <span>Manage keywords</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Position
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.3</div>
              <p className="text-xs text-muted-foreground mt-2">
                +0.8 from last week
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Improvement Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground mt-2">
                <Link to="/automation" className="flex items-center gap-1 hover:underline">
                  <span>View all opportunities</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <RankingChart />
          
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Recent Tasks</CardTitle>
              <CardDescription>Latest SEO tasks to complete</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {websiteCount === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">No websites added yet</p>
                  <Button asChild>
                    <Link to="/rank-tracking">Add Your First Website</Link>
                  </Button>
                </div>
              ) : keywordCount === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">No keywords tracked yet</p>
                  <Button asChild>
                    <Link to="/keywords">Add Your First Keyword</Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">No active tasks</p>
                  <Button asChild>
                    <Link to="/automation">Create New Task</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common SEO actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/rank-tracking">Add new website</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/keywords">Track new keyword</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/automation">Generate improvement report</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
