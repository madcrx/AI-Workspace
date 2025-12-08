'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Folder, FolderOpen, X, Edit2, Check, ExternalLink, GripVertical, Plus } from 'lucide-react';

interface Tool {
  id: string;
  tool: {
    id: string;
    name: string;
    description: string;
    category: string;
    pricing: string;
    websiteUrl: string;
  };
}

interface ToolContainerProps {
  container: {
    id: string;
    name: string;
    tools: Tool[];
    color?: string;
    page?: number;
  };
  onRemoveTool: (toolId: string) => void;
  onRename: (containerId: string, newName: string) => void;
  onDelete: (containerId: string) => void;
  onAddTool?: (containerId: string) => void;
}

export function ToolContainer({ container, onRemoveTool, onRename, onDelete, onAddTool }: ToolContainerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(container.name);
  const [currentPage, setCurrentPage] = useState(0);

  const toolsPerPage = 9; // 3x3 grid
  const totalPages = Math.ceil(container.tools.length / toolsPerPage);
  const startIdx = currentPage * toolsPerPage;
  const visibleTools = container.tools.slice(startIdx, startIdx + toolsPerPage);

  const handleRename = () => {
    if (editName.trim() && editName !== container.name) {
      onRename(container.id, editName.trim());
    }
    setIsEditing(false);
  };

  const getPricingColor = (pricing: string) => {
    switch (pricing) {
      case 'FREE': return 'bg-green-500';
      case 'FREEMIUM': return 'bg-blue-500';
      case 'PAID': return 'bg-orange-500';
      case 'SUBSCRIPTION': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card
      className={`relative group hover:shadow-xl transition-all duration-300 ${
        isOpen ? 'col-span-2 row-span-2' : ''
      }`}
      style={{ borderColor: container.color || '#e5e7eb' }}
    >
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
            {isOpen ? (
              <FolderOpen className="h-5 w-5 text-primary" style={{ color: container.color }} />
            ) : (
              <Folder className="h-5 w-5 text-primary" style={{ color: container.color }} />
            )}
            {isEditing ? (
              <div className="flex items-center gap-1 flex-1">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                  className="h-6 text-sm"
                  autoFocus
                />
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleRename}>
                  <Check className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <CardTitle className="text-sm">{container.name}</CardTitle>
            )}
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!isEditing && (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  {isOpen ? <FolderOpen className="h-3 w-3" /> : <Folder className="h-3 w-3" />}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-destructive"
                  onClick={() => onDelete(container.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          {container.tools.length} tool{container.tools.length !== 1 ? 's' : ''}
        </div>
      </CardHeader>

      <CardContent className="p-3 pt-0">
        {isOpen ? (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {visibleTools.map((toolItem) => (
                <div
                  key={toolItem.id}
                  className="relative border rounded p-2 hover:bg-accent transition-colors group/tool"
                >
                  <button
                    onClick={() => onRemoveTool(toolItem.tool.id)}
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover/tool:opacity-100 transition-opacity"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                  <div className="text-xs font-medium truncate">{toolItem.tool.name}</div>
                  <div className={`h-1 w-full rounded mt-1 ${getPricingColor(toolItem.tool.pricing)}`} />
                  <a
                    href={toolItem.tool.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-1 right-1 opacity-0 group-hover/tool:opacity-100 transition-opacity"
                  >
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </a>
                </div>
              ))}
              {onAddTool && (
                <button
                  onClick={() => onAddTool(container.id)}
                  className="border-2 border-dashed rounded p-2 hover:bg-accent transition-colors flex items-center justify-center"
                >
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`h-1.5 w-1.5 rounded-full transition-all ${
                      i === currentPage ? 'bg-primary w-3' : 'bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {container.tools.slice(0, 9).map((toolItem) => (
              <div
                key={toolItem.id}
                className={`h-6 w-6 rounded ${getPricingColor(toolItem.tool.pricing)}`}
                title={toolItem.tool.name}
              />
            ))}
            {container.tools.length > 9 && (
              <div className="h-6 w-6 rounded bg-muted flex items-center justify-center text-xs">
                +{container.tools.length - 9}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
