import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Building2,
  FileText,
} from "lucide-react";
import { Link } from "wouter";
import { LeadCaptureDialog } from "@/components/lead-capture-dialog";
import { PRICING_PLANS } from "@/config/pricing";

export default function Pricing() {
  return (
    <Layout>
      <div className="bg-primary/5 pt-20 pb-16 border-b">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-6 text-foreground">
            Simple pricing for companies of every size
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Give your employees practical sustainability training through one straightforward monthly company subscription. Choose the category that matches your total number of employees.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            All prices are shown in Mauritian rupees and are charged monthly.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {PRICING_PLANS.map((plan) => (
            <div 
              key={plan.id} 
              className="relative bg-card border rounded-2xl p-6 flex flex-col shadow-sm transition-all"
            >
              <div className="mb-6">
                <h3 className="text-xl font-bold font-serif mb-2">{plan.name}</h3>
                <div className="h-20 flex flex-col justify-center">
                  {!plan.requiresCustomQuote ? (
                    <>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold">MUR {plan.monthlyPriceMUR?.toLocaleString()}</span>
                      </div>
                      <span className="text-muted-foreground font-medium text-sm mt-1">per month</span>
                    </>
                  ) : (
                    <span className="text-xl font-bold text-foreground">Contact us for a tailored quote</span>
                  )}
                </div>
              </div>

              {!plan.requiresCustomQuote ? (
                <Button 
                  asChild
                  className="w-full mb-6 h-11 text-sm bg-secondary text-secondary-foreground hover:bg-secondary/90"
                >
                  <Link href="/sign-up">Get started</Link>
                </Button>
              ) : (
                <LeadCaptureDialog
                  interest="proposal"
                  trigger={
                    <Button
                      variant="outline"
                      className="w-full mb-6 h-11 text-sm"
                    >
                      Contact us
                    </Button>
                  }
                />
              )}

              <div className="flex-1">
                <ul className="space-y-3">
                  {plan.features?.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span className="leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-24 max-w-3xl mx-auto border-t pt-16">
          <div className="text-center mb-10">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10 text-secondary mb-6">
              <Building2 className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-bold font-serif mb-4">
              More than 120 employees?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Contact us to discuss your workforce, training requirements and reporting needs.
            </p>
          </div>
          <div className="max-w-md mx-auto">
            <div className="border rounded-2xl p-8 bg-card shadow-sm flex flex-col items-center text-center">
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