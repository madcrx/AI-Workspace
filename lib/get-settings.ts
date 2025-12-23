import { prisma } from './prisma';

/**
 * Get application settings from database
 * These settings are configured in the Admin Dashboard > Backend Settings
 */
export async function getSettings() {
  try {
    const settings = await prisma.monetizationSettings.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!settings) {
      return getDefaultSettings();
    }

    return settings;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return getDefaultSettings();
  }
}

/**
 * Get specific setting value by key
 */
export async function getSetting<K extends keyof Awaited<ReturnType<typeof getSettings>>>(
  key: K
): Promise<Awaited<ReturnType<typeof getSettings>>[K]> {
  const settings = await getSettings();
  return settings[key];
}

/**
 * Default settings fallback
 */
function getDefaultSettings() {
  return {
    id: 'default',
    // Email defaults
    smtpHost: process.env.SMTP_HOST || null,
    smtpPort: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
    smtpUsername: process.env.SMTP_USERNAME || null,
    smtpPassword: process.env.SMTP_PASSWORD || null,
    smtpFromEmail: process.env.SMTP_FROM_EMAIL || null,
    smtpFromName: process.env.SMTP_FROM_NAME || 'AI Workspace',
    smtpSecure: true,
    smtpEnabled: false,

    // OAuth defaults
    googleClientId: process.env.GOOGLE_CLIENT_ID || null,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || null,
    googleRedirectUri: process.env.GOOGLE_REDIRECT_URI || null,
    googleEnabled: false,

    githubClientId: process.env.GITHUB_CLIENT_ID || null,
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET || null,
    githubRedirectUri: process.env.GITHUB_REDIRECT_URI || null,
    githubEnabled: false,

    discordClientId: process.env.DISCORD_CLIENT_ID || null,
    discordClientSecret: process.env.DISCORD_CLIENT_SECRET || null,
    discordRedirectUri: process.env.DISCORD_REDIRECT_URI || null,
    discordEnabled: false,

    microsoftClientId: process.env.MICROSOFT_CLIENT_ID || null,
    microsoftClientSecret: process.env.MICROSOFT_CLIENT_SECRET || null,
    microsoftRedirectUri: process.env.MICROSOFT_REDIRECT_URI || null,
    microsoftEnabled: false,

    // AI Service API Keys
    openaiApiKey: process.env.OPENAI_API_KEY || null,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || null,
    googleAiApiKey: process.env.GOOGLE_AI_API_KEY || null,
    cohereApiKey: process.env.COHERE_API_KEY || null,
    huggingfaceApiKey: process.env.HUGGINGFACE_API_KEY || null,

    // Analytics
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID || null,
    mixpanelToken: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || null,
    segmentWriteKey: process.env.SEGMENT_WRITE_KEY || null,
    hotjarSiteId: process.env.NEXT_PUBLIC_HOTJAR_SITE_ID || null,
    clarityProjectId: process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || null,

    // Payment
    stripePublicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || null,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || null,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || null,
    paypalClientId: process.env.PAYPAL_CLIENT_ID || null,
    paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET || null,
    paypalMode: process.env.PAYPAL_MODE || 'sandbox',

    // Cloud Storage
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || null,
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || null,
    awsRegion: process.env.AWS_REGION || null,
    awsS3Bucket: process.env.AWS_S3_BUCKET || null,
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || null,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || null,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || null,

    // Communication
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || null,
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || null,
    twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER || null,
    sendgridApiKey: process.env.SENDGRID_API_KEY || null,
    mailgunApiKey: process.env.MAILGUN_API_KEY || null,
    mailgunDomain: process.env.MAILGUN_DOMAIN || null,

    // Social Media
    twitterApiKey: process.env.TWITTER_API_KEY || null,
    twitterApiSecret: process.env.TWITTER_API_SECRET || null,
    twitterBearerToken: process.env.TWITTER_BEARER_TOKEN || null,
    facebookAppId: process.env.FACEBOOK_APP_ID || null,
    facebookAppSecret: process.env.FACEBOOK_APP_SECRET || null,
    linkedinClientId: process.env.LINKEDIN_CLIENT_ID || null,
    linkedinClientSecret: process.env.LINKEDIN_CLIENT_SECRET || null,

    // Search & SEO
    googleSearchApiKey: process.env.GOOGLE_SEARCH_API_KEY || null,
    googleSearchEngineId: process.env.GOOGLE_SEARCH_ENGINE_ID || null,
    serpApiKey: process.env.SERP_API_KEY || null,
    semrushApiKey: process.env.SEMRUSH_API_KEY || null,

    // Database
    databaseUrl: process.env.DATABASE_URL || null,
    redisUrl: process.env.REDIS_URL || null,
    mongodbUrl: process.env.MONGODB_URL || null,

    // Application URLs
    appUrl: process.env.NEXT_PUBLIC_APP_URL || null,
    apiUrl: process.env.NEXT_PUBLIC_API_URL || null,
    cdnUrl: process.env.NEXT_PUBLIC_CDN_URL || null,

    // Security
    jwtSecret: process.env.JWT_SECRET || null,
    encryptionKey: process.env.ENCRYPTION_KEY || null,
    apiRateLimit: 100,
    corsOrigins: process.env.CORS_ORIGINS || null,

    // Feature Flags
    enableAiChat: false,
    enableSocialLogin: false,
    enablePayments: false,
    enableAnalytics: true,
    enableEmailNotifications: true,

    // Other fields
    paypalEmail: null,
    stripeAccountId: null,
    bankAccountNumber: null,
    bankRoutingNumber: null,
    bankAccountName: null,
    impactPartnerId: null,
    impactApiKey: null,
    shareasaleAffiliateId: null,
    shareasaleApiToken: null,
    cjPublisherId: null,
    cjApiKey: null,
    openaiAffiliateId: null,
    anthropicAffiliateId: null,
    midjourneyAffiliateId: null,
    elevenLabsAffiliateId: null,
    jasperAffiliateId: null,
    monthlyRevenueGoal: 0,
    minimumPayoutAmount: 50,
    taxId: null,
    businessName: null,
    businessAddress: null,
    notificationEmail: null,
    sendWeeklyReports: true,
    sendMonthlyReports: true,
    alertOnLargeConversion: true,
    largeConversionThreshold: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Helper functions for common use cases
 */

export async function getEmailConfig() {
  const settings = await getSettings();
  return {
    host: settings.smtpHost,
    port: settings.smtpPort,
    secure: settings.smtpSecure,
    auth: {
      user: settings.smtpUsername,
      pass: settings.smtpPassword,
    },
    from: {
      email: settings.smtpFromEmail,
      name: settings.smtpFromName,
    },
    enabled: settings.smtpEnabled,
  };
}

export async function getOAuthConfig(provider: 'google' | 'github' | 'discord' | 'microsoft') {
  const settings = await getSettings();

  const configs = {
    google: {
      clientId: settings.googleClientId,
      clientSecret: settings.googleClientSecret,
      redirectUri: settings.googleRedirectUri,
      enabled: settings.googleEnabled,
    },
    github: {
      clientId: settings.githubClientId,
      clientSecret: settings.githubClientSecret,
      redirectUri: settings.githubRedirectUri,
      enabled: settings.githubEnabled,
    },
    discord: {
      clientId: settings.discordClientId,
      clientSecret: settings.discordClientSecret,
      redirectUri: settings.discordRedirectUri,
      enabled: settings.discordEnabled,
    },
    microsoft: {
      clientId: settings.microsoftClientId,
      clientSecret: settings.microsoftClientSecret,
      redirectUri: settings.microsoftRedirectUri,
      enabled: settings.microsoftEnabled,
    },
  };

  return configs[provider];
}

export async function getApiKey(service: string) {
  const settings = await getSettings();
  const keyMap: Record<string, any> = {
    openai: settings.openaiApiKey,
    anthropic: settings.anthropicApiKey,
    'google-ai': settings.googleAiApiKey,
    cohere: settings.cohereApiKey,
    huggingface: settings.huggingfaceApiKey,
    stripe: settings.stripeSecretKey,
    sendgrid: settings.sendgridApiKey,
    mailgun: settings.mailgunApiKey,
    twilio: settings.twilioAuthToken,
  };

  return keyMap[service] || null;
}

export async function isFeatureEnabled(feature: string) {
  const settings = await getSettings();
  const featureMap: Record<string, any> = {
    'ai-chat': settings.enableAiChat,
    'social-login': settings.enableSocialLogin,
    'payments': settings.enablePayments,
    'analytics': settings.enableAnalytics,
    'email': settings.enableEmailNotifications,
  };

  return featureMap[feature] || false;
}
