import { Layout } from "@/components/layout/Layout";
import { useListCertificates } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Award, Download, ExternalLink, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

export default function Certificates() {
  const { data: certificates, isLoading } = useListCertificates();

  return (
    <Layout>
      <div className="bg-primary/5 border-b py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold font-serif mb-2">My Certificates</h1>
          <p className="text-muted-foreground">View and download your earned qualifications.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="border rounded-xl p-6 flex flex-col items-center text-center">
                <Skeleton className="h-24 w-24 rounded-full mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-6" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))
          ) : certificates?.length === 0 ? (
            <div className="col-span-full py-16 text-center border-2 border-dashed rounded-2xl bg-muted/10">
              <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold mb-2">No certificates yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Complete courses and pass the final quizzes to earn recognized certificates in sustainability.
              </p>
              <Button asChild>
                <Link href="/courses">Browse Courses</Link>
              </Button>
            </div>
          ) : (
            certificates?.map((cert) => (
              <div key={cert.id} className="bg-card border rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col relative">
                <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-primary to-secondary" />
                <div className="p-6 flex-1 flex flex-col items-center text-center mt-2">
                  <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                    <Award className="h-10 w-10" />
                  </div>
                  <h3 className="font-bold font-serif text-lg mb-1">{cert.courseName}</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Issued: {format(new Date(cert.issuedAt), 'MMMM d, yyyy')}
                  </p>
                  
                  <div className="mt-auto w-full pt-6 border-t flex flex-col gap-3">
                    <div className="flex items-center justify-center gap-2 text-xs font-mono text-muted-foreground bg-muted p-2 rounded">
                      <CheckCircle className="h-3 w-3" /> ID: {cert.uniqueCode}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" asChild>
                        <a href={`/api/certificates/${cert.id}/pdf`} target="_blank" rel="noopener noreferrer">
                          <Download className="mr-2 h-4 w-4" /> PDF
                        </a>
                      </Button>
                      <Button variant="outline" className="flex-1" asChild>
                        <Link href={`/certificates/verify/${cert.uniqueCode}`}>
                          <ExternalLink className="mr-2 h-4 w-4" /> Verify
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}