import { Layout } from "@/components/layout/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { ArrowRight, Calendar, User, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";

interface ArticlePost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  thumbnailUrl?: string;
  publishedAt: string;
  authorName: string;
}

export default function InsightsArticlesList() {
  const [posts, setPosts] = useState<ArticlePost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/insights/articles")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load articles", err);
        setIsLoading(false);
      });
  }, []);

  return (
    <Layout>
      <div className="bg-primary/5 py-12 border-b">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link href="/insights" className="inline-flex items-center text-sm text-primary font-medium hover:underline mb-4 cursor-pointer">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Insights
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold font-serif mb-4">Sustainability Articles</h1>
          <p className="text-lg text-muted-foreground">
            Practical ideas, educational content and sustainability guidance for organisations and individuals.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex flex-col gap-4">
                <Skeleton className="h-48 w-full rounded-2xl" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground border rounded-2xl max-w-xl mx-auto bg-muted/20">
            <p className="text-lg font-medium text-foreground mb-1">New sustainability articles will be added soon.</p>
            <p className="text-sm">We are preparing new content for this section.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link key={post.id} href={`/insights/articles/${post.slug}`}>
                <div className="group h-full flex flex-col cursor-pointer border rounded-2xl p-4 bg-card hover:shadow-sm hover:border-primary/45 transition-all">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-muted">
                    {post.thumbnailUrl ? (
                      <img 
                        src={post.thumbnailUrl} 
                        alt={post.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-serif font-bold text-xl">
                        EcoLearn
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {format(new Date(post.publishedAt), 'MMM d, yyyy')}</span>
                    <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {post.authorName}</span>
                  </div>
                  <h2 className="text-xl font-bold font-serif mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="text-primary text-sm font-medium flex items-center mt-auto">
                    Read article <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
