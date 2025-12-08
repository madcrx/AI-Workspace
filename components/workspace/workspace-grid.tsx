'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, X, GripVertical } from 'lucide-react';

interface WorkspaceTool {
  id: string;
  toolId: string;
  position: number;
  gridX: number;
  gridY: number;
  width: number;
  height: number;
  tool: {
    id: string;
    name: string;
    description: string;
    category: string;
    websiteUrl: string;
    pricing: string;
    logoUrl?: string;
  };
}

interface WorkspaceGridProps {
  tools: WorkspaceTool[];
  onRemoveTool: (toolId: string) => void;
  onUpdateLayout: (tools: WorkspaceTool[]) => void;
}

export function WorkspaceGrid({ tools, onRemoveTool, onUpdateLayout }: WorkspaceGridProps) {
  const [draggedTool, setDraggedTool] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, toolId: string) => {
    setDraggedTool(toolId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetToolId: string) => {
    e.preventDefault();

    if (!draggedTool || draggedTool === targetToolId) {
      setDraggedTool(null);
      return;
    }

    const draggedIndex = tools.findIndex(t => t.toolId === draggedTool);
    const targetIndex = tools.findIndex(t => t.toolId === targetToolId);

    const newTools = [...tools];
    const [removed] = newTools.splice(draggedIndex, 1);
    newTools.splice(targetIndex, 0, removed);

    const updatedTools = newTools.map((tool, index) => ({
      ...tool,
      position: index,
    }));

    onUpdateLayout(updatedTools);
    setDraggedTool(null);
  };

  const getPricingBadgeColor = (pricing: string) => {
    switch (pricing) {
      case 'FREE':
        return 'bg-green-500 text-white';
      case 'FREEMIUM':
        return 'bg-blue-500 text-white';
      case 'PAID':
        return 'bg-orange-500 text-white';
      case 'SUBSCRIPTION':
        return 'bg-purple-500 text-white';
      default:
        return '';
    }
  };

  if (tools.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">Your workspace is empty</p>
          <p className="text-sm text-muted-foreground">
            Browse tools and add them to your workspace
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {tools
        .sort((a, b) => a.position - b.position)
        .map((workspaceTool) => (
          <Card
            key={workspaceTool.id}
            draggable
            onDragStart={(e) => handleDragStart(e, workspaceTool.toolId)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, workspaceTool.toolId)}
            className="cursor-move hover:shadow-lg transition-shadow"
          >
            <CardHeader className="pb-2 p-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  <GripVertical className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  {workspaceTool.tool.logoUrl && (
                    <div className="h-6 w-6 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={workspaceTool.tool.logoUrl}
                        alt={`${workspaceTool.tool.name} logo`}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-sm truncate">{workspaceTool.tool.name}</CardTitle>
                    <CardDescription className="text-xs mt-0.5 truncate">
                      {workspaceTool.tool.category}
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 flex-shrink-0"
                  onClick={() => onRemoveTool(workspaceTool.toolId)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 p-3 pt-0">
              <p className="text-xs text-muted-foreground line-clamp-2">
                {workspaceTool.tool.description}
              </p>
              <div className="flex items-center gap-1">
                <Badge className={`text-xs py-0 px-1.5 ${getPricingBadgeColor(workspaceTool.tool.pricing)}`}>
                  {workspaceTool.tool.pricing}
                </Badge>
              </div>
              <a
                href={workspaceTool.tool.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" className="w-full gap-1 h-7 text-xs">
                  <ExternalLink className="h-3 w-3" />
                  Open Tool
                </Button>
              </a>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
