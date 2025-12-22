'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Search, ExternalLink, TrendingUp, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';

interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  websiteUrl: string;
  logoUrl: string | null;
  pricing: string;
  tags: string;
  isFeatured: boolean;
  views: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

export default function ToolsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPricing, setSelectedPricing] = useState('all');
  const [addingToolId, setAddingToolId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const toolsPerPage = 100; // 5 columns × 20 rows

  useEffect(() => {
    fetchCategories();
    fetchTools();
    setCurrentPage(1); // Reset to page 1 when filters change
  }, [selectedCategory, selectedPricing, searchQuery]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTools = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedPricing !== 'all') params.append('pricing', selectedPricing);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/tools?${params.toString()}`);
      const data = await response.json();
      setTools(data);
    } catch (error) {
      console.error('Error fetching tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPricingBadgeColor = (pricing: string) => {
    switch (pricing) {
      case 'FREE':
        return 'bg-green-500 text-white';
      case 'FREEMIUM':
        return 'bg-blue-500 text-white';
      case 'PAID':
        return 'bg-orange-500 text-white';
      case 'SUBSCRIPTION':
        return 'bg-purple-500 text-white';
      default:
        return '';
    }
  };

  const addToWorkspace = async (toolId: string) => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    setAddingToolId(toolId);
    try {
      // Get user's first workspace or create one
      const workspacesRes = await fetch('/api/workspaces');
      const workspaces = await workspacesRes.json();

      let workspaceId = workspaces[0]?.id;

      if (!workspaceId) {
        // Create a workspace if user doesn't have one
        const createRes = await fetch('/api/workspaces', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'My Workspace' }),
        });
        const newWorkspace = await createRes.json();
        workspaceId = newWorkspace.id;
      }

      // Add tool to workspace
      const response = await fetch(`/api/workspaces/${workspaceId}/tools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolId }),
      });

      if (response.ok) {
        alert('Tool added to workspace!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add tool');
      }
    } catch (error) {
      console.error('Error adding tool to workspace:', error);
      alert('Failed to add tool to workspace');
    } finally {
      setAddingToolId(null);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(tools.length / toolsPerPage);
  const indexOfLastTool = currentPage * toolsPerPage;
  const indexOfFirstTool = indexOfLastTool - toolsPerPage;
  const currentTools = tools.slice(indexOfFirstTool, indexOfLastTool);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 bg-background z-10">
        <Header />
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Discover AI Tools</h1>
          <p className="text-lg text-muted-foreground">
            Browse our collection of AI tools and add them to your workspace
          </p>
        </div>

        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border rounded-md bg-background"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
          <select
            value={selectedPricing}
            onChange={(e) => setSelectedPricing(e.target.value)}
            className="px-4 py-2 border rounded-md bg-background"
          >
            <option value="all">All Pricing</option>
            <option value="free">Free</option>
            <option value="freemium">Freemium</option>
            <option value="paid">Paid</option>
            <option value="subscription">Subscription</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading tools...</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {currentTools.map((tool) => (
              <Card key={tool.id} className="hover:shadow-lg transition-shadow flex flex-col">
                <CardHeader className="p-3 pb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-8 w-8 bg-primary/10 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {tool.logoUrl ? (
                        <img
                          src={tool.logoUrl}
                          alt={`${tool.name} logo`}
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <Sparkles className={`h-4 w-4 text-primary ${tool.logoUrl ? 'hidden' : ''}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-sm truncate">{tool.name}</CardTitle>
                      {tool.isFeatured && (
                        <Badge variant="secondary" className="text-xs">
                          Featured
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2 text-xs">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 pt-0 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 flex-wrap">
                      <Badge variant="outline" className="text-xs">{tool.category}</Badge>
                      <Badge className={`text-xs ${getPricingBadgeColor(tool.pricing)}`}>
                        {tool.pricing}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="default"
                        size="sm"
                        className="gap-1 h-7 text-xs w-full"
                        onClick={() => addToWorkspace(tool.id)}
                        disabled={addingToolId === tool.id}
                      >
                        <Plus className="h-3 w-3" />
                        {addingToolId === tool.id ? 'Adding...' : 'Add'}
                      </Button>
                      <div className="flex gap-1">
                        <a
                          href={tool.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={async () => {
                            await fetch(`/api/tools/${tool.id}/click`, { method: 'POST' });
                          }}
                          className="flex-1"
                        >
                          <Button variant="outline" size="sm" className="gap-1 h-6 text-xs w-full">
                            <ExternalLink className="h-3 w-3" />
                            Visit
                          </Button>
                        </a>
                        <Link href={`/tools/${tool.slug}`} className="flex-1">
                          <Button size="sm" variant="ghost" className="h-6 text-xs w-full">
                            Info
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => paginate(page)}
                          className="min-w-[2.5rem]"
                        >
                          {page}
                        </Button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-2">...</span>;
                    }
                    return null;
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        {!loading && tools.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No tools found matching your criteria</p>
          </div>
        )}
      </main>
    </div>
  );
}
