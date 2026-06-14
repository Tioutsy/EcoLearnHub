import { Layout } from "@/components/layout/Layout";
import { useVerifyCertificate } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Award, Calendar, User, Building2 } from "lucide-react";
import { format } from "date-fns";

export default function VerifyCertificate() {
  const { code } = useParams();
  const { data: cert, isLoading, isError } = useVerifyCertificate(code || "", { query: { enabled: !!code, retry: false } });

  return (
    <Layout>
      <div className="bg-primary/5 border-b py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold font-serif mb-2">Certificate Verification</h1>
          <p className="text-muted-foreground">Verify the authenticity of an EcoLearn certificate.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-3xl">
        {isLoading ? (
          <div className="bg-card border rounded-2xl p-8 shadow-sm">
            <Skeleton className="h-16 w-16 rounded-full mx-auto mb-6" />
            <Skeleton className="h-8 w-1/2 mx-auto mb-8" />
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        ) : isError || !cert ? (
          <div className="bg-card border-2 border-destructive/20 rounded-2xl p-12 text-center shadow-sm">
            <div className="h-20 w-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="h-10 w-10" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Verification Failed</h2>
            <p className="text-lg text-muted-foreground mb-8">
              We could not find a valid certificate with the code <strong className="text-foreground">{code}</strong>.
              Please check the code and try again.
            </p>
            <Button asChild variant="outline">
              <Link href="/">Return to Homepage</Link>
            </Button>
          </div>
        ) : (
          <div className="bg-card border-2 border-primary/20 rounded-2xl overflow-hidden shadow-xl">
            <div className="bg-primary text-primary-foreground p-8 text-center flex flex-col items-center">
              <Award className="h-16 w-16 mb-4 opacity-90" />
              <h2 className="text-2xl font-bold mb-1">Authentic Certificate</h2>
              <p className="opacity-90 font-medium">This certificate is valid and verified.</p>
            </div>
            
            <div className="p-8 md:p-12">
              <div className="space-y-8">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Course</p>
                  <h3 className="text-2xl font-bold font-serif text-foreground">{cert.courseName}</h3>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-8 pt-6 border-t">
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <User className="h-4 w-4" />
                      <span className="text-sm font-medium uppercase tracking-wider">Recipient</span>
                    </div>
                    <p className="text-lg font-semibold">{cert.employeeName}</p>
                  </div>
                  
                  {cert.companyName && (
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Building2 className="h-4 w-4" />
                        <span className="text-sm font-medium uppercase tracking-wider">Organization</span>
                      </div>
                      <p className="text-lg font-semibold">{cert.companyName}</p>
                    </div>
                  )}
                  
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm font-medium uppercase tracking-wider">Issue Date</span>
                    </div>
                    <p className="text-lg font-semibold">{format(new Date(cert.issuedAt), 'MMMM d, yyyy')}</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium uppercase tracking-wider">Credential ID</span>
                    </div>
                    <p className="text-lg font-mono font-semibold">{cert.uniqueCode}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}