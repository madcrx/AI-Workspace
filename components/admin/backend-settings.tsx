'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Key, Cloud, Database, Shield, Settings as SettingsIcon } from 'lucide-react';

interface BackendSettings {
  // Email/SMTP
  smtpHost?: string;
  smtpPort?: number;
  smtpUsername?: string;
  smtpPassword?: string;
  smtpFromEmail?: string;
  smtpFromName?: string;
  smtpSecure?: boolean;
  smtpEnabled?: boolean;

  // OAuth - Google
  googleClientId?: string;
  googleClientSecret?: string;
  googleRedirectUri?: string;
  googleEnabled?: boolean;

  // OAuth - GitHub
  githubClientId?: string;
  githubClientSecret?: string;
  githubRedirectUri?: string;
  githubEnabled?: boolean;

  // OAuth - Discord
  discordClientId?: string;
  discordClientSecret?: string;
  discordRedirectUri?: string;
  discordEnabled?: boolean;

  // OAuth - Microsoft
  microsoftClientId?: string;
  microsoftClientSecret?: string;
  microsoftRedirectUri?: string;
  microsoftEnabled?: boolean;

  // AI Services
  openaiApiKey?: string;
  anthropicApiKey?: string;
  googleAiApiKey?: string;
  cohereApiKey?: string;
  huggingfaceApiKey?: string;

  // Analytics
  googleAnalyticsId?: string;
  mixpanelToken?: string;
  segmentWriteKey?: string;
  hotjarSiteId?: string;
  clarityProjectId?: string;

  // Payment Services
  stripePublicKey?: string;
  stripeSecretKey?: string;
  stripeWebhookSecret?: string;
  paypalClientId?: string;
  paypalClientSecret?: string;
  paypalMode?: string;

  // Cloud Storage
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  awsRegion?: string;
  awsS3Bucket?: string;
  cloudinaryCloudName?: string;
  cloudinaryApiKey?: string;
  cloudinaryApiSecret?: string;

  // Communication
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioPhoneNumber?: string;
  sendgridApiKey?: string;
  mailgunApiKey?: string;
  mailgunDomain?: string;

  // Social Media
  twitterApiKey?: string;
  twitterApiSecret?: string;
  twitterBearerToken?: string;
  facebookAppId?: string;
  facebookAppSecret?: string;
  linkedinClientId?: string;
  linkedinClientSecret?: string;

  // Search & SEO
  googleSearchApiKey?: string;
  googleSearchEngineId?: string;
  serpApiKey?: string;
  semrushApiKey?: string;

  // Database
  databaseUrl?: string;
  redisUrl?: string;
  mongodbUrl?: string;

  // Application URLs
  appUrl?: string;
  apiUrl?: string;
  cdnUrl?: string;

  // Security
  jwtSecret?: string;
  encryptionKey?: string;
  apiRateLimit?: number;
  corsOrigins?: string;

  // Feature Flags
  enableAiChat?: boolean;
  enableSocialLogin?: boolean;
  enablePayments?: boolean;
  enableAnalytics?: boolean;
  enableEmailNotifications?: boolean;
}

