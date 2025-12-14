'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { StickyNote } from 'lucide-react';

export function NotepadWidget() {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    // Load notes from localStorage
    const savedNotes = localStorage.getItem('workspace-notes');
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, []);

  const handleNotesChange = (value: string) => {
    setNotes(value);
    localStorage.setItem('workspace-notes', value);
  };

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="text-sm flex items-center gap-2">
          <StickyNote className="h-4 w-4" />
          Notepad
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden">
        <Textarea
          placeholder="Your notes..."
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          className="flex-1 text-xs resize-none h-full"
        />
      </CardContent>
    </Card>
  );
}
