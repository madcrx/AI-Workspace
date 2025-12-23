'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, X, GripVertical, Key } from 'lucide-react';

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
    longDescription?: string;
    category: string;
    websiteUrl: string;
    pricing: string;
    logoUrl?: string;
    features?: string;
  };
}

interface WorkspaceGridProps {
  tools: WorkspaceTool[];
  onRemoveTool: (toolId: string) => void;
  onUpdateLayout: (tools: WorkspaceTool[]) => void;
  userCredentials?: Map<string, any>;
}

export function WorkspaceGrid({ tools, onRemoveTool, onUpdateLayout, userCredentials }: WorkspaceGridProps) {
  const [draggedTool, setDraggedTool] = useState<string | null>(null);
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());

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

  const toggleExpanded = (toolId: string) => {
    const newExpanded = new Set(expandedTools);
    if (newExpanded.has(toolId)) {
      newExpanded.delete(toolId);
    } else {
      newExpanded.add(toolId);
    }
    setExpandedTools(newExpanded);
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
    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
            <CardHeader className="pb-3 p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  {workspaceTool.tool.logoUrl && (
                    <div className="h-8 w-8 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={workspaceTool.tool.logoUrl}
                        alt={`${workspaceTool.tool.name} logo`}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Badge className={`text-sm py-0.5 px-2 ${getPricingBadgeColor(workspaceTool.tool.pricing)}`}>
                    {workspaceTool.tool.pricing}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 flex-shrink-0"
                    onClick={() => onRemoveTool(workspaceTool.toolId)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="min-w-0">
                <CardTitle className="text-base truncate">{workspaceTool.tool.name}</CardTitle>
                <CardDescription className="text-sm mt-1 truncate">
                  {workspaceTool.tool.category}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 p-4 pt-0">
              <div className="text-sm text-muted-foreground">
                <p className={expandedTools.has(workspaceTool.toolId) ? '' : 'line-clamp-2'}>
                  {workspaceTool.tool.longDescription || workspaceTool.tool.description}
                </p>
                {(workspaceTool.tool.longDescription || workspaceTool.tool.description.length > 100) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpanded(workspaceTool.toolId);
                    }}
                    className="text-primary hover:underline mt-1 text-sm"
                  >
                    {expandedTools.has(workspaceTool.toolId) ? 'Show less' : 'Show more'}
                  </button>
                )}
                {expandedTools.has(workspaceTool.toolId) && workspaceTool.tool.features && (
                  <div className="mt-2 pt-2 border-t">
                    <p className="font-medium mb-1 text-sm">Features:</p>
                    <div className="text-sm space-y-1">
                      {JSON.parse(workspaceTool.tool.features).map((feature: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-1">
                          <span>•</span>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {userCredentials?.has(workspaceTool.toolId) ? (
                <div className="flex gap-1">
                  <a
                    href={userCredentials.get(workspaceTool.toolId)?.loginUrl || workspaceTool.tool.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                    onClick={() => {
                      const cred = userCredentials.get(workspaceTool.toolId);
                      if (cred) {
                        navigator.clipboard.writeText(`Username: ${cred.username}`);
                      }
                    }}
                  >
                    <Button size="sm" className="w-full gap-1 h-9 text-sm" variant="default">
                      <Key className="h-4 w-4" />
                      Login
                    </Button>
                  </a>
                  <a
                    href={workspaceTool.tool.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button size="sm" className="w-full gap-1 h-9 text-sm" variant="outline">
                      <ExternalLink className="h-4 w-4" />
                      Visit
                    </Button>
                  </a>
                </div>
              ) : (
                <a
                  href={workspaceTool.tool.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="sm" className="w-full gap-1 h-9 text-sm">
                    <ExternalLink className="h-4 w-4" />
                    Open Tool
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
