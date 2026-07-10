import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/react";
import { Link } from "wouter";
import {
  ArrowLeft,
  Edit,
  Filter,
  Loader2,
  Plus,
  Recycle,
  Save,
  Search,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  useAdminRecyclingCompanies,
  useAdminRecyclingEnquiries,
  useAdminRecyclingRecords,
  useAdminRecyclingSummary,
  useCreateRecyclingRecord,
  useDeleteRecyclingRecord,
  useUpdateRecyclingRecord,
  useUpdateRecyclingService,
  type RecyclingCollection,
  type RecyclingCollectionInput,
  type RecyclingServiceInput,
  type RecyclingServiceStatus,
} from "@/lib/recycling-api";

const SERVICE_STATUSES: { value: RecyclingServiceStatus; label: string }[] = [
  { value: "NOT_CLIENT", label: "Not client" },
  { value: "ACTIVE_CLIENT", label: "Active client" },
  { value: "PAUSED", label: "Paused" },
  { value: "FORMER_CLIENT", label: "Former client" },
];

const MATERIAL_FIELDS = [
  { key: "paperCardboardKg", label: "Paper/cardboard kg" },
  { key: "plasticKg", label: "Plastic kg" },
  { key: "glassKg", label: "Glass kg" },
  { key: "aluminiumMetalKg", label: "Aluminium/metal kg" },
  { key: "otherKg", label: "Other kg" },
] as const;

const EMPTY_RECORD: RecyclingCollectionInput = {
  siteName: "",
  collectionDate: "",
  paperCardboardKg: "0",
  plasticKg: "0",
  glassKg: "0",
  aluminiumMetalKg: "0",
  otherKg: "0",
  internalComment: "",
};

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

