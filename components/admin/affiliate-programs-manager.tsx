'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DollarSign,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';

interface AffiliateProgram {
  id: string;
  name: string;
  provider: string;
  affiliateNetwork: string | null;
  commissionType: string;
  commissionRate: number;
  costPerClick: number;
  trackingUrl: string;
  isActive: boolean;
  totalClicks: number;
  totalConversions: number;
  totalEarnings: number;
  _count?: {
    affiliateClicks: number;
  };
}

export default function AffiliateProgramsManager() {
  const [programs, setPrograms] = useState<AffiliateProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editedValues, setEditedValues] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/admin/affiliate-programs');
      const data = await response.json();
      setPrograms(data);

      // Initialize edited values
      const initialValues: { [key: string]: number } = {};
      data.forEach((program: AffiliateProgram) => {
        initialValues[program.id] = program.costPerClick || 0;
      });
      setEditedValues(initialValues);
    } catch (error) {
      console.error('Error fetching programs:', error);
      setMessage({ type: 'error', text: 'Failed to load affiliate programs' });
    } finally {
      setLoading(false);
    }
  };

  const updateCostPerClick = (programId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setEditedValues((prev) => ({ ...prev, [programId]: numValue }));
  };

  const saveCostPerClick = async (programId: string) => {
    setSaving(programId);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/affiliate-programs/${programId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ costPerClick: editedValues[programId] }),
      });

      if (response.ok) {
        const updatedProgram = await response.json();

        // Update the program in the list
        setPrograms((prev) =>
          prev.map((p) => (p.id === programId ? { ...p, costPerClick: updatedProgram.costPerClick } : p))
        );

        setMessage({
          type: 'success',
          text: `Updated cost per click for ${programs.find(p => p.id === programId)?.name}`
        });
      } else {
        setMessage({ type: 'error', text: 'Failed to update cost per click' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while updating' });
    } finally {
      setSaving(null);
    }
  };

  const hasChanges = (programId: string) => {
    const program = programs.find((p) => p.id === programId);
    if (!program) return false;
    return editedValues[programId] !== program.costPerClick;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Affiliate Programs - Cost Per Click
        </CardTitle>
        <CardDescription>
          Set the cost per click for each affiliate program. This determines how much you earn per conversion.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
            {message.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {programs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No affiliate programs found.</p>
            <p className="text-sm mt-2">Run the database seed to create default programs.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {programs.map((program) => (
              <div
                key={program.id}
                className={`p-4 border rounded-lg transition-colors ${
                  !program.isActive ? 'bg-muted/30 opacity-60' : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{program.name}</h4>
                      <Badge variant={program.isActive ? 'default' : 'secondary'} className="text-xs">
                        {program.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {program.provider} • {program.affiliateNetwork || 'Direct'} • {program.commissionType}
                    </p>
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{program.totalClicks.toLocaleString()} clicks</span>
                      <span>{program.totalConversions.toLocaleString()} conversions</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        ${program.totalEarnings.toFixed(2)} earned
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="space-y-1">
                      <Label htmlFor={`cost-${program.id}`} className="text-xs">
                        Cost Per Click
                      </Label>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            $
                          </span>
                          <Input
                            id={`cost-${program.id}`}
                            type="number"
                            step="0.01"
                            min="0"
                            value={editedValues[program.id] || 0}
                            onChange={(e) => updateCostPerClick(program.id, e.target.value)}
                            className="w-24 pl-6"
                            disabled={!program.isActive}
                          />
                        </div>
                        <Button
                          size="sm"
                          onClick={() => saveCostPerClick(program.id)}
                          disabled={!hasChanges(program.id) || saving === program.id || !program.isActive}
                          className="min-w-[70px]"
                        >
                          {saving === program.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : hasChanges(program.id) ? (
                            <>
                              <Save className="h-4 w-4 mr-1" />
                              Save
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Saved
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {hasChanges(program.id) && (
                  <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded text-xs">
                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                      <AlertTriangle className="h-3 w-3" />
                      <span>
                        Unsaved changes: ${program.costPerClick.toFixed(2)} → ${editedValues[program.id].toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 border-t">
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-100">
              <p className="font-semibold mb-1">How Cost Per Click Works</p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Set the dollar amount you earn each time a user clicks through your affiliate link and completes
                a conversion (signup, purchase, etc.). This value is automatically used to calculate earnings
                across all tutorials and tracking systems.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
