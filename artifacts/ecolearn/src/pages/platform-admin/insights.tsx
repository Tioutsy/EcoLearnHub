import React, { useState } from "react";
import { PlatformAdminLayout } from "@/components/layout/PlatformAdminLayout";
import {
  usePlatformAdminListInsightCategories,
  usePlatformAdminCreateInsightCategory,
  usePlatformAdminUpdateInsightCategory,
  usePlatformAdminUpdateInsightCategoryStatus,
  usePlatformAdminListInsightArticles,
  usePlatformAdminCreateInsightArticle,
  usePlatformAdminUpdateInsightArticle,
  usePlatformAdminUpdateInsightArticleStatus,
  usePlatformAdminListSectors,
  useListCourses,
  usePlatformAdminListSdgContributions
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Plus, Edit, Archive, CheckCircle, ArrowLeft, Eye, Tag } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

// React-based safe Markdown parser (no dangerouslySetInnerHTML, completely XSS safe)
function parseMarkdownToReact(text: string = ""): React.ReactNode[] {
  return text.split('\n\n').map((block, i) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const items = trimmed.split('\n').map(line => line.replace(/^[-*]\s+/, ''));
      return (
        <ul key={i} className="list-disc pl-5 my-2 space-y-1 text-sm text-foreground">
          {items.map((item, j) => <li key={j}>{item}</li>)}
        </ul>
      );
    }
    if (trimmed.startsWith('### ')) {
      return <h3 key={i} className="text-base font-bold font-serif my-3 text-foreground">{trimmed.slice(4)}</h3>;
    }
    if (trimmed.startsWith('## ')) {
      return <h2 key={i} className="text-lg font-bold font-serif my-4 text-foreground">{trimmed.slice(3)}</h2>;
    }
    if (trimmed.startsWith('# ')) {
      return <h1 key={i} className="text-xl font-bold font-serif my-5 text-foreground">{trimmed.slice(2)}</h1>;
    }
    return <p key={i} className="my-2 leading-relaxed text-sm text-muted-foreground">{trimmed}</p>;
  }).filter(Boolean) as React.ReactNode[];
}

