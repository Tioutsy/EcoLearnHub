import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { PlatformAdminLayout } from "@/components/layout/PlatformAdminLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Plus,
  Search,
  Key,
  Copy,
  Check,
  Calendar,
  Users,
  ShieldCheck,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  XCircle,
  Building2,
  BookOpen,
  TrendingUp,
  CheckCircle2,
  DollarSign,
  CreditCard,
  FileText,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PilotPassItem {
  id: number;
  maskedCode: string;
  codeLastFour: string;
  companyName: string;
  intendedContactName: string;
  intendedContactEmail: string;
  intendedEmailDomain?: string;
  status: "issued" | "active" | "expired" | "revoked" | "converted";
  durationDays: number;
  learnerSeatLimit: number;
  administratorSeatLimit: number;
  permittedCourseIds: number[];
  internalSalesNote?: string;
  startsAt?: string;
  expiresAt?: string;
  retentionEndsAt?: string;
  redeemedAt?: string;
  companyId?: number;
  createdAt: string;
  activeLearnerCount: number;
  reservedSeatsCount: number;
  daysRemaining: number;
  isExpired: boolean;
}

interface CourseItem {
  id: number;
  title: string;
  courseCode?: string;
  isPublished: boolean;
}

export default function PlatformAdminPilotPasses() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [emailDomain, setEmailDomain] = useState("");
  const [durationDays, setDurationDays] = useState(30);
  const [learnerSeats, setLearnerSeats] = useState(10);
  const [adminSeats, setAdminSeats] = useState(1);
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);
  const [salesNote, setSalesNote] = useState("");

  // Reveal Modal State
  const [revealData, setRevealData] = useState<{ fullCode: string; maskedCode: string; companyName: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Extend Modal State
  const [extendingPass, setExtendingPass] = useState<PilotPassItem | null>(null);
  const [extendDays, setExtendDays] = useState(14);
  const [extendReason, setExtendReason] = useState("");

  // Revoke Modal State
  const [revokingPass, setRevokingPass] = useState<PilotPassItem | null>(null);
  const [revokeReason, setRevokeReason] = useState("");

  // Convert Modal State
  const [convertingPass, setConvertingPass] = useState<PilotPassItem | null>(null);
  const [convertPlan, setConvertPlan] = useState("COMPLETE");
  const [convertBand, setConvertBand] = useState("UP_TO_25");

  // Sprint 12.3: Insights Drawer State
  const [insightsPassId, setInsightsPassId] = useState<number | null>(null);

  // Sprint 12.3: Commercial Payment Confirmation Modal State
  const [paymentModalRequest, setPaymentModalRequest] = useState<any | null>(null);
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentAmountMUR, setPaymentAmountMUR] = useState(1950);
  const [paymentMethod, setPaymentMethod] = useState("MANUAL_INVOICE");
  const [paymentInternalNote, setPaymentInternalNote] = useState("");

  // Fetch Pilot Passes
  const { data: passes, isLoading } = useQuery<PilotPassItem[]>({
    queryKey: ["/api/platform-admin/pilot-passes"],
    queryFn: () => customFetch<PilotPassItem[]>("/api/platform-admin/pilot-passes"),
  });

  // Fetch Courses for selection
  const { data: courses } = useQuery<CourseItem[]>({
    queryKey: ["/api/courses"],
    queryFn: () => customFetch<CourseItem[]>("/api/courses"),
  });

  // Fetch Upgrade Requests (Sprint 12.3 Phase 3)
  const { data: upgradeRequests, isLoading: isLoadingUpgradeRequests } = useQuery<any[]>({
    queryKey: ["/api/platform-admin/upgrade-requests"],
    queryFn: () => customFetch<any[]>("/api/platform-admin/upgrade-requests"),
  });

  // Fetch Engagement Insights (Sprint 12.3 Phase 4)
  const { data: insightsData, isLoading: isLoadingInsights } = useQuery<any>({
    queryKey: ["/api/platform-admin/pilot-passes/insights", insightsPassId],
    queryFn: () => customFetch<any>(`/api/platform-admin/pilot-passes/${insightsPassId}/insights`),
    enabled: Boolean(insightsPassId),
  });

  // Mark Awaiting Payment Mutation
  const markAwaitingPaymentMutation = useMutation({
    mutationFn: (id: number) =>
      customFetch(`/api/platform-admin/upgrade-requests/${id}/mark-awaiting-payment`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/platform-admin/upgrade-requests"] });
      toast.success("Upgrade request marked awaiting payment");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update request");
    },
  });

  // Confirm Payment Mutation
  const confirmPaymentMutation = useMutation({
    mutationFn: (data: any) =>
      customFetch(`/api/platform-admin/upgrade-requests/${data.id}/confirm-payment`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/platform-admin/upgrade-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/platform-admin/pilot-passes"] });
      setPaymentModalRequest(null);
      setPaymentReference("");
      setPaymentInternalNote("");
      toast.success("Payment recorded manually! Request is now authorized for conversion.");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to confirm payment");
    },
  });

  // Convert Upgrade Request Mutation
  const convertUpgradeRequestMutation = useMutation({
    mutationFn: (id: number) =>
      customFetch(`/api/platform-admin/upgrade-requests/${id}/convert`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/platform-admin/upgrade-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/platform-admin/pilot-passes"] });
      toast.success("Company converted to paid commercial subscription successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to convert upgrade request");
    },
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (data: any) =>
      customFetch<{ pilotPass: PilotPassItem; fullCode: string }>("/api/platform-admin/pilot-passes", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["/api/platform-admin/pilot-passes"] });
      setIsCreateOpen(false);
      // Reset form
      setCompanyName("");
      setContactName("");
      setContactEmail("");
      setEmailDomain("");
      setDurationDays(30);
      setLearnerSeats(10);
      setSelectedCourseIds([]);
      setSalesNote("");

      // Open One-Time Reveal Modal
      setRevealData({
        fullCode: res.fullCode,
        maskedCode: res.pilotPass.maskedCode,
        companyName: res.pilotPass.companyName,
      });
      toast.success("Pilot pass created successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create pilot pass");
    },
  });

  // Extend Mutation
  const extendMutation = useMutation({
    mutationFn: ({ id, additionalDays, reason }: { id: number; additionalDays: number; reason: string }) =>
      customFetch(`/api/platform-admin/pilot-passes/${id}/extend`, {
        method: "POST",
        body: JSON.stringify({ additionalDays, reason }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/platform-admin/pilot-passes"] });
      setExtendingPass(null);
      setExtendReason("");
      toast.success("Pilot duration extended successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to extend pilot pass");
    },
  });

  // Revoke Mutation
  const revokeMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      customFetch(`/api/platform-admin/pilot-passes/${id}/revoke`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/platform-admin/pilot-passes"] });
      setRevokingPass(null);
      setRevokeReason("");
      toast.success("Pilot pass revoked successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to revoke pilot pass");
    },
  });

  // Convert Mutation
  const convertMutation = useMutation({
    mutationFn: ({ id, planCode, employeeBandCode }: { id: number; planCode: string; employeeBandCode: string }) =>
      customFetch(`/api/platform-admin/pilot-passes/${id}/convert`, {
        method: "POST",
        body: JSON.stringify({ planCode, employeeBandCode }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/platform-admin/pilot-passes"] });
      setConvertingPass(null);
      toast.success("Company converted to paid subscription successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to convert pilot to paid subscription");
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !contactName.trim() || !contactEmail.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    createMutation.mutate({
      companyName,
      intendedContactName: contactName,
      intendedContactEmail: contactEmail,
      intendedEmailDomain: emailDomain || undefined,
      durationDays,
      learnerSeatLimit: learnerSeats,
      administratorSeatLimit: adminSeats,
      permittedCourseIds: selectedCourseIds,
      internalSalesNote: salesNote || undefined,
    });
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Pilot pass code copied to clipboard!");
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error("Failed to copy code to clipboard");
    }
  };

  // Filter passes
  const filteredPasses = (passes || []).filter((pass) => {
    // Search filter
    const matchesSearch =
      pass.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pass.intendedContactEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pass.intendedContactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pass.codeLastFour.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // Tab filter
    if (activeTab === "all") return true;
    if (activeTab === "issued") return pass.status === "issued";
    if (activeTab === "active") return pass.status === "active" && !pass.isExpired;
    if (activeTab === "expiring_soon") return pass.status === "active" && pass.daysRemaining <= 7 && pass.daysRemaining > 0;
    if (activeTab === "expired") return pass.status === "expired" || (pass.status === "active" && pass.isExpired);
    if (activeTab === "revoked") return pass.status === "revoked";
    if (activeTab === "converted") return pass.status === "converted";
    return true;
  });

  // Calculate Metrics
  const totalCount = passes?.length || 0;
  const activeCount = passes?.filter((p) => p.status === "active" && !p.isExpired).length || 0;
  const convertedCount = passes?.filter((p) => p.status === "converted").length || 0;
  const totalSeatsAllocated = passes?.reduce((sum, p) => sum + (p.status === "active" ? p.learnerSeatLimit : 0), 0) || 0;
  const totalSeatsUsed = passes?.reduce((sum, p) => sum + (p.status === "active" ? p.activeLearnerCount : 0), 0) || 0;

  return (
    <PlatformAdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold font-serif">Controlled Company Pilot Passes</h2>
            <p className="text-muted-foreground text-sm">
              Issue single-use, cryptographic pilot passes for prospective companies to test ELEVIO Skills free of charge.
            </p>
          </div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" /> Issue Pilot Pass
          </Button>
        </div>

        {/* Metrics Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Passes</div>
              <div className="text-2xl font-bold text-foreground mt-1">{isLoading ? <Skeleton className="h-8 w-12" /> : totalCount}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Created across platform</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Pilots</div>
              <div className="text-2xl font-bold text-emerald-700 mt-1">{isLoading ? <Skeleton className="h-8 w-12" /> : activeCount}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Currently testing LMS</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Learner Seats Active</div>
              <div className="text-2xl font-bold text-primary mt-1">
                {isLoading ? <Skeleton className="h-8 w-16" /> : `${totalSeatsUsed} / ${totalSeatsAllocated}`}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">Seats utilized by pilots</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Paid Conversions</div>
              <div className="text-2xl font-bold text-emerald-800 mt-1">{isLoading ? <Skeleton className="h-8 w-12" /> : convertedCount}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Upgraded to commercial</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList className="grid grid-cols-4 sm:flex sm:flex-wrap">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="issued">Issued</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="expiring_soon">Expiring Soon</TabsTrigger>
              <TabsTrigger value="expired">Expired</TabsTrigger>
              <TabsTrigger value="revoked">Revoked</TabsTrigger>
              <TabsTrigger value="converted">Converted</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search company, contact, code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>
        </div>

        {/* Pilot Passes Table */}
        <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Reference Code</TableHead>
                  <TableHead>Target Company & Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Seats Used / Limit</TableHead>
                  <TableHead>Duration & Remaining</TableHead>
                  <TableHead>Permitted Courses</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(4).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredPasses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-36 text-center text-muted-foreground">
                      No pilot passes found. Click <strong>Issue Pilot Pass</strong> to create single-use access codes.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPasses.map((pass) => {
                    const isIssued = pass.status === "issued";
                    const isActive = pass.status === "active" && !pass.isExpired;
                    const isExpired = pass.status === "expired" || (pass.status === "active" && pass.isExpired);
                    const isRevoked = pass.status === "revoked";
                    const isConverted = pass.status === "converted";

                    return (
                      <TableRow key={pass.id}>
                        <TableCell>
                          <div className="font-mono text-sm font-semibold text-foreground flex items-center gap-1.5">
                            <Key className="h-3.5 w-3.5 text-emerald-600" />
                            {pass.maskedCode}
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">ID #{pass.id}</div>
                        </TableCell>

                        <TableCell>
                          <div>
                            <div className="font-medium text-foreground">{pass.companyName}</div>
                            <div className="text-xs text-muted-foreground">
                              {pass.intendedContactName} • {pass.intendedContactEmail}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          {isIssued && <Badge variant="outline" className="border-amber-400 text-amber-800 bg-amber-50">Issued (Unredeemed)</Badge>}
                          {isActive && <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">Active Pilot</Badge>}
                          {isExpired && <Badge variant="destructive">Expired (Read-Only)</Badge>}
                          {isRevoked && <Badge variant="outline" className="border-rose-300 text-rose-700 bg-rose-50">Revoked</Badge>}
                          {isConverted && <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white">Converted to Paid</Badge>}
                        </TableCell>

                        <TableCell>
                          <div className="text-sm font-medium">
                            {pass.activeLearnerCount} / {pass.learnerSeatLimit} learners
                          </div>
                          <div className="text-xs text-muted-foreground">
                            (+{pass.administratorSeatLimit} admin seat)
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="text-sm font-medium">
                            {isActive ? `${pass.daysRemaining} days left` : `${pass.durationDays} days total`}
                          </div>
                          {pass.expiresAt && (
                            <div className="text-xs text-muted-foreground">
                              Expires: {new Date(pass.expiresAt).toLocaleDateString()}
                            </div>
                          )}
                        </TableCell>

                        <TableCell>
                          <div className="text-xs text-muted-foreground">
                            {pass.permittedCourseIds?.length ? `${pass.permittedCourseIds.length} Courses Selected` : "Full Catalog (All)"}
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {pass.companyId && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-emerald-600/40 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-xs"
                                onClick={() => setInsightsPassId(pass.id)}
                              >
                                <TrendingUp className="h-3.5 w-3.5 mr-1" />
                                Insights
                              </Button>
                            )}

                            {(isIssued || isActive || isExpired) && !isRevoked && !isConverted && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setExtendingPass(pass);
                                  setExtendDays(14);
                                  setExtendReason("");
                                }}
                              >
                                Extend
                              </Button>
                            )}

                            {isActive && !isConverted && (
                              <Button
                                size="sm"
                                variant="default"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                onClick={() => {
                                  setConvertingPass(pass);
                                  setConvertPlan("COMPLETE");
                                  setConvertBand("UP_TO_25");
                                }}
                              >
                                Convert
                              </Button>
                            )}

                            {!isRevoked && !isConverted && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                onClick={() => {
                                  setRevokingPass(pass);
                                  setRevokeReason("");
                                }}
                              >
                                Revoke
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* ── Sprint 12.3: COMMERCIAL UPGRADE REQUESTS SECTION ──────────────── */}
        <div className="space-y-4 pt-6 border-t">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold font-serif flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-700" />
                Commercial Upgrade Requests & Conversions
              </h3>
              <p className="text-muted-foreground text-sm">
                Review self-serve upgrade requests submitted by pilot companies. Confirm manual payment before executing commercial conversions.
              </p>
            </div>
            <Badge variant="outline" className="font-mono text-xs">
              {upgradeRequests?.length || 0} Total Requests
            </Badge>
          </div>

          <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Requested Plan & Band</TableHead>
                    <TableHead>Billing Contact</TableHead>
                    <TableHead>Requested At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Info</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingUpgradeRequests ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={7}><Skeleton className="h-10 w-full" /></TableCell>
                      </TableRow>
                    ))
                  ) : (!upgradeRequests || upgradeRequests.length === 0) ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No commercial upgrade requests submitted yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    upgradeRequests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-medium">
                          <div className="font-semibold">{req.companyName}</div>
                          <div className="text-xs text-muted-foreground font-mono">Req ID #{req.id}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                            {req.selectedPlanCode}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {req.selectedEmployeeBandCode} · {req.billingInterval}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{req.billingContactName}</div>
                          <div className="text-xs text-muted-foreground">{req.billingContactEmail}</div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {req.requestedAt ? new Date(req.requestedAt).toLocaleString() : "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "font-mono text-xs",
                              req.status === "REQUESTED" && "bg-blue-500/10 text-blue-800 border-blue-500/30",
                              req.status === "AWAITING_PAYMENT" && "bg-amber-500/10 text-amber-800 border-amber-500/30",
                              req.status === "PAYMENT_CONFIRMED" && "bg-emerald-500/10 text-emerald-800 border-emerald-500/30",
                              req.status === "CONVERTED" && "bg-purple-500/10 text-purple-800 border-purple-500/30",
                              req.status === "CANCELLED" && "bg-rose-500/10 text-rose-800 border-rose-500/30"
                            )}
                          >
                            {req.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          {req.paymentReference ? (
                            <div>
                              <div className="font-mono font-semibold">{req.paymentReference}</div>
                              <div className="text-muted-foreground">{req.paymentMethod} {req.paymentAmountMUR ? `· MUR ${req.paymentAmountMUR.toLocaleString()}` : ""}</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic">Not Recorded</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {req.status === "REQUESTED" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs"
                                onClick={() => markAwaitingPaymentMutation.mutate(req.id)}
                                disabled={markAwaitingPaymentMutation.isPending}
                              >
                                Mark Awaiting Payment
                              </Button>
                            )}

                            {(req.status === "REQUESTED" || req.status === "AWAITING_PAYMENT") && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-emerald-600/40 text-emerald-700 hover:bg-emerald-50 text-xs"
                                onClick={() => {
                                  setPaymentModalRequest(req);
                                  setPaymentReference(`INV-${req.companyId}-${Date.now().toString().slice(-4)}`);
                                  setPaymentAmountMUR(1950);
                                  setPaymentDate(new Date().toISOString().split("T")[0]);
                                }}
                              >
                                Record Payment
                              </Button>
                            )}

                            {req.status === "PAYMENT_CONFIRMED" && (
                              <Button
                                size="sm"
                                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold"
                                onClick={() => convertUpgradeRequestMutation.mutate(req.id)}
                                disabled={convertUpgradeRequestMutation.isPending}
                              >
                                Convert to Paid Plan
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* ── CREATE PILOT PASS DIALOG ────────────────────────────────────────── */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">Issue Controlled Company Pilot Pass</DialogTitle>
              <DialogDescription>
                Configure the duration, seat allowance, and permitted courses. A single-use, cryptographic pilot pass code will be generated.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  placeholder="e.g. Acme Corporation"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="contactName">Contact Person *</Label>
                  <Input
                    id="contactName"
                    placeholder="e.g. Sarah Connor"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contactEmail">Contact Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="e.g. s.connor@acme.mu"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="emailDomain">Permitted Email Domain (Optional)</Label>
                <Input
                  id="emailDomain"
                  placeholder="e.g. acme.mu (allows any email @acme.mu to redeem)"
                  value={emailDomain}
                  onChange={(e) => setEmailDomain(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="duration">Duration (Days)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min={1}
                    max={180}
                    value={durationDays}
                    onChange={(e) => setDurationDays(parseInt(e.target.value, 10) || 30)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="learnerSeats">Learner Seats</Label>
                  <Input
                    id="learnerSeats"
                    type="number"
                    min={1}
                    max={100}
                    value={learnerSeats}
                    onChange={(e) => setLearnerSeats(parseInt(e.target.value, 10) || 10)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="adminSeats">Admin Seats</Label>
                  <Input
                    id="adminSeats"
                    type="number"
                    min={1}
                    max={5}
                    value={adminSeats}
                    onChange={(e) => setAdminSeats(parseInt(e.target.value, 10) || 1)}
                  />
                </div>
              </div>

              {/* Permitted Courses Selection */}
              <div className="space-y-2 pt-2 border-t">
                <Label>Permitted Pilot Courses ({selectedCourseIds.length ? `${selectedCourseIds.length} Selected` : "All Courses Included"})</Label>
                <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 rounded-lg border bg-muted/20 text-sm">
                  {courses?.map((c) => (
                    <label key={c.id} className="flex items-center gap-2 cursor-pointer hover:bg-muted/40 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={selectedCourseIds.includes(c.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCourseIds([...selectedCourseIds, c.id]);
                          } else {
                            setSelectedCourseIds(selectedCourseIds.filter((id) => id !== c.id));
                          }
                        }}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="truncate">{c.courseCode ? `[${c.courseCode}] ` : ""}{c.title}</span>
                    </label>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground">Leave unchecked to include the standard full course catalog.</p>
              </div>

              <div className="space-y-1.5 pt-2 border-t">
                <Label htmlFor="salesNote">Internal Sales Note</Label>
                <Textarea
                  id="salesNote"
                  placeholder="e.g. Prospect met at Sustainability Summit 2026. Evaluating for 200-employee rollout."
                  value={salesNote}
                  onChange={(e) => setSalesNote(e.target.value)}
                  rows={2}
                />
              </div>

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending} className="bg-emerald-700 hover:bg-emerald-800 text-white">
                  {createMutation.isPending ? "Generating..." : "Generate Pilot Pass"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ── ONE-TIME REVEAL DIALOG ────────────────────────────────────────── */}
        <Dialog open={Boolean(revealData)} onOpenChange={(open) => !open && setRevealData(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl flex items-center gap-2 text-emerald-800">
                <Key className="h-5 w-5 text-emerald-600" /> Pilot Pass Generated
              </DialogTitle>
              <DialogDescription>
                Share this secure code with <strong>{revealData?.companyName}</strong>.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3">
              <div className="p-4 rounded-xl border bg-emerald-50/70 border-emerald-200 text-center space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-800">Single-Use Pilot Access Code</div>
                <div className="font-mono text-2xl font-bold tracking-wider text-emerald-950 select-all">
                  {revealData?.fullCode}
                </div>
                <Button
                  onClick={() => revealData && handleCopyCode(revealData.fullCode)}
                  className="mt-2 w-full bg-emerald-700 hover:bg-emerald-800 text-white"
                >
                  {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                  {copied ? "Copied to Clipboard!" : "Copy Pilot Pass Code"}
                </Button>
              </div>

              <div className="p-3 rounded-lg border bg-amber-50 border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Important Security Notice:</strong> This full pilot pass code is displayed <strong>only once</strong> and is immediately hashed. It cannot be retrieved again after closing this window.
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                Masked reference: <code className="font-mono font-bold">{revealData?.maskedCode}</code>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={() => setRevealData(null)}>Done & Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── EXTEND PILOT DIALOG ────────────────────────────────────────────── */}
        <Dialog open={Boolean(extendingPass)} onOpenChange={(open) => !open && setExtendingPass(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif text-lg">Extend Pilot Duration</DialogTitle>
              <DialogDescription>
                Grant additional testing days for <strong>{extendingPass?.companyName}</strong>.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="extendDays">Additional Days</Label>
                <Input
                  id="extendDays"
                  type="number"
                  min={1}
                  max={90}
                  value={extendDays}
                  onChange={(e) => setExtendDays(parseInt(e.target.value, 10) || 14)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="extendReason">Extension Reason (Required for Audit Trail) *</Label>
                <Textarea
                  id="extendReason"
                  placeholder="e.g. Customer requested 2 more weeks to complete ESG compliance module review."
                  value={extendReason}
                  onChange={(e) => setExtendReason(e.target.value)}
                  rows={3}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setExtendingPass(null)}>Cancel</Button>
              <Button
                onClick={() => extendingPass && extendMutation.mutate({ id: extendingPass.id, additionalDays: extendDays, reason: extendReason })}
                disabled={!extendReason.trim() || extendMutation.isPending}
                className="bg-emerald-700 hover:bg-emerald-800 text-white"
              >
                {extendMutation.isPending ? "Extending..." : "Confirm Extension"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── REVOKE PILOT DIALOG ────────────────────────────────────────────── */}
        <Dialog open={Boolean(revokingPass)} onOpenChange={(open) => !open && setRevokingPass(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif text-lg text-rose-700">Revoke Pilot Pass</DialogTitle>
              <DialogDescription>
                Revoking will immediately disable course learning access and invitations for <strong>{revokingPass?.companyName}</strong>.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="revokeReason">Revocation Reason (Required for Audit Trail) *</Label>
                <Textarea
                  id="revokeReason"
                  placeholder="e.g. Prospect declined participation or requested immediate cancellation."
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  rows={3}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setRevokingPass(null)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={() => revokingPass && revokeMutation.mutate({ id: revokingPass.id, reason: revokeReason })}
                disabled={!revokeReason.trim() || revokeMutation.isPending}
              >
                {revokeMutation.isPending ? "Revoking..." : "Confirm Revocation"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── CONVERT TO PAID DIALOG ────────────────────────────────────────── */}
        <Dialog open={Boolean(convertingPass)} onOpenChange={(open) => !open && setConvertingPass(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif text-lg text-indigo-900">Convert to Paid Subscription</DialogTitle>
              <DialogDescription>
                Upgrade <strong>{convertingPass?.companyName}</strong> to an active commercial subscription. All existing employees, assignments, progress, and certificates will be 100% preserved.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Commercial Plan</Label>
                <select
                  value={convertPlan}
                  onChange={(e) => setConvertPlan(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm bg-background"
                >
                  <option value="ESSENTIAL">Essential Plan</option>
                  <option value="PROFESSIONAL">Professional Plan</option>
                  <option value="COMPLETE">Complete Corporate Plan</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label>Employee Band</Label>
                <select
                  value={convertBand}
                  onChange={(e) => setConvertBand(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm bg-background"
                >
                  <option value="UP_TO_25">Band 1 (Up to 25 Employees)</option>
                  <option value="FROM_26_TO_50">Band 2 (26–50 Employees)</option>
                  <option value="FROM_51_TO_80">Band 3 (51–80 Employees)</option>
                  <option value="FROM_81_TO_120">Band 4 (81–120 Employees)</option>
                  <option value="OVER_120">Enterprise (Over 120 Employees)</option>
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setConvertingPass(null)}>Cancel</Button>
              <Button
                onClick={() => convertingPass && convertMutation.mutate({ id: convertingPass.id, planCode: convertPlan, employeeBandCode: convertBand })}
                disabled={convertMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {convertMutation.isPending ? "Converting..." : "Upgrade to Paid Plan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Sprint 12.3: ENGAGEMENT & FUNNEL INSIGHTS DIALOG ──────────────── */}
        <Dialog open={Boolean(insightsPassId)} onOpenChange={(open) => !open && setInsightsPassId(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-700" />
                Pilot Engagement & Funnel Insights
              </DialogTitle>
              <DialogDescription>
                Live funnel metrics for <strong>{insightsData?.companyName || "Pilot Company"}</strong>.
              </DialogDescription>
            </DialogHeader>

            {isLoadingInsights ? (
              <div className="space-y-3 py-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-28 w-full" />
              </div>
            ) : insightsData ? (
              <div className="space-y-5 py-2">
                {/* Follow-up Classification Header */}
                <div className="p-4 rounded-xl border bg-muted/30 flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Follow-Up Classification</div>
                    <div className="text-lg font-bold text-foreground mt-0.5">
                      {insightsData.followUpClassification.replace(/_/g, " ")}
                    </div>
                  </div>
                  <Badge
                    className={cn(
                      "font-mono text-xs px-3 py-1",
                      insightsData.followUpClassification === "UPGRADE_REQUESTED" && "bg-purple-500/20 text-purple-900 dark:text-purple-300 border-purple-500/40",
                      insightsData.followUpClassification === "HIGH_ENGAGEMENT" && "bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 border-emerald-500/40",
                      insightsData.followUpClassification === "ENGAGED" && "bg-blue-500/20 text-blue-900 dark:text-blue-300 border-blue-500/40",
                      insightsData.followUpClassification === "LOW_ENGAGEMENT" && "bg-amber-500/20 text-amber-900 dark:text-amber-300 border-amber-500/40",
                      insightsData.followUpClassification === "NOT_STARTED" && "bg-slate-500/20 text-slate-900 dark:text-slate-300 border-slate-500/40"
                    )}
                  >
                    {insightsData.followUpClassification}
                  </Badge>
                </div>

                {/* Funnel Metrics Grid */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl border bg-card shadow-sm">
                    <div className="text-xs text-muted-foreground font-medium">Invited Learners</div>
                    <div className="text-2xl font-bold text-foreground mt-1">{insightsData.invitedLearners}</div>
                  </div>
                  <div className="p-3 rounded-xl border bg-card shadow-sm">
                    <div className="text-xs text-muted-foreground font-medium">Activated Learners</div>
                    <div className="text-2xl font-bold text-emerald-700 mt-1">{insightsData.activatedLearners} / {insightsData.learnerSeatLimit}</div>
                  </div>
                  <div className="p-3 rounded-xl border bg-card shadow-sm">
                    <div className="text-xs text-muted-foreground font-medium">Started Learning</div>
                    <div className="text-2xl font-bold text-blue-700 mt-1">{insightsData.startedLearners}</div>
                  </div>
                  <div className="p-3 rounded-xl border bg-card shadow-sm">
                    <div className="text-xs text-muted-foreground font-medium">Completing Learners</div>
                    <div className="text-2xl font-bold text-indigo-700 mt-1">{insightsData.completingLearners}</div>
                  </div>
                  <div className="p-3 rounded-xl border bg-card shadow-sm">
                    <div className="text-xs text-muted-foreground font-medium">Total Completions</div>
                    <div className="text-2xl font-bold text-purple-700 mt-1">{insightsData.totalCourseCompletions}</div>
                  </div>
                  <div className="p-3 rounded-xl border bg-card shadow-sm">
                    <div className="text-xs text-muted-foreground font-medium">Avg Completion %</div>
                    <div className="text-2xl font-bold text-amber-700 mt-1">{insightsData.averageCompletionPercentage}%</div>
                  </div>
                </div>

                {/* Key Lifecycle Timestamps */}
                <div className="p-3 rounded-xl border bg-card text-xs space-y-1.5 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Contact Administrator:</span>
                    <strong className="text-foreground">{insightsData.companyAdministratorName} ({insightsData.companyAdministratorEmail})</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Pilot Lifecycle State:</span>
                    <strong className="text-foreground font-mono">{insightsData.effectiveStatus}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Meaningful Activity:</span>
                    <strong className="text-foreground">{insightsData.lastMeaningfulActivityAt ? new Date(insightsData.lastMeaningfulActivityAt).toLocaleString() : "None"}</strong>
                  </div>
                  {insightsData.upgradeRequest && (
                    <div className="flex justify-between pt-1 border-t text-purple-800 dark:text-purple-300 font-semibold">
                      <span>Commercial Upgrade Request:</span>
                      <span>Status: {insightsData.upgradeRequest.status} ({insightsData.upgradeRequest.selectedPlanCode})</span>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            <DialogFooter>
              <Button onClick={() => setInsightsPassId(null)}>Close Insights</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Sprint 12.3: RECORD CONFIRMED PAYMENT MODAL ───────────────────── */}
        <Dialog open={Boolean(paymentModalRequest)} onOpenChange={(open) => !open && setPaymentModalRequest(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif text-lg flex items-center gap-2 text-emerald-800">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                Record Confirmed Payment
              </DialogTitle>
              <DialogDescription>
                Record manual bank transfer or invoice settlement for <strong>{paymentModalRequest?.companyName}</strong>.
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!paymentReference.trim()) {
                  toast.error("Payment reference is required");
                  return;
                }
                confirmPaymentMutation.mutate({
                  id: paymentModalRequest.id,
                  paymentReference,
                  paymentDate,
                  amountMUR: paymentAmountMUR,
                  paymentMethod,
                  paymentInternalNote,
                });
              }}
              className="space-y-4 py-2"
            >
              <div className="space-y-1.5">
                <Label htmlFor="paymentRef">Payment Reference / Bank Transfer Ref *</Label>
                <Input
                  id="paymentRef"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="e.g. MCB-FT-8839219"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="paymentAmt">Amount (MUR)</Label>
                  <Input
                    id="paymentAmt"
                    type="number"
                    value={paymentAmountMUR}
                    onChange={(e) => setPaymentAmountMUR(Number(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="paymentDate">Payment Date</Label>
                  <Input
                    id="paymentDate"
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm bg-background"
                >
                  <option value="MANUAL_INVOICE">Bank Transfer (Manual Invoice)</option>
                  <option value="JUICE_MCB">MCB Juice / Mobile Pay</option>
                  <option value="CREDIT_CARD">Credit / Debit Card</option>
                  <option value="CHEQUE">Corporate Cheque</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="paymentNote">Internal Sales / Verification Note</Label>
                <Textarea
                  id="paymentNote"
                  placeholder="e.g. Invoice #1042 settled via direct bank transfer to SBM account."
                  value={paymentInternalNote}
                  onChange={(e) => setPaymentInternalNote(e.target.value)}
                  rows={2}
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setPaymentModalRequest(null)}>Cancel</Button>
                <Button
                  type="submit"
                  disabled={confirmPaymentMutation.isPending}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white"
                >
                  {confirmPaymentMutation.isPending ? "Recording..." : "Record Payment & Authorize Conversion"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </PlatformAdminLayout>
  );
}
