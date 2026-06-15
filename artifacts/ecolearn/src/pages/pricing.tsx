import { Layout } from "@/components/layout/Layout";
import { useListPlans } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Building2,
  TreePine,
  Sparkles,
  CalendarDays,
  FileText,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { LeadCaptureDialog } from "@/components/lead-capture-dialog";

export default function Pricing() {
  const { data: plans, isLoading } = useListPlans();
  const paidPlans = plans?.filter((p) => (p.priceAnnual ?? 0) > 0);
  const trialPlan = plans?.find((p) => p.slug === "trial");

  return (
    <Layout>
      <div className="bg-primary/5 pt-20 pb-16 border-b">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-6 text-foreground">
            Corporate ESG Training Plans
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Train your workforce, track engagement, and certify ESG readiness. Every plan includes reporting and compliance support for Mauritian organisations.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Every plan is billed once a year. The monthly figure shows what each plan works out to per month.
          </p>

          <div className="mt-2 inline-flex items-center gap-3 rounded-full border border-primary/20 bg-primary/5 px-5 py-2.5 text-sm text-foreground">
            <TreePine className="h-4 w-4 text-primary shrink-0" />
            <span>
              <strong>5%</strong> of every subscription plants native trees with{" "}
              <strong>Ebony Forest, Chamarel</strong>. See it on our{" "}
              <Link href="/impact" className="text-primary font-semibold underline underline-offset-2">Impact</Link> page.
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
        {trialPlan && (
          <div className="max-w-6xl mx-auto mb-16">
            <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-primary/5 p-8 md:p-10">
              <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-sm font-medium mb-4">
                    <Sparkles className="h-4 w-4" />
                    Free Trial
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold font-serif mb-3">
                    Try EcoLearn free for 14 days
                  </h2>
                  <p className="text-muted-foreground text-lg mb-6">
                    Get your team started with no card required. See how training,
                    tracking, and certificates work before you commit.
                  </p>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6">
                    {(trialPlan.features ?? []).map((feature, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-2 text-sm text-foreground"
                      >
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        {feature}
                      </span>
                    ))}
                  </div>
                  <LeadCaptureDialog
                    interest="trial"
                    planId={trialPlan.id}
                    trigger={
                      <Button size="lg" className="h-12 px-8 text-base">
                        Start free trial
                      </Button>
                    }
                  />
                </div>
                <div className="hidden lg:flex justify-center">
                  <div className="text-center">
                    <p className="text-6xl font-bold font-serif text-primary">
                      14
                    </p>
                    <p className="text-muted-foreground font-medium">
                      days, on us
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="border rounded-2xl p-8 flex flex-col gap-4">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-16 w-3/4" />
                <Skeleton className="h-10 w-full mt-4" />
                <div className="space-y-3 mt-8">
                  {Array(5).fill(0).map((_, j) => <Skeleton key={j} className="h-4 w-full" />)}
                </div>
              </div>
            ))
          ) : paidPlans?.map((plan) => (
            <div 
              key={plan.id} 
              className={`relative bg-card border rounded-2xl p-8 flex flex-col shadow-sm transition-all ${
                plan.isPopular ? 'border-primary shadow-md lg:-translate-y-4 lg:pb-12' : ''
              }`}
            >
              {plan.isPopular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold font-serif mb-2">{plan.name}</h3>
                <div className="text-muted-foreground text-sm mb-6 h-10">
                  {plan.maxEmployees ? `Up to ${plan.maxEmployees} employees` : 'Unlimited employees'}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">Rs {plan.priceAnnual?.toLocaleString()}</span>
                  <span className="text-muted-foreground font-medium">/year</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Works out to <strong className="text-foreground">Rs {Math.round((plan.priceAnnual ?? 0) / 12).toLocaleString()}</strong> per month
                </p>
              </div>

              <Button 
                asChild
                className={`w-full mb-8 h-12 text-base ${plan.isPopular ? '' : 'bg-secondary text-secondary-foreground hover:bg-secondary/90'}`}
              >
                <Link href="/sign-up">Get Started</Link>
              </Button>

              <div className="flex-1">
                <p className="font-semibold text-sm mb-4 uppercase tracking-wider text-muted-foreground">What's included</p>
                <ul className="space-y-4">
                  {plan.features?.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                      <span className="leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-24 max-w-5xl mx-auto border-t pt-16">
          <div className="text-center mb-10">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10 text-secondary mb-6">
              <Building2 className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-bold font-serif mb-4">
              Talk to our team
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Whether you want to see the platform in action or need pricing built
              around your headcount, we are happy to help Mauritian organisations
              of any size.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="border rounded-2xl p-8 bg-card shadow-sm flex flex-col">
              <CalendarDays className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold font-serif mb-2">
                Book a demo
              </h3>
              <p className="text-muted-foreground mb-6 flex-1">
                See how EcoLearn trains, tracks, and certifies your workforce on a
                guided call with our team.
              </p>
              <LeadCaptureDialog
                interest="demo"
                trigger={
                  <Button size="lg" className="h-12 w-full">
                    Book a demo
                  </Button>
                }
              />
            </div>
            <div className="border rounded-2xl p-8 bg-card shadow-sm flex flex-col">
              <FileText className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold font-serif mb-2">
                Request a corporate proposal
              </h3>
              <p className="text-muted-foreground mb-6 flex-1">
                Get tailored pricing and a rollout plan built around your team
                size and sustainability goals.
              </p>
              <LeadCaptureDialog
                interest="proposal"
                trigger={
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 w-full"
                  >
                    Request proposal
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}