export default function BackendSettings() {
  const [settings, setSettings] = useState<BackendSettings>({});
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
        setMessage({ type: 'success', text: 'Backend settings saved successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to save settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while saving' });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof BackendSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return <div>Loading backend settings...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Backend Configuration Settings
          </CardTitle>
          <CardDescription>
            Configure Email, OAuth, API keys, and integrations used throughout the application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="email" className="space-y-4">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="oauth">OAuth</TabsTrigger>
              <TabsTrigger value="ai">AI APIs</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="storage">Storage</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            {/* Email/SMTP Tab */}
            <TabsContent value="email" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Mail className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">SMTP Email Configuration</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input
                      id="smtpHost"
                      placeholder="smtp.gmail.com"
                      value={settings.smtpHost || ''}
                      onChange={(e) => updateSetting('smtpHost', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input
                      id="smtpPort"
                      type="number"
                      placeholder="587"
                      value={settings.smtpPort || ''}
                      onChange={(e) => updateSetting('smtpPort', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtpUsername">SMTP Username</Label>
                    <Input
                      id="smtpUsername"
                      placeholder="your-email@gmail.com"
                      value={settings.smtpUsername || ''}
                      onChange={(e) => updateSetting('smtpUsername', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="smtpPassword">SMTP Password</Label>
                    <Input
                      id="smtpPassword"
                      type="password"
                      placeholder="Your app password"
                      value={settings.smtpPassword || ''}
                      onChange={(e) => updateSetting('smtpPassword', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtpFromEmail">From Email</Label>
                    <Input
                      id="smtpFromEmail"
                      placeholder="noreply@yoursite.com"
                      value={settings.smtpFromEmail || ''}
                      onChange={(e) => updateSetting('smtpFromEmail', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="smtpFromName">From Name</Label>
                    <Input
                      id="smtpFromName"
                      placeholder="AI Workspace"
                      value={settings.smtpFromName || ''}
                      onChange={(e) => updateSetting('smtpFromName', e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.smtpSecure || false}
                      onChange={(e) => updateSetting('smtpSecure', e.target.checked)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">Use TLS/SSL</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.smtpEnabled || false}
                      onChange={(e) => updateSetting('smtpEnabled', e.target.checked)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm font-semibold">Enable SMTP</span>
                  </label>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2">Alternative Email Services</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sendgridApiKey">SendGrid API Key</Label>
                      <Input
                        id="sendgridApiKey"
                        type="password"
                        placeholder="SG.xxx"
                        value={settings.sendgridApiKey || ''}
                        onChange={(e) => updateSetting('sendgridApiKey', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="mailgunApiKey">Mailgun API Key</Label>
                      <Input
                        id="mailgunApiKey"
                        type="password"
                        placeholder="key-xxx"
                        value={settings.mailgunApiKey || ''}
                        onChange={(e) => updateSetting('mailgunApiKey', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="mailgunDomain">Mailgun Domain</Label>
                    <Input
                      id="mailgunDomain"
                      placeholder="mg.yoursite.com"
                      value={settings.mailgunDomain || ''}
                      onChange={(e) => updateSetting('mailgunDomain', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* OAuth Tab */}
            <TabsContent value="oauth" className="space-y-6">
              <div className="space-y-6">
                {/* Google OAuth */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">Google OAuth</h4>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.googleEnabled || false}
                        onChange={(e) => updateSetting('googleEnabled', e.target.checked)}
                        className="h-4 w-4"
                      />
                      <span className="text-sm font-semibold">Enabled</span>
                    </label>
                  </div>
                  <div className="grid gap-3">
                    <div>
                      <Label>Client ID</Label>
                      <Input
                        placeholder="xxx.apps.googleusercontent.com"
                        value={settings.googleClientId || ''}
                        onChange={(e) => updateSetting('googleClientId', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Client Secret</Label>
                      <Input
                        type="password"
                        value={settings.googleClientSecret || ''}
                        onChange={(e) => updateSetting('googleClientSecret', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Redirect URI</Label>
                      <Input
                        placeholder="https://yoursite.com/api/auth/callback/google"
                        value={settings.googleRedirectUri || ''}
                        onChange={(e) => updateSetting('googleRedirectUri', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* GitHub OAuth */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">GitHub OAuth</h4>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.githubEnabled || false}
                        onChange={(e) => updateSetting('githubEnabled', e.target.checked)}
                        className="h-4 w-4"
                      />
                      <span className="text-sm font-semibold">Enabled</span>
                    </label>
                  </div>
                  <div className="grid gap-3">
                    <div>
                      <Label>Client ID</Label>
                      <Input
                        value={settings.githubClientId || ''}
                        onChange={(e) => updateSetting('githubClientId', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Client Secret</Label>
                      <Input
                        type="password"
                        value={settings.githubClientSecret || ''}
                        onChange={(e) => updateSetting('githubClientSecret', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Redirect URI</Label>
                      <Input
                        placeholder="https://yoursite.com/api/auth/callback/github"
                        value={settings.githubRedirectUri || ''}
                        onChange={(e) => updateSetting('githubRedirectUri', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Discord OAuth */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">Discord OAuth</h4>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.discordEnabled || false}
                        onChange={(e) => updateSetting('discordEnabled', e.target.checked)}
                        className="h-4 w-4"
                      />
                      <span className="text-sm font-semibold">Enabled</span>
                    </label>
                  </div>
                  <div className="grid gap-3">
                    <div>
                      <Label>Client ID</Label>
                      <Input
                        value={settings.discordClientId || ''}
                        onChange={(e) => updateSetting('discordClientId', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Client Secret</Label>
                      <Input
                        type="password"
                        value={settings.discordClientSecret || ''}
                        onChange={(e) => updateSetting('discordClientSecret', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Redirect URI</Label>
                      <Input
                        placeholder="https://yoursite.com/api/auth/callback/discord"
                        value={settings.discordRedirectUri || ''}
                        onChange={(e) => updateSetting('discordRedirectUri', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Microsoft OAuth */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">Microsoft OAuth</h4>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.microsoftEnabled || false}
                        onChange={(e) => updateSetting('microsoftEnabled', e.target.checked)}
                        className="h-4 w-4"
                      />
                      <span className="text-sm font-semibold">Enabled</span>
                    </label>
                  </div>
                  <div className="grid gap-3">
                    <div>
                      <Label>Client ID</Label>
                      <Input
                        value={settings.microsoftClientId || ''}
                        onChange={(e) => updateSetting('microsoftClientId', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Client Secret</Label>
                      <Input
                        type="password"
                        value={settings.microsoftClientSecret || ''}
                        onChange={(e) => updateSetting('microsoftClientSecret', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Redirect URI</Label>
                      <Input
                        placeholder="https://yoursite.com/api/auth/callback/microsoft"
                        value={settings.microsoftRedirectUri || ''}
                        onChange={(e) => updateSetting('microsoftRedirectUri', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* AI APIs Tab */}
            <TabsContent value="ai" className="space-y-4">
              <div className="space-y-4">
                <h4 className="font-semibold mb-4">AI Service API Keys</h4>

                <div>
                  <Label htmlFor="openaiApiKey">OpenAI API Key</Label>
                  <Input
                    id="openaiApiKey"
                    type="password"
                    placeholder="sk-..."
                    value={settings.openaiApiKey || ''}
                    onChange={(e) => updateSetting('openaiApiKey', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">For GPT-4, GPT-3.5, DALL-E, Whisper</p>
                </div>

                <div>
                  <Label htmlFor="anthropicApiKey">Anthropic API Key</Label>
                  <Input
                    id="anthropicApiKey"
                    type="password"
                    placeholder="sk-ant-..."
                    value={settings.anthropicApiKey || ''}
                    onChange={(e) => updateSetting('anthropicApiKey', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">For Claude models</p>
                </div>

                <div>
                  <Label htmlFor="googleAiApiKey">Google AI API Key</Label>
                  <Input
                    id="googleAiApiKey"
                    type="password"
                    placeholder="AIza..."
                    value={settings.googleAiApiKey || ''}
                    onChange={(e) => updateSetting('googleAiApiKey', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">For Gemini, PaLM, Bard</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cohereApiKey">Cohere API Key</Label>
                    <Input
                      id="cohereApiKey"
                      type="password"
                      value={settings.cohereApiKey || ''}
                      onChange={(e) => updateSetting('cohereApiKey', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="huggingfaceApiKey">HuggingFace API Key</Label>
                    <Input
                      id="huggingfaceApiKey"
                      type="password"
                      value={settings.huggingfaceApiKey || ''}
                      onChange={(e) => updateSetting('huggingfaceApiKey', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-4">
              <div className="space-y-4">
                <h4 className="font-semibold mb-4">Analytics & Tracking Services</h4>

                <div>
                  <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                  <Input
                    id="googleAnalyticsId"
                    placeholder="G-XXXXXXXXXX or UA-XXXXXXXX-X"
                    value={settings.googleAnalyticsId || ''}
                    onChange={(e) => updateSetting('googleAnalyticsId', e.target.value)}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="mixpanelToken">Mixpanel Token</Label>
                    <Input
                      id="mixpanelToken"
                      value={settings.mixpanelToken || ''}
                      onChange={(e) => updateSetting('mixpanelToken', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="segmentWriteKey">Segment Write Key</Label>
                    <Input
                      id="segmentWriteKey"
                      type="password"
                      value={settings.segmentWriteKey || ''}
                      onChange={(e) => updateSetting('segmentWriteKey', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hotjarSiteId">Hotjar Site ID</Label>
                    <Input
                      id="hotjarSiteId"
                      placeholder="1234567"
                      value={settings.hotjarSiteId || ''}
                      onChange={(e) => updateSetting('hotjarSiteId', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="clarityProjectId">Microsoft Clarity Project ID</Label>
                    <Input
                      id="clarityProjectId"
                      value={settings.clarityProjectId || ''}
                      onChange={(e) => updateSetting('clarityProjectId', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Storage Tab */}
            <TabsContent value="storage" className="space-y-4">
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Cloud className="h-4 w-4" />
                    AWS S3 Configuration
                  </h4>
                  <div className="grid gap-3">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Access Key ID</Label>
                        <Input
                          type="password"
                          value={settings.awsAccessKeyId || ''}
                          onChange={(e) => updateSetting('awsAccessKeyId', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Secret Access Key</Label>
                        <Input
                          type="password"
                          value={settings.awsSecretAccessKey || ''}
                          onChange={(e) => updateSetting('awsSecretAccessKey', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Region</Label>
                        <Input
                          placeholder="us-east-1"
                          value={settings.awsRegion || ''}
                          onChange={(e) => updateSetting('awsRegion', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>S3 Bucket Name</Label>
                        <Input
                          placeholder="my-bucket"
                          value={settings.awsS3Bucket || ''}
                          onChange={(e) => updateSetting('awsS3Bucket', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Cloudinary Configuration</h4>
                  <div className="grid gap-3">
                    <div>
                      <Label>Cloud Name</Label>
                      <Input
                        value={settings.cloudinaryCloudName || ''}
                        onChange={(e) => updateSetting('cloudinaryCloudName', e.target.value)}
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>API Key</Label>
                        <Input
                          value={settings.cloudinaryApiKey || ''}
                          onChange={(e) => updateSetting('cloudinaryApiKey', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>API Secret</Label>
                        <Input
                          type="password"
                          value={settings.cloudinaryApiSecret || ''}
                          onChange={(e) => updateSetting('cloudinaryApiSecret', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Security & Feature Flags</h3>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>App URL</Label>
                    <Input
                      placeholder="https://yoursite.com"
                      value={settings.appUrl || ''}
                      onChange={(e) => updateSetting('appUrl', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>API URL</Label>
                    <Input
                      placeholder="https://api.yoursite.com"
                      value={settings.apiUrl || ''}
                      onChange={(e) => updateSetting('apiUrl', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>CDN URL</Label>
                    <Input
                      placeholder="https://cdn.yoursite.com"
                      value={settings.cdnUrl || ''}
                      onChange={(e) => updateSetting('cdnUrl', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>JWT Secret</Label>
                    <Input
                      type="password"
                      placeholder="Your JWT secret key"
                      value={settings.jwtSecret || ''}
                      onChange={(e) => updateSetting('jwtSecret', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Encryption Key</Label>
                    <Input
                      type="password"
                      placeholder="Your encryption key"
                      value={settings.encryptionKey || ''}
                      onChange={(e) => updateSetting('encryptionKey', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label>API Rate Limit (requests per minute)</Label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={settings.apiRateLimit || ''}
                    onChange={(e) => updateSetting('apiRateLimit', parseInt(e.target.value))}
                  />
                </div>

                <div>
                  <Label>CORS Allowed Origins (comma-separated)</Label>
                  <Input
                    placeholder="https://example.com,https://app.example.com"
                    value={settings.corsOrigins || ''}
                    onChange={(e) => updateSetting('corsOrigins', e.target.value)}
                  />
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Feature Flags</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.enableAiChat || false}
                        onChange={(e) => updateSetting('enableAiChat', e.target.checked)}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">Enable AI Chat</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.enableSocialLogin || false}
                        onChange={(e) => updateSetting('enableSocialLogin', e.target.checked)}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">Enable Social Login</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.enablePayments || false}
                        onChange={(e) => updateSetting('enablePayments', e.target.checked)}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">Enable Payments</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.enableAnalytics || false}
                        onChange={(e) => updateSetting('enableAnalytics', e.target.checked)}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">Enable Analytics</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.enableEmailNotifications || false}
                        onChange={(e) => updateSetting('enableEmailNotifications', e.target.checked)}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">Enable Email Notifications</span>
                    </label>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex items-center justify-between border-t pt-4">
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
              {saving ? 'Saving...' : 'Save All Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
