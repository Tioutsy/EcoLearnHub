import { Layout } from "@/components/layout/Layout";
import { useListCompanyCertificates } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Award, Download, ExternalLink, FileDown, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

export default function CompanyCertificates() {
  const { data: certificates, isLoading } = useListCompanyCertificates();
  const hasCerts = (certificates?.length ?? 0) > 0;

  return (
    <Layout>
      <div className="bg-primary/5 border-b py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <Link href="/company">
                <span className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2 cursor-pointer">
                  <ArrowLeft className="mr-1 h-4 w-4" /> Back to Dashboard
                </span>
              </Link>
              <h1 className="text-3xl font-bold font-serif mb-1">Company Certificates</h1>
              <p className="text-muted-foreground">
                All qualifications earned by your employees, ready to download or share.
              </p>
            </div>
            <Button asChild disabled={!hasCerts}>
              <a href="/api/certificates/company/export" target="_blank" rel="noopener noreferrer">
                <FileDown className="mr-2 h-4 w-4" /> Bulk Export (PDF)
              </a>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="border rounded-xl overflow-hidden">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border-b last:border-0">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                  <Skeleton className="h-9 w-24" />
                </div>
              ))}
          </div>
        ) : !hasCerts ? (
          <div className="py-16 text-center border-2 border-dashed rounded-2xl bg-muted/10">
            <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-2">No certificates issued yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Once your employees complete courses and pass their assessments, their certificates
              will appear here for download.
            </p>
            <Button asChild>
              <Link href="/courses">Assign Training</Link>
            </Button>
          </div>
        ) : (
          <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <div className="col-span-3">Employee</div>
              <div className="col-span-4">Course</div>
              <div className="col-span-2">Issued</div>
              <div className="col-span-1">ID</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            {certificates?.map((cert) => (
              <div
                key={cert.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-6 py-4 border-t items-center"
              >
                <div className="md:col-span-3 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Award className="h-4 w-4" />
                  </div>
                  <span className="font-medium">{cert.employeeName ?? "Employee"}</span>
                </div>
                <div className="md:col-span-4 text-sm">{cert.courseName}</div>
                <div className="md:col-span-2 text-sm text-muted-foreground">
                  {format(new Date(cert.issuedAt), "MMM d, yyyy")}
                </div>
                <div className="md:col-span-1 text-xs font-mono text-muted-foreground truncate">
                  {cert.uniqueCode}
                </div>
                <div className="md:col-span-2 flex gap-2 md:justify-end">
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={`/api/certificates/${cert.id}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="mr-1.5 h-3.5 w-3.5" /> PDF
                    </a>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/certificates/verify/${cert.uniqueCode}`}>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
