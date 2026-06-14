import { Layout } from "@/components/layout/Layout";
import { useListBlogPosts } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { ArrowRight, Calendar, User } from "lucide-react";
import { format } from "date-fns";

export default function BlogList() {
  const { data: posts, isLoading } = useListBlogPosts();

  return (
    <Layout>
      <div className="bg-primary/5 py-16 border-b">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-6">Insights & Resources</h1>
          <p className="text-xl text-muted-foreground">
            Strategic perspectives on sustainability, ESG compliance, and environmental education in Mauritius.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="flex flex-col gap-4">
                <Skeleton className="h-64 w-full rounded-2xl" />
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-3/4" />
              </div>
            ))
          ) : posts?.length === 0 ? (
            <div className="col-span-full py-12 text-center text-muted-foreground border rounded-2xl">
              No articles published yet. Check back soon.
            </div>
          ) : (
            posts?.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <div className="group h-full flex flex-col cursor-pointer">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-6 bg-muted">
                    {post.thumbnailUrl && (
                      <img 
                        src={post.thumbnailUrl} 
                        alt={post.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {format(new Date(post.publishedAt), 'MMM d, yyyy')}</span>
                    <span className="flex items-center gap-1.5"><User className="h-4 w-4" /> {post.authorName}</span>
                  </div>
                  <h2 className="text-2xl font-bold font-serif mb-3 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-muted-foreground line-clamp-3 mb-4 flex-1">
                    {post.excerpt}
                  </p>
                  <div className="text-primary font-medium flex items-center mt-auto">
                    Read article <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}