export default function PlatformAdminInsights() {
  const queryClient = useQueryClient();

  // Queries
  const categoriesQuery = usePlatformAdminListInsightCategories();
  const articlesQuery = usePlatformAdminListInsightArticles();
  const sectorsQuery = usePlatformAdminListSectors();
  const coursesQuery = useListCourses();
  const sdgQuery = usePlatformAdminListSdgContributions();

  // Mutations - Categories
  const createCategoryMutation = usePlatformAdminCreateInsightCategory({
    mutation: {
      onSuccess: () => {
        toast.success("Category created");
        queryClient.invalidateQueries({ queryKey: ["platformAdminListInsightCategories"] });
        setCatCreateOpen(false);
        setCatForm({ name: "", slug: "", description: "" });
      },
      onError: (err: any) => toast.error(err.message || "Failed to create category")
    }
  });

  const updateCategoryMutation = usePlatformAdminUpdateInsightCategory({
    mutation: {
      onSuccess: () => {
        toast.success("Category updated");
        queryClient.invalidateQueries({ queryKey: ["platformAdminListInsightCategories"] });
        setCatEditOpen(false);
        setCatForm({ name: "", slug: "", description: "" });
      },
      onError: (err: any) => toast.error(err.message || "Failed to update category")
    }
  });

  const updateCategoryStatusMutation = usePlatformAdminUpdateInsightCategoryStatus({
    mutation: {
      onSuccess: () => {
        toast.success("Category status updated");
        queryClient.invalidateQueries({ queryKey: ["platformAdminListInsightCategories"] });
      },
      onError: (err: any) => toast.error(err.message || "Failed to update status")
    }
  });

  // Mutations - Articles
  const createArticleMutation = usePlatformAdminCreateInsightArticle({
    mutation: {
      onSuccess: () => {
        toast.success("Article draft created successfully");
        queryClient.invalidateQueries({ queryKey: ["platformAdminListInsightArticles"] });
        setViewMode("list");
        resetArticleForm();
      },
      onError: (err: any) => toast.error(err.message || "Failed to create article")
    }
  });

  const updateArticleMutation = usePlatformAdminUpdateInsightArticle({
    mutation: {
      onSuccess: () => {
        toast.success("Article updated successfully");
        queryClient.invalidateQueries({ queryKey: ["platformAdminListInsightArticles"] });
        setViewMode("list");
        resetArticleForm();
      },
      onError: (err: any) => toast.error(err.message || "Failed to update article")
    }
  });

  const updateArticleStatusMutation = usePlatformAdminUpdateInsightArticleStatus({
    mutation: {
      onSuccess: () => {
        toast.success("Article status updated successfully");
        queryClient.invalidateQueries({ queryKey: ["platformAdminListInsightArticles"] });
      },
      onError: (err: any) => toast.error(err.message || "Failed to change article status")
    }
  });

  // State Management
  const [activeTab, setActiveTab] = useState("articles");
  const [viewMode, setViewMode] = useState<"list" | "create" | "edit" | "preview">("list");

  // Filter States
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Category Form State
  const [catCreateOpen, setCatCreateOpen] = useState(false);
  const [catEditOpen, setCatEditOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState<number | null>(null);
  const [catForm, setCatForm] = useState({ name: "", slug: "", description: "" });

  // Article Form State
  const [editingArticleId, setEditingArticleId] = useState<number | null>(null);
  const [artTitle, setArtTitle] = useState("");
  const [artSlug, setArtSlug] = useState("");
  const [artExcerpt, setArtExcerpt] = useState("");
  const [artContent, setArtContent] = useState("");
  const [artAuthorName, setArtAuthorName] = useState("");
  const [artAuthorTitle, setArtAuthorTitle] = useState("");
  const [artThumbnailUrl, setArtThumbnailUrl] = useState("");
  const [artImageAlt, setArtImageAlt] = useState("");
  const [artReadingTime, setArtReadingTime] = useState(5);
  const [artSeoTitle, setArtSeoTitle] = useState("");
  const [artSeoDescription, setArtSeoDescription] = useState("");
  const [artTags, setArtTags] = useState("");
  const [artCategoryId, setArtCategoryId] = useState<number | "">("");
  const [selectedSectors, setSelectedSectors] = useState<number[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [selectedSdg, setSelectedSdg] = useState<number[]>([]);
  const [sourceReferences, setSourceReferences] = useState<Array<{ title: string; url?: string }>>([]);

  const resetArticleForm = () => {
    setEditingArticleId(null);
    setArtTitle("");
    setArtSlug("");
    setArtExcerpt("");
    setArtContent("");
    setArtAuthorName("");
    setArtAuthorTitle("");
    setArtThumbnailUrl("");
    setArtImageAlt("");
    setArtReadingTime(5);
    setArtSeoTitle("");
    setArtSeoDescription("");
    setArtTags("");
    setArtCategoryId("");
    setSelectedSectors([]);
    setSelectedCourses([]);
    setSelectedSdg([]);
    setSourceReferences([]);
  };

  const handleEditArticleClick = (article: any) => {
    setEditingArticleId(article.id);
    setArtTitle(article.title);
    setArtSlug(article.slug);
    setArtExcerpt(article.excerpt);
    setArtContent(article.content);
    setArtAuthorName(article.authorName);
    setArtAuthorTitle(article.authorTitle || "");
    setArtThumbnailUrl(article.thumbnailUrl || "");
    setArtImageAlt(article.imageAlt || "");
    setArtReadingTime(article.readingTimeMinutes || 5);
    setArtSeoTitle(article.seoTitle || "");
    setArtSeoDescription(article.seoDescription || "");
    setArtTags(article.tags?.join(", ") || "");
    setArtCategoryId(article.insightCategoryId || "");
    // Extract linked IDs
    setSelectedSectors(article.sectors || []);
    setSelectedCourses(article.relatedCourses || []);
    setSelectedSdg(article.sdgContributions || []);
    setSourceReferences(article.sourceReferences || []);
    setViewMode("edit");
  };

  // Submit Handlers
  const handleCategoryCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.name.trim() || !catForm.slug.trim()) {
      toast.error("Name and Slug are required");
      return;
    }
    createCategoryMutation.mutate({ data: catForm });
  };

  const handleCategoryEditClick = (cat: any) => {
    setEditingCatId(cat.id);
    setCatForm({ name: cat.name, slug: cat.slug, description: cat.description || "" });
    setCatEditOpen(true);
  };

  const handleCategoryEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCatId) return;
    updateCategoryMutation.mutate({
      id: editingCatId,
      data: catForm
    });
  };

  const handleCategoryStatusToggle = (id: number, current: string) => {
    const next = current === "active" ? "inactive" : "active";
    if (next === "inactive") {
      const ok = window.confirm("Are you sure you want to archive this category?");
      if (!ok) return;
    }
    updateCategoryStatusMutation.mutate({
      id,
      data: { status: next }
    });
  };

  const handleArticleSubmit = (e: React.FormEvent, forceStatus?: string) => {
    e.preventDefault();
    if (!artTitle.trim() || !artSlug.trim() || !artExcerpt.trim() || !artContent.trim() || !artAuthorName.trim() || !artCategoryId) {
      toast.error("Please fill in all required fields (marked *)");
      return;
    }

    const payload: any = {
      title: artTitle,
      slug: artSlug,
      excerpt: artExcerpt,
      content: artContent,
      authorName: artAuthorName,
      authorTitle: artAuthorTitle || null,
      thumbnailUrl: artThumbnailUrl || null,
      imageAlt: artImageAlt || null,
      readingTimeMinutes: Number(artReadingTime),
      seoTitle: artSeoTitle || null,
      seoDescription: artSeoDescription || null,
      tags: artTags.split(",").map(t => t.trim()).filter(Boolean),
      insightCategoryId: Number(artCategoryId),
      sectors: selectedSectors,
      relatedCourses: selectedCourses,
      sdgContributions: selectedSdg,
      sourceReferences
    };

    if (forceStatus) {
      payload.status = forceStatus;
    }

    if (viewMode === "create") {
      // Create defaults to draft
      payload.status = payload.status || "draft";
      createArticleMutation.mutate({ data: payload });
    } else if (viewMode === "edit" && editingArticleId) {
      updateArticleMutation.mutate({
        id: editingArticleId,
        data: payload
      });
    }
  };

  const handleArticleStatusToggle = (id: number, current: string) => {
    const allowed = ["draft", "review", "scheduled", "published", "archived"];
    let next = "draft";
    if (current === "draft") next = "review";
    else if (current === "review") next = "published";
    else if (current === "published") {
      const ok = window.confirm("Are you sure you want to archive this article?");
      if (!ok) return;
      next = "archived";
    }

    updateArticleStatusMutation.mutate({
      id,
      data: { status: next as any }
    });
  };

  // Helper selectors
  const categories = categoriesQuery.data || [];
  const articles = articlesQuery.data || [];
  const sectors = sectorsQuery.data || [];
  const courses = coursesQuery.data || [];
  const sdgs = sdgQuery.data || [];

  // Filter Articles
  const filteredArticles = articles.filter((a: any) => {
    const matchesCat = filterCategory === "all" || String(a.insightCategoryId) === filterCategory;
    const matchesStatus = filterStatus === "all" || a.status === filterStatus;
    return matchesCat && matchesStatus;
  });

  return (
    <PlatformAdminLayout>
      {viewMode === "list" ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold font-serif">Insights Content</h2>
              <p className="text-muted-foreground mt-1">
                Manage editorial articles, blog posts, and categories.
              </p>
            </div>

            <TabsList>
              <TabsTrigger value="articles">Articles</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="articles" className="space-y-4">
            {/* Filter and Add Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-card border rounded-lg p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <Label htmlFor="filter-cat" className="text-xs text-muted-foreground">Category</Label>
                  <select
                    id="filter-cat"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <Label htmlFor="filter-status" className="text-xs text-muted-foreground">Status</Label>
                  <select
                    id="filter-status"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="all">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="review">Review</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <Button onClick={() => { resetArticleForm(); setViewMode("create"); }} className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Create Article
              </Button>
            </div>

            {/* Articles Table */}
            {articlesQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : filteredArticles.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent className="text-muted-foreground">
                  No articles match your filters.
                </CardContent>
              </Card>
            ) : (
              <div className="border rounded-lg overflow-x-auto bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Reading Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredArticles.map((art: any) => {
                      const catName = categories.find((c: any) => c.id === art.insightCategoryId)?.name || "N/A";
                      return (
                        <TableRow key={art.id}>
                          <TableCell className="font-medium max-w-xs truncate">{art.title}</TableCell>
                          <TableCell className="text-xs">{art.authorName}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{catName}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{art.readingTimeMinutes} min</TableCell>
                          <TableCell>
                            <Badge variant={
                              art.status === "published" ? "default" :
                              art.status === "draft" ? "secondary" : "outline"
                            }>
                              {art.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleEditArticleClick(art)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleArticleStatusToggle(art.id, art.status)}
                                disabled={art.status === "archived"}
                              >
                                {art.status === "draft" ? "Submit Review" :
                                 art.status === "review" ? "Publish" :
                                 art.status === "published" ? "Archive" : "Archived"}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={catCreateOpen} onOpenChange={setCatCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Create Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleCategoryCreate} className="space-y-4">
                    <DialogHeader>
                      <DialogTitle>Create Category</DialogTitle>
                      <DialogDescription>Add a new editorial category for insights blog posts.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="cat-name">Category Name</Label>
                        <Input
                          id="cat-name"
                          value={catForm.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                            setCatForm({ ...catForm, name: val, slug: catForm.slug ? catForm.slug : slug });
                          }}
                          placeholder="e.g. Climate Action"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cat-slug">Slug (Unique)</Label>
                        <Input
                          id="cat-slug"
                          value={catForm.slug}
                          onChange={(e) => setCatForm({ ...catForm, slug: e.target.value.toLowerCase() })}
                          placeholder="e.g. climate-action"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cat-desc">Description</Label>
                        <Textarea
                          id="cat-desc"
                          value={catForm.description}
                          onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                          placeholder="Describe the topics covered..."
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setCatCreateOpen(false)}>Cancel</Button>
                      <Button type="submit">Create</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {categoriesQuery.isLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <div className="border rounded-lg overflow-x-auto bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((cat: any) => (
                      <TableRow key={cat.id}>
                        <TableCell className="font-medium">{cat.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{cat.slug}</TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-xs truncate">{cat.description}</TableCell>
                        <TableCell>
                          <Badge variant={cat.status === "active" ? "default" : "secondary"}>
                            {cat.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleCategoryEditClick(cat)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCategoryStatusToggle(cat.id, cat.status)}
                              className={cat.status === "active" ? "text-amber-600" : "text-emerald-600"}
                            >
                              {cat.status === "active" ? <Archive className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        // Create / Edit Screen Form
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => setViewMode("list")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-2xl font-bold font-serif">
                {viewMode === "create" ? "Create Article" : "Edit Article"}
              </h2>
              <p className="text-sm text-muted-foreground">
                Define details, layout parameters, and classifications.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <form onSubmit={(e) => handleArticleSubmit(e)} className="lg:col-span-2 space-y-6 bg-card border rounded-xl p-6 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="art-title">Title *</Label>
                  <Input
                    id="art-title"
                    value={artTitle}
                    onChange={(e) => {
                      setArtTitle(e.target.value);
                      if (viewMode === "create") {
                        setArtSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
                      }
                    }}
                    placeholder="Article headline..."
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="art-slug">Slug *</Label>
                  <Input
                    id="art-slug"
                    value={artSlug}
                    onChange={(e) => setArtSlug(e.target.value.toLowerCase())}
                    placeholder="article-slug"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="art-cat">Category *</Label>
                  <select
                    id="art-cat"
                    value={artCategoryId}
                    onChange={(e) => setArtCategoryId(Number(e.target.value))}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-1"
                    required
                  >
                    <option value="">Select Category...</option>
                    {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="art-excerpt">Excerpt (1-2 sentence summary) *</Label>
                <Textarea
                  id="art-excerpt"
                  value={artExcerpt}
                  onChange={(e) => setArtExcerpt(e.target.value)}
                  placeholder="Summarize this article..."
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="art-content">Body Content (Markdown format) *</Label>
                <Textarea
                  id="art-content"
                  value={artContent}
                  onChange={(e) => setArtContent(e.target.value)}
                  placeholder="Write the full content body in Markdown..."
                  className="mt-1 min-h-[300px]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4">
                <div>
                  <Label htmlFor="art-author-name">Author Name *</Label>
                  <Input
                    id="art-author-name"
                    value={artAuthorName}
                    onChange={(e) => setArtAuthorName(e.target.value)}
                    placeholder="Author full name..."
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="art-author-title">Author Job Title</Label>
                  <Input
                    id="art-author-title"
                    value={artAuthorTitle}
                    onChange={(e) => setArtAuthorTitle(e.target.value)}
                    placeholder="e.g. Lead Sustainability Researcher"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="art-thumb">Featured Image URL</Label>
                  <Input
                    id="art-thumb"
                    value={artThumbnailUrl}
                    onChange={(e) => setArtThumbnailUrl(e.target.value)}
                    placeholder="/images/blog/photo.png"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="art-alt">Image Alt Text</Label>
                  <Input
                    id="art-alt"
                    value={artImageAlt}
                    onChange={(e) => setArtImageAlt(e.target.value)}
                    placeholder="Description of the image..."
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t pt-4">
                <div>
                  <Label htmlFor="art-read">Reading Time (minutes)</Label>
                  <Input
                    id="art-read"
                    type="number"
                    value={artReadingTime}
                    onChange={(e) => setArtReadingTime(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="art-tags">Tags (comma-separated)</Label>
                  <Input
                    id="art-tags"
                    value={artTags}
                    onChange={(e) => setArtTags(e.target.value)}
                    placeholder="climate, waste, recycling"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h4 className="font-semibold text-sm">SEO Parameters</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="art-seo-title">SEO Title</Label>
                    <Input
                      id="art-seo-title"
                      value={artSeoTitle}
                      onChange={(e) => setArtSeoTitle(e.target.value)}
                      placeholder="Meta title tag..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="art-seo-desc">SEO Description</Label>
                    <Input
                      id="art-seo-desc"
                      value={artSeoDescription}
                      onChange={(e) => setArtSeoDescription(e.target.value)}
                      placeholder="Meta description summary..."
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 border-t pt-4">
                <Button type="button" variant="outline" onClick={() => setViewMode("list")}>
                  Cancel
                </Button>
                <Button type="submit" variant="secondary">
                  Save as Draft
                </Button>
                <Button type="button" onClick={(e) => handleArticleSubmit(e, "review")}>
                  Submit for Review
                </Button>
                {viewMode === "edit" && (
                  <Button type="button" variant="destructive" onClick={(e) => handleArticleSubmit(e, "archived")}>
                    Archive Article
                  </Button>
                )}
              </div>
            </form>

            {/* Sidebar metadata selectors and Preview */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold">Classifications & Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  {/* Sectors select */}
                  <div>
                    <Label className="font-semibold text-xs mb-1 block">Assigned Sectors</Label>
                    <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                      {sectors.map((sec: any) => (
                        <label key={sec.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedSectors.includes(sec.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSectors([...selectedSectors, sec.id]);
                              } else {
                                setSelectedSectors(selectedSectors.filter(id => id !== sec.id));
                              }
                            }}
                          />
                          {sec.name}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Related Courses select */}
                  <div>
                    <Label className="font-semibold text-xs mb-1 block">Related Courses</Label>
                    <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                      {courses.map((crs: any) => (
                        <label key={crs.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedCourses.includes(crs.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCourses([...selectedCourses, crs.id]);
                              } else {
                                setSelectedCourses(selectedCourses.filter(id => id !== crs.id));
                              }
                            }}
                          />
                          {crs.title}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* SDG Contributions select */}
                  <div>
                    <Label className="font-semibold text-xs mb-1 block">SDG Contributions</Label>
                    <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                      {sdgs.map((sdg: any) => (
                        <label key={sdg.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedSdg.includes(sdg.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSdg([...selectedSdg, sdg.id]);
                              } else {
                                setSelectedSdg(selectedSdg.filter(id => id !== sdg.id));
                              }
                            }}
                          />
                          {sdg.rationale} ({sdg.contributionCategory})
                        </label>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Markdown Preview Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Eye className="h-4 w-4" /> Live Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="border-t p-4 max-h-[300px] overflow-y-auto prose prose-sm">
                  {artTitle && <h2 className="text-base font-serif font-bold text-foreground mb-1">{artTitle}</h2>}
                  {artExcerpt && <p className="italic text-xs text-muted-foreground mb-4">{artExcerpt}</p>}
                  {artContent ? parseMarkdownToReact(artContent) : <p className="text-xs text-muted-foreground">Markdown output preview will render here...</p>}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Dialog */}
      <Dialog open={catEditOpen} onOpenChange={setCatEditOpen}>
        <DialogContent>
          <form onSubmit={handleCategoryEditSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
              <DialogDescription>Modify name or description parameters.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label htmlFor="edit-cat-name">Category Name</Label>
                <Input
                  id="edit-cat-name"
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-cat-slug">Slug (Immutable)</Label>
                <Input
                  id="edit-cat-slug"
                  value={catForm.slug}
                  disabled
                  className="mt-1 bg-muted cursor-not-allowed text-muted-foreground"
                />
              </div>
              <div>
                <Label htmlFor="edit-cat-desc">Description</Label>
                <Textarea
                  id="edit-cat-desc"
                  value={catForm.description}
                  onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCatEditOpen(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PlatformAdminLayout>
  );
}
