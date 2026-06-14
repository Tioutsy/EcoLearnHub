import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Leaf, ShieldCheck, TrendingUp, Users, PlayCircle, BookOpen, Award, BarChart3 } from "lucide-react";
import { useGetFeaturedCourses } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function Home() {
  const { data: featuredCourses, isLoading } = useGetFeaturedCourses();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background pt-16 md:pt-24 lg:pt-32 pb-16">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
        <div className="container relative mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-6">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2" />
                Mauritius' Premier Corporate Sustainability Platform
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground font-serif leading-[1.1] mb-6">
                Transform your business with <span className="text-primary italic">strategic environmental</span> education.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
                Empower your workforce with targeted training in waste sorting, recycling, and ESG compliance. Confident, purposeful sustainability that drives real business value.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="h-12 px-8 text-base">
                  <Link href="/courses">Explore Courses <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base border-primary/20 hover:bg-primary/5">
                  <Link href="/pricing">View Corporate Plans</Link>
                </Button>
              </div>
              
              <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground font-medium">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <span>ESG Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span>500+ Professionals</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <span>Certified Courses</span>
                </div>
              </div>
            </div>
            
            <div className="relative lg:ml-auto">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 border bg-card">
                <img 
                  src="/images/hero.png" 
                  alt="Corporate sustainability training" 
                  className="w-full h-auto object-cover aspect-[4/3] sm:aspect-[16/9] lg:aspect-[4/3]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 w-full flex items-center gap-4 text-white">
                    <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <PlayCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-white/80">Featured Module</p>
                      <p className="font-semibold">Implementing Circular Economy in Hospitality</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold font-serif mb-4">Why EcoLearn for your enterprise?</h2>
            <p className="text-muted-foreground text-lg">We provide the structure, reporting, and high-quality content needed to turn sustainability goals into organizational habits.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Leaf,
                title: "Substantive Green Action",
                description: "Move beyond greenwashing. Our curriculum is built on scientifically sound environmental practices tailored to the Mauritian context."
              },
              {
                icon: BarChart3,
                title: "Data-Rich Impact",
                description: "Track employee progress and measure real-world impact. Our corporate dashboard translates learning hours into ESG KPIs."
              },
              {
                icon: ShieldCheck,
                title: "Compliance & Certification",
                description: "Prepare your organization for global sustainability standards with auditable training records and verifiable employee certificates."
              }
            ].map((prop, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary">
                  <prop.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{prop.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{prop.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Counter */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-primary-foreground/10 text-center">
            <div>
              <p className="text-4xl font-bold font-serif mb-2">15+</p>
              <p className="text-primary-foreground/80 font-medium">Corporate Partners</p>
            </div>
            <div>
              <p className="text-4xl font-bold font-serif mb-2">2.5k</p>
              <p className="text-primary-foreground/80 font-medium">Employees Trained</p>
            </div>
            <div>
              <p className="text-4xl font-bold font-serif mb-2">45k</p>
              <p className="text-primary-foreground/80 font-medium">Kg Waste Diverted</p>
            </div>
            <div>
              <p className="text-4xl font-bold font-serif mb-2">100%</p>
              <p className="text-primary-foreground/80 font-medium">Local Context</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold font-serif mb-4">Strategic Training Programs</h2>
              <p className="text-muted-foreground text-lg max-w-2xl">Expert-led courses designed for immediate organizational application.</p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link href="/courses">View All Catalog <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <Skeleton className="h-48 w-full rounded-xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))
            ) : featuredCourses?.map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`}>
                <div className="group bg-card border rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all cursor-pointer h-full flex flex-col">
                  <div className="relative aspect-video overflow-hidden">
                    <img 
                      src={course.thumbnailUrl || '/images/course-esg.png'} 
                      alt={course.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="bg-white/90 backdrop-blur-sm text-foreground text-xs font-semibold px-2.5 py-1 rounded-md">
                        {course.categoryName}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium mb-3">
                      <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {course.durationMinutes} min</span>
                      <span className="capitalize px-2 py-0.5 bg-secondary/10 text-secondary rounded">{course.level}</span>
                    </div>
                    <h3 className="text-xl font-bold font-serif mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-6 flex-1">
                      {course.description}
                    </p>
                    <div className="pt-4 border-t flex items-center justify-between mt-auto">
                      <span className="font-semibold">${course.priceUsd}</span>
                      <span className="text-sm font-medium text-primary flex items-center">
                        View details <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8 flex justify-center sm:hidden">
            <Button variant="outline" asChild className="w-full">
              <Link href="/courses">View All Catalog</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-secondary" />
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        
        <div className="container relative mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold font-serif text-white mb-6">
            Ready to lead in sustainable business?
          </h2>
          <p className="text-secondary-foreground/80 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Join forward-thinking companies in Mauritius equipping their teams with the knowledge to drive environmental and operational excellence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-secondary hover:bg-white/90 h-12 px-8 text-base">
              Get Started Today
            </Button>
            <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 h-12 px-8 text-base">
              Schedule a Demo
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}