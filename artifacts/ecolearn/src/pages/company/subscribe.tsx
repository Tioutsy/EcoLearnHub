import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { PRICING_PLANS } from "@/config/pricing";
import { CreditCard, ShieldCheck, CheckCircle2, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { customFetch } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function Subscribe() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Parse planId from URL query string
  const urlParams = new URLSearchParams(window.location.search);
  const planId = urlParams.get("planId") || "plan_25";

  const selectedPlan = PRICING_PLANS.find((p) => p.id === planId) || PRICING_PLANS[0];

  // Card details state
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [companyName, setCompanyName] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Auto-format card number: XXXX XXXX XXXX XXXX
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 16) value = value.slice(0, 16);
    const formatted = value.match(/.{1,4}/g)?.join(" ") || value;
    setCardNumber(formatted);
  };

  // Auto-format expiry date: MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 2) {
      setCardExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
    } else {
      setCardExpiry(value);
    }
  };

  // Auto-format CVV: 3 digits
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 3);
    setCardCvv(value);
  };

  const handleSubscribeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      toast({
        title: "Company name required",
        description: "Please enter your organization's name to link the subscription.",
        variant: "destructive",
      });
      return;
    }

    if (cardNumber.replace(/\s/g, "").length < 16) {
      toast({
        title: "Invalid Card Number",
        description: "Please enter a valid 16-digit card number.",
        variant: "destructive",
      });
      return;
    }

    if (cardExpiry.length < 5) {
      toast({
        title: "Invalid Expiry Date",
        description: "Please enter your card's expiration date (MM/YY).",
        variant: "destructive",
      });
      return;
    }

    if (cardCvv.length < 3) {
      toast({
        title: "Invalid CVV",
        description: "Please enter a valid 3-digit security code.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Map config pricing ID to database slug
      const dbPlanSlug = selectedPlan.id.replace("_", "-");

      // Upgrade company plan and update company name
      await customFetch("/api/company/subscribe", {
        method: "POST",
        body: JSON.stringify({ 
          planSlug: dbPlanSlug, 
          companyName: companyName 
        }),
      });

      setIsSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["/api/company/current"] });
      
      toast({
        title: "Subscription Activated!",
        description: `Successfully upgraded to the ${selectedPlan.name} plan.`,
      });

      // Redirect to company dashboard after a short delay
      setTimeout(() => {
        setLocation("/company");
      }, 3000);
    } catch (err: any) {
      toast({
        title: "Payment Failed",
        description: err.message || "An error occurred while upgrading your subscription.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] bg-background py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-8">
            <Link href="/pricing" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Pricing
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold font-serif text-foreground">
              Complete Your Subscription
            </h1>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Form Section */}
            <div className="lg:col-span-7">
              {isSuccess ? (
                <Card className="border-primary/20 bg-primary/5 text-center p-8 backdrop-blur-md">
                  <CardHeader className="flex flex-col items-center">
                    <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 animate-bounce">
                      <Sparkles className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-foreground">
                      Subscription Activated!
                    </CardTitle>
                    <CardDescription className="text-muted-foreground text-md max-w-sm mt-2">
                      Thank you for choosing EcoLearn. We are processing your payment and preparing your custom company dashboard...
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center mt-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Redirecting to your company dashboard
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <form onSubmit={handleSubscribeSubmit}>
                  <Card className="shadow-sm border-border/80">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        Billing & Payment Details
                      </CardTitle>
                      <CardDescription>
                        All credit card transactions are secure and encrypted.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Company Name */}
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                          id="companyName"
                          placeholder="e.g. EcoLearn Mauritius Ltd"
                          required
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                        />
                      </div>

                      {/* Cardholder Name */}
                      <div className="space-y-2">
                        <Label htmlFor="cardName">Cardholder Name</Label>
                        <Input
                          id="cardName"
                          placeholder="Name as it appears on card"
                          required
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                        />
                      </div>

                      {/* Card Number */}
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          required
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Expiry */}
                        <div className="space-y-2">
                          <Label htmlFor="cardExpiry">Expiration Date</Label>
                          <Input
                            id="cardExpiry"
                            placeholder="MM/YY"
                            required
                            value={cardExpiry}
                            onChange={handleExpiryChange}
                          />
                        </div>

                        {/* CVV */}
                        <div className="space-y-2">
                          <Label htmlFor="cardCvv">Security Code (CVV)</Label>
                          <Input
                            id="cardCvv"
                            placeholder="123"
                            required
                            value={cardCvv}
                            onChange={handleCvvChange}
                          />
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="flex-col gap-4 border-t pt-6 bg-muted/30">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground w-full">
                        <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>Protected by 256-bit SSL encryption. Secure checkout processes.</span>
                      </div>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-12 text-md font-semibold bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Authorizing payment...
                          </>
                        ) : (
                          `Pay & Subscribe — MUR ${selectedPlan.monthlyPriceMUR?.toLocaleString()}/mo`
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </form>
              )}
            </div>

            {/* Summary Section */}
            <div className="lg:col-span-5">
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-xl font-serif">Order Summary</CardTitle>
                  <CardDescription>Review your selected plan selection.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Selected Plan Details */}
                  <div className="flex justify-between items-start pb-4 border-b">
                    <div>
                      <h3 className="font-bold text-lg text-foreground">{selectedPlan.name}</h3>
                      <p className="text-sm text-muted-foreground">Monthly Corporate Package</p>
                    </div>
                    <span className="font-bold text-lg text-primary">
                      MUR {selectedPlan.monthlyPriceMUR?.toLocaleString()}
                    </span>
                  </div>

                  {/* Included features list */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">What's Included</p>
                    <ul className="space-y-2">
                      {selectedPlan.features.slice(1).map((feature, idx) => (
                        <li key={idx} className="flex gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Summary math */}
                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Plan Subscription</span>
                      <span>MUR {selectedPlan.monthlyPriceMUR?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Setup & Licensing fee</span>
                      <span className="text-emerald-600 font-semibold">FREE</span>
                    </div>
                    <div className="flex justify-between pt-4 border-t text-lg font-bold text-foreground">
                      <span>Total Charge</span>
                      <span>MUR {selectedPlan.monthlyPriceMUR?.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
