import { Layout } from "@/components/layout/Layout";
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2, Building2, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
  const lastUpdated = "17 August 2026";

  return (
    <Layout>
      {/* Header */}
      <div className="bg-primary/5 border-b py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
            <ShieldCheck className="h-4 w-4" /> Data Protection & Privacy
          </div>
          <h1 className="text-3xl md:text-5xl font-bold font-serif mb-3 text-foreground">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Last Updated: {lastUpdated} • Elevio Skills (Operated by Recyclean Ltd)
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-emerald dark:prose-invert max-w-none space-y-10">
          
          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold font-serif text-foreground flex items-center gap-2 border-b pb-2">
              <Eye className="h-5 w-5 text-primary" /> 1. Introduction & Overview
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Elevio Skills ("we", "our", or "us"), operated by <strong>Recyclean Ltd</strong>, is committed to safeguarding the privacy of our corporate clients, administrators, managers, and employee learners. This Privacy Policy explains how we collect, use, process, and protect your personal information when you access and use the Elevio Skills Learning Management System (LMS) and related services.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We process personal data in compliance with applicable data protection laws, including the <strong>Mauritius Data Protection Act 2017 (DPA 2017)</strong> and international data privacy best practices (including GDPR principles).
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold font-serif text-foreground flex items-center gap-2 border-b pb-2">
              <FileText className="h-5 w-5 text-primary" /> 2. Information We Collect
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect information necessary to administer workplace training, track educational progress, issue verifiable credentials, and generate corporate ESG reporting:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <strong>Account & Profile Information:</strong> Full name, corporate email address, job title, department, role within the organisation (Employee, Manager, or Admin), and password/authentication tokens.
              </li>
              <li>
                <strong>Organisation Data:</strong> Company name, sector/industry, corporate billing address, employee counts, and subscription package details.
              </li>
              <li>
                <strong>Learning Activity & Performance Records:</strong> Course enrollments, module completion status, quiz and assessment scores, time spent per lesson, commitment inputs, certificate issuance timestamps, and verification reference codes.
              </li>
              <li>
                <strong>Technical & Device Data:</strong> IP address, browser type, operating system, login timestamps, session identifiers, and diagnostic logs for security and audit assurance.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold font-serif text-foreground flex items-center gap-2 border-b pb-2">
              <CheckCircle2 className="h-5 w-5 text-primary" /> 3. How We Use Your Information
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We use collected information strictly for legitimate operational, educational, and reporting purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>To provide, personalize, and maintain access to our sustainability and ESG training catalog.</li>
              <li>To track individual and departmental progress against assigned learning pathways.</li>
              <li>To generate aggregated, audit-ready ESG training reports (e.g., GRI 404-1 disclosures) for corporate administrators and sustainability managers.</li>
              <li>To generate and validate tamper-evident digital certificates of completion with unique QR verification codes.</li>
              <li>To send essential transactional notifications, including invitation emails, assignment alerts, and course completion confirmations.</li>
              <li>To maintain system integrity, prevent fraud, and ensure tenant data isolation.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold font-serif text-foreground flex items-center gap-2 border-b pb-2">
              <Lock className="h-5 w-5 text-primary" /> 4. Data Protection & Security Controls
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement industry-standard technical and organizational security measures to protect your personal and organizational data:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Encryption:</strong> All data transmitted between your browser and our servers is encrypted using HTTPS/TLS 1.3. Stored databases and sensitive tokens are encrypted at rest.</li>
              <li><strong>Tenant Isolation:</strong> Company data and employee progress records are isolated by tenant boundaries, ensuring one organization cannot view another's confidential learner data.</li>
              <li><strong>Role-Based Access:</strong> Access to employee records is strictly restricted to designated company administrators, authorized managers, and authenticated learners themselves.</li>
              <li><strong>No Data Monetization:</strong> We never sell, rent, or trade your personal or organizational learning data to advertisers or third parties.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold font-serif text-foreground flex items-center gap-2 border-b pb-2">
              <Building2 className="h-5 w-5 text-primary" /> 5. Data Retention & Your Rights
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain learning records for as long as your organization maintains an active subscription with Elevio Skills, or as required to support verifiable certificate validation and audit compliance. Under the Mauritius Data Protection Act 2017, you have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Request access to the personal data we hold about you.</li>
              <li>Request the correction of inaccurate or incomplete information.</li>
              <li>Request the erasure of your personal data upon account termination (subject to statutory audit requirements).</li>
              <li>Withdraw consent or object to specific processing where applicable.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-4 bg-muted/40 p-6 rounded-2xl border">
            <h2 className="text-xl font-bold font-serif text-foreground">
              6. Contact Our Data Protection Officer
            </h2>
            <p className="text-sm text-muted-foreground">
              If you have any questions, requests, or concerns regarding this Privacy Policy or how your data is handled, please reach out to our team:
            </p>
            <div className="space-y-2 text-sm text-foreground pt-2">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span><strong>Recyclean Ltd</strong> (Operating Elevio Skills)</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Black River, Mauritius</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <a href="mailto:support@elevio.mu" className="text-primary hover:underline">support@elevio.mu</a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span>+230 5743 4349</span>
              </div>
            </div>
          </section>

          <div className="pt-6 flex gap-4">
            <Button asChild variant="outline">
              <Link href="/">Back to Home</Link>
            </Button>
            <Button asChild>
              <Link href="/courses">Explore Courses</Link>
            </Button>
          </div>

        </div>
      </div>
    </Layout>
  );
}
