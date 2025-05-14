
import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { WebsiteSelector } from '@/components/rank-tracking/WebsiteSelector';
import { supabase, TablesSelect, assertData } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { AutomationTasks } from '@/components/dashboard/AutomationTasks';

const Automation = () => {
  const { toast } = useToast();
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string | null>(null);
  
  // Fetch website details
  const { data: website } = useQuery({
    queryKey: ['website-details', selectedWebsiteId],
    queryFn: async () => {
      if (!selectedWebsiteId) return null;
      
      try {
        const { data, error } = await supabase
          .from('websites')
          .select('*')
          .eq('id', selectedWebsiteId)
          .single();
        
        if (error) {
          console.error('Error fetching website details:', error);
          return null;
        }
        
        return data as TablesSelect['websites'];
      } catch (error) {
        console.error('Exception fetching website details:', error);
        return null;
      }
    },
    enabled: !!selectedWebsiteId
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Automation</h1>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Website Selector</CardTitle>
            <CardDescription>
              Choose a website to configure SEO automation settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WebsiteSelector 
              selectedWebsiteId={selectedWebsiteId}
              setSelectedWebsiteId={setSelectedWebsiteId}
            />
          </CardContent>
        </Card>

        {selectedWebsiteId ? (
          <>
            <Tabs defaultValue="settings">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="settings">Automation Settings</TabsTrigger>
                <TabsTrigger value="tasks">Automation Tasks</TabsTrigger>
              </TabsList>
              
              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>SEO Automation Settings</CardTitle>
                    <CardDescription>
                      Configure how AutoSEO Sync should automatically optimize your website
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Meta Title Optimization</h3>
                          <p className="text-sm text-muted-foreground">
                            Automatically optimize page titles based on keyword targets
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Meta Description Generation</h3>
                          <p className="text-sm text-muted-foreground">
                            Generate compelling meta descriptions for your pages
                          </p>
                        </div>
                        <Switch />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Image Alt Text</h3>
                          <p className="text-sm text-muted-foreground">
                            Add missing alt text to images based on context
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Schema Markup</h3>
                          <p className="text-sm text-muted-foreground">
                            Inject appropriate schema markup (JSON-LD)
                          </p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                    
                    <div className="space-y-4 pt-4 border-t">
                      <h3 className="font-medium">Automation Schedule</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="frequency">Frequency</Label>
                          <Select defaultValue="weekly">
                            <SelectTrigger id="frequency">
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="approval">Approval Process</Label>
                          <Select defaultValue="manual">
                            <SelectTrigger id="approval">
                              <SelectValue placeholder="Select approval process" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="automatic">Automatic</SelectItem>
                              <SelectItem value="manual">Manual Approval</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button>Save Settings</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="tasks">
                <AutomationTasks websiteId={selectedWebsiteId} />
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-lg text-muted-foreground">
                Select a website to configure automation settings
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default Automation;
