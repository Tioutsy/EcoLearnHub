import { Layout } from "@/components/layout/Layout";
import { useListCourses, useListCategories } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, BookOpen, Clock, Tag } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Courses() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const { data: categories, isLoading: isLoadingCategories } = useListCategories();
  const { data: courses, isLoading: isLoadingCourses } = useListCourses({
    search: search || null,
    categoryId: selectedCategory,
  });

  return (
    <Layout>
      <div className="bg-primary/5 py-12 border-b">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold font-serif mb-4">Course Catalog</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Discover strategic environmental training designed for the modern Mauritian workforce.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-64 shrink-0 space-y-8">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search courses..." 
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Tag className="h-4 w-4" /> Categories
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                    selectedCategory === null 
                      ? "bg-primary text-primary-foreground font-medium" 
                      : "hover:bg-muted text-muted-foreground"
                  )}
                >
                  All Categories
                </button>
                {isLoadingCategories ? (
                  Array(4).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-9 w-full" />
                  ))
                ) : (
                  categories?.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between",
                        selectedCategory === category.id 
                          ? "bg-primary text-primary-foreground font-medium" 
                          : "hover:bg-muted text-muted-foreground"
                      )}
                    >
                      <span>{category.name}</span>
                      <span className={cn(
                        "text-xs px-1.5 py-0.5 rounded-full",
                        selectedCategory === category.id ? "bg-primary-foreground/20" : "bg-muted-foreground/10"
                      )}>
                        {category.courseCount}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {isLoadingCourses ? "Loading..." : `${courses?.length || 0} Courses found`}
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {isLoadingCourses ? (
                Array(6).fill(0).map((_, i) => (
                  <div key={i} className="flex flex-col gap-3">
                    <Skeleton className="h-48 w-full rounded-xl" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))
              ) : courses?.length === 0 ? (
                <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-2xl">
                  <p>No courses found matching your criteria.</p>
                  <Button variant="link" onClick={() => { setSearch(""); setSelectedCategory(null); }}>
                    Clear filters
                  </Button>
                </div>
              ) : (
                courses?.map((course) => (
                  <Link key={course.id} href={`/courses/${course.id}`}>
                    <div className="group bg-card border rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all cursor-pointer h-full flex flex-col">
                      <div className="relative aspect-video overflow-hidden bg-muted">
                        {course.thumbnailUrl && (
                          <img 
                            src={course.thumbnailUrl} 
                            alt={course.title} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )}
                        <div className="absolute top-3 left-3 flex gap-2">
                          <span className="bg-white/90 backdrop-blur-sm text-foreground text-xs font-semibold px-2.5 py-1 rounded-md">
                            {course.categoryName}
                          </span>
                        </div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium mb-3">
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {course.durationMinutes} min</span>
                          <span className="capitalize px-2 py-0.5 bg-secondary/10 text-secondary rounded">{course.level}</span>
                        </div>
                        <h3 className="text-lg font-bold font-serif mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {course.title}
                        </h3>
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-1">
                          {course.description}
                        </p>
                        <div className="pt-4 border-t flex items-center justify-between mt-auto">
                          <span className="font-semibold text-lg">${course.priceUsd}</span>
                          <span className="text-sm font-medium text-primary">Details &rarr;</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}