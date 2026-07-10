import { useMemo, useState, type FormEvent } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Download,
  Filter,
  Leaf,
  Recycle,
  Scale,
  Send,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  useCompanyRecyclingSummary,
  useSubmitRecyclingEnquiry,
  type RecyclingCollection,
} from "@/lib/recycling-api";

const MATERIALS = [
  { key: "paperCardboardKg", label: "Paper/cardboard" },
  { key: "plasticKg", label: "Plastic" },
  { key: "glassKg", label: "Glass" },
  { key: "aluminiumMetalKg", label: "Aluminium/metal" },
  { key: "otherKg", label: "Other" },
] as const;

function fmtKg(value: number): string {
  return `${value.toLocaleString("en-GB", { maximumFractionDigits: 3 })} kg`;
}

function fmtDate(value: string | null | undefined): string {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function csvValue(value: unknown): string {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function collectionToCsv(row: RecyclingCollection) {
  return [
    row.reportingMonth,
    fmtDate(row.collectionDate),
    row.siteName,
    row.paperCardboardKg,
    row.plasticKg,
    row.glassKg,
    row.aluminiumMetalKg,
    row.otherKg,
    row.totalKg,
  ];
}

export default function CompanyRecycling() {
  const { toast } = useToast();
  const [fromMonth, setFromMonth] = useState("");
  const [toMonth, setToMonth] = useState("");
  const [site, setSite] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [siteLocation, setSiteLocation] = useState("");
  const [currentArrangement, setCurrentArrangement] = useState("");
  const [message, setMessage] = useState("");

  const filters = useMemo(
    () => ({
      fromMonth: fromMonth || undefined,
      toMonth: toMonth || undefined,
      site: site.trim() || undefined,
    }),
    [fromMonth, toMonth, site],
  );
  const { data, isLoading, isError, error } = useCompanyRecyclingSummary(filters);
  const submitEnquiry = useSubmitRecyclingEnquiry();
  const isActive = data?.profile.recyclingServiceStatus === "ACTIVE_CLIENT";

  const exportCsv = () => {
    if (!data) return;
    const summaryRows = [
      ["Generated", new Date(data.generatedAt).toISOString()],
      ["Company", data.profile.name],
      ["Service status", data.profile.recyclingServiceStatus],
      ["Period total kg", data.period.totalKg],
      ["Collections count", data.period.collectionsCount],
      ["Latest collection", fmtDate(data.period.latestCollectionDate)],
      ...MATERIALS.map((material) => [
        `${material.label} kg`,
        data.period.materialTotals[material.key],
      ]),
      [],
    ];
    const header = [
      "Reporting month",
      "Collection date",
      "Site",
      "Paper/cardboard kg",
      "Plastic kg",
      "Glass kg",
      "Aluminium/metal kg",
      "Other kg",
      "Total kg",
    ];
    const csv = [...summaryRows, header, ...data.records.map(collectionToCsv)]
      .map((line) => line.map(csvValue).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ecolearn-recycling-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleEnquirySubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!contactName.trim() || !email.trim()) {
      toast({
        title: "Missing details",
        description: "Please add a contact name and email.",
        variant: "destructive",
      });
      return;
    }
    submitEnquiry.mutate(
      {
        contactName: contactName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        siteLocation: siteLocation.trim() || undefined,
        currentArrangement: currentArrangement.trim() || undefined,
        message: message.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast({
            title: "Enquiry sent",
            description: "The EcoLearnHub team can now follow up from the admin panel.",
          });
          setContactName("");
          setEmail("");
          setPhone("");
          setSiteLocation("");
          setCurrentArrangement("");
          setMessage("");
        },
        onError: (err) =>
          toast({
            title: "Could not send enquiry",
            description:
              err instanceof Error ? err.message : "Please try again.",
            variant: "destructive",
          }),
      },
    );
  };

  return (
    <Layout>
      <div className="bg-primary/5 border-b py-8">
        <div className="container mx-auto px-4">
          <Link href="/company" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to overview
          </Link>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
                <Recycle className="h-4 w-4" />
                Recyclean service data
              </div>
              <h1 className="text-3xl font-bold font-serif mb-2">
                Recycling Impact
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                Verified collection weights for company reporting. Any
                environmental equivalents are hidden unless a sourced conversion
                factor is configured.
              </p>
            </div>
            <Button onClick={exportCsv} disabled={!data?.records.length || !isActive}>
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : isError ? (
          <div className="bg-card border rounded-xl p-8 text-center">
            <Recycle className="h-10 w-10 mx-auto text-amber-600 mb-3" />
            <h2 className="text-xl font-bold font-serif mb-2">
              Recycling data is unavailable
            </h2>
            <p className="text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "Please try again later."}
            </p>
          </div>
        ) : data && !isActive ? (
          <div className="grid lg:grid-cols-[1fr_420px] gap-6">
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Leaf className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold font-serif mb-3">
                Turn sustainability learning into measurable action
              </h2>
              <p className="text-muted-foreground mb-5">
                Recyclean collection clients can track verified recycling
                volumes, material breakdowns, monthly trends, and exportable
                reporting data inside EcoLearnHub.
              </p>
              <div className="grid sm:grid-cols-3 gap-3">
                {["Verified kg records", "Monthly trend reports", "Material-level exports"].map((item) => (
                  <div key={item} className="rounded-lg border p-4">
                    <CheckCircle2 className="h-5 w-5 text-primary mb-2" />
                    <p className="text-sm font-medium">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <form
              onSubmit={handleEnquirySubmit}
              className="bg-card border rounded-xl p-6 shadow-sm space-y-4"
            >
              <div>
                <h3 className="text-xl font-bold font-serif">
                  Enquire about Recyclean collection
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  This secure request is visible to platform administrators.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="recycling-contact">Contact name</Label>
                <Input
                  id="recycling-contact"
                  value={contactName}
                  onChange={(event) => setContactName(event.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="recycling-email">Work email</Label>
                <Input
                  id="recycling-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.mu"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="recycling-phone">Phone</Label>
                <Input
                  id="recycling-phone"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+230 ..."
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="recycling-site">Collection site</Label>
                <Input
                  id="recycling-site"
                  value={siteLocation}
                  onChange={(event) => setSiteLocation(event.target.value)}
                  placeholder="Main office, warehouse, hotel site..."
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="recycling-arrangement">
                  Current recycling arrangement
                </Label>
                <Textarea
                  id="recycling-arrangement"
                  value={currentArrangement}
                  onChange={(event) => setCurrentArrangement(event.target.value)}
                  placeholder="Tell us how collection currently works."
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="recycling-message">Notes</Label>
                <Textarea
                  id="recycling-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Any preferred schedule or material types?"
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitEnquiry.isPending}>
                <Send className="mr-2 h-4 w-4" />
                {submitEnquiry.isPending ? "Sending..." : "Submit enquiry"}
              </Button>
            </form>
          </div>
        ) : data ? (
          <>
            <div className="bg-card border rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold mb-4">
                <Filter className="h-4 w-4 text-primary" />
                Recycling report filters
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="from-month">From month</Label>
                  <Input
                    id="from-month"
                    type="month"
                    value={fromMonth}
                    onChange={(event) => setFromMonth(event.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="to-month">To month</Label>
                  <Input
                    id="to-month"
                    type="month"
                    value={toMonth}
                    onChange={(event) => setToMonth(event.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="site-filter">Site</Label>
                  <Input
                    id="site-filter"
                    value={site}
                    onChange={(event) => setSite(event.target.value)}
                    placeholder="All sites"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-card border rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Scale className="h-4 w-4" />
                  Period total
                </div>
                <div className="text-2xl font-bold">
                  {fmtKg(data.period.totalKg)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.period.collectionsCount} collections
                </p>
              </div>
              <div className="bg-card border rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <CalendarDays className="h-4 w-4" />
                  Latest collection
                </div>
                <div className="text-2xl font-bold">
                  {fmtDate(data.period.latestCollectionDate)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Generated {fmtDate(data.generatedAt)}
                </p>
              </div>
              <div className="bg-card border rounded-xl p-5 shadow-sm">
                <div className="text-sm text-muted-foreground mb-3">
                  Service status
                </div>
                <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/30">
                  Active Recyclean client
                </Badge>
                <p className="text-xs text-muted-foreground mt-3">
                  {data.profile.recyclingServiceFrequency ?? "Frequency not set"}
                </p>
              </div>
            </div>

            <div className="bg-card border rounded-xl p-5 shadow-sm">
              <h2 className="text-xl font-bold font-serif mb-4">
                Material breakdown
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {MATERIALS.map((material) => (
                  <div key={material.key} className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">
                      {material.label}
                    </p>
                    <p className="text-lg font-bold mt-1">
                      {fmtKg(data.period.materialTotals[material.key])}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                {data.equivalents.length
                  ? "Estimated equivalents use configured active conversion factors and display as estimates."
                  : data.equivalentsNote}
              </p>
            </div>

            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Site</TableHead>
                      <TableHead>Month</TableHead>
                      <TableHead>Paper/Cardboard</TableHead>
                      <TableHead>Plastic</TableHead>
                      <TableHead>Glass</TableHead>
                      <TableHead>Aluminium/Metal</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.records.length ? (
                      data.records.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{fmtDate(record.collectionDate)}</TableCell>
                          <TableCell className="font-medium min-w-[180px]">
                            {record.siteName}
                          </TableCell>
                          <TableCell>{record.reportingMonth}</TableCell>
                          <TableCell>{fmtKg(record.paperCardboardKg)}</TableCell>
                          <TableCell>{fmtKg(record.plasticKg)}</TableCell>
                          <TableCell>{fmtKg(record.glassKg)}</TableCell>
                          <TableCell>{fmtKg(record.aluminiumMetalKg)}</TableCell>
                          <TableCell className="font-semibold">
                            {fmtKg(record.totalKg)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                          No recycling collection records match these filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </Layout>
  );
}
