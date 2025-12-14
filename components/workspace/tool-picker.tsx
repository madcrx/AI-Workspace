'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus } from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  pricing: string;
  rating?: number;
}

interface ToolPickerProps {
  open: boolean;
  onClose: () => void;
  onAddTool: (toolId: string) => void;
  existingToolIds: string[];
}

export function ToolPicker({ open, onClose, onAddTool, existingToolIds }: ToolPickerProps) {
  const [tools, setTools] = useState<Tool[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [minRating, setMinRating] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchTools();
      fetchCategories();
    }
  }, [open, searchQuery, selectedCategory, minRating]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      const uniqueCategories = Array.isArray(data) ? data.map((c: any) => c.name) : [];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTools = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);

      const response = await fetch(`/api/tools?${params.toString()}`);
      const data = await response.json();
      // Ensure data is an array
      setTools(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching tools:', error);
      setTools([]);
    } finally {
      setLoading(false);
    }
  };

  const availableTools = Array.isArray(tools)
    ? tools.filter(tool =>
        !existingToolIds.includes(tool.id) &&
        (minRating === 0 || (tool.rating && tool.rating >= minRating))
      )
    : [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Tools to Workspace</DialogTitle>
          <DialogDescription>
            Search and select tools to add to your workspace
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="0">All Ratings</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : availableTools.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tools available to add
            </div>
          ) : (
            availableTools.map((tool) => (
              <div
                key={tool.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent"
              >
                <div className="flex-1">
                  <div className="font-medium">{tool.name}</div>
                  <div className="text-sm text-muted-foreground line-clamp-1">
                    {tool.description}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {tool.category}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {tool.pricing}
                    </Badge>
                    {tool.rating && tool.rating > 0 && (
                      <span className="text-xs text-muted-foreground">
                        ⭐ {tool.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    onAddTool(tool.id);
                    onClose();
                  }}
                  className="ml-4"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
