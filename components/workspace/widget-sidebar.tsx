'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Pin, PinOff, Plus, X, GripVertical } from 'lucide-react';
import { ClockWidget } from './widgets/clock-widget';
import { NotepadWidget } from './widgets/notepad-widget';
import { CryptoWidget } from './widgets/crypto-widget';
import { WeatherWidget } from './widgets/weather-widget';
import { CalculatorWidget } from './widgets/calculator-widget';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const AVAILABLE_WIDGETS = [
  { id: 'clock', name: 'Clock', component: ClockWidget },
  { id: 'notepad', name: 'Notepad', component: NotepadWidget },
  { id: 'crypto', name: 'Crypto Ticker', component: CryptoWidget },
  { id: 'weather', name: 'Weather', component: WeatherWidget },
  { id: 'calculator', name: 'Calculator', component: CalculatorWidget },
];

interface WidgetItem {
  id: string;
  widgetId: string;
  order: number;
}

export function WidgetSidebar() {
  const [isPinned, setIsPinned] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [widgets, setWidgets] = useState<WidgetItem[]>([]);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    // Load sidebar state from localStorage
    const savedPinned = localStorage.getItem('sidebar-pinned');
    const savedWidgets = localStorage.getItem('sidebar-widgets');

    if (savedPinned) setIsPinned(JSON.parse(savedPinned));
    if (savedWidgets) setWidgets(JSON.parse(savedWidgets));
    else {
      // Default widgets
      setWidgets([
        { id: '1', widgetId: 'clock', order: 0 },
        { id: '2', widgetId: 'notepad', order: 1 },
      ]);
    }
  }, []);

  const togglePin = () => {
    const newPinned = !isPinned;
    setIsPinned(newPinned);
    localStorage.setItem('sidebar-pinned', JSON.stringify(newPinned));
    if (newPinned) setIsOpen(true);
  };

  const addWidget = (widgetId: string) => {
    const newWidget: WidgetItem = {
      id: Date.now().toString(),
      widgetId,
      order: widgets.length,
    };
    const newWidgets = [...widgets, newWidget];
    setWidgets(newWidgets);
    localStorage.setItem('sidebar-widgets', JSON.stringify(newWidgets));
    setShowAddDialog(false);
  };

  const removeWidget = (id: string) => {
    const newWidgets = widgets.filter(w => w.id !== id);
    setWidgets(newWidgets);
    localStorage.setItem('sidebar-widgets', JSON.stringify(newWidgets));
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedWidget(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedWidget || draggedWidget === targetId) {
      setDraggedWidget(null);
      return;
    }

    const draggedIndex = widgets.findIndex(w => w.id === draggedWidget);
    const targetIndex = widgets.findIndex(w => w.id === targetId);

    const newWidgets = [...widgets];
    const [removed] = newWidgets.splice(draggedIndex, 1);
    newWidgets.splice(targetIndex, 0, removed);

    const updatedWidgets = newWidgets.map((w, index) => ({
      ...w,
      order: index,
    }));

    setWidgets(updatedWidgets);
    localStorage.setItem('sidebar-widgets', JSON.stringify(updatedWidgets));
    setDraggedWidget(null);
  };

  const availableToAdd = AVAILABLE_WIDGETS.filter(
    w => !widgets.some(widget => widget.widgetId === w.id)
  );

  return (
    <>
      {/* Sidebar Toggle Button */}
      {!isOpen && !isPinned && (
        <Button
          variant="outline"
          size="sm"
          className="fixed left-4 top-20 z-40"
          onClick={() => setIsOpen(true)}
        >
          <span className="text-xs">Widgets</span>
        </Button>
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-background border-r transition-transform duration-300 z-30 ${
          isOpen || isPinned ? 'translate-x-0' : '-translate-x-full'
        } w-72 overflow-y-auto`}
        onMouseEnter={() => !isPinned && setIsOpen(true)}
        onMouseLeave={() => !isPinned && setIsOpen(false)}
      >
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Widgets</h3>
            <div className="flex items-center gap-1">
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Plus className="h-3 w-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Widget</DialogTitle>
                    <DialogDescription>
                      Choose a widget to add to your sidebar
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2">
                    {availableToAdd.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        All widgets are already added
                      </p>
                    ) : (
                      availableToAdd.map((widget) => (
                        <Button
                          key={widget.id}
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => addWidget(widget.id)}
                        >
                          {widget.name}
                        </Button>
                      ))
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={togglePin}
              >
                {isPinned ? (
                  <PinOff className="h-3 w-3" />
                ) : (
                  <Pin className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>

          {/* Widgets */}
          <div className="space-y-3">
            {widgets
              .sort((a, b) => a.order - b.order)
              .map((widget) => {
                const widgetConfig = AVAILABLE_WIDGETS.find(w => w.id === widget.widgetId);
                if (!widgetConfig) return null;
                const WidgetComponent = widgetConfig.component;

                return (
                  <div
                    key={widget.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, widget.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, widget.id)}
                    className="relative group cursor-move"
                  >
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      onClick={() => removeWidget(widget.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <WidgetComponent />
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Spacer when sidebar is pinned */}
      {isPinned && <div className="w-72" />}
    </>
  );
}
