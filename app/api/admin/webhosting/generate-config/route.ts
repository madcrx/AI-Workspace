import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Generate Apache configuration files based on settings
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type } = await request.json();

    // Get the latest settings
    const settings = await prisma.monetizationSettings.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!settings) {
      return NextResponse.json(
        { error: 'No hosting settings found' },
        { status: 404 }
      );
    }

    let configContent = '';
    let filename = '';

    switch (type) {
      case 'virtualhost':
        configContent = generateVirtualHostConfig(settings);
        filename = `${settings.apacheServerName || 'site'}.conf`;
        break;

      case 'htaccess':
        configContent = generateHtaccessConfig(settings);
        filename = '.htaccess';
        break;

      case 'phpini':
        configContent = generatePhpIniConfig(settings);
        filename = 'php.ini';
        break;

      case 'security':
        configContent = generateSecurityConfig(settings);
        filename = 'security.conf';
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid configuration type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      filename,
      content: configContent,
    });
  } catch (error: any) {
    console.error('Error generating configuration:', error);
    return NextResponse.json(
      { error: 'Failed to generate configuration', message: error.message },
      { status: 500 }
    );
  }
}

function generateVirtualHostConfig(settings: any): string {
  const httpPort = settings.apacheHttpPort || 80;
  const httpsPort = settings.apacheHttpsPort || 443;
  const serverName = settings.apacheServerName || 'example.com';
  const serverAlias = settings.apacheServerAlias || '';
  const serverAdmin = settings.apacheServerAdmin || 'admin@example.com';
  const documentRoot = settings.apacheDocumentRoot || '/var/www/html';

  let config = `# Virtual Host Configuration for ${serverName}
# Generated on ${new Date().toISOString()}

`;

  // HTTP VirtualHost
  config += `<VirtualHost *:${httpPort}>
    ServerName ${serverName}
    ${serverAlias ? `ServerAlias ${serverAlias}` : ''}
    ServerAdmin ${serverAdmin}
    DocumentRoot ${documentRoot}

    <Directory ${documentRoot}>
        Options ${settings.apacheOptions || 'FollowSymLinks'}
        AllowOverride ${settings.apacheAllowOverride || 'All'}
        Require ${settings.apacheRequire || 'all granted'}
        DirectoryIndex ${settings.apacheDirectoryIndex || 'index.html index.php'}
    </Directory>

    # Logging
    ErrorLog ${settings.apacheErrorLogPath || '/var/log/apache2/error.log'}
    CustomLog ${settings.apacheAccessLogPath || '/var/log/apache2/access.log'} ${settings.apacheLogFormat || 'combined'}
    LogLevel ${settings.apacheLogLevel || 'warn'}
`;

  // SSL Redirect if SSL is enabled
  if (settings.apacheSslEnabled) {
    config += `
    # Redirect to HTTPS
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}$1 [R=301,L]
`;
  }

  config += `</VirtualHost>

`;

  // HTTPS VirtualHost if SSL is enabled
  if (settings.apacheSslEnabled) {
    config += `<VirtualHost *:${httpsPort}>
    ServerName ${serverName}
    ${serverAlias ? `ServerAlias ${serverAlias}` : ''}
    ServerAdmin ${serverAdmin}
    DocumentRoot ${documentRoot}

    # SSL Configuration
    SSLEngine on
    SSLCertificateFile ${settings.apacheSslCertPath || '/etc/ssl/certs/ssl-cert.pem'}
    SSLCertificateKeyFile ${settings.apacheSslKeyPath || '/etc/ssl/private/ssl-cert.key'}
    ${settings.apacheSslChainPath ? `SSLCertificateChainFile ${settings.apacheSslChainPath}` : ''}
    SSLProtocol ${settings.apacheSslProtocol || 'all -SSLv2 -SSLv3 -TLSv1 -TLSv1.1'}
    SSLCipherSuite ${settings.apacheSslCipherSuite || 'HIGH:!aNULL:!MD5:!3DES'}

    <Directory ${documentRoot}>
        Options ${settings.apacheOptions || 'FollowSymLinks'}
        AllowOverride ${settings.apacheAllowOverride || 'All'}
        Require ${settings.apacheRequire || 'all granted'}
        DirectoryIndex ${settings.apacheDirectoryIndex || 'index.html index.php'}
    </Directory>

    # Logging
    ErrorLog ${settings.apacheErrorLogPath || '/var/log/apache2/error.log'}
    CustomLog ${settings.apacheAccessLogPath || '/var/log/apache2/access.log'} ${settings.apacheLogFormat || 'combined'}
    LogLevel ${settings.apacheLogLevel || 'warn'}

    # Security Headers
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
</VirtualHost>

`;
  }

  // Add custom configuration if provided
  if (settings.apacheVirtualHostConfig) {
    config += `# Custom Configuration
${settings.apacheVirtualHostConfig}

`;
  }

  return config;
}

