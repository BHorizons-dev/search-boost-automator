
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface KeywordFormProps {
  websiteId: string;
  onKeywordAdded: () => void;
  onCancel: () => void;
}

export function KeywordForm({ websiteId, onKeywordAdded, onCancel }: KeywordFormProps) {
  const [keyword, setKeyword] = React.useState('');
  const [importance, setImportance] = React.useState('3');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!keyword.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a keyword.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from('keywords')
        .insert({
          website_id: websiteId,
          keyword: keyword.trim(),
          importance: parseInt(importance)
        })
        .select();
        
      if (error) throw error;
      
      // Add mock initial rankings for this keyword
      const keywordId = data[0].id;
      const mockRankings = [];
      
      // Create mock rankings for each search engine
      const searchEngines = ['google', 'bing', 'yahoo'];
      const basePosition = Math.floor(Math.random() * 15) + 1; // Random position between 1-15
      
      for (const engine of searchEngines) {
        // Slight variation per engine
        const position = basePosition + Math.floor(Math.random() * 5) - 2;
        const finalPosition = Math.max(1, position); // Ensure position is at least 1
        
        mockRankings.push({
          keyword_id: keywordId,
          search_engine: engine,
          position: finalPosition,
          url: `https://www.${engine}.com/search?q=${encodeURIComponent(keyword)}`,
          recorded_at: new Date().toISOString()
        });
      }
      
      // Insert mock rankings
      const { error: rankingsError } = await supabase
        .from('rankings')
        .insert(mockRankings);
      
      if (rankingsError) {
        console.error('Error adding mock rankings:', rankingsError);
      }
      
      toast({
        title: 'Keyword Added',
        description: `"${keyword}" has been added successfully with mock rankings.`,
      });
      
      onKeywordAdded();
    } catch (error: any) {
      console.error('Error adding keyword:', error);
      toast({
        title: 'Error Adding Keyword',
        description: error.message || 'An unknown error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Keyword</DialogTitle>
          <DialogDescription>
            Enter the keyword you want to track for this website.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="keyword" className="text-right">
                Keyword
              </Label>
              <Input
                id="keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="col-span-3"
                placeholder="digital marketing services"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="importance" className="text-right">
                Importance
              </Label>
              <Select
                value={importance}
                onValueChange={setImportance}
              >
                <SelectTrigger id="importance" className="col-span-3">
                  <SelectValue placeholder="Select importance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Low</SelectItem>
                  <SelectItem value="2">2 - Below Average</SelectItem>
                  <SelectItem value="3">3 - Average</SelectItem>
                  <SelectItem value="4">4 - High</SelectItem>
                  <SelectItem value="5">5 - Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Keyword'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
