import { Layout } from "@/components/layout/Layout";
import { useState, useEffect } from "react";
import { customFetch } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Building2,
  Search,
  Edit,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Layers,
  DollarSign,
  Lock,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface SubscriptionAdminItem {
  id: number;
  companyId: number;
  companyName: string;
  status: "PENDING" | "ACTIVE" | "SUSPENDED" | "CANCELLED" | "EXPIRED";
  currency: string;
  agreedMonthlyAmount: string | null;
  pricingSource: "STANDARD" | "TAILORED" | "LEGACY";
  startsAt: string;
  planCode: "ESSENTIAL" | "PROFESSIONAL" | "COMPLETE";
  planName: string;
  bandCode: string;
  bandLabel: string;
}

interface PriceAdminItem {
  id: number;
  planCode: string;
  planName: string;
  bandCode: string;
  bandLabel: string;
  monthlyAmount: string | null;
  requiresTailoredQuote: boolean;
  isActive: boolean;
}

export default function PlatformAdminSubscriptions() {
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<SubscriptionAdminItem[]>([]);
  const [prices, setPrices] = useState<PriceAdminItem[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Dialog State for Editing Subscription
  const [editingSub, setEditingSub] = useState<SubscriptionAdminItem | null>(null);
  const [editPlanCode, setEditPlanCode] = useState<string>("COMPLETE");
  const [editBandCode, setEditBandCode] = useState<string>("UP_TO_25");
  const [editAmountMUR, setEditAmountMUR] = useState<string>("");
  const [editStatus, setEditStatus] = useState<string>("ACTIVE");
  const [editPricingSource, setEditPricingSource] = useState<string>("STANDARD");
  const [isSaving, setIsSaving] = useState(false);

  // Dialog State for Editing Price Matrix Item
  const [editingPrice, setEditingPrice] = useState<PriceAdminItem | null>(null);
  const [priceAmountMUR, setPriceAmountMUR] = useState<string>("");
  const [priceTailored, setPriceTailored] = useState<boolean>(false);

  const loadData = () => {
    setIsLoading(true);
    Promise.all([
      customFetch<SubscriptionAdminItem[]>("/api/subscriptions/admin/list"),
      customFetch<PriceAdminItem[]>("/api/subscriptions/admin/prices"),
    ])
      .then(([subRes, priceRes]) => {
        if (subRes) setSubscriptions(subRes);
        if (priceRes) setPrices(priceRes);
        setIsLoading(false);
      })
      .catch((err) => {
        toast({
          title: "Access Denied",
          description: "Platform admin permission required.",
          variant: "destructive",
        });
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredSubscriptions = subscriptions.filter((s) =>
    s.companyName.toLowerCase().includes(search.toLowerCase()) ||
    s.planName.toLowerCase().includes(search.toLowerCase()) ||
    s.bandLabel.toLowerCase().includes(search.toLowerCase())
  );

  const openEditModal = (sub: SubscriptionAdminItem) => {
    setEditingSub(sub);
    setEditPlanCode(sub.planCode);
    setEditBandCode(sub.bandCode);
    setEditAmountMUR(sub.agreedMonthlyAmount || "");
    setEditStatus(sub.status);
    setEditPricingSource(sub.pricingSource);
  };

  const handleSaveSubscription = async () => {
    if (!editingSub) return;
    setIsSaving(true);
    try {
      await customFetch(`/api/subscriptions/admin/${editingSub.companyId}`, {
        method: "PATCH",
        body: JSON.stringify({
          planCode: editPlanCode,
          employeeBandCode: editBandCode,
          agreedMonthlyAmountMUR: editAmountMUR ? parseFloat(editAmountMUR) : null,
          status: editStatus,
          pricingSource: editPricingSource,
        }),
      });

      toast({
        title: "Subscription Updated",
        description: `Successfully updated subscription for ${editingSub.companyName}.`,
      });

      setEditingSub(null);
      loadData();
    } catch (err: any) {
      toast({
        title: "Update Failed",
        description: err.message || "Failed to update subscription.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePrice = async () => {
    if (!editingPrice) return;
    setIsSaving(true);
    try {
      await customFetch(`/api/subscriptions/admin/prices/${editingPrice.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          monthlyAmountMUR: priceTailored ? null : parseFloat(priceAmountMUR),
          requiresTailoredQuote: priceTailored,
        }),
      });

      toast({
        title: "Price Matrix Updated",
        description: `Updated public price for ${editingPrice.planName} (${editingPrice.bandLabel}).`,
      });

      setEditingPrice(null);
      loadData();
    } catch (err: any) {
      toast({
        title: "Price Update Failed",
        description: err.message || "Failed to update price matrix.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      <div className="bg-primary/5 border-b py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-primary/10 text-primary uppercase tracking-wider">
                Platform Governance
              </span>
              <h1 className="text-3xl font-bold font-serif mt-1">Company Subscription Management</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Manage commercial subscription plans, contractual pricing, employee bands, and governance access across all registered companies.
              </p>
            </div>
            <Button onClick={loadData} variant="outline" size="sm" className="gap-2 rounded-xl">
              <RefreshCw className="h-4 w-4" /> Refresh Subscriptions
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-10">
        {/* Company Subscriptions List Section */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-serif">Active & Pending Company Subscriptions</CardTitle>
              <CardDescription>
                {subscriptions.length} Companies subscribed across Essential, Professional, and Complete commercial plans.
              </CardDescription>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by company or plan..."
                className="pl-9 bg-card rounded-xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>

          <CardContent className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="py-3 px-4">Company Name</th>
                  <th className="py-3 px-4">Plan & Category</th>
                  <th className="py-3 px-4">Employee Band</th>
                  <th className="py-3 px-4">Agreed Monthly Price</th>
                  <th className="py-3 px-4">Pricing Source</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-muted-foreground">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      Loading company subscriptions...
                    </td>
                  </tr>
                ) : filteredSubscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No matching company subscriptions found.
                    </td>
                  </tr>
                ) : (
                  filteredSubscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-foreground flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary shrink-0" />
                        <span>{sub.companyName}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-md font-semibold text-xs border inline-flex items-center gap-1",
                          sub.planCode === "ESSENTIAL" && "bg-slate-500/10 text-slate-700 border-slate-500/20",
                          sub.planCode === "PROFESSIONAL" && "bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
                          sub.planCode === "COMPLETE" && "bg-purple-600/10 text-purple-700 dark:text-purple-400 border-purple-500/30"
                        )}>
                          {sub.planName}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-xs text-foreground">
                        {sub.bandLabel}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-foreground">
                        {sub.agreedMonthlyAmount ? `MUR ${parseFloat(sub.agreedMonthlyAmount).toLocaleString()}/mo` : "Tailored Quote"}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded font-mono font-medium border",
                          sub.pricingSource === "LEGACY" && "bg-amber-500/10 text-amber-700 border-amber-500/30",
                          sub.pricingSource === "STANDARD" && "bg-blue-500/10 text-blue-700 border-blue-500/30",
                          sub.pricingSource === "TAILORED" && "bg-purple-500/10 text-purple-700 border-purple-500/30"
                        )}>
                          {sub.pricingSource}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-md text-xs font-semibold border",
                          sub.status === "ACTIVE" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
                          sub.status === "PENDING" && "bg-amber-500/10 text-amber-700 border-amber-500/30",
                          sub.status === "SUSPENDED" && "bg-red-500/10 text-red-700 border-red-500/30",
                          sub.status === "CANCELLED" && "bg-slate-500/10 text-slate-700 border-slate-500/30"
                        )}>
                          {sub.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => openEditModal(sub)} className="gap-1 text-xs">
                          <Edit className="h-3.5 w-3.5" /> Edit Subscription
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Configurable Public Price Matrix Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-serif">Public Pricing Matrix Governance</CardTitle>
            <CardDescription>
              Configurable base prices per plan and employee band. Updating public matrix rates will not overwrite existing company agreements.
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="py-3 px-4">Commercial Plan</th>
                  <th className="py-3 px-4">Employee Band</th>
                  <th className="py-3 px-4">Monthly Rate (MUR)</th>
                  <th className="py-3 px-4">Pricing Type</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y text-muted-foreground">
                {prices.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-foreground">{p.planName}</td>
                    <td className="py-3 px-4 text-xs font-medium text-foreground">{p.bandLabel}</td>
                    <td className="py-3 px-4 font-semibold text-foreground">
                      {p.requiresTailoredQuote ? "Tailored Quote" : `MUR ${parseFloat(p.monthlyAmount || "0").toLocaleString()}/mo`}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {p.requiresTailoredQuote ? (
                        <span className="text-purple-600 font-medium">Custom Proposal</span>
                      ) : (
                        <span className="text-emerald-600 font-medium">Standard Public Rate</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingPrice(p);
                          setPriceAmountMUR(p.monthlyAmount || "");
                          setPriceTailored(p.requiresTailoredQuote);
                        }}
                        className="text-xs gap-1"
                      >
                        <Edit className="h-3.5 w-3.5" /> Edit Rate
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Edit Subscription Modal */}
      <Dialog open={!!editingSub} onOpenChange={(open) => { if (!open) setEditingSub(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              Edit Subscription for {editingSub?.companyName}
            </DialogTitle>
            <DialogDescription>
              Reassign commercial plan, employee band, agreed price, or subscription status.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider">Commercial Plan</Label>
              <select
                className="w-full bg-background border rounded-xl p-2.5 text-sm"
                value={editPlanCode}
                onChange={(e) => setEditPlanCode(e.target.value)}
              >
                <option value="ESSENTIAL">Essential (Core Certificate ELH-01..12)</option>
                <option value="PROFESSIONAL">Professional (Essential + Action + Department)</option>
                <option value="COMPLETE">Complete (Full Catalogue & Leadership)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider">Employee Band</Label>
              <select
                className="w-full bg-background border rounded-xl p-2.5 text-sm"
                value={editBandCode}
                onChange={(e) => setEditBandCode(e.target.value)}
              >
                <option value="UP_TO_25">Up to 25 employees</option>
                <option value="FROM_26_TO_50">26–50 employees</option>
                <option value="FROM_51_TO_80">51–80 employees</option>
                <option value="FROM_81_TO_120">81–120 employees</option>
                <option value="OVER_120">Over 120 employees</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider">Agreed Monthly Amount (MUR)</Label>
              <Input
                type="number"
                placeholder="Leave blank for tailored quote"
                value={editAmountMUR}
                onChange={(e) => setEditAmountMUR(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider">Subscription Status</Label>
                <select
                  className="w-full bg-background border rounded-xl p-2.5 text-sm"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PENDING">PENDING</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                  <option value="CANCELLED">CANCELLED</option>
                  <option value="EXPIRED">EXPIRED</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider">Pricing Source</Label>
                <select
                  className="w-full bg-background border rounded-xl p-2.5 text-sm"
                  value={editPricingSource}
                  onChange={(e) => setEditPricingSource(e.target.value)}
                >
                  <option value="STANDARD">STANDARD</option>
                  <option value="TAILORED">TAILORED</option>
                  <option value="LEGACY">LEGACY</option>
                </select>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditingSub(null)}>Cancel</Button>
            <Button onClick={handleSaveSubscription} disabled={isSaving} className="bg-primary text-primary-foreground">
              {isSaving ? "Saving..." : "Save Subscription Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Price Matrix Modal */}
      <Dialog open={!!editingPrice} onOpenChange={(open) => { if (!open) setEditingPrice(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              Edit Price: {editingPrice?.planName} ({editingPrice?.bandLabel})
            </DialogTitle>
            <DialogDescription>
              Configure the public standard monthly rate in Mauritian Rupees (MUR).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="tailoredQuoteCheck"
                checked={priceTailored}
                onChange={(e) => setPriceTailored(e.target.checked)}
                className="h-4 w-4 rounded"
              />
              <Label htmlFor="tailoredQuoteCheck" className="text-sm font-medium">Requires Tailored Quote (No fixed public price)</Label>
            </div>

            {!priceTailored && (
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider">Monthly Amount (MUR)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 4500"
                  value={priceAmountMUR}
                  onChange={(e) => setPriceAmountMUR(e.target.value)}
                />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditingPrice(null)}>Cancel</Button>
            <Button onClick={handleSavePrice} disabled={isSaving} className="bg-primary text-primary-foreground">
              {isSaving ? "Saving..." : "Save Public Price"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
