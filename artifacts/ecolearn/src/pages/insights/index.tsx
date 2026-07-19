import { Layout } from "@/components/layout/Layout";
import { Link } from "wouter";
import { BookOpen, Scale, ArrowRight } from "lucide-react";

export default function InsightsLanding() {
  return (
    <Layout>
      <div className="bg-primary/5 py-16 border-b">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-6">Insights</h1>
          <p className="text-xl text-muted-foreground">
            Explore practical sustainability articles and Mauritius-specific laws, regulations, guidance and official resources.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Articles Card */}
          <Link href="/insights/articles">
            <div className="group h-full flex flex-col justify-between p-8 bg-card border rounded-2xl cursor-pointer hover:shadow-md hover:border-primary/50 transition-all duration-300">
              <div>
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold font-serif mb-3 group-hover:text-primary transition-colors">
                  Articles
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Practical ideas, educational content and sustainability guidance for organisations and individuals.
                </p>
              </div>
              <div className="text-primary font-medium flex items-center mt-auto">
                Browse Articles <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>

          {/* Mauritius Rules & Resources Card */}
          <Link href="/insights/mauritius-resources">
            <div className="group h-full flex flex-col justify-between p-8 bg-card border rounded-2xl cursor-pointer hover:shadow-md hover:border-primary/50 transition-all duration-300">
              <div>
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                  <Scale className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold font-serif mb-3 group-hover:text-primary transition-colors">
                  Mauritius Rules & Resources
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Access information on Mauritian environmental laws, regulations, policies, official guidance and compliance resources.
                </p>
              </div>
              <div className="text-primary font-medium flex items-center mt-auto">
                Browse Laws & Guidelines <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
