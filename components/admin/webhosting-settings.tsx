'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Server,
  Shield,
  Settings,
  Lock,
  Zap,
  FileCode,
  CheckCircle2,
  Copy,
  Download,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

interface WebHostingSettings {
  // Server Settings
  apacheServerName?: string;
  apacheServerAlias?: string;
  apacheServerAdmin?: string;
  apacheDocumentRoot?: string;
  apacheHttpPort?: number;
  apacheHttpsPort?: number;

  // SSL/TLS
  apacheSslEnabled?: boolean;
  apacheSslCertPath?: string;
  apacheSslKeyPath?: string;
  apacheSslChainPath?: string;
  apacheSslProtocol?: string;
  apacheSslCipherSuite?: string;

  // Apache Modules
  apacheModRewrite?: boolean;
  apacheModSsl?: boolean;
  apacheModHeaders?: boolean;
  apacheModExpires?: boolean;
  apacheModDeflate?: boolean;
  apacheModSecurity?: boolean;

  // Directory Configuration
  apacheAllowOverride?: string;
  apacheOptions?: string;
  apacheDirectoryIndex?: string;
  apacheRequire?: string;

  // PHP Configuration
  apachePhpVersion?: string;
  apachePhpMemoryLimit?: string;
  apachePhpMaxExecutionTime?: number;
  apachePhpMaxInputTime?: number;
  apachePhpUploadMaxFilesize?: string;
  apachePhpPostMaxSize?: string;
  apachePhpDisplayErrors?: boolean;
  apachePhpLogErrors?: boolean;

  // Logging
  apacheErrorLogPath?: string;
  apacheAccessLogPath?: string;
  apacheLogLevel?: string;
  apacheLogFormat?: string;

  // Security
  apacheServerTokens?: string;
  apacheServerSignature?: string;
  apacheTraceEnable?: string;
  apacheHtaccessEnabled?: boolean;
  apacheDirectoryListing?: boolean;

  // Performance
  apacheKeepAlive?: boolean;
  apacheMaxKeepAliveRequests?: number;
  apacheKeepAliveTimeout?: number;
  apacheTimeout?: number;
  apacheMaxClients?: number;
  apacheMaxRequestsPerChild?: number;

  // Compression
  apacheCompressionEnabled?: boolean;
  apacheCompressionTypes?: string;

  // Cache Control
  apacheCacheControl?: string;
  apacheEtagEnabled?: boolean;
  apacheExpiresActive?: boolean;
  apacheExpiresDefault?: string;

  // Advanced
  apacheVirtualHostConfig?: string;
  apacheHtaccessRules?: string;
  apacheCustomConfig?: string;
  apacheRewriteEngine?: boolean;
  apacheRewriteBase?: string;
  apacheRewriteRules?: string;
}

