import { Layout } from "@/components/layout/Layout";
import { FileText, ShieldCheck, CheckCircle2, Building2, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function TermsOfService() {
  const lastUpdated = "17 August 2026";

  return (
    <Layout>
      {/* Header */}
      <div className="bg-primary/5 border-b py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
            <FileText className="h-4 w-4" /> Legal & Terms
          </div>
          <h1 className="text-3xl md:text-5xl font-bold font-serif mb-3 text-foreground">
            Terms of Service
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Last Updated: {lastUpdated} • Elevio Skills (Operated by Recyclean Ltd)
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-emerald dark:prose-invert max-w-none space-y-10">
          
          <section className="space-y-4">
            <h2 className="text-2xl font-bold font-serif text-foreground flex items-center gap-2 border-b pb-2">
              1. Acceptance of Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using the Elevio Skills Learning Management System ("the Platform"), operated by <strong>Recyclean Ltd</strong>, you agree to be bound by these Terms of Service. If you are registering an account on behalf of an enterprise or organisation, you represent and warrant that you have full authority to bind that organisation.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold font-serif text-foreground flex items-center gap-2 border-b pb-2">
              2. Corporate Subscriptions & User Licenses
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Elevio Skills offers tiered corporate subscription plans based on organisation employee categories. Client organisations are responsible for managing employee seat allocations, invitations, and ensuring active users comply with corporate conduct and LMS rules.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>User accounts are strictly personal and may not be shared across multiple individuals.</li>
              <li>Subscription fees are billed on a recurring monthly or annual basis as specified in your agreement.</li>
              <li>Organizations may upgrade plans or request additional seat capacity at any time.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold font-serif text-foreground flex items-center gap-2 border-b pb-2">
              3. Intellectual Property & Course Materials
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              All training curricula, text, graphics, video simulations, assessment questions, decision scenarios, and instructional designs on Elevio Skills are the exclusive intellectual property of Recyclean Ltd or its licensors. Learners and client companies are granted a non-exclusive, non-transferable license to access training materials for internal capability building only.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold font-serif text-foreground flex items-center gap-2 border-b pb-2">
              4. Certification & Audit Assurance
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Certificates issued upon successful course completion represent verifiable records of training compliance. Attempts to circumvent assessment controls, falsify answers, or tamper with digital verification records constitute a breach of terms and will result in immediate certificate revocation and account suspension.
            </p>
          </section>

          <section className="space-y-4 bg-muted/40 p-6 rounded-2xl border">
            <h2 className="text-xl font-bold font-serif text-foreground">
              5. Contact Information & Governing Law
            </h2>
            <p className="text-sm text-muted-foreground">
              These Terms are governed by the laws of the Republic of Mauritius. For legal inquiries or support:
            </p>
            <div className="space-y-2 text-sm text-foreground pt-2">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span><strong>Recyclean Ltd</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Black River, Mauritius</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <a href="mailto:support@elevio.mu" className="text-primary hover:underline">support@elevio.mu</a>
              </div>
            </div>
          </section>

          <div className="pt-6 flex gap-4">
            <Button asChild variant="outline">
              <Link href="/">Back to Home</Link>
            </Button>
            <Button asChild>
              <Link href="/privacy">View Privacy Policy</Link>
            </Button>
          </div>

        </div>
      </div>
    </Layout>
  );
}
