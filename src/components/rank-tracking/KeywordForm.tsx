
// Add correct type handling for KeywordForm component

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase, TablesInsert } from '@/integrations/supabase/client';

interface KeywordFormProps {
  websiteId: string;
  onKeywordAdded: () => void;
  onCancel: () => void;
}

// We'll need to handle the data correctly
export const handleWebsiteKeywordSubmit = async (websiteId: string, keyword: string, importance: number) => {
  try {
    const newKeyword: TablesInsert['keywords'] = {
      website_id: websiteId,
      keyword: keyword.trim(),
      importance: importance
    };
    
    const { data, error } = await supabase
      .from('keywords')
      .insert(newKeyword as any)
      .select('id')
      .single();
      
    if (error) throw error;
    
    return { success: true, data };
  } catch (error: any) {
    console.error('Error adding keyword:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
};

export function KeywordForm({ websiteId, onKeywordAdded, onCancel }: KeywordFormProps) {
  const { toast } = useToast();
  const [newKeyword, setNewKeyword] = useState('');
  const [keywordImportance, setKeywordImportance] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddKeyword = async () => {
    if (!websiteId || !newKeyword.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a keyword',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    const importance = parseInt(keywordImportance);

    try {
      const result = await handleWebsiteKeywordSubmit(websiteId, newKeyword, importance);

      if (result.success) {
        toast({
          title: 'Keyword Added',
          description: `"${newKeyword}" has been added successfully.`
        });
        
        setNewKeyword('');
        setKeywordImportance('1');
        onKeywordAdded();
      } else {
        toast({
          title: 'Error Adding Keyword',
          description: result.error || 'An unknown error occurred',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Exception adding keyword:', error);
      toast({
        title: 'Error Adding Keyword',
        description: error.message || 'An unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
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
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleAddKeyword} disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Keyword'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
