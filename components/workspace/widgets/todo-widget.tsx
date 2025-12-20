'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2 } from 'lucide-react';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export function TodoWidget() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState('');

  useEffect(() => {
    // Load todos from server
    const loadTodos = async () => {
      try {
        const response = await fetch('/api/user/preferences');
        if (response.ok) {
          const data = await response.json();
          setTodos(data.todos || []);
        }
      } catch (error) {
        console.error('Error loading todos:', error);
      }
    };
    loadTodos();
  }, []);

  const saveTodos = async (updatedTodos: TodoItem[]) => {
    setTodos(updatedTodos);
    // Save to server
    try {
      await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ todos: updatedTodos }),
      });
    } catch (error) {
      console.error('Error saving todos:', error);
    }
  };

  const addTodo = () => {
    if (!newTodo.trim()) return;
    const todo: TodoItem = {
      id: Date.now().toString(),
      text: newTodo,
      completed: false,
    };
    saveTodos([...todos, todo]);
    setNewTodo('');
  };

  const toggleTodo = (id: string) => {
    saveTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    saveTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">To-Do List</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              placeholder="Add a task..."
              className="h-8 text-sm"
            />
            <Button size="sm" onClick={addTodo} className="h-8 px-2">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {todos.map(todo => (
              <div key={todo.id} className="flex items-center gap-2 group">
                <Checkbox
                  checked={todo.completed}
                  onCheckedChange={() => toggleTodo(todo.id)}
                />
                <span
                  className={`text-sm flex-1 ${
                    todo.completed ? 'line-through text-muted-foreground' : ''
                  }`}
                >
                  {todo.text}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => deleteTodo(todo.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
