'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Script from 'next/script';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Layout, Zap, Shield, Search, Users } from 'lucide-react';
import { FeaturedToolsCarousel } from '@/components/featured-tools-carousel';
import { Header } from '@/components/layout/header';

export default function HomePage() {
  const { data: session } = useSession();

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AI Workspace',
    description: 'Discover and manage 1000+ AI tools in your personalized workspace',
    url: 'https://aiworkspace.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://aiworkspace.com/tools?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'AI Workspace',
      logo: {
        '@type': 'ImageObject',
        url: 'https://aiworkspace.com/logo.png',
      },
    },
  };

  return (
    <div className="min-h-screen">
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Header />

      <main>
        <section className="py-20 px-4 text-center bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-5xl font-bold mb-6">
              Your Personalized AI Tools Workspace
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Discover, organize, and access 1000+ AI tools in one customizable workspace.
              Build your perfect productivity environment.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href={session ? "/workspace" : "/auth/signup"}>
                <Button size="lg" className="gap-2">
                  <Sparkles className="h-5 w-5" />
                  {session ? "Go to Workspace" : "Create Your Workspace"}
                </Button>
              </Link>
              <Link href="/tools">
                <Button size="lg" variant="outline">
                  Browse Tools
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Featured AI Tools</h2>
                <p className="text-muted-foreground">
                  Discover the top-rated and most popular AI tools
                </p>
              </div>
              <Link href="/tools">
                <Button variant="outline">View All Tools</Button>
              </Link>
            </div>
            <FeaturedToolsCarousel />
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Why Choose AI Workspace?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <Layout className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Customizable Widgets</CardTitle>
                  <CardDescription>
                    Add draggable widgets like clock, weather, calculator, and notes to your workspace
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Search className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>1000+ AI Tools</CardTitle>
                  <CardDescription>
                    Access a vast library of curated and verified AI tools
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Zap className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Instant Access</CardTitle>
                  <CardDescription>
                    Quick links and credential management for all your favorite tools
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Shield className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Secure & Private</CardTitle>
                  <CardDescription>
                    Encrypted credential storage and private workspace settings
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Sparkles className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Custom Themes</CardTitle>
                  <CardDescription>
                    Personalize your workspace with custom colors and styles
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Users className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Community Driven</CardTitle>
                  <CardDescription>
                    Submit tools, request features, and help improve the platform
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-muted/50">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Build Your AI Workspace?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of users who have organized their AI tools workflow
            </p>
            <Link href={session ? "/workspace" : "/auth/signup"}>
              <Button size="lg">
                {session ? "Go to My Workspace" : "Get Started Free"}
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 px-4">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-6">
            <div>
              <h3 className="font-semibold mb-3">Contribute</h3>
              <div className="space-y-2 text-sm">
                <Link href="/submit-tool" className="block text-muted-foreground hover:text-foreground">
                  Submit an AI Tool
                </Link>
                <Link href="/request-feature" className="block text-muted-foreground hover:text-foreground">
                  Request a Feature
                </Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Partner With Us</h3>
              <div className="space-y-2 text-sm">
                <Link href="/advertise" className="block text-muted-foreground hover:text-foreground">
                  Advertise Your Tool
                </Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Resources</h3>
              <div className="space-y-2 text-sm">
                <Link href="/tools" className="block text-muted-foreground hover:text-foreground">
                  Browse All Tools
                </Link>
              </div>
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground border-t pt-6">
            <p>&copy; 2024 AI Workspace. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
