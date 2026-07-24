import React, { useState, useEffect } from "react";
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
import { AlertCircle, Plus, Edit, Archive, CheckCircle, ArrowLeft, Eye, Scale, Tag, Globe, FileText } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function PlatformAdminInsights() {
  const queryClient = useQueryClient();

  // Queries
  const categoriesQuery = usePlatformAdminListInsightCategories();
  const articlesQuery = usePlatformAdminListInsightArticles();
  const sectorsQuery = usePlatformAdminListSectors();
  const coursesQuery = useListCourses();
  const sdgQuery = usePlatformAdminListSdgContributions();

  // State Management
  const [activeTab, setActiveTab] = useState("articles");
  const [viewMode, setViewMode] = useState<"list" | "create" | "edit" | "preview" | "create_resource" | "edit_resource">("list");

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

  // Mauritius Resources State
  const [resources, setResources] = useState<any[]>([]);
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const [editingResourceId, setEditingResourceId] = useState<number | null>(null);

  // Resource Form State
  const [resTitle, setResTitle] = useState("");
  const [resSlug, setResSlug] = useState("");
  const [resType, setResType] = useState("Act");
  const [resShortSummary, setResShortSummary] = useState("");
  const [resMainExplanation, setResMainExplanation] = useState("");
  const [resOfficialName, setResOfficialName] = useState("");
  const [resNumber, setResNumber] = useState("");
  const [resAuthority, setResAuthority] = useState("");
  const [resSector, setResSector] = useState("Waste");
  const [resDateIssued, setResDateIssued] = useState("");
  const [resEffectiveDate, setResEffectiveDate] = useState("");
  const [resSourceLink, setResSourceLink] = useState("");
  const [resDownloadLink, setResDownloadLink] = useState("");
  const [resComplianceRelevance, setResComplianceRelevance] = useState("");
  const [resPracticalImplications, setResPracticalImplications] = useState("");
  const [resDisclaimer, setResDisclaimer] = useState("This content is provided for general educational purposes and does not constitute legal advice. Users should refer to the official legislation and seek professional advice where required.");
  const [resIsFeatured, setResIsFeatured] = useState(false);

  // New Resource Fields
  const [resLegalStatus, setResLegalStatus] = useState("active");
  const [resLastVerified, setResLastVerified] = useState("");
  const [resNextReview, setResNextReview] = useState("");

  // New Article Fields
  const [artLinkedResources, setArtLinkedResources] = useState("");
  const [artLastVerified, setArtLastVerified] = useState("");
  const [artNextReview, setArtNextReview] = useState("");

  // Dashboard State
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);

  const fetchDashboardData = () => {
    setIsLoadingDashboard(true);
    fetch("/api/platform-admin/insights/review-dashboard")
      .then((res) => res.json())
      .then((data) => {
        setDashboardData(data);
        setIsLoadingDashboard(false);
      })
      .catch((err) => {
        toast.error("Failed to load review dashboard data");
        setIsLoadingDashboard(false);
      });
  };

  // Fetch Resources Function
  const fetchResources = () => {
    setIsLoadingResources(true);
    fetch("/api/platform-admin/insights/mauritius-resources")
      .then((res) => res.json())
      .then((data) => {
        setResources(data);
        setIsLoadingResources(false);
      })
      .catch((err) => {
        toast.error("Failed to load Mauritius resources");
        setIsLoadingResources(false);
      });
  };

  useEffect(() => {
    if (activeTab === "resources") {
      fetchResources();
    }
    if (activeTab === "review") {
      fetchDashboardData();
    }
  }, [activeTab]);

  // Mutations - Categories
  const createCategoryMutation = usePlatformAdminCreateInsightCategory({
    mutation: {
      onSuccess: () => {
        toast.success("Category created");
        categoriesQuery.refetch();
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
        categoriesQuery.refetch();
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
        categoriesQuery.refetch();
      },
      onError: (err: any) => toast.error(err.message || "Failed to update status")
    }
  });

  // Mutations - Articles
  const createArticleMutation = usePlatformAdminCreateInsightArticle({
    mutation: {
      onSuccess: () => {
        toast.success("Article draft created successfully");
        articlesQuery.refetch();
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
        articlesQuery.refetch();
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
        articlesQuery.refetch();
      },
      onError: (err: any) => toast.error(err.message || "Failed to change article status")
    }
  });

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
    setArtLinkedResources("");
    setArtLastVerified("");
    setArtNextReview("");
  };

  const resetResourceForm = () => {
    setEditingResourceId(null);
    setResTitle("");
    setResSlug("");
    setResType("Act");
    setResShortSummary("");
    setResMainExplanation("");
    setResOfficialName("");
    setResNumber("");
    setResAuthority("");
    setResSector("Waste");
    setResDateIssued("");
    setResEffectiveDate("");
    setResSourceLink("");
    setResDownloadLink("");
    setResComplianceRelevance("");
    setResPracticalImplications("");
    setResDisclaimer("This content is provided for general educational purposes and does not constitute legal advice. Users should refer to the official legislation and seek professional advice where required.");
    setResIsFeatured(false);
    setResLegalStatus("active");
    setResLastVerified("");
    setResNextReview("");
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
    setSelectedSectors(article.sectors || []);
    setSelectedCourses(article.relatedCourses || []);
    setSelectedSdg(article.sdgContributions || []);
    setSourceReferences(article.sourceReferences || []);
    setArtLinkedResources(article.linkedResourceSlugs?.join(", ") || "");
    setArtLastVerified(article.lastVerifiedAt ? new Date(article.lastVerifiedAt).toISOString().substring(0, 10) : "");
    setArtNextReview(article.nextReviewAt ? new Date(article.nextReviewAt).toISOString().substring(0, 10) : "");
    setViewMode("edit");
  };

  const handleEditResourceClick = (res: any) => {
    setEditingResourceId(res.id);
    setResTitle(res.title);
    setResSlug(res.slug);
    setResType(res.resourceType);
    setResShortSummary(res.shortSummary);
    setResMainExplanation(res.mainExplanation);
    setResOfficialName(res.officialName || "");
    setResNumber(res.resourceNumber || "");
    setResAuthority(res.responsibleAuthority || "");
    setResSector(res.relevantSector || "Waste");
    setResDateIssued(res.dateIssued ? new Date(res.dateIssued).toISOString().substring(0, 10) : "");
    setResEffectiveDate(res.effectiveDate ? new Date(res.effectiveDate).toISOString().substring(0, 10) : "");
    setResSourceLink(res.officialSourceLink || "");
    setResDownloadLink(res.downloadableDocLink || "");
    setResComplianceRelevance(res.complianceRelevance || "");
    setResPracticalImplications(res.practicalImplications || "");
    setResDisclaimer(res.disclaimer || "");
    setResIsFeatured(res.isFeatured === true);
    setResLegalStatus(res.legalStatus || "active");
    setResLastVerified(res.lastVerifiedAt ? new Date(res.lastVerifiedAt).toISOString().substring(0, 10) : "");
    setResNextReview(res.nextReviewAt ? new Date(res.nextReviewAt).toISOString().substring(0, 10) : "");
    setViewMode("edit_resource");
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
    if (!artTitle.trim() || !artSlug.trim() || !artExcerpt.trim() || !artContent.trim() || !artAuthorName.trim()) {
      toast.error("Please fill in all required fields");
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
      sectors: selectedSectors,
      relatedCourses: selectedCourses,
      sdgContributions: selectedSdg,
      sourceReferences,
      linkedResourceSlugs: artLinkedResources.split(",").map(s => s.trim()).filter(Boolean),
      lastVerifiedAt: artLastVerified ? new Date(artLastVerified).toISOString() : new Date().toISOString(),
      nextReviewAt: artNextReview ? new Date(artNextReview).toISOString() : null
    };

    if (artCategoryId) {
      payload.insightCategoryId = Number(artCategoryId);
    }

    if (forceStatus) {
      payload.status = forceStatus;
    }

    if (viewMode === "create") {
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

  // Resources Submission
  const handleResourceSubmit = (e: React.FormEvent, forceStatus?: string) => {
    e.preventDefault();
    if (!resTitle.trim() || !resSlug.trim() || !resShortSummary.trim() || !resMainExplanation.trim()) {
      toast.error("Please fill in all required fields (marked *)");
      return;
    }

    const payload = {
      title: resTitle,
      slug: resSlug,
      resourceType: resType,
      shortSummary: resShortSummary,
      mainExplanation: resMainExplanation,
      officialName: resOfficialName || null,
      resourceNumber: resNumber || null,
      responsibleAuthority: resAuthority || null,
      relevantSector: resSector,
      dateIssued: resDateIssued ? new Date(resDateIssued).toISOString() : null,
      effectiveDate: resEffectiveDate ? new Date(resEffectiveDate).toISOString() : null,
      officialSourceLink: resSourceLink || null,
      downloadableDocLink: resDownloadLink || null,
      complianceRelevance: resComplianceRelevance || null,
      practicalImplications: resPracticalImplications || null,
      disclaimer: resDisclaimer,
      isFeatured: resIsFeatured === true,
      legalStatus: resLegalStatus,
      lastVerifiedAt: resLastVerified ? new Date(resLastVerified).toISOString() : new Date().toISOString(),
      nextReviewAt: resNextReview ? new Date(resNextReview).toISOString() : null,
      status: forceStatus || (viewMode === "create_resource" ? "draft" : undefined)
    };

    const method = viewMode === "create_resource" ? "POST" : "PATCH";
    const url = viewMode === "create_resource" 
      ? "/api/platform-admin/insights/mauritius-resources"
      : `/api/platform-admin/insights/mauritius-resources/${editingResourceId}`;

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then((res) => {
        if (res.status === 200 || res.status === 201) {
          toast.success("Resource saved successfully!");
          fetchResources();
          setViewMode("list");
          resetResourceForm();
          return null;
        } else {
          return res.json().then(e => { throw new Error(e.error || "Save failed"); });
        }
      })
      .catch((err) => toast.error(err.message));
  };

  const handleResourceStatusToggle = (id: number, current: string) => {
    let next = "draft";
    if (current === "draft") next = "published";
    else if (current === "published") {
      const ok = window.confirm("Are you sure you want to archive this resource?");
      if (!ok) return;
      next = "archived";
    }

    fetch(`/api/platform-admin/insights/mauritius-resources/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next })
    })
      .then((res) => {
        if (res.status === 200) {
          toast.success(`Resource status updated to ${next}`);
          fetchResources();
        } else {
          toast.error("Failed to change resource status");
        }
      })
      .catch((err) => toast.error(err.message));
  };

  // Helper variables
  const categories = categoriesQuery.data || [];
  const articles = articlesQuery.data || [];
  const sectors = sectorsQuery.data || [];
  const courses = coursesQuery.data || [];
  const sdgs = sdgQuery.data || [];

  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

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
              <h2 className="text-2xl font-bold font-serif">Insights & Resources Panel</h2>
              <p className="text-muted-foreground mt-1">
                Manage editorial articles, Categories, and Mauritius environmental compliance regulations.
              </p>
            </div>

            <TabsList>
              <TabsTrigger value="articles">Articles</TabsTrigger>
              <TabsTrigger value="resources">Mauritius Rules & Resources</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="review">Review Dashboard</TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: ARTICLES */}
          <TabsContent value="articles" className="space-y-4">
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

            {articlesQuery.isLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : filteredArticles.length === 0 ? (
              <Card className="text-center py-12"><CardContent className="text-muted-foreground">No articles match your filters.</CardContent></Card>
            ) : (
              <div className="border rounded-lg overflow-x-auto bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Category</TableHead>
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
                          <TableCell>
                            <Badge variant={art.status === "published" ? "default" : art.status === "draft" ? "secondary" : "outline"}>
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

          {/* TAB 2: MAURITIUS RULES & RESOURCES */}
          <TabsContent value="resources" className="space-y-4">
            <div className="flex justify-end bg-card border rounded-lg p-4">
              <Button onClick={() => { resetResourceForm(); setViewMode("create_resource"); }} className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Create Rule / Resource
              </Button>
            </div>

            {isLoadingResources ? (
              <Skeleton className="h-40 w-full" />
            ) : resources.length === 0 ? (
              <Card className="text-center py-12"><CardContent className="text-muted-foreground">No Mauritius compliance resources available.</CardContent></Card>
            ) : (
              <div className="border rounded-lg overflow-x-auto bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Resource Type</TableHead>
                      <TableHead>Sector</TableHead>
                      <TableHead>Authority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resources.map((res: any) => (
                      <TableRow key={res.id}>
                        <TableCell className="font-medium max-w-xs truncate">{res.title}</TableCell>
                        <TableCell className="text-xs">
                          <Badge variant="outline">{res.resourceType}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{res.relevantSector}</TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-xs truncate">{res.responsibleAuthority}</TableCell>
                        <TableCell>
                          <Badge variant={res.status === "published" ? "default" : "secondary"}>
                            {res.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditResourceClick(res)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResourceStatusToggle(res.id, res.status)}
                              disabled={res.status === "archived"}
                            >
                              {res.status === "draft" ? "Publish" :
                               res.status === "published" ? "Archive" : "Archived"}
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

          {/* TAB 3: CATEGORIES */}
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
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((cat: any) => (
                      <TableRow key={cat.id}>
                        <TableCell className="font-medium">{cat.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{cat.slug}</TableCell>
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
                            <Button variant="ghost" size="icon" onClick={() => handleCategoryStatusToggle(cat.id, cat.status)}>
                              {cat.status === "active" ? <Archive className="h-4 w-4 text-amber-600" /> : <CheckCircle className="h-4 w-4 text-emerald-600" />}
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

          <TabsContent value="review" className="space-y-6">
            {isLoadingDashboard ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : dashboardData ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Overdue Articles</CardDescription>
                      <CardTitle className="text-3xl font-bold text-destructive">
                        {dashboardData.overdueArticles?.length || 0}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Overdue Resources</CardDescription>
                      <CardTitle className="text-3xl font-bold text-destructive">
                        {dashboardData.overdueResources?.length || 0}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Broken Source Links</CardDescription>
                      <CardTitle className="text-3xl font-bold text-amber-600">
                        {dashboardData.brokenLinks?.length || 0}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Unsourced Articles</CardDescription>
                      <CardTitle className="text-3xl font-bold text-amber-600">
                        {dashboardData.unsourcedArticles?.length || 0}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-serif">Overdue Items Pending Review</CardTitle>
                    <CardDescription>Articles and rules exceeding their next review date.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardData.overdueArticles?.map((art: any) => (
                        <div key={`overdue-art-${art.id}`} className="flex justify-between items-center p-3 border rounded-lg bg-card">
                          <div>
                            <Badge className="mr-2">Article</Badge>
                            <span className="font-semibold">{art.title}</span>
                            <div className="text-xs text-muted-foreground mt-1">
                              Overdue since: {art.nextReviewAt ? new Date(art.nextReviewAt).toLocaleDateString() : (art.reviewDate ? new Date(art.reviewDate).toLocaleDateString() : "N/A")}
                            </div>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => handleEditArticleClick(art)}>Edit & Verify</Button>
                        </div>
                      ))}
                      {dashboardData.overdueResources?.map((res: any) => (
                        <div key={`overdue-res-${res.id}`} className="flex justify-between items-center p-3 border rounded-lg bg-card">
                          <div>
                            <Badge className="mr-2" variant="secondary">Resource</Badge>
                            <span className="font-semibold">{res.title}</span>
                            <div className="text-xs text-muted-foreground mt-1">
                              Overdue since: {res.nextReviewAt ? new Date(res.nextReviewAt).toLocaleDateString() : "N/A"}
                            </div>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => handleEditResourceClick(res)}>Edit & Verify</Button>
                        </div>
                      ))}
                      {(!dashboardData.overdueArticles?.length && !dashboardData.overdueResources?.length) && (
                        <p className="text-sm text-muted-foreground">No overdue review items found.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-serif text-destructive flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" /> Warning: Articles Referencing Outdated Laws
                    </CardTitle>
                    <CardDescription>Published articles containing link references to revoked or superseded legislation.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardData.articlesWithSupersededLinks?.map((art: any) => (
                        <div key={`superseded-warn-${art.id}`} className="flex justify-between items-center p-3 border border-destructive/20 rounded-lg bg-destructive/5">
                          <div>
                            <span className="font-semibold text-destructive">{art.title}</span>
                            <div className="text-xs text-muted-foreground mt-1">
                              Linked Slugs: {art.linkedResourceSlugs?.join(", ")}
                            </div>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => handleEditArticleClick(art)}>Re-link Rules</Button>
                        </div>
                      ))}
                      {!dashboardData.articlesWithSupersededLinks?.length && (
                        <p className="text-sm text-muted-foreground">No articles referencing superseded laws found.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data available.</p>
            )}
          </TabsContent>
        </Tabs>
      ) : viewMode === "create_resource" || viewMode === "edit_resource" ? (
        // CREATE/EDIT RESOURCE SCREEN
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => setViewMode("list")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-2xl font-bold font-serif">
                {viewMode === "create_resource" ? "Create Mauritius Resource" : "Edit Mauritius Resource"}
              </h2>
              <p className="text-sm text-muted-foreground">
                Expose regulatory compliance, laws, policies and guides.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <form onSubmit={(e) => handleResourceSubmit(e)} className="lg:col-span-2 space-y-6 bg-card border rounded-xl p-6 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="res-title">Resource Title *</Label>
                  <Input
                    id="res-title"
                    value={resTitle}
                    onChange={(e) => {
                      setResTitle(e.target.value);
                      if (viewMode === "create_resource") {
                        setResSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
                      }
                    }}
                    placeholder="e.g. Single-Use Plastic Ban Regulations"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="res-slug">Slug *</Label>
                  <Input
                    id="res-slug"
                    value={resSlug}
                    onChange={(e) => setResSlug(e.target.value.toLowerCase())}
                    placeholder="regulation-slug"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="res-type">Resource Type *</Label>
                  <select
                    id="res-type"
                    value={resType}
                    onChange={(e) => setResType(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-1"
                    required
                  >
                    <option value="Act">Act</option>
                    <option value="Regulation">Regulation</option>
                    <option value="Rule">Rule</option>
                    <option value="Policy">Policy</option>
                    <option value="Government guideline">Government guideline</option>
                    <option value="Code">Code</option>
                    <option value="Official notice">Official notice</option>
                    <option value="Authority">Authority</option>
                    <option value="Compliance resource">Compliance resource</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="res-short">Short Summary *</Label>
                <Textarea
                  id="res-short"
                  value={resShortSummary}
                  onChange={(e) => setResShortSummary(e.target.value)}
                  placeholder="A brief 1-2 sentence regulatory summary..."
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="res-main">Simplified Explanation *</Label>
                <Textarea
                  id="res-main"
                  value={resMainExplanation}
                  onChange={(e) => setResMainExplanation(e.target.value)}
                  placeholder="Explain the law in simplified terms for learners..."
                  className="mt-1 min-h-[150px]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4">
                <div>
                  <Label htmlFor="res-official-name">Official Legal Name</Label>
                  <Input
                    id="res-official-name"
                    value={resOfficialName}
                    onChange={(e) => setResOfficialName(e.target.value)}
                    placeholder="e.g. Environment Protection Act 2002"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="res-number">Act / Regulation / Guideline Number</Label>
                  <Input
                    id="res-number"
                    value={resNumber}
                    onChange={(e) => setResNumber(e.target.value)}
                    placeholder="e.g. GN No. 316 of 2020"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="res-authority">Responsible Authority</Label>
                  <Input
                    id="res-authority"
                    value={resAuthority}
                    onChange={(e) => setResAuthority(e.target.value)}
                    placeholder="e.g. Ministry of Environment"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="res-sector">Relevant Sector</Label>
                  <select
                    id="res-sector"
                    value={resSector}
                    onChange={(e) => setResSector(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-1"
                  >
                    <option value="Waste">Waste</option>
                    <option value="Energy">Energy</option>
                    <option value="Water">Water</option>
                    <option value="Biodiversity">Biodiversity</option>
                    <option value="Pollution">Pollution</option>
                    <option value="Climate">Climate</option>
                    <option value="Workplace">Workplace</option>
                    <option value="Procurement">Procurement</option>
                    <option value="ESG">ESG</option>
                    <option value="General environmental compliance">General environmental compliance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4">
                <div>
                  <Label htmlFor="res-date-issued">Date Issued</Label>
                  <Input
                    id="res-date-issued"
                    type="date"
                    value={resDateIssued}
                    onChange={(e) => setResDateIssued(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="res-effective-date">Effective Date</Label>
                  <Input
                    id="res-effective-date"
                    type="date"
                    value={resEffectiveDate}
                    onChange={(e) => setResEffectiveDate(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="res-source-link">Official Source Link (URL)</Label>
                  <Input
                    id="res-source-link"
                    type="url"
                    value={resSourceLink}
                    onChange={(e) => setResSourceLink(e.target.value)}
                    placeholder="https://..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="res-download-link">Downloadable Document Link (URL)</Label>
                  <Input
                    id="res-download-link"
                    type="url"
                    value={resDownloadLink}
                    onChange={(e) => setResDownloadLink(e.target.value)}
                    placeholder="https://..."
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <div>
                  <Label htmlFor="res-relevance">Compliance Relevance</Label>
                  <Textarea
                    id="res-relevance"
                    value={resComplianceRelevance}
                    onChange={(e) => setResComplianceRelevance(e.target.value)}
                    placeholder="What triggers compliance obligations..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="res-implications">Practical Implications for Organisations</Label>
                  <Textarea
                    id="res-implications"
                    value={resPracticalImplications}
                    onChange={(e) => setResPracticalImplications(e.target.value)}
                    placeholder="Replace single-use plastics, audit water meters..."
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <div>
                  <Label htmlFor="res-disclaimer">Legal Disclaimer (Editable)</Label>
                  <Textarea
                    id="res-disclaimer"
                    value={resDisclaimer}
                    onChange={(e) => setResDisclaimer(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t pt-4">
                  <div>
                    <Label htmlFor="res-legal-status">Legal Status</Label>
                    <select
                      id="res-legal-status"
                      value={resLegalStatus}
                      onChange={(e) => setResLegalStatus(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-1"
                    >
                      <option value="active">Active</option>
                      <option value="superseded">Superseded</option>
                      <option value="revoked">Revoked</option>
                      <option value="non_legal">Non Legal / Portal</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="res-last-verified">Last Verified Date</Label>
                    <Input
                      id="res-last-verified"
                      type="date"
                      value={resLastVerified}
                      onChange={(e) => setResLastVerified(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="res-next-review">Next Review Date</Label>
                    <Input
                      id="res-next-review"
                      type="date"
                      value={resNextReview}
                      onChange={(e) => setResNextReview(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    id="res-featured"
                    type="checkbox"
                    checked={resIsFeatured}
                    onChange={(e) => setResIsFeatured(e.target.checked)}
                    className="h-4 w-4 text-primary rounded border-input bg-background"
                  />
                  <Label htmlFor="res-featured">Mark as Featured Resource</Label>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 border-t pt-4">
                <Button type="button" variant="outline" onClick={() => setViewMode("list")}>
                  Cancel
                </Button>
                <Button type="submit" variant="secondary">
                  Save as Draft
                </Button>
                <Button type="button" onClick={(e) => handleResourceSubmit(e, "published")}>
                  Publish Resource
                </Button>
              </div>
            </form>

            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle className="text-sm font-bold flex items-center gap-2"><Scale className="h-4 w-4" /> Live Preview</CardTitle></CardHeader>
                <CardContent className="border-t p-4 max-h-[300px] overflow-y-auto space-y-3">
                  {resTitle && <h3 className="text-base font-bold font-serif text-foreground">{resTitle}</h3>}
                  <div className="flex gap-2">
                    <Badge variant="outline">{resType}</Badge>
                    <Badge variant="secondary">{resSector}</Badge>
                  </div>
                  {resShortSummary && <p className="text-xs text-muted-foreground">{resShortSummary}</p>}
                  {resMainExplanation && (
                    <div className="bg-muted p-3 rounded-lg text-xs italic text-muted-foreground mt-2">
                      {resMainExplanation}
                    </div>
                  )}
                  <p className="text-[10px] text-amber-700 leading-tight mt-2 bg-amber-50 p-2 rounded border border-amber-200">
                    <strong>Disclaimer:</strong> {resDisclaimer}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        // ARTICLES CREATE/EDIT FORM SCREEN
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
                  <Label htmlFor="art-cat">Category</Label>
                  <select
                    id="art-cat"
                    value={artCategoryId}
                    onChange={(e) => setArtCategoryId(e.target.value ? Number(e.target.value) : "")}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-1"
                  >
                    <option value="">Select Category (Optional)...</option>
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
                    placeholder="https://images.unsplash.com/photo-..."
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t pt-4">
                <div>
                  <Label htmlFor="art-linked-resources">Linked Resource Slugs (comma-separated)</Label>
                  <Input
                    id="art-linked-resources"
                    value={artLinkedResources}
                    onChange={(e) => setArtLinkedResources(e.target.value)}
                    placeholder="regulation-slug-1, regulation-slug-2"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="art-last-verified">Last Verified Date</Label>
                  <Input
                    id="art-last-verified"
                    type="date"
                    value={artLastVerified}
                    onChange={(e) => setArtLastVerified(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="art-next-review">Next Review Date</Label>
                  <Input
                    id="art-next-review"
                    type="date"
                    value={artNextReview}
                    onChange={(e) => setArtNextReview(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 border-t pt-4">
                <Button type="button" variant="outline" onClick={() => setViewMode("list")}>
                  Cancel
                </Button>
                <Button type="submit" variant="secondary">
                  Save as Draft
                </Button>
                <Button type="button" onClick={(e) => handleArticleSubmit(e, "published")}>
                  Publish Article
                </Button>
              </div>
            </form>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Eye className="h-4 w-4" /> Live Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="border-t p-4 max-h-[300px] overflow-y-auto prose prose-sm">
                  {artTitle && <h2 className="text-base font-serif font-bold text-foreground mb-1">{artTitle}</h2>}
                  {artExcerpt && <p className="italic text-xs text-muted-foreground mb-4">{artExcerpt}</p>}
                  {artContent ? (
                    <div className="text-xs text-muted-foreground whitespace-pre-wrap">{artContent}</div>
                  ) : (
                    <p className="text-xs text-muted-foreground font-sans">Content preview will render here...</p>
                  )}
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
