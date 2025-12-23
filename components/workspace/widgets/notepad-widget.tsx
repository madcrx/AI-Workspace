'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

export function NotepadWidget() {
  const [notes, setNotes] = useState('');
  const [height, setHeight] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);

  useEffect(() => {
    // Load notes and height from server
    const loadPreferences = async () => {
      try {
        const response = await fetch('/api/user/preferences');
        if (response.ok) {
          const data = await response.json();
          setNotes(data.notes || '');
          setHeight(data.notepadHeight || 300);
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };
    loadPreferences();
  }, []);

  const handleNotesChange = async (value: string) => {
    setNotes(value);
    // Save to server
    try {
      await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: value }),
      });
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const saveHeight = async (newHeight: number) => {
    try {
      await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notepadHeight: newHeight }),
      });
    } catch (error) {
      console.error('Error saving height:', error);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    startYRef.current = e.clientY;
    startHeightRef.current = height;
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaY = e.clientY - startYRef.current;
      const newHeight = Math.max(150, Math.min(800, startHeightRef.current + deltaY));
      setHeight(newHeight);
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        saveHeight(height);
      }
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, height]);

  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="p-0 relative">
        <Textarea
          ref={textareaRef}
          placeholder="Your notes..."
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          style={{ height: `${height}px` }}
          className="text-xs resize-none border-none focus-visible:ring-0 overflow-auto p-4"
        />
        <div
          onMouseDown={handleMouseDown}
          className={`absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-primary/20 transition-colors ${
            isResizing ? 'bg-primary/30' : ''
          }`}
        >
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-muted-foreground/30 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}
