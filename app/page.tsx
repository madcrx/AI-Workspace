import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Layout, Zap, Shield, Search, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">AI Workspace</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/tools">
              <Button variant="ghost">Explore Tools</Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="py-20 px-4 text-center bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-5xl font-bold mb-6">
              Your Personalized AI Tools Workspace
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Discover, organize, and access the best AI tools in one customizable workspace.
              Build your perfect productivity environment.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/auth/signup">
                <Button size="lg" className="gap-2">
                  <Sparkles className="h-5 w-5" />
                  Create Your Workspace
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

        <section className="py-16 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Why Choose AI Workspace?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <Layout className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Customizable Layout</CardTitle>
                  <CardDescription>
                    Drag, drop, and arrange your tools exactly how you want them
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Search className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>AI Tools</CardTitle>
                  <CardDescription>
                    Access a growing library of verified and categorized AI tools
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Zap className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Instant Access</CardTitle>
                  <CardDescription>
                    Quick links to all your favorite tools in one place
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Shield className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Secure & Private</CardTitle>
                  <CardDescription>
                    Your workspace and preferences are safe and private
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
                    Tools are reviewed and rated by the community
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
            <Link href="/auth/signup">
              <Button size="lg">Get Started Free</Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; 2024 AI Workspace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