function toInputDate(value: string): string {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

export default function AdminRecycling() {
  const { user, isLoaded } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const role = user?.publicMetadata?.role;
  const isPlatformAdmin = role === "super_admin" || role === "platform_admin";

  const [search, setSearch] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [month, setMonth] = useState("");
  const [site, setSite] = useState("");
  const [editingRecordId, setEditingRecordId] = useState<number | null>(null);
  const [deleteRecordId, setDeleteRecordId] = useState<number | null>(null);
  const [serviceForm, setServiceForm] = useState<RecyclingServiceInput>({
    recyclingServiceStatus: "NOT_CLIENT",
  });
  const [recordForm, setRecordForm] = useState<RecyclingCollectionInput>(EMPTY_RECORD);

  const { data: companies, isLoading: isLoadingCompanies } =
    useAdminRecyclingCompanies(search);
  const selectedCompany = useMemo(
    () => companies?.find((company) => company.id === selectedCompanyId) ?? null,
    [companies, selectedCompanyId],
  );
  const filters = useMemo(
    () => ({
      month: month || undefined,
      site: site.trim() || undefined,
    }),
    [month, site],
  );
  const { data: summary, isLoading: isLoadingSummary } =
    useAdminRecyclingSummary(selectedCompanyId, filters);
  const { data: records, isLoading: isLoadingRecords } =
    useAdminRecyclingRecords(selectedCompanyId, filters);
  const { data: enquiries } = useAdminRecyclingEnquiries();
  const updateService = useUpdateRecyclingService();
  const createRecord = useCreateRecyclingRecord();
  const updateRecord = useUpdateRecyclingRecord();
  const deleteRecord = useDeleteRecyclingRecord();

  useEffect(() => {
    if (!selectedCompanyId && companies?.length) {
      setSelectedCompanyId(companies[0].id);
    }
  }, [companies, selectedCompanyId]);

  useEffect(() => {
    if (!selectedCompany) return;
    setServiceForm({
      recyclingServiceStatus: selectedCompany.recyclingServiceStatus,
      recycleanCustomerRef: selectedCompany.recycleanCustomerRef ?? "",
      recyclingServiceStartDate: selectedCompany.recyclingServiceStartDate
        ? selectedCompany.recyclingServiceStartDate.slice(0, 10)
        : "",
      defaultCollectionSiteName: selectedCompany.defaultCollectionSiteName ?? "",
      recyclingServiceFrequency: selectedCompany.recyclingServiceFrequency ?? "",
      recyclingInternalNotes: selectedCompany.recyclingInternalNotes ?? "",
    });
    setRecordForm((current) => ({
      ...current,
      siteName:
        current.siteName || selectedCompany.defaultCollectionSiteName || "",
    }));
  }, [selectedCompany]);

  if (isLoaded && !isPlatformAdmin) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 max-w-md text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-rose-100 flex items-center justify-center mb-4">
            <ShieldAlert className="h-6 w-6 text-rose-600" />
          </div>
          <h1 className="text-2xl font-bold font-serif mb-2">
            Restricted area
          </h1>
          <p className="text-muted-foreground mb-6">
            Recyclean collection records are managed by platform administrators
            only.
          </p>
          <Link
            href="/company"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Go to company dashboard
          </Link>
        </div>
      </Layout>
    );
  }

  const invalidateRecycling = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-recycling-companies"] });
    queryClient.invalidateQueries({ queryKey: ["admin-recycling-summary"] });
    queryClient.invalidateQueries({ queryKey: ["admin-recycling-records"] });
    queryClient.invalidateQueries({ queryKey: ["company-recycling-summary"] });
  };

  const handleServiceSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!selectedCompanyId) return;
    updateService.mutate(
      {
        companyId: selectedCompanyId,
        data: serviceForm,
      },
      {
        onSuccess: () => {
          invalidateRecycling();
          toast({
            title: "Recyclean service updated",
            description: "The company service status is saved.",
          });
        },
        onError: (err) =>
          toast({
            title: "Could not update service",
            description:
              err instanceof Error ? err.message : "Please try again.",
            variant: "destructive",
          }),
      },
    );
  };

  const handleRecordSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!selectedCompanyId) return;
    const callbacks = {
      onSuccess: () => {
        invalidateRecycling();
        setEditingRecordId(null);
        setRecordForm({
          ...EMPTY_RECORD,
          siteName: selectedCompany?.defaultCollectionSiteName ?? "",
        });
        toast({
          title: editingRecordId ? "Collection updated" : "Collection added",
          description: "Totals were calculated from the material weights.",
        });
      },
      onError: (err: unknown) =>
        toast({
          title: "Could not save collection",
          description: err instanceof Error ? err.message : "Please try again.",
          variant: "destructive",
        }),
    };

    if (editingRecordId) {
      updateRecord.mutate(
        { recordId: editingRecordId, data: recordForm },
        callbacks,
      );
    } else {
      createRecord.mutate(
        { companyId: selectedCompanyId, data: recordForm },
        callbacks,
      );
    }
  };

  const startEdit = (record: RecyclingCollection) => {
    setEditingRecordId(record.id);
    setRecordForm({
      siteName: record.siteName,
      collectionDate: toInputDate(record.collectionDate),
      reportingMonth: record.reportingMonth,
      paperCardboardKg: String(record.paperCardboardKg),
      plasticKg: String(record.plasticKg),
      glassKg: String(record.glassKg),
      aluminiumMetalKg: String(record.aluminiumMetalKg),
      otherKg: String(record.otherKg),
      internalComment: record.internalComment ?? "",
    });
  };

  const confirmDelete = () => {
    if (!deleteRecordId) return;
    deleteRecord.mutate(deleteRecordId, {
      onSuccess: () => {
        invalidateRecycling();
        setDeleteRecordId(null);
        toast({
          title: "Collection deleted",
          description: "The recycling collection record was removed.",
        });
      },
      onError: (err) =>
        toast({
          title: "Could not delete collection",
          description: err instanceof Error ? err.message : "Please try again.",
          variant: "destructive",
        }),
    });
  };

  return (
    <Layout>
      <div className="bg-primary/5 border-b py-8">
        <div className="container mx-auto px-4">
          <Link href="/admin" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to admin
          </Link>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
                <Recycle className="h-4 w-4" />
                Platform administration
              </div>
              <h1 className="text-3xl font-bold font-serif mb-2">
                Recyclean Collections
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                Manage company service status and verified collection records.
                Environmental equivalents stay blank until sourced conversion
                factors are configured.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 grid xl:grid-cols-[320px_1fr] gap-6">
        <aside className="space-y-4">
          <div className="bg-card border rounded-xl p-4 shadow-sm">
            <Label htmlFor="company-search" className="text-sm font-semibold">
              Company
            </Label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="company-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-9"
                placeholder="Search company or ref"
              />
            </div>
            <div className="mt-4 space-y-2 max-h-[520px] overflow-auto pr-1">
              {isLoadingCompanies ? (
                Array(5)
                  .fill(0)
                  .map((_, index) => <Skeleton key={index} className="h-16 w-full" />)
              ) : companies?.length ? (
                companies.map((company) => (
                  <button
                    key={company.id}
                    type="button"
                    onClick={() => setSelectedCompanyId(company.id)}
                    className={`w-full rounded-lg border p-3 text-left transition-colors ${
                      selectedCompanyId === company.id
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="font-semibold">{company.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {company.recycleanCustomerRef ?? "No Recyclean ref"}
                    </div>
                    <Badge variant="outline" className="mt-2 text-[11px]">
                      {
                        SERVICE_STATUSES.find(
                          (status) => status.value === company.recyclingServiceStatus,
                        )?.label
                      }
                    </Badge>
                  </button>
                ))
              ) : (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  No companies match your search.
                </div>
              )}
            </div>
          </div>

          <div className="bg-card border rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold mb-4">
              <Filter className="h-4 w-4 text-primary" />
              Record filters
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="record-month">Reporting month</Label>
                <Input
                  id="record-month"
                  type="month"
                  value={month}
                  onChange={(event) => setMonth(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="record-site-filter">Site</Label>
                <Input
                  id="record-site-filter"
                  value={site}
                  onChange={(event) => setSite(event.target.value)}
                  placeholder="All sites"
                />
              </div>
            </div>
          </div>
        </aside>

        <main className="space-y-6">
          {selectedCompany ? (
            <>
              <form
                onSubmit={handleServiceSubmit}
                className="bg-card border rounded-xl p-5 shadow-sm"
              >
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-5">
                  <div>
                    <h2 className="text-xl font-bold font-serif">
                      {selectedCompany.name}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Recyclean service profile
                    </p>
                  </div>
                  <Button type="submit" disabled={updateService.isPending}>
                    {updateService.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save service
                  </Button>
                </div>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label>Service status</Label>
                    <Select
                      value={serviceForm.recyclingServiceStatus}
                      onValueChange={(value) =>
                        setServiceForm((current) => ({
                          ...current,
                          recyclingServiceStatus: value as RecyclingServiceStatus,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICE_STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="customer-ref">Customer ref</Label>
                    <Input
                      id="customer-ref"
                      value={serviceForm.recycleanCustomerRef ?? ""}
                      onChange={(event) =>
                        setServiceForm((current) => ({
                          ...current,
                          recycleanCustomerRef: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="service-start">Service start</Label>
                    <Input
                      id="service-start"
                      type="date"
                      value={serviceForm.recyclingServiceStartDate ?? ""}
                      onChange={(event) =>
                        setServiceForm((current) => ({
                          ...current,
                          recyclingServiceStartDate: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="default-site">Default site</Label>
                    <Input
                      id="default-site"
                      value={serviceForm.defaultCollectionSiteName ?? ""}
                      onChange={(event) =>
                        setServiceForm((current) => ({
                          ...current,
                          defaultCollectionSiteName: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="frequency">Collection frequency</Label>
                    <Input
                      id="frequency"
                      value={serviceForm.recyclingServiceFrequency ?? ""}
                      onChange={(event) =>
                        setServiceForm((current) => ({
                          ...current,
                          recyclingServiceFrequency: event.target.value,
                        }))
                      }
                      placeholder="Monthly, weekly..."
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2 xl:col-span-1">
                    <Label htmlFor="internal-notes">Internal notes</Label>
                    <Textarea
                      id="internal-notes"
                      value={serviceForm.recyclingInternalNotes ?? ""}
                      onChange={(event) =>
                        setServiceForm((current) => ({
                          ...current,
                          recyclingInternalNotes: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </form>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-card border rounded-xl p-5 shadow-sm">
                  <p className="text-sm text-muted-foreground">Period total</p>
                  <p className="text-2xl font-bold mt-1">
                    {isLoadingSummary
                      ? "..."
                      : fmtKg(summary?.period.totalKg ?? 0)}
                  </p>
                </div>
                <div className="bg-card border rounded-xl p-5 shadow-sm">
                  <p className="text-sm text-muted-foreground">Collections</p>
                  <p className="text-2xl font-bold mt-1">
                    {summary?.period.collectionsCount ?? 0}
                  </p>
                </div>
                <div className="bg-card border rounded-xl p-5 shadow-sm">
                  <p className="text-sm text-muted-foreground">Latest</p>
                  <p className="text-2xl font-bold mt-1">
                    {fmtDate(summary?.period.latestCollectionDate)}
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleRecordSubmit}
                className="bg-card border rounded-xl p-5 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                  <div>
                    <h2 className="text-xl font-bold font-serif">
                      {editingRecordId ? "Edit collection" : "Add collection"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Enter verified material weights. Total kg is calculated by
                      the server.
                    </p>
                  </div>
                  {editingRecordId && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingRecordId(null);
                        setRecordForm({
                          ...EMPTY_RECORD,
                          siteName:
                            selectedCompany.defaultCollectionSiteName ?? "",
                        });
                      }}
                    >
                      Cancel edit
                    </Button>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="collection-site">Site</Label>
                    <Input
                      id="collection-site"
                      value={recordForm.siteName}
                      onChange={(event) =>
                        setRecordForm((current) => ({
                          ...current,
                          siteName: event.target.value,
                        }))
                      }
                      placeholder="Ferney"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="collection-date">Collection date</Label>
                    <Input
                      id="collection-date"
                      type="date"
                      value={recordForm.collectionDate}
                      onChange={(event) =>
                        setRecordForm((current) => ({
                          ...current,
                          collectionDate: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reporting-month">Reporting month</Label>
                    <Input
                      id="reporting-month"
                      type="month"
                      value={recordForm.reportingMonth ?? ""}
                      onChange={(event) =>
                        setRecordForm((current) => ({
                          ...current,
                          reportingMonth: event.target.value || undefined,
                        }))
                      }
                    />
                  </div>
                  {MATERIAL_FIELDS.map((field) => (
                    <div key={field.key} className="space-y-1.5">
                      <Label htmlFor={field.key}>{field.label}</Label>
                      <Input
                        id={field.key}
                        inputMode="decimal"
                        value={recordForm[field.key]}
                        onChange={(event) =>
                          setRecordForm((current) => ({
                            ...current,
                            [field.key]: event.target.value,
                          }))
                        }
                      />
                    </div>
                  ))}
                  <div className="space-y-1.5 sm:col-span-2 lg:col-span-4">
                    <Label htmlFor="collection-comment">Internal comment</Label>
                    <Textarea
                      id="collection-comment"
                      value={recordForm.internalComment ?? ""}
                      onChange={(event) =>
                        setRecordForm((current) => ({
                          ...current,
                          internalComment: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="mt-5 flex justify-end">
                  <Button
                    type="submit"
                    disabled={createRecord.isPending || updateRecord.isPending}
                  >
                    {createRecord.isPending || updateRecord.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    {editingRecordId ? "Update collection" : "Add collection"}
                  </Button>
                </div>
              </form>

              <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Site</TableHead>
                        <TableHead>Month</TableHead>
                        <TableHead>Plastic</TableHead>
                        <TableHead>Glass</TableHead>
                        <TableHead>Paper/Cardboard</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingRecords ? (
                        Array(5)
                          .fill(0)
                          .map((_, index) => (
                            <TableRow key={index}>
                              <TableCell colSpan={8}>
                                <Skeleton className="h-6 w-full" />
                              </TableCell>
                            </TableRow>
                          ))
                      ) : records?.length ? (
                        records.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{fmtDate(record.collectionDate)}</TableCell>
                            <TableCell className="font-medium min-w-[160px]">
                              {record.siteName}
                            </TableCell>
                            <TableCell>{record.reportingMonth}</TableCell>
                            <TableCell>{fmtKg(record.plasticKg)}</TableCell>
                            <TableCell>{fmtKg(record.glassKg)}</TableCell>
                            <TableCell>{fmtKg(record.paperCardboardKg)}</TableCell>
                            <TableCell className="font-semibold">
                              {fmtKg(record.totalKg)}
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-2">
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="outline"
                                  onClick={() => startEdit(record)}
                                  aria-label="Edit collection"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="outline"
                                  onClick={() => setDeleteRecordId(record.id)}
                                  aria-label="Delete collection"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                            No collection records yet for this company and
                            filter.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="bg-card border rounded-xl p-5 shadow-sm">
                <h2 className="text-xl font-bold font-serif mb-4">
                  Collection enquiries
                </h2>
                {enquiries?.length ? (
                  <div className="divide-y">
                    {enquiries.slice(0, 8).map((enquiry) => (
                      <div key={enquiry.id} className="py-3 first:pt-0 last:pb-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <div>
                            <p className="font-medium">
                              {enquiry.companyName} • {enquiry.contactName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {enquiry.email}
                              {enquiry.phone ? ` • ${enquiry.phone}` : ""}
                            </p>
                          </div>
                          <Badge variant="outline">{enquiry.status}</Badge>
                        </div>
                        {enquiry.message && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {enquiry.message}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                    No Recyclean enquiries have been submitted yet.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-card border rounded-xl p-10 text-center text-muted-foreground">
              Select a company to manage Recyclean records.
            </div>
          )}
        </main>
      </div>

      <AlertDialog open={Boolean(deleteRecordId)} onOpenChange={(open) => !open && setDeleteRecordId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete collection record?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the verified recycling collection entry from the
              company account. The action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete record
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