function generateHtaccessConfig(settings: any): string {
  let config = `# .htaccess Configuration
# Generated on ${new Date().toISOString()}

`;

  // RewriteEngine
  if (settings.apacheRewriteEngine) {
    config += `# Enable URL Rewriting
RewriteEngine On
RewriteBase ${settings.apacheRewriteBase || '/'}

`;

    // Add custom rewrite rules if provided
    if (settings.apacheRewriteRules) {
      try {
        const rules = JSON.parse(settings.apacheRewriteRules);
        if (Array.isArray(rules) && rules.length > 0) {
          config += `# Custom Rewrite Rules
`;
          rules.forEach((rule: string) => {
            config += `${rule}
`;
          });
          config += `
`;
        }
      } catch (e) {
        // Invalid JSON, skip
      }
    }

    // HTTPS redirect
    if (settings.apacheSslEnabled) {
      config += `# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]

`;
    }
  }

  // Directory listing
  if (!settings.apacheDirectoryListing) {
    config += `# Disable Directory Listing
Options -Indexes

`;
  }

  // PHP Settings
  if (settings.apachePhpMemoryLimit) {
    config += `# PHP Configuration
php_value memory_limit ${settings.apachePhpMemoryLimit}
php_value max_execution_time ${settings.apachePhpMaxExecutionTime || 300}
php_value max_input_time ${settings.apachePhpMaxInputTime || 300}
php_value upload_max_filesize ${settings.apachePhpUploadMaxFilesize || '64M'}
php_value post_max_size ${settings.apachePhpPostMaxSize || '64M'}
php_flag display_errors ${settings.apachePhpDisplayErrors ? 'On' : 'Off'}
php_flag log_errors ${settings.apachePhpLogErrors ? 'On' : 'Off'}

`;
  }

  // Compression
  if (settings.apacheCompressionEnabled && settings.apacheModDeflate) {
    config += `# Enable Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE ${settings.apacheCompressionTypes || 'text/html text/plain text/xml text/css text/javascript application/javascript'}
</IfModule>

`;
  }

  // Caching
  if (settings.apacheExpiresActive && settings.apacheModExpires) {
    config += `# Browser Caching
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresDefault "${settings.apacheExpiresDefault || 'access plus 1 year'}"

    ExpiresByType text/html "access plus 1 hour"
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType text/javascript "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType image/x-icon "access plus 1 year"
    ExpiresByType font/woff "access plus 1 year"
    ExpiresByType font/woff2 "access plus 1 year"
</IfModule>

`;
  }

  // Cache-Control Headers
  if (settings.apacheModHeaders) {
    config += `# Cache Control Headers
<IfModule mod_headers.c>
    <FilesMatch "\\.(ico|pdf|flv|jpg|jpeg|png|gif|svg|js|css|swf|woff|woff2|ttf|eot)$">
        Header set Cache-Control "${settings.apacheCacheControl || 'public, max-age=31536000'}"
    </FilesMatch>
</IfModule>

`;
  }

  // ETag
  if (!settings.apacheEtagEnabled) {
    config += `# Disable ETags
FileETag None

`;
  }

  // Security Headers
  config += `# Security Headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
    Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

`;

  // Add custom htaccess rules if provided
  if (settings.apacheHtaccessRules) {
    config += `# Custom Rules
${settings.apacheHtaccessRules}

`;
  }

  return config;
}

