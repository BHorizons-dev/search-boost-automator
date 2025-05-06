
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

interface AddRankingFormProps {
  keywordId: string;
  keywordText: string;
  onRankingAdded: () => void;
  onCancel: () => void;
}

export function AddRankingForm({ 
  keywordId, 
  keywordText, 
  onRankingAdded, 
  onCancel 
}: AddRankingFormProps) {
  const [searchEngine, setSearchEngine] = React.useState('google');
  const [position, setPosition] = React.useState('');
  const [url, setUrl] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!position) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a position.',
        variant: 'destructive',
      });
      return;
    }
    
    const positionNum = parseInt(position);
    if (isNaN(positionNum) || positionNum < 1) {
      toast({
        title: 'Validation Error',
        description: 'Position must be a positive number.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('rankings')
        .insert({
          keyword_id: keywordId as any,
          search_engine: searchEngine,
          position: positionNum,
          url: url || null,
          recorded_at: new Date().toISOString()
        } as any);
        
      if (error) throw error;
      
      toast({
        title: 'Ranking Added',
        description: `New ranking for "${keywordText}" on ${searchEngine} has been recorded.`,
      });
      
      onRankingAdded();
    } catch (error: any) {
      console.error('Error adding ranking:', error);
      toast({
        title: 'Error Adding Ranking',
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
          <DialogTitle>Add Manual Ranking</DialogTitle>
          <DialogDescription>
            Enter the ranking data for "{keywordText}".
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="search-engine" className="text-right">
                Search Engine
              </Label>
              <Select
                value={searchEngine}
                onValueChange={setSearchEngine}
              >
                <SelectTrigger id="search-engine" className="col-span-3">
                  <SelectValue placeholder="Select search engine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google">Google</SelectItem>
                  <SelectItem value="bing">Bing</SelectItem>
                  <SelectItem value="yahoo">Yahoo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="position" className="text-right">
                Position
              </Label>
              <Input
                id="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="col-span-3"
                type="number"
                min="1"
                placeholder="e.g., 3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="url" className="text-right">
                URL (optional)
              </Label>
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="col-span-3"
                placeholder="https://example.com/page"
              />
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
              {isSubmitting ? 'Adding...' : 'Add Ranking'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
