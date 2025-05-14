import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase, TablesSelect, assertData } from '@/integrations/supabase/client';
import { Plus, Search, FileText, RefreshCw } from 'lucide-react';
import { WebsiteSelector } from '@/components/rank-tracking/WebsiteSelector';

const Keywords = () => {
  const { toast } = useToast();
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddKeywordDialogOpen, setIsAddKeywordDialogOpen] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [keywordImportance, setKeywordImportance] = useState('1');

  // Fetch keywords for the selected website
  const { data: keywords, isLoading, refetch } = useQuery({
    queryKey: ['keywords', selectedWebsiteId],
    queryFn: async () => {
      if (!selectedWebsiteId) return [] as TablesSelect['keywords'][];
      
      try {
        const { data, error } = await supabase
          .from('keywords')
          .select('*')
          .eq('website_id', selectedWebsiteId);
          
        if (error) {
          console.error('Error fetching keywords:', error);
          toast({
            title: 'Error fetching keywords',
            description: error.message,
            variant: 'destructive'
          });
          return [] as TablesSelect['keywords'][];
        }
        
        return assertData<TablesSelect['keywords'][]>(data);
      } catch (error: any) {
        console.error('Exception fetching keywords:', error);
        toast({
          title: 'Error fetching keywords',
          description: error.message || 'An unknown error occurred',
          variant: 'destructive'
        });
        return [] as TablesSelect['keywords'][];
      }
    },
    enabled: !!selectedWebsiteId,
    retry: 3,
    retryDelay: 1000
  });

  // Filter keywords by search query
  const filteredKeywords = keywords?.filter(keyword => 
    keyword.keyword.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddKeyword = async () => {
    if (!selectedWebsiteId || !newKeyword.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please select a website and enter a keyword',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('keywords')
        .insert({
          website_id: selectedWebsiteId,
          keyword: newKeyword.trim(),
          importance: parseInt(keywordImportance)
        });

      if (error) {
        console.error('Error adding keyword:', error);
        throw error;
      }

      toast({
        title: 'Keyword Added',
        description: `"${newKeyword}" has been added successfully.`
      });
      
      setNewKeyword('');
      setKeywordImportance('1');
      setIsAddKeywordDialogOpen(false);
      refetch();
    } catch (error: any) {
      console.error('Exception adding keyword:', error);
      toast({
        title: 'Error Adding Keyword',
        description: error.message || 'An unknown error occurred',
        variant: 'destructive'
      });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Keywords</h1>
          <Button 
            onClick={() => setIsAddKeywordDialogOpen(true)}
            disabled={!selectedWebsiteId}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Keyword
          </Button>
        </div>

        <WebsiteSelector 
          selectedWebsiteId={selectedWebsiteId}
          setSelectedWebsiteId={setSelectedWebsiteId}
        />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Keyword Management</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search keywords..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Loading keywords...</div>
            ) : filteredKeywords && filteredKeywords.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Keyword</TableHead>
                    <TableHead>Importance</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead>Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredKeywords.map((keyword) => (
                    <TableRow key={keyword.id}>
                      <TableCell className="font-medium">{keyword.keyword}</TableCell>
                      <TableCell>
                        {keyword.importance === 1 ? 'Low' : 
                         keyword.importance === 2 ? 'Medium' : 'High'}
                      </TableCell>
                      <TableCell>
                        {new Date(keyword.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(keyword.updated_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : selectedWebsiteId ? (
              <div className="text-center py-8">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-lg text-muted-foreground mb-2">No keywords found</p>
                <p className="text-sm text-muted-foreground mb-4">Add your first keyword to start tracking</p>
                <Button onClick={() => setIsAddKeywordDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Keyword
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Select a website to view keywords</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Keyword Dialog */}
        <Dialog open={isAddKeywordDialogOpen} onOpenChange={setIsAddKeywordDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Keyword</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="keyword">Keyword</Label>
                <Input 
                  id="keyword" 
                  placeholder="e.g., seo services"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="importance">Importance</Label>
                <Select value={keywordImportance} onValueChange={setKeywordImportance}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select importance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Low</SelectItem>
                    <SelectItem value="2">Medium</SelectItem>
                    <SelectItem value="3">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddKeywordDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddKeyword}>Add Keyword</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Keywords;
