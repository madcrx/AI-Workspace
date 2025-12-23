'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, CreditCard, Building2, Bell } from 'lucide-react';

interface MonetizationSettings {
  id?: string;
  // Payment Information
  paypalEmail?: string;
  stripeAccountId?: string;
  bankAccountNumber?: string;
  bankRoutingNumber?: string;
  bankAccountName?: string;

  // Affiliate Network Credentials
  impactPartnerId?: string;
  impactApiKey?: string;
  shareasaleAffiliateId?: string;
  shareasaleApiToken?: string;
  cjPublisherId?: string;
  cjApiKey?: string;

  // Custom Affiliate IDs
  openaiAffiliateId?: string;
  anthropicAffiliateId?: string;
  midjourneyAffiliateId?: string;
  elevenLabsAffiliateId?: string;
  jasperAffiliateId?: string;

  // Revenue Goals
  monthlyRevenueGoal?: number;
  minimumPayoutAmount?: number;

  // Tax Information
  taxId?: string;
  businessName?: string;
  businessAddress?: string;

  // Notifications
  notificationEmail?: string;
  sendWeeklyReports?: boolean;
  sendMonthlyReports?: boolean;
  alertOnLargeConversion?: boolean;
  largeConversionThreshold?: number;
}

export default function MonetizationSettings() {
  const [settings, setSettings] = useState<MonetizationSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/monetization/settings');
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/monetization/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to save settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while saving' });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof MonetizationSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return <div>Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Monetization Backend Settings
          </CardTitle>
          <CardDescription>
            Configure payment methods, affiliate network credentials, and notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="payment" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="payment">Payment</TabsTrigger>
              <TabsTrigger value="networks">Networks</TabsTrigger>
              <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
              <TabsTrigger value="notifications">Alerts</TabsTrigger>
            </TabsList>

            <TabsContent value="payment" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="paypalEmail">PayPal Email</Label>
                  <Input
                    id="paypalEmail"
                    type="email"
                    placeholder="your-email@example.com"
                    value={settings.paypalEmail || ''}
                    onChange={(e) => updateSetting('paypalEmail', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="stripeAccountId">Stripe Account ID</Label>
                  <Input
                    id="stripeAccountId"
                    placeholder="acct_xxxxxxxxxxxxx"
                    value={settings.stripeAccountId || ''}
                    onChange={(e) => updateSetting('stripeAccountId', e.target.value)}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bankAccountName">Bank Account Name</Label>
                    <Input
                      id="bankAccountName"
                      placeholder="Your Business Name"
                      value={settings.bankAccountName || ''}
                      onChange={(e) => updateSetting('bankAccountName', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="bankAccountNumber">Account Number (Last 4)</Label>
                    <Input
                      id="bankAccountNumber"
                      placeholder="****1234"
                      value={settings.bankAccountNumber || ''}
                      onChange={(e) => updateSetting('bankAccountNumber', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="monthlyGoal">Monthly Revenue Goal ($)</Label>
                    <Input
                      id="monthlyGoal"
                      type="number"
                      placeholder="5000"
                      value={settings.monthlyRevenueGoal || ''}
                      onChange={(e) => updateSetting('monthlyRevenueGoal', parseFloat(e.target.value))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="minimumPayout">Minimum Payout ($)</Label>
                    <Input
                      id="minimumPayout"
                      type="number"
                      placeholder="50"
                      value={settings.minimumPayoutAmount || ''}
                      onChange={(e) => updateSetting('minimumPayoutAmount', parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="networks" className="space-y-4">
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="impactPartnerId">Impact Partner ID</Label>
                    <Input
                      id="impactPartnerId"
                      placeholder="Enter your Impact Partner ID"
                      value={settings.impactPartnerId || ''}
                      onChange={(e) => updateSetting('impactPartnerId', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="impactApiKey">Impact API Key</Label>
                    <Input
                      id="impactApiKey"
                      type="password"
                      placeholder="Enter your Impact API key"
                      value={settings.impactApiKey || ''}
                      onChange={(e) => updateSetting('impactApiKey', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="shareasaleId">ShareASale Affiliate ID</Label>
                    <Input
                      id="shareasaleId"
                      placeholder="Enter your ShareASale ID"
                      value={settings.shareasaleAffiliateId || ''}
                      onChange={(e) => updateSetting('shareasaleAffiliateId', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="shareasaleToken">ShareASale API Token</Label>
                    <Input
                      id="shareasaleToken"
                      type="password"
                      placeholder="Enter your API token"
                      value={settings.shareasaleApiToken || ''}
                      onChange={(e) => updateSetting('shareasaleApiToken', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cjPublisherId">CJ Publisher ID</Label>
                    <Input
                      id="cjPublisherId"
                      placeholder="Enter your CJ Publisher ID"
                      value={settings.cjPublisherId || ''}
                      onChange={(e) => updateSetting('cjPublisherId', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="cjApiKey">CJ API Key</Label>
                    <Input
                      id="cjApiKey"
                      type="password"
                      placeholder="Enter your CJ API key"
                      value={settings.cjApiKey || ''}
                      onChange={(e) => updateSetting('cjApiKey', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="affiliates" className="space-y-4">
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="openaiId">OpenAI Affiliate ID</Label>
                    <Input
                      id="openaiId"
                      placeholder="ChatGPT & DALL-E affiliate ID"
                      value={settings.openaiAffiliateId || ''}
                      onChange={(e) => updateSetting('openaiAffiliateId', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="anthropicId">Anthropic Affiliate ID</Label>
                    <Input
                      id="anthropicId"
                      placeholder="Claude affiliate ID"
                      value={settings.anthropicAffiliateId || ''}
                      onChange={(e) => updateSetting('anthropicAffiliateId', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="midjourneyId">Midjourney Affiliate ID</Label>
                    <Input
                      id="midjourneyId"
                      placeholder="Midjourney affiliate ID"
                      value={settings.midjourneyAffiliateId || ''}
                      onChange={(e) => updateSetting('midjourneyAffiliateId', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="elevenLabsId">ElevenLabs Affiliate ID</Label>
                    <Input
                      id="elevenLabsId"
                      placeholder="ElevenLabs affiliate ID"
                      value={settings.elevenLabsAffiliateId || ''}
                      onChange={(e) => updateSetting('elevenLabsAffiliateId', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="jasperId">Jasper AI Affiliate ID</Label>
                  <Input
                    id="jasperId"
                    placeholder="Jasper affiliate ID"
                    value={settings.jasperAffiliateId || ''}
                    onChange={(e) => updateSetting('jasperAffiliateId', e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="notificationEmail">Notification Email</Label>
                  <Input
                    id="notificationEmail"
                    type="email"
                    placeholder="alerts@yoursite.com"
                    value={settings.notificationEmail || ''}
                    onChange={(e) => updateSetting('notificationEmail', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Report Preferences</Label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.sendWeeklyReports || false}
                        onChange={(e) => updateSetting('sendWeeklyReports', e.target.checked)}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">Send weekly revenue reports</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.sendMonthlyReports || false}
                        onChange={(e) => updateSetting('sendMonthlyReports', e.target.checked)}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">Send monthly revenue reports</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.alertOnLargeConversion || false}
                        onChange={(e) => updateSetting('alertOnLargeConversion', e.target.checked)}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">Alert on large conversions</span>
                    </label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="conversionThreshold">Large Conversion Threshold ($)</Label>
                  <Input
                    id="conversionThreshold"
                    type="number"
                    placeholder="100"
                    value={settings.largeConversionThreshold || ''}
                    onChange={(e) => updateSetting('largeConversionThreshold', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex items-center justify-between">
            {message && (
              <div
                className={`text-sm ${
                  message.type === 'success' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {message.text}
              </div>
            )}
            <Button onClick={handleSave} disabled={saving} className="ml-auto">
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
