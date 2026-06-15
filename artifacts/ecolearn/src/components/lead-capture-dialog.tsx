import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCreateLead } from "@workspace/api-client-react";
import { CheckCircle2, Loader2 } from "lucide-react";

type Interest = "trial" | "demo" | "proposal";

interface LeadCaptureDialogProps {
  interest: Interest;
  trigger: ReactNode;
  planId?: number;
}

const COPY: Record<
  Interest,
  { title: string; description: string; cta: string; success: string }
> = {
  trial: {
    title: "Start your 14-day free trial",
    description:
      "Up to 5 employees, one full course, no card required. Tell us where to set things up and our team will activate your trial.",
    cta: "Start free trial",
    success:
      "Your trial request is in. Our team will set up your account and email you within one business day.",
  },
  demo: {
    title: "Book a demo",
    description:
      "See how EcoLearn trains, tracks, and certifies your workforce. We will walk your team through the platform on a call.",
    cta: "Request demo",
    success:
      "Thanks. We will reach out shortly to arrange a demo that fits your schedule.",
  },
  proposal: {
    title: "Request a corporate proposal",
    description:
      "Tell us about your organisation and we will prepare a tailored proposal with pricing for your headcount and goals.",
    cta: "Request proposal",
    success:
      "Thanks. Our team will prepare a tailored proposal and send it to you shortly.",
  },
};

const EMPLOYEE_RANGES = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "500+",
];

const INDUSTRIES = [
  "Hospitality",
  "Financial Services",
  "Retail and FMCG",
  "Manufacturing",
  "Agriculture",
  "Public Sector",
  "Other",
];

export function LeadCaptureDialog({
  interest,
  trigger,
  planId,
}: LeadCaptureDialogProps) {
  const { toast } = useToast();
  const createLead = useCreateLead();
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [industry, setIndustry] = useState("");
  const [employeeRange, setEmployeeRange] = useState("");
  const [message, setMessage] = useState("");

  const copy = COPY[interest];

  function resetForm() {
    setName("");
    setEmail("");
    setCompanyName("");
    setPhone("");
    setIndustry("");
    setEmployeeRange("");
    setMessage("");
    setSubmitted(false);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setTimeout(resetForm, 200);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !companyName.trim()) {
      toast({
        title: "Missing details",
        description: "Please add your name, email, and company.",
        variant: "destructive",
      });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast({
        title: "Check your email",
        description: "That email address does not look right.",
        variant: "destructive",
      });
      return;
    }

    createLead.mutate(
      {
        data: {
          name: name.trim(),
          email: email.trim(),
          companyName: companyName.trim(),
          phone: phone.trim() || undefined,
          industry: industry || undefined,
          employeeRange: employeeRange || undefined,
          message: message.trim() || undefined,
          interest,
          planId,
        },
      },
      {
        onSuccess: () => setSubmitted(true),
        onError: () =>
          toast({
            title: "Something went wrong",
            description: "We could not submit your request. Please try again.",
            variant: "destructive",
          }),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        {submitted ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold font-serif mb-2">
              You are all set
            </h3>
            <p className="text-muted-foreground mb-6">{copy.success}</p>
            <Button onClick={() => handleOpenChange(false)}>Close</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">
                {copy.title}
              </DialogTitle>
              <DialogDescription>{copy.description}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="lead-name">Full name</Label>
                  <Input
                    id="lead-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lead-email">Work email</Label>
                  <Input
                    id="lead-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.mu"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="lead-company">Company</Label>
                  <Input
                    id="lead-company"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Company name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lead-phone">Phone (optional)</Label>
                  <Input
                    id="lead-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+230 ..."
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Industry</Label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Team size</Label>
                  <Select
                    value={employeeRange}
                    onValueChange={setEmployeeRange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select team size" />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYEE_RANGES.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt} employees
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lead-message">
                  What would you like to achieve? (optional)
                </Label>
                <Textarea
                  id="lead-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your sustainability and training goals."
                  rows={3}
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11"
                disabled={createLead.isPending}
              >
                {createLead.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting
                  </>
                ) : (
                  copy.cta
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                We use your details only to respond to this request.
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
