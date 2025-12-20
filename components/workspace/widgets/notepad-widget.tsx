'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { StickyNote } from 'lucide-react';

export function NotepadWidget() {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    // Load notes from server
    const loadNotes = async () => {
      try {
        const response = await fetch('/api/user/preferences');
        if (response.ok) {
          const data = await response.json();
          setNotes(data.notes || '');
        }
      } catch (error) {
        console.error('Error loading notes:', error);
      }
    };
    loadNotes();
  }, []);

  const handleNotesChange = async (value: string) => {
    setNotes(value);
    // Save to server with debounce
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
