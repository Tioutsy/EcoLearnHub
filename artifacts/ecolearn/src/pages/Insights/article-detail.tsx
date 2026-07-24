import { Layout } from "@/components/layout/Layout";
import { useParams, Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, User, Tag } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";

import { customFetch } from "@workspace/api-client-react";

interface ArticlePost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  thumbnailUrl?: string;
  publishedAt: string;
  authorName: string;
  tags?: string[];
  linkedResourceSlugs?: string[];
  sourceReferences?: Array<{
    title: string;
    url?: string;
    publisher?: string;
  }>;
}

export default function InsightsArticleDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState<ArticlePost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedResources, setRelatedResources] = useState<any[]>([]);

  useEffect(() => {
    if (!slug) return;
    customFetch<ArticlePost>(`/api/insights/articles/${slug}`)
      .then((data) => {
        setPost(data);
        setIsLoading(false);
      })
      .catch((err) => {
        if (err.status === 404) {
          setPost(null);
        } else {
          console.error("Failed to load article detail", err);
        }
        setIsLoading(false);
      });
  }, [slug]);

  useEffect(() => {
    if (!post || !post.linkedResourceSlugs || post.linkedResourceSlugs.length === 0) {
      setRelatedResources([]);
      return;
    }
    
    customFetch<any[]>("/api/insights/mauritius-resources")
      .then((data) => {
        const filtered = data.filter((r: any) => post.linkedResourceSlugs!.includes(r.slug));
        setRelatedResources(filtered);
      })
      .catch((err) => {
        console.error("Failed to load related resources", err);
      });
  }, [post]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Skeleton className="h-10 w-full mb-6" />
          <Skeleton className="h-6 w-1/3 mb-12" />
          <Skeleton className="h-96 w-full rounded-2xl mb-12" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h2 className="text-2xl font-bold mb-4 font-serif">Article not found</h2>
          <Link href="/insights/articles" className="text-primary font-medium hover:underline cursor-pointer">
            Back to articles
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <article className="pb-20">
        {/* Header */}
        <header className="bg-primary/5 pt-12 pb-10 border-b">
          <div className="container mx-auto px-4 max-w-4xl">
            <Link href="/insights/articles" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors cursor-pointer">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to articles
            </Link>
            
            <h1 className="text-3xl md:text-5xl font-bold font-serif mb-6 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="font-medium text-foreground">{post.authorName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(post.publishedAt), 'MMMM d, yyyy')}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="container mx-auto px-4 max-w-4xl mt-12">
          {post.thumbnailUrl && (
            <div className="aspect-[21/9] rounded-2xl overflow-hidden mb-12 bg-muted shadow-md">
              <img src={post.thumbnailUrl} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="prose prose-emerald prose-lg prose-headings:font-serif prose-a:text-primary hover:prose-a:text-primary/80 max-w-none">
            {post.content.split('\n\n').map((paragraph, i) => {
              if (paragraph.startsWith('###')) {
                return <h3 key={i} className="text-2xl font-bold font-serif mt-8 mb-4">{paragraph.replace('###', '').trim()}</h3>;
              }
              if (paragraph.startsWith('####')) {
                return <h4 key={i} className="text-xl font-bold font-serif mt-6 mb-3">{paragraph.replace('####', '').trim()}</h4>;
              }
              if (paragraph.startsWith('*')) {
                return (
                  <ul key={i} className="list-disc pl-6 my-4 space-y-2">
                    {paragraph.split('\n').map((li, idx) => (
                      <li key={idx}>{li.replace('*', '').trim()}</li>
                    ))}
                  </ul>
                );
              }
              return <p key={i} className="mb-6 leading-relaxed text-muted-foreground">{paragraph}</p>;
            })}
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t flex flex-wrap gap-2 items-center">
              <Tag className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
              {post.tags.map((tag) => (
                <span key={tag} className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Related Official Resources */}
          {relatedResources.length > 0 && (
            <div className="mt-12 pt-8 border-t">
              <h3 className="text-xl font-bold font-serif mb-4">Related Mauritius Rules & Resources</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {relatedResources.map((res) => (
                  <Link key={res.id} href={`/insights/mauritius-resources/${res.slug}`}>
                    <div className="border rounded-xl p-4 hover:border-primary/45 hover:shadow-sm transition-all cursor-pointer bg-card h-full flex flex-col justify-between">
                      <div>
                        <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-semibold mb-2 inline-block">
                          {res.resourceType}
                        </span>
                        <h4 className="font-bold text-sm text-foreground hover:text-primary transition-colors line-clamp-1">
                          {res.title}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {res.shortSummary}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Source References */}
          {post.sourceReferences && post.sourceReferences.length > 0 && (
            <div className="mt-8 pt-8 border-t">
              <h3 className="text-xl font-bold font-serif mb-4">References & Sources</h3>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                {post.sourceReferences.map((ref, idx) => (
                  <li key={idx} className="flex items-start gap-1">
                    <span>•</span>
                    <div>
                      <strong className="text-foreground">{ref.title}</strong>
                      {ref.publisher && ` — ${ref.publisher}`}
                      {ref.url && (
                        <a href={ref.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1.5 inline-block">
                          View source
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </article>
    </Layout>
  );
}
