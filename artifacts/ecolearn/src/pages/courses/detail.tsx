import { Layout } from "@/components/layout/Layout";
import { useGetCourse, useCreateEnrollment } from "@workspace/api-client-react";
import { useParams, useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, CheckCircle2, PlayCircle, FileText, Award, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@clerk/react";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function CourseDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { isSignedIn } = useAuth();
  const { toast } = useToast();
  
  const courseId = parseInt(id || "0", 10);
  const { data: course, isLoading } = useGetCourse(courseId, { query: { enabled: !!courseId, queryKey: ['course', courseId] } });
  
  const enrollMutation = useCreateEnrollment();

  const handleEnroll = () => {
    if (!isSignedIn) {
      setLocation("/sign-in");
      return;
    }

    enrollMutation.mutate(
      { data: { courseId } },
      {
        onSuccess: (enrollment) => {
          toast({
            title: "Successfully enrolled",
            description: "Welcome to the course! Redirecting to player...",
          });
          setLocation(`/learn/${enrollment.id}`);
        },
        onError: () => {
          toast({
            title: "Enrollment failed",
            description: "You might already be enrolled in this course.",
            variant: "destructive",
          });
          setLocation("/dashboard");
        }
      }
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div>
              <Skeleton className="h-96 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Course not found</h2>
          <p className="text-muted-foreground mb-6">The course you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link href="/courses">Browse all courses</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-primary/5 py-12 border-b">
        <div className="container mx-auto px-4">
          <Link href="/courses" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to courses
          </Link>
          
          <div className="grid lg:grid-cols-3 gap-12 items-start">
            <div className="lg:col-span-2">
              <div className="flex gap-3 mb-4">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                  {course.categoryName}
                </span>
                <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                  {course.level}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold font-serif mb-6 text-foreground leading-tight">
                {course.title}
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                {course.description}
              </p>
              
              <div className="flex flex-wrap items-center gap-6 text-sm font-medium border-y py-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>{course.durationMinutes} minutes</span>
                </div>
                {course.includesCertificate && (
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    <span>Certificate of Completion</span>
                  </div>
                )}
                {(course.enrollmentCount ?? 0) > 0 && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>{course.enrollmentCount} enrolled</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-card border rounded-2xl shadow-xl overflow-hidden sticky top-24">
              {course.thumbnailUrl && (
                <div className="aspect-video relative">
                  <img src={course.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                  {course.previewVideoUrl && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Button size="icon" variant="secondary" className="rounded-full w-14 h-14 bg-white/90 text-primary hover:bg-white hover:scale-110 transition-all">
                        <PlayCircle className="h-8 w-8" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
              <div className="p-6">
                <Button 
                  size="lg" 
                  className="w-full h-12 text-base font-semibold shadow-md"
                  onClick={handleEnroll}
                  disabled={enrollMutation.isPending}
                >
                  {enrollMutation.isPending ? "Enrolling..." : "Enroll Now"}
                </Button>
                <p className="text-center text-xs text-muted-foreground mt-4">
                  Corporate billing available for teams
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            
            {/* Learning Objectives */}
            {course.learningObjectives && course.learningObjectives.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold font-serif mb-6">What you'll learn</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {course.learningObjectives.map((obj, i) => (
                    <div key={i} className="flex gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                      <span className="text-muted-foreground">{obj}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Course Content */}
            {course.lessons && course.lessons.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold font-serif mb-6">Course Content</h2>
                <div className="mb-4 text-sm text-muted-foreground flex justify-between">
                  <span>{course.lessons.length} lessons</span>
                  <span>{course.durationMinutes} minutes total</span>
                </div>
                
                <Accordion type="single" collapsible className="w-full border rounded-xl overflow-hidden bg-card">
                  {course.lessons.map((lesson) => (
                    <AccordionItem key={lesson.id} value={`lesson-${lesson.id}`}>
                      <AccordionTrigger className="px-6 hover:no-underline hover:bg-muted/50 data-[state=open]:bg-muted/50">
                        <div className="flex items-center gap-4 text-left">
                          {lesson.videoUrl ? <PlayCircle className="h-5 w-5 text-primary shrink-0" /> : <FileText className="h-5 w-5 text-primary shrink-0" />}
                          <div>
                            <div className="font-semibold">{lesson.title}</div>
                            <div className="text-xs text-muted-foreground font-normal mt-1">{lesson.durationMinutes} minutes</div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4 pt-2 text-muted-foreground">
                        {lesson.content ? lesson.content.substring(0, 150) + "..." : "Learn the core concepts and applications in this detailed lesson."}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
