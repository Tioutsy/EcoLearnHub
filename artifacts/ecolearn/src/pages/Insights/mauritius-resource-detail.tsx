import { Layout } from "@/components/layout/Layout";
import { useParams, Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, Building2, Globe, FileText, AlertTriangle, Briefcase, FileCheck } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";

interface MauritiusResource {
  id: number;
  title: string;
  slug: string;
  resourceType: string;
  shortSummary: string;
  mainExplanation: string;
  officialName?: string;
  resourceNumber?: string;
  responsibleAuthority?: string;
  relevantSector?: string;
  dateIssued?: string;
  effectiveDate?: string;
  officialSourceLink?: string;
  downloadableDocLink?: string;
  complianceRelevance?: string;
  practicalImplications?: string;
  disclaimer: string;
  legalStatus?: string;
  lastVerifiedAt?: string;
}

export default function MauritiusResourceDetail() {
  const { slug } = useParams();
  const [resource, setResource] = useState<MauritiusResource | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/insights/mauritius-resources/${slug}`)
      .then((res) => {
        if (res.status === 404) {
          setResource(null);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setResource(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load resource detail", err);
        setIsLoading(false);
      });
  }, [slug]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Skeleton className="h-10 w-full mb-6" />
          <Skeleton className="h-6 w-1/3 mb-12" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!resource) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h2 className="text-2xl font-bold mb-4 font-serif">Resource not found</h2>
          <Link href="/insights/mauritius-resources" className="text-primary font-medium hover:underline cursor-pointer">
            Back to Mauritius Rules & Resources
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pb-20">
        {/* Header */}
        <header className="bg-primary/5 pt-12 pb-10 border-b">
          <div className="container mx-auto px-4 max-w-4xl">
            <Link href="/insights/mauritius-resources" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors cursor-pointer">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Rules & Resources
            </Link>
            
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="bg-primary text-primary-foreground px-2.5 py-0.5 rounded-full text-xs font-semibold">
                {resource.resourceType}
              </span>
              {resource.relevantSector && (
                <span className="bg-secondary/15 text-secondary-foreground px-2.5 py-0.5 rounded-full text-xs font-semibold">
                  Sector: {resource.relevantSector}
                </span>
              )}
              {resource.legalStatus && resource.legalStatus !== "active" && (
                <span className="bg-destructive text-destructive-foreground px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase">
                  {resource.legalStatus}
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-bold font-serif mb-4 leading-tight">
              {resource.title}
            </h1>

            {resource.officialName && (
              <p className="text-sm text-muted-foreground italic mb-2">
                Official Name: {resource.officialName} {resource.resourceNumber ? `(${resource.resourceNumber})` : ""}
              </p>
            )}
          </div>
        </header>

        {/* Warning block for superseded or revoked laws */}
        {resource.legalStatus && resource.legalStatus !== "active" && (
          <div className="container mx-auto px-4 max-w-4xl mt-8">
            <div className="bg-destructive/10 border border-destructive/25 rounded-xl p-4 flex gap-3 text-destructive text-sm">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
              <div>
                <strong>Legal Warning:</strong> This legal instrument has status <strong>{resource.legalStatus.toUpperCase()}</strong>. It is not currently active. Reference should be made to current laws such as the Environment Act 2024.
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer Alert */}
        <div className="container mx-auto px-4 max-w-4xl mt-8">
          <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-4 flex gap-3 text-amber-800 text-sm">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <p className="leading-relaxed">
              <strong>Disclaimer:</strong> {resource.disclaimer}
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="container mx-auto px-4 max-w-4xl mt-10 grid md:grid-cols-3 gap-8">
          {/* Main Info (Left/Middle Column) */}
          <div className="md:col-span-2 space-y-8">
            {/* Short Summary */}
            <div>
              <h2 className="text-xl font-bold font-serif mb-3 text-foreground border-b pb-2">
                Summary
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {resource.shortSummary}
              </p>
            </div>

            {/* Simplified Explanation */}
            <div>
              <h2 className="text-xl font-bold font-serif mb-3 text-foreground border-b pb-2">
                Simplified Explanation
              </h2>
              <div className="bg-muted/30 border rounded-xl p-5 leading-relaxed text-muted-foreground">
                <p>{resource.mainExplanation}</p>
              </div>
            </div>

            {/* Compliance Relevance */}
            {resource.complianceRelevance && (
              <div>
                <h2 className="text-xl font-bold font-serif mb-3 text-foreground border-b pb-2 flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-primary" /> Compliance Relevance
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {resource.complianceRelevance}
                </p>
              </div>
            )}

            {/* Practical Implications */}
            {resource.practicalImplications && (
              <div>
                <h2 className="text-xl font-bold font-serif mb-3 text-foreground border-b pb-2 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-secondary" /> Practical Implications for Organizations
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {resource.practicalImplications}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar Info (Right Column) */}
          <div className="space-y-6">
            <div className="border rounded-2xl p-6 bg-card shadow-sm space-y-4">
              <h3 className="font-bold text-base font-serif border-b pb-2 mb-2">
                Reference Metadata
              </h3>

              {resource.responsibleAuthority && (
                <div>
                  <span className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                    Authority
                  </span>
                  <span className="text-sm font-medium text-foreground flex items-start gap-1.5">
                    <Building2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    {resource.responsibleAuthority}
                  </span>
                </div>
              )}

              {resource.dateIssued && (
                <div>
                  <span className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                    Date Issued
                  </span>
                  <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-primary shrink-0" />
                    {format(new Date(resource.dateIssued), 'MMM d, yyyy')}
                  </span>
                </div>
              )}

              {resource.effectiveDate && (
                <div>
                  <span className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                    Effective Date
                  </span>
                  <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-primary shrink-0" />
                    {format(new Date(resource.effectiveDate), 'MMM d, yyyy')}
                  </span>
                </div>
              )}

              {resource.lastVerifiedAt && (
                <div>
                  <span className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                    Last Verified
                  </span>
                  <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-primary shrink-0" />
                    {format(new Date(resource.lastVerifiedAt), 'MMM d, yyyy')}
                  </span>
                </div>
              )}

              {(resource.officialSourceLink || resource.downloadableDocLink) && (
                <div className="pt-2 border-t space-y-2.5">
                  <span className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                    Official Links
                  </span>

                  {resource.officialSourceLink && (
                    <a
                      href={resource.officialSourceLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary font-medium hover:underline flex items-center gap-1.5"
                    >
                      <Globe className="h-4 w-4 shrink-0" /> Official Source
                    </a>
                  )}

                  {resource.downloadableDocLink && (
                    <a
                      href={resource.downloadableDocLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary font-medium hover:underline flex items-center gap-1.5"
                    >
                      <FileText className="h-4 w-4 shrink-0" /> Download Document
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
