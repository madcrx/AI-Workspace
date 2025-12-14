'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator } from 'lucide-react';

export function CalculatorWidget() {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const handleNumber = (num: string) => {
    setDisplay(display === '0' ? num : display + num);
  };

  const handleOperator = (op: string) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const handleEquals = () => {
    try {
      const result = eval(equation + display);
      setDisplay(String(result));
      setEquation('');
    } catch {
      setDisplay('Error');
      setEquation('');
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="bg-muted p-2 rounded text-right">
          <div className="text-xs text-muted-foreground h-4">{equation}</div>
          <div className="text-lg font-bold">{display}</div>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {['7', '8', '9', '/'].map((btn) => (
            <Button
              key={btn}
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={() => (btn === '/' ? handleOperator(btn) : handleNumber(btn))}
            >
              {btn}
            </Button>
          ))}
          {['4', '5', '6', '*'].map((btn) => (
            <Button
              key={btn}
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={() => (btn === '*' ? handleOperator(btn) : handleNumber(btn))}
            >
              {btn}
            </Button>
          ))}
          {['1', '2', '3', '-'].map((btn) => (
            <Button
              key={btn}
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={() => (btn === '-' ? handleOperator(btn) : handleNumber(btn))}
            >
              {btn}
            </Button>
          ))}
          {['0', '.', '=', '+'].map((btn) => (
            <Button
              key={btn}
              size="sm"
              variant={btn === '=' ? 'default' : 'outline'}
              className="h-8 text-xs"
              onClick={() => {
                if (btn === '=') handleEquals();
                else if (btn === '+') handleOperator(btn);
                else handleNumber(btn);
              }}
            >
              {btn}
            </Button>
          ))}
          <Button
            size="sm"
            variant="destructive"
            className="h-8 text-xs col-span-4"
            onClick={handleClear}
          >
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