export default function WebHostingSettings() {
  const [settings, setSettings] = useState<WebHostingSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [generatedConfig, setGeneratedConfig] = useState<{ filename: string; content: string } | null>(null);

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
      setMessage({ type: 'error', text: 'Failed to load settings' });
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
        setMessage({ type: 'success', text: 'Web hosting settings saved successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to save settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while saving' });
    } finally {
      setSaving(false);
    }
  };

  const generateConfig = async (type: 'virtualhost' | 'htaccess' | 'phpini' | 'security') => {
    setGenerating(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/webhosting/generate-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });

      const data = await response.json();

      if (response.ok) {
        setGeneratedConfig(data);
        setMessage({ type: 'success', text: `${data.filename} generated successfully!` });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to generate config' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while generating config' });
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setMessage({ type: 'success', text: 'Copied to clipboard!' });
  };

  const downloadConfig = () => {
    if (!generatedConfig) return;

    const blob = new Blob([generatedConfig.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = generatedConfig.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Apache Web Hosting Configuration
          </CardTitle>
          <CardDescription>
            Configure Apache web server settings, SSL, PHP, security, and performance options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="server">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="server">Server</TabsTrigger>
              <TabsTrigger value="ssl">SSL/TLS</TabsTrigger>
              <TabsTrigger value="php">PHP</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            {/* Server Settings Tab */}
            <TabsContent value="server" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="serverName">Server Name (Domain)</Label>
                  <Input
                    id="serverName"
                    placeholder="example.com"
                    value={settings.apacheServerName || ''}
                    onChange={(e) => updateSetting('apacheServerName', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Primary domain for this site</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serverAlias">Server Alias (Additional Domains)</Label>
                  <Input
                    id="serverAlias"
                    placeholder="www.example.com subdomain.example.com"
                    value={settings.apacheServerAlias || ''}
                    onChange={(e) => updateSetting('apacheServerAlias', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Space-separated list of additional domains</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serverAdmin">Server Admin Email</Label>
                  <Input
                    id="serverAdmin"
                    type="email"
                    placeholder="admin@example.com"
                    value={settings.apacheServerAdmin || ''}
                    onChange={(e) => updateSetting('apacheServerAdmin', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentRoot">Document Root Path</Label>
                  <Input
                    id="documentRoot"
                    placeholder="/var/www/html"
                    value={settings.apacheDocumentRoot || ''}
                    onChange={(e) => updateSetting('apacheDocumentRoot', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="httpPort">HTTP Port</Label>
                  <Input
                    id="httpPort"
                    type="number"
                    placeholder="80"
                    value={settings.apacheHttpPort || 80}
                    onChange={(e) => updateSetting('apacheHttpPort', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="httpsPort">HTTPS Port</Label>
                  <Input
                    id="httpsPort"
                    type="number"
                    placeholder="443"
                    value={settings.apacheHttpsPort || 443}
                    onChange={(e) => updateSetting('apacheHttpsPort', parseInt(e.target.value))}
                  />
                </div>
              </div>

              {/* Directory Configuration */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Directory Configuration</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="directoryIndex">Directory Index</Label>
                    <Input
                      id="directoryIndex"
                      placeholder="index.html index.php"
                      value={settings.apacheDirectoryIndex || ''}
                      onChange={(e) => updateSetting('apacheDirectoryIndex', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="options">Options</Label>
                    <Input
                      id="options"
                      placeholder="FollowSymLinks"
                      value={settings.apacheOptions || ''}
                      onChange={(e) => updateSetting('apacheOptions', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="allowOverride">Allow Override</Label>
                    <Select
                      value={settings.apacheAllowOverride || 'All'}
                      onValueChange={(value) => updateSetting('apacheAllowOverride', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="None">None</SelectItem>
                        <SelectItem value="All">All</SelectItem>
                        <SelectItem value="FileInfo">FileInfo</SelectItem>
                        <SelectItem value="Options">Options</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="require">Access Control</Label>
                    <Input
                      id="require"
                      placeholder="all granted"
                      value={settings.apacheRequire || ''}
                      onChange={(e) => updateSetting('apacheRequire', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Apache Modules */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Apache Modules</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <Label htmlFor="modRewrite">mod_rewrite</Label>
                    <Switch
                      id="modRewrite"
                      checked={settings.apacheModRewrite}
                      onCheckedChange={(checked) => updateSetting('apacheModRewrite', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <Label htmlFor="modSsl">mod_ssl</Label>
                    <Switch
                      id="modSsl"
                      checked={settings.apacheModSsl}
                      onCheckedChange={(checked) => updateSetting('apacheModSsl', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <Label htmlFor="modHeaders">mod_headers</Label>
                    <Switch
                      id="modHeaders"
                      checked={settings.apacheModHeaders}
                      onCheckedChange={(checked) => updateSetting('apacheModHeaders', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <Label htmlFor="modExpires">mod_expires</Label>
                    <Switch
                      id="modExpires"
                      checked={settings.apacheModExpires}
                      onCheckedChange={(checked) => updateSetting('apacheModExpires', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <Label htmlFor="modDeflate">mod_deflate</Label>
                    <Switch
                      id="modDeflate"
                      checked={settings.apacheModDeflate}
                      onCheckedChange={(checked) => updateSetting('apacheModDeflate', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <Label htmlFor="modSecurity">mod_security</Label>
                    <Switch
                      id="modSecurity"
                      checked={settings.apacheModSecurity}
                      onCheckedChange={(checked) => updateSetting('apacheModSecurity', checked)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* SSL/TLS Tab */}
            <TabsContent value="ssl" className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  <Label htmlFor="sslEnabled">Enable SSL/TLS</Label>
                </div>
                <Switch
                  id="sslEnabled"
                  checked={settings.apacheSslEnabled}
                  onCheckedChange={(checked) => updateSetting('apacheSslEnabled', checked)}
                />
              </div>

              {settings.apacheSslEnabled && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="sslCert">SSL Certificate Path</Label>
                      <Input
                        id="sslCert"
                        placeholder="/etc/ssl/certs/ssl-cert.pem"
                        value={settings.apacheSslCertPath || ''}
                        onChange={(e) => updateSetting('apacheSslCertPath', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sslKey">SSL Private Key Path</Label>
                      <Input
                        id="sslKey"
                        placeholder="/etc/ssl/private/ssl-cert.key"
                        value={settings.apacheSslKeyPath || ''}
                        onChange={(e) => updateSetting('apacheSslKeyPath', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="sslChain">SSL Certificate Chain Path (Optional)</Label>
                      <Input
                        id="sslChain"
                        placeholder="/etc/ssl/certs/ca-bundle.crt"
                        value={settings.apacheSslChainPath || ''}
                        onChange={(e) => updateSetting('apacheSslChainPath', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="sslProtocol">SSL Protocol</Label>
                      <Input
                        id="sslProtocol"
                        placeholder="all -SSLv2 -SSLv3 -TLSv1 -TLSv1.1"
                        value={settings.apacheSslProtocol || ''}
                        onChange={(e) => updateSetting('apacheSslProtocol', e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Recommended: Disable older protocols (SSLv2, SSLv3, TLSv1, TLSv1.1)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sslCipher">SSL Cipher Suite</Label>
                      <Input
                        id="sslCipher"
                        placeholder="HIGH:!aNULL:!MD5:!3DES"
                        value={settings.apacheSslCipherSuite || ''}
                        onChange={(e) => updateSetting('apacheSslCipherSuite', e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">Strong cipher configuration for security</p>
                    </div>
                  </div>

                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      SSL/TLS is enabled. HTTP traffic will be automatically redirected to HTTPS for security.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </TabsContent>

            {/* PHP Configuration Tab */}
            <TabsContent value="php" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phpVersion">PHP Version</Label>
                  <Select
                    value={settings.apachePhpVersion || '8.2'}
                    onValueChange={(value) => updateSetting('apachePhpVersion', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7.4">PHP 7.4</SelectItem>
                      <SelectItem value="8.0">PHP 8.0</SelectItem>
                      <SelectItem value="8.1">PHP 8.1</SelectItem>
                      <SelectItem value="8.2">PHP 8.2</SelectItem>
                      <SelectItem value="8.3">PHP 8.3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phpMemory">Memory Limit</Label>
                  <Input
                    id="phpMemory"
                    placeholder="256M"
                    value={settings.apachePhpMemoryLimit || ''}
                    onChange={(e) => updateSetting('apachePhpMemoryLimit', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phpMaxExec">Max Execution Time (seconds)</Label>
                  <Input
                    id="phpMaxExec"
                    type="number"
                    placeholder="300"
                    value={settings.apachePhpMaxExecutionTime || 300}
                    onChange={(e) => updateSetting('apachePhpMaxExecutionTime', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phpMaxInput">Max Input Time (seconds)</Label>
                  <Input
                    id="phpMaxInput"
                    type="number"
                    placeholder="300"
                    value={settings.apachePhpMaxInputTime || 300}
                    onChange={(e) => updateSetting('apachePhpMaxInputTime', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phpUploadMax">Upload Max Filesize</Label>
                  <Input
                    id="phpUploadMax"
                    placeholder="64M"
                    value={settings.apachePhpUploadMaxFilesize || ''}
                    onChange={(e) => updateSetting('apachePhpUploadMaxFilesize', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phpPostMax">Post Max Size</Label>
                  <Input
                    id="phpPostMax"
                    placeholder="64M"
                    value={settings.apachePhpPostMaxSize || ''}
                    onChange={(e) => updateSetting('apachePhpPostMaxSize', e.target.value)}
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">PHP Error Handling</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <Label htmlFor="phpDisplayErrors">Display Errors</Label>
                    <Switch
                      id="phpDisplayErrors"
                      checked={settings.apachePhpDisplayErrors}
                      onCheckedChange={(checked) => updateSetting('apachePhpDisplayErrors', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <Label htmlFor="phpLogErrors">Log Errors</Label>
                    <Switch
                      id="phpLogErrors"
                      checked={settings.apachePhpLogErrors}
                      onCheckedChange={(checked) => updateSetting('apachePhpLogErrors', checked)}
                    />
                  </div>
                </div>
                <Alert className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Disable "Display Errors" in production to prevent exposing sensitive information.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="serverTokens">Server Tokens</Label>
                  <Select
                    value={settings.apacheServerTokens || 'Prod'}
                    onValueChange={(value) => updateSetting('apacheServerTokens', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Prod">Prod (Recommended)</SelectItem>
                      <SelectItem value="Major">Major</SelectItem>
                      <SelectItem value="Minor">Minor</SelectItem>
                      <SelectItem value="Minimal">Minimal</SelectItem>
                      <SelectItem value="OS">OS</SelectItem>
                      <SelectItem value="Full">Full</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Control server version information disclosure</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serverSignature">Server Signature</Label>
                  <Select
                    value={settings.apacheServerSignature || 'Off'}
                    onValueChange={(value) => updateSetting('apacheServerSignature', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Off">Off (Recommended)</SelectItem>
                      <SelectItem value="On">On</SelectItem>
                      <SelectItem value="EMail">EMail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="traceEnable">Trace Enable</Label>
                  <Select
                    value={settings.apacheTraceEnable || 'Off'}
                    onValueChange={(value) => updateSetting('apacheTraceEnable', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Off">Off (Recommended)</SelectItem>
                      <SelectItem value="On">On</SelectItem>
                      <SelectItem value="extended">Extended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logLevel">Log Level</Label>
                  <Select
                    value={settings.apacheLogLevel || 'warn'}
                    onValueChange={(value) => updateSetting('apacheLogLevel', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emerg">Emergency</SelectItem>
                      <SelectItem value="alert">Alert</SelectItem>
                      <SelectItem value="crit">Critical</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="warn">Warning (Recommended)</SelectItem>
                      <SelectItem value="notice">Notice</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="debug">Debug</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="errorLog">Error Log Path</Label>
                  <Input
                    id="errorLog"
                    placeholder="/var/log/apache2/error.log"
                    value={settings.apacheErrorLogPath || ''}
                    onChange={(e) => updateSetting('apacheErrorLogPath', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accessLog">Access Log Path</Label>
                  <Input
                    id="accessLog"
                    placeholder="/var/log/apache2/access.log"
                    value={settings.apacheAccessLogPath || ''}
                    onChange={(e) => updateSetting('apacheAccessLogPath', e.target.value)}
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Security Features</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <Label htmlFor="htaccessEnabled">.htaccess Enabled</Label>
                    <Switch
                      id="htaccessEnabled"
                      checked={settings.apacheHtaccessEnabled}
                      onCheckedChange={(checked) => updateSetting('apacheHtaccessEnabled', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <Label htmlFor="directoryListing">Directory Listing</Label>
                    <Switch
                      id="directoryListing"
                      checked={settings.apacheDirectoryListing}
                      onCheckedChange={(checked) => updateSetting('apacheDirectoryListing', checked)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="timeout">Timeout (seconds)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    placeholder="300"
                    value={settings.apacheTimeout || 300}
                    onChange={(e) => updateSetting('apacheTimeout', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxClients">Max Clients</Label>
                  <Input
                    id="maxClients"
                    type="number"
                    placeholder="150"
                    value={settings.apacheMaxClients || 150}
                    onChange={(e) => updateSetting('apacheMaxClients', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keepAliveTimeout">Keep Alive Timeout (seconds)</Label>
                  <Input
                    id="keepAliveTimeout"
                    type="number"
                    placeholder="5"
                    value={settings.apacheKeepAliveTimeout || 5}
                    onChange={(e) => updateSetting('apacheKeepAliveTimeout', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxKeepAlive">Max Keep Alive Requests</Label>
                  <Input
                    id="maxKeepAlive"
                    type="number"
                    placeholder="100"
                    value={settings.apacheMaxKeepAliveRequests || 100}
                    onChange={(e) => updateSetting('apacheMaxKeepAliveRequests', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxRequestsPerChild">Max Requests Per Child (0 = unlimited)</Label>
                  <Input
                    id="maxRequestsPerChild"
                    type="number"
                    placeholder="0"
                    value={settings.apacheMaxRequestsPerChild || 0}
                    onChange={(e) => updateSetting('apacheMaxRequestsPerChild', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Keep Alive & Compression</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <Label htmlFor="keepAlive">Keep Alive</Label>
                    <Switch
                      id="keepAlive"
                      checked={settings.apacheKeepAlive}
                      onCheckedChange={(checked) => updateSetting('apacheKeepAlive', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <Label htmlFor="compression">Compression Enabled</Label>
                    <Switch
                      id="compression"
                      checked={settings.apacheCompressionEnabled}
                      onCheckedChange={(checked) => updateSetting('apacheCompressionEnabled', checked)}
                    />
                  </div>
                </div>
              </div>

              {settings.apacheCompressionEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="compressionTypes">Compression MIME Types</Label>
                  <Textarea
                    id="compressionTypes"
                    placeholder="text/html text/plain text/xml text/css..."
                    value={settings.apacheCompressionTypes || ''}
                    onChange={(e) => updateSetting('apacheCompressionTypes', e.target.value)}
                    rows={3}
                  />
                </div>
              )}

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Browser Caching</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <Label htmlFor="expiresActive">Expires Active</Label>
                    <Switch
                      id="expiresActive"
                      checked={settings.apacheExpiresActive}
                      onCheckedChange={(checked) => updateSetting('apacheExpiresActive', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <Label htmlFor="etagEnabled">ETag Enabled</Label>
                    <Switch
                      id="etagEnabled"
                      checked={settings.apacheEtagEnabled}
                      onCheckedChange={(checked) => updateSetting('apacheEtagEnabled', checked)}
                    />
                  </div>
                </div>

                {settings.apacheExpiresActive && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiresDefault">Expires Default</Label>
                      <Input
                        id="expiresDefault"
                        placeholder="access plus 1 year"
                        value={settings.apacheExpiresDefault || ''}
                        onChange={(e) => updateSetting('apacheExpiresDefault', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cacheControl">Cache-Control Header</Label>
                      <Input
                        id="cacheControl"
                        placeholder="public, max-age=31536000"
                        value={settings.apacheCacheControl || ''}
                        onChange={(e) => updateSetting('apacheCacheControl', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Save Button */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>

          {/* Configuration Generation */}
          <div className="border-t pt-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileCode className="h-5 w-5" />
              Generate Configuration Files
            </h3>

            <div className="grid md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                onClick={() => generateConfig('virtualhost')}
                disabled={generating}
              >
                <Server className="h-4 w-4 mr-2" />
                VirtualHost
              </Button>

              <Button
                variant="outline"
                onClick={() => generateConfig('htaccess')}
                disabled={generating}
              >
                <FileCode className="h-4 w-4 mr-2" />
                .htaccess
              </Button>

              <Button
                variant="outline"
                onClick={() => generateConfig('phpini')}
                disabled={generating}
              >
                <Settings className="h-4 w-4 mr-2" />
                php.ini
              </Button>

              <Button
                variant="outline"
                onClick={() => generateConfig('security')}
                disabled={generating}
              >
                <Shield className="h-4 w-4 mr-2" />
                Security Config
              </Button>
            </div>

            {generatedConfig && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>{generatedConfig.filename}</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(generatedConfig.content)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button size="sm" variant="ghost" onClick={downloadConfig}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                    <code>{generatedConfig.content}</code>
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
