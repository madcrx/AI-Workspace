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
    <Card className="w-full overflow-hidden">
      <CardContent className="pt-4 pb-4">
        <Textarea
          placeholder="Your notes..."
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          className="text-xs resize-none h-48 border-none focus-visible:ring-0"
        />
      </CardContent>
    </Card>
  );
}
