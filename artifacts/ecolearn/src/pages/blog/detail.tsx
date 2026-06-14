import { Layout } from "@/components/layout/Layout";
import { useGetBlogPost } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, User, Tag } from "lucide-react";
import { format } from "date-fns";

export default function BlogPost() {
  const { slug } = useParams();
  const { data: post, isLoading } = useGetBlogPost(slug || "", { query: { enabled: !!slug } });

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
          <h2 className="text-2xl font-bold mb-4">Article not found</h2>
          <Link href="/blog" className="text-primary font-medium hover:underline">
            Back to blog
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <article className="pb-20">
        {/* Header */}
        <header className="bg-primary/5 pt-16 pb-12 border-b">
          <div className="container mx-auto px-4 max-w-4xl">
            <Link href="/blog" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to insights
            </Link>
            
            <h1 className="text-4xl md:text-5xl font-bold font-serif mb-6 leading-tight">
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

          <div className="prose prose-lg prose-headings:font-serif prose-a:text-primary hover:prose-a:text-primary/80 max-w-none">
            {/* Real implementation would render Markdown/HTML, just showing raw text for the scaffold */}
            {post.content.split('\n\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t flex flex-wrap gap-2">
              <Tag className="h-5 w-5 text-muted-foreground mr-2 shrink-0" />
              {post.tags.map((tag) => (
                <span key={tag} className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Layout>
  );
}