function generatePhpIniConfig(settings: any): string {
  return `; PHP Configuration
; Generated on ${new Date().toISOString()}

[PHP]
memory_limit = ${settings.apachePhpMemoryLimit || '256M'}
max_execution_time = ${settings.apachePhpMaxExecutionTime || 300}
max_input_time = ${settings.apachePhpMaxInputTime || 300}
upload_max_filesize = ${settings.apachePhpUploadMaxFilesize || '64M'}
post_max_size = ${settings.apachePhpPostMaxSize || '64M'}
display_errors = ${settings.apachePhpDisplayErrors ? 'On' : 'Off'}
display_startup_errors = ${settings.apachePhpDisplayErrors ? 'On' : 'Off'}
log_errors = ${settings.apachePhpLogErrors ? 'On' : 'Off'}
error_log = /var/log/php/error.log
error_reporting = E_ALL & ~E_DEPRECATED & ~E_STRICT

; Session Configuration
session.save_handler = files
session.save_path = "/var/lib/php/sessions"
session.gc_maxlifetime = 1440
session.cookie_httponly = On
session.cookie_secure = ${settings.apacheSslEnabled ? 'On' : 'Off'}

; Security
expose_php = Off
allow_url_fopen = On
allow_url_include = Off
disable_functions = exec,passthru,shell_exec,system,proc_open,popen

; File Uploads
file_uploads = On
max_file_uploads = 20

; Date/Time
date.timezone = UTC
`;
}

function generateSecurityConfig(settings: any): string {
  return `# Security Configuration for Apache
# Generated on ${new Date().toISOString()}

# Server Signature and Tokens
ServerSignature ${settings.apacheServerSignature || 'Off'}
ServerTokens ${settings.apacheServerTokens || 'Prod'}

# Disable Trace
TraceEnable ${settings.apacheTraceEnable || 'Off'}

# Security Headers
<IfModule mod_headers.c>
    # Prevent clickjacking
    Header always set X-Frame-Options "SAMEORIGIN"

    # XSS Protection
    Header always set X-XSS-Protection "1; mode=block"

    # MIME Type Sniffing Protection
    Header always set X-Content-Type-Options "nosniff"

    # Referrer Policy
    Header always set Referrer-Policy "strict-origin-when-cross-origin"

    # Content Security Policy (adjust as needed)
    Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"

    ${settings.apacheSslEnabled ? `# HSTS (HTTP Strict Transport Security)
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"` : ''}
</IfModule>

# Limit Request Size
LimitRequestBody 10485760

# Timeout Configuration
Timeout ${settings.apacheTimeout || 300}
KeepAlive ${settings.apacheKeepAlive ? 'On' : 'Off'}
MaxKeepAliveRequests ${settings.apacheMaxKeepAliveRequests || 100}
KeepAliveTimeout ${settings.apacheKeepAliveTimeout || 5}

# Disable Directory Browsing
Options -Indexes

# Block Access to Hidden Files
<FilesMatch "^\\.|^#.*#$|~$">
    Require all denied
</FilesMatch>

# Protect Sensitive Files
<FilesMatch "\\.(env|htaccess|htpasswd|ini|log|sh|sql|conf|bak)$">
    Require all denied
</FilesMatch>

# Prevent Access to Version Control
<DirectoryMatch "^\\..*">
    Require all denied
</DirectoryMatch>

${settings.apacheModSecurity ? `# ModSecurity Configuration
<IfModule mod_security2.c>
    SecRuleEngine On
    SecRequestBodyAccess On
    SecResponseBodyAccess Off
    SecRequestBodyLimit 10485760
    SecResponseBodyLimit 524288
</IfModule>` : ''}
`;
}
