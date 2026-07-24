import { Layout } from "@/components/layout/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { ArrowRight, Scale, ArrowLeft, Filter, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";

interface MauritiusResource {
  id: number;
  title: string;
  slug: string;
  resourceType: string;
  shortSummary: string;
  officialName?: string;
  resourceNumber?: string;
  responsibleAuthority?: string;
  relevantSector?: string;
  legalStatus?: string;
}

export default function MauritiusResourcesList() {
  const [resources, setResources] = useState<MauritiusResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedAuthority, setSelectedAuthority] = useState("");

  useEffect(() => {
    let url = "/api/insights/mauritius-resources?";
    if (selectedType) url += `resourceType=${encodeURIComponent(selectedType)}&`;
    if (selectedSector) url += `sector=${encodeURIComponent(selectedSector)}&`;
    if (selectedAuthority) url += `authority=${encodeURIComponent(selectedAuthority)}&`;

    setIsLoading(true);
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setResources(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load resources", err);
        setIsLoading(false);
      });
  }, [selectedType, selectedSector, selectedAuthority]);

  const resourceTypes = [
    "Act",
    "Regulation",
    "Rule",
    "Policy",
    "Government guideline",
    "Code",
    "Official notice",
    "Authority",
    "Compliance resource"
  ];

  const sectors = [
    "Waste",
    "Energy",
    "Water",
    "Biodiversity",
    "Pollution",
    "Climate",
    "Workplace",
    "Procurement",
    "ESG",
    "General environmental compliance"
  ];

  const authorities = [
    "Ministry of Environment, Solid Waste Management and Climate Change",
    "Ministry of Environment / Solid Waste Management Division",
    "Ministry of Energy and Public Utilities"
  ];

  return (
    <Layout>
      <div className="bg-primary/5 py-12 border-b">
        <div className="container mx-auto px-4 max-w-5xl">
          <Link href="/insights" className="inline-flex items-center text-sm text-primary font-medium hover:underline mb-4 cursor-pointer">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Insights
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold font-serif mb-4 flex items-center gap-3">
            <Scale className="h-8 w-8 text-primary" /> Mauritius Rules & Resources
          </h1>
          <p className="text-lg text-muted-foreground">
            This is a curated directory of Mauritius sustainability, environmental and ESG rules relevant to organisations. It does not represent every law or regulation in Mauritius.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Filters */}
        <div className="bg-card border rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-2 font-medium mb-4 text-sm text-foreground">
            <Filter className="h-4 w-4 text-primary" /> Filters
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-2">Resource Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
              >
                <option value="">All Types</option>
                {resourceTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-2">Sector</label>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
              >
                <option value="">All Sectors</option>
                {sectors.map((sec) => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-2">Responsible Authority</label>
              <select
                value={selectedAuthority}
                onChange={(e) => setSelectedAuthority(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
              >
                <option value="">All Authorities</option>
                {authorities.map((auth) => (
                  <option key={auth} value={auth}>{auth}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* List Content */}
        {isLoading ? (
          <div className="space-y-6">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="border rounded-2xl p-6 bg-card flex flex-col gap-3">
                <Skeleton className="h-7 w-1/3" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
              </div>
            ))}
          </div>
        ) : resources.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground border rounded-2xl max-w-xl mx-auto bg-muted/20">
            <p className="text-lg font-medium text-foreground mb-1">
              Mauritius-specific laws, regulations and official resources are currently being prepared.
            </p>
            <p className="text-sm">We are preparing new regulatory resources for this section.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {resources.map((res) => (
              <Link key={res.id} href={`/insights/mauritius-resources/${res.slug}`}>
                <div className="group border rounded-2xl p-6 bg-card hover:shadow-sm hover:border-primary/45 transition-all cursor-pointer flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs font-semibold">
                        {res.resourceType}
                      </span>
                      {res.relevantSector && (
                        <span className="bg-secondary/10 text-secondary px-2.5 py-0.5 rounded-full text-xs font-semibold">
                          {res.relevantSector}
                        </span>
                      )}
                      {res.resourceNumber && (
                        <span className="text-xs text-muted-foreground">
                          {res.resourceNumber}
                        </span>
                      )}
                      {res.legalStatus && res.legalStatus !== "active" && (
                        <span className="bg-destructive/10 text-destructive border border-destructive/20 px-2 py-0.5 rounded text-[10px] font-semibold uppercase">
                          {res.legalStatus}
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold font-serif mb-2 group-hover:text-primary transition-colors">
                      {res.title}
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                      {res.shortSummary}
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-between items-center mt-2 border-t pt-4 text-xs text-muted-foreground">
                    <div>
                      {res.responsibleAuthority && (
                        <span>Authority: <strong className="text-foreground">{res.responsibleAuthority}</strong></span>
                      )}
                    </div>
                    <div className="text-primary font-medium flex items-center group-hover:underline text-sm mt-2 sm:mt-0">
                      View details <ArrowRight className="ml-1 h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
