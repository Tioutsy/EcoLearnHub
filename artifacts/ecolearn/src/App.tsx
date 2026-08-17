import { useEffect, useRef, useState, type ReactNode } from "react";
import { ClerkProvider, SignIn, SignUp, UserProfile, Show, useAuth, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { Layout } from '@/components/layout/Layout';
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from 'wouter';
import { QueryClientProvider, useQueryClient, QueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/context/LanguageContext";
import {
  setBaseUrl,
  setAuthTokenGetter,
  customFetch,
} from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

if (import.meta.env.VITE_API_URL) {
  setBaseUrl(import.meta.env.VITE_API_URL);
}

// Pages
import Home from "@/pages/home";
import InternalHome from "@/pages/internal-home";
import Courses from "@/pages/courses";
import CourseDetail from "@/pages/courses/detail";
import LearningPaths from "@/pages/learning-paths";
import LearningPathDetail from "@/pages/learning-paths/detail";
import Challenges from "@/pages/challenges";
import Learn from "@/pages/learn";
import Quiz from "@/pages/quiz";
import Dashboard from "@/pages/dashboard";
// import ImpactDashboard from "@/pages/impact"; // Intentionally disabled — Sprint product simplification. Preserved for future premium feature recovery.
import Pricing from "@/pages/pricing";
// import InsightsLanding from "@/pages/Insights/index";
// import InsightsArticlesList from "@/pages/Insights/articles";
// import InsightsArticleDetail from "@/pages/Insights/article-detail";
// import MauritiusResourcesList from "@/pages/Insights/mauritius-resources";
// import MauritiusResourceDetail from "@/pages/Insights/mauritius-resource-detail";
import Certificates from "@/pages/certificates";
import VerifyCertificate from "@/pages/certificates/verify";
import CompanyDashboard from "@/pages/company";
import Subscribe from "@/pages/company/subscribe";
import ChallengesReview from "@/pages/company/challenges-review";
import CompanyEmployees from "@/pages/company/employees";
import CompanyCertificates from "@/pages/company/certificates";
import CompanyLeaderboards from "@/pages/company/leaderboards";
import CompanyCompliance from "@/pages/company/compliance";
import CompanyReports from "@/pages/company/reports";
import SustainabilityImpact from "@/pages/sustainability";
import TrainingFollowUpPage from "@/pages/company/training-follow-up";
// import { TrainingImpactPage } from "@/pages/company/training-impact"; // Intentionally disabled — Sprint product simplification. Preserved for future premium feature recovery.
import AdminPanel from "@/pages/admin";
import AdminRecycling from "@/pages/admin/recycling";
import CompanyRecycling from "@/pages/company/recycling";
import OnboardingPage from "@/pages/onboarding";
import PrivacyPolicy from "@/pages/Privacy";
import TermsOfService from "@/pages/Terms";
import NotFound from "@/pages/not-found";

// Platform Admin Pages
import PlatformAdminOverview from "@/pages/platform-admin/overview";
import PlatformAdminOrganisations from "@/pages/platform-admin/organisations";
import PlatformAdminAccounts from "@/pages/platform-admin/accounts";
import PlatformAdminActivity from "@/pages/platform-admin/activity";
import PlatformAdminHealth from "@/pages/platform-admin/health";
import PlatformAdminSectors from "@/pages/platform-admin/sectors";
import PlatformAdminInsights from "@/pages/platform-admin/insights";
import PlatformAdminLearningPaths from "@/pages/platform-admin/learningPaths";
import PlatformAdminCourses from "@/pages/platform-admin/courses";
import AdminCoursePreview from "@/pages/platform-admin/preview";
import PlatformAdminSdgMapping from "@/pages/platform-admin/sdgMapping";
import PlatformAdminSubscriptions from "@/pages/platform-admin/subscriptions";

const queryClient = new QueryClient();

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? "";

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = (import.meta.env.BASE_URL || "").replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const clerkAppearance = {
  cssLayerName: "clerk",
  variables: {
    colorPrimary: "hsl(155, 45%, 25%)",
    colorForeground: "hsl(155, 30%, 12%)",
    colorMutedForeground: "hsl(155, 10%, 40%)",
    colorDanger: "hsl(0, 84%, 60%)",
    colorBackground: "hsl(0, 0%, 100%)",
    colorInput: "hsl(155, 20%, 90%)",
    colorInputForeground: "hsl(155, 30%, 12%)",
    colorNeutral: "hsl(155, 20%, 90%)",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-white rounded-2xl max-w-full shadow-xl border",
    signInRootBox: "w-full max-w-[440px]",
    signUpRootBox: "w-full max-w-[440px]",
    signInCardBox: "w-[440px] max-w-full overflow-hidden",
    signUpCardBox: "w-[440px] max-w-full overflow-hidden",
    userProfileRootBox: "w-full max-w-4xl",
    userProfileCardBox: "w-full max-w-4xl shadow-xl rounded-2xl bg-white",
    modalContent: "!max-w-4xl !w-full",
    modalCard: "!max-w-4xl !w-full",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-2xl font-bold font-serif text-foreground",
    headerSubtitle: "text-muted-foreground",
    socialButtonsBlockButtonText: "font-medium",
    formFieldLabel: "text-sm font-medium",
    footerActionLink: "text-primary hover:text-primary/80 font-medium",
    footerActionText: "text-muted-foreground",
    dividerText: "text-muted-foreground text-xs",
    formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium",
    formFieldInput: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    userButtonPopoverCard: "!bg-white border shadow-xl rounded-xl",
    userButtonPopoverMain: "!bg-white",
    userButtonPopoverActionButton: "!text-gray-800 hover:!bg-gray-100",
    userButtonPopoverActionButtonText: "!text-gray-800",
    userButtonPopoverActionButtonIcon: "!text-gray-500",
    userButtonPopoverFooter: "!bg-white",
    userPreviewMainIdentifier: "!text-gray-900",
    userPreviewSecondaryIdentifier: "!text-gray-500",
    profileSection__emailAddresses: "!w-full",
    profileSectionContent__emailAddresses: "!w-full",
  },
};

function AccountProfilePage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 max-w-4xl flex justify-center">
        <UserProfile routing="path" path="/profile" />
      </div>
    </Layout>
  );
}

function SignInPage() {
  const params = new URLSearchParams(window.location.search);
  const inviteToken = params.get("invite");
  // If the employee arrives at sign-in with an invite token, redirect them to
  // the acceptance page after they authenticate.
  const postSignInUrl = inviteToken
    ? `${basePath}/accept-invitation?invite=${encodeURIComponent(inviteToken)}`
    : params.get("redirect_url") || `${basePath}/dashboard`;

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-muted/30 px-4">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        forceRedirectUrl={postSignInUrl}
      />
    </div>
  );
}

function SignUpPage() {
  const params = new URLSearchParams(window.location.search);
  const inviteToken = params.get("invite");
  // After Clerk completes sign-up, redirect to accept-invitation if an invite token is present,
  // otherwise begin guided company administrator onboarding.
  const postSignUpUrl = inviteToken
    ? `${basePath}/accept-invitation?invite=${encodeURIComponent(inviteToken)}`
    : params.get("redirect_url") || `${basePath}/onboarding`;

  // Pass the invite token forward so clicking "Sign in" inside Clerk's widget
  // also lands on the invite-aware sign-in page and preserves the token.
  const signInWithInvite = inviteToken
    ? `${basePath}/sign-in?invite=${encodeURIComponent(inviteToken)}`
    : `${basePath}/sign-in`;

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-muted/30 px-4 py-8">
      {!inviteToken && (
        <div className="mb-6 max-w-md text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
            Company Administrator Registration
          </div>
          <h1 className="text-2xl font-bold font-serif text-foreground">Get Started with ELEVIO SKILLS</h1>
          <p className="text-sm text-muted-foreground">
            Create your administrator account to set up your company, choose your plan and invite your team.
          </p>
        </div>
      )}
      <SignUp 
        routing="path" 
        path={`${basePath}/sign-up`} 
        signInUrl={signInWithInvite} 
        forceRedirectUrl={postSignUpUrl} 
      />
    </div>
  );
}

function AcceptInvitationPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const [status, setStatus] = useState<"pending" | "accepting" | "done" | "error">("pending");
  const [message, setMessage] = useState("");
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      // Not signed in — send to the invite-aware sign-in page so forceRedirectUrl
      // brings them back here after authentication.
      const invite = new URLSearchParams(window.location.search).get("invite") || "";
      setLocation(`${basePath}/sign-in?invite=${encodeURIComponent(invite)}`);
      return;
    }

    const invite = new URLSearchParams(window.location.search).get("invite");
    if (!invite) {
      setLocation(`${basePath}/dashboard`);
      return;
    }

    if (status !== "pending") return;
    setStatus("accepting");

    customFetch("/api/invitations/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: invite }),
    } as RequestInit).then(() => {
      setStatus("done");
      setMessage("Your account has been linked to your company. Redirecting…");
      setTimeout(() => setLocation(`${basePath}/dashboard`), 2000);
    }).catch((err: any) => {
      setStatus("error");
      setMessage(err?.message || "Failed to accept invitation. Please contact your company administrator.");
    });
  }, [isLoaded, isSignedIn, status]);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-muted/30 px-4">
      <div className="text-center space-y-4 max-w-md">
        {status === "pending" || status === "accepting" ? (
          <>
            <div className="h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">Linking your account to your company…</p>
          </>
        ) : status === "done" ? (
          <>
            <div className="h-10 w-10 text-emerald-600 mx-auto">✓</div>
            <p className="text-sm font-medium text-emerald-700">{message}</p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-destructive">{message}</p>
            <a href={`${basePath}/dashboard`} className="text-xs text-muted-foreground underline">Go to dashboard</a>
          </>
        )}
      </div>
    </div>
  );
}

function RequireCompanyAdmin({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [isForbidden, setIsForbidden] = useState<boolean>(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setLocation(`${basePath}/sign-in`);
      return;
    }
    customFetch("/api/company")
      .then(() => {
        setAllowed(true);
        setIsForbidden(false);
      })
      .catch((err: any) => {
        setAllowed(false);
        if (err.status === 403) {
          setIsForbidden(true);
        } else {
          setLocation(`${basePath}/home`);
        }
      });
  }, [isLoaded, isSignedIn, setLocation]);

  if (allowed === null) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center">
        <div className="h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isForbidden) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 max-w-md text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold font-serif">Access Denied</h2>
          <p className="text-sm text-muted-foreground">
            Company Administrator access required. You do not have permission to manage this organisation.
          </p>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <a href={`${basePath}/home`}>Return to Home</a>
          </Button>
        </div>
      </Layout>
    );
  }

  if (!allowed) return null;
  return <>{children}</>;
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/home" />
      </Show>
      <Show when="signed-out">
        <Home />
      </Show>
    </>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

function ClerkApiTokenBridge({ children }: { children: ReactNode }) {
  const { getToken, isLoaded } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    setAuthTokenGetter(async () => {
      return await getToken();
    });

    setIsReady(true);

    return () => {
      setAuthTokenGetter(null);
    };
  }, [getToken, isLoaded]);

  if (!isReady) {
    return null;
  }

  return <>{children}</>;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
  <ClerkApiTokenBridge>
    <LanguageProvider>
      <ClerkQueryClientCacheInvalidator />
      <TooltipProvider>
        <Switch>
            <Route path="/" component={HomeRedirect} />
            <Route path="/home">
              <Show when="signed-in">
                <InternalHome />
              </Show>
              <Show when="signed-out">
                <Redirect to="/sign-in" />
              </Show>
            </Route>
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route path="/profile/*?" component={AccountProfilePage} />
            <Route path="/account/*?" component={AccountProfilePage} />
            <Route path="/accept-invitation" component={AcceptInvitationPage} />
            <Route path="/courses" component={Courses} />
            <Route path="/courses/:id" component={CourseDetail} />
            {/* <Route path="/learning-paths" component={LearningPaths} />
            <Route path="/learning-paths/:slug" component={LearningPathDetail} /> */}
            <Route path="/challenges" component={Challenges} />
            <Route path="/learn/:enrollmentId" component={Learn} />
            <Route path="/quiz/:courseId" component={Quiz} />
            <Route path="/certificates" component={Certificates} />
            <Route path="/certificates/verify/:code" component={VerifyCertificate} />
            <Route path="/dashboard" component={Dashboard} />
            {/* /impact — Intentionally disabled. Redirect authenticated users to dashboard. */}
            <Route path="/impact"><Redirect to="/dashboard" /></Route>
            <Route path="/pricing" component={Pricing} />
            <Route path="/privacy" component={PrivacyPolicy} />
            <Route path="/privacy-policy" component={PrivacyPolicy} />
            <Route path="/terms" component={TermsOfService} />
            <Route path="/terms-of-service" component={TermsOfService} />
            <Route path="/terms-and-conditions" component={TermsOfService} />
            {/* /mauritius-rules-resources & legacy content routes — Intentionally disabled. Redirect to /courses */}
            <Route path="/made-for-mauritius"><Redirect to="/courses" /></Route>
            <Route path="/blog"><Redirect to="/courses" /></Route>
            <Route path="/blog/:slug"><Redirect to="/courses" /></Route>
            <Route path="/insights"><Redirect to="/courses" /></Route>
            <Route path="/insights/articles"><Redirect to="/courses" /></Route>
            <Route path="/insights/articles/:slug"><Redirect to="/courses" /></Route>
            <Route path="/insights/mauritius-resources"><Redirect to="/courses" /></Route>
            <Route path="/insights/mauritius-resources/:slug"><Redirect to="/courses" /></Route>
            <Route path="/mauritius-rules-resources"><Redirect to="/courses" /></Route>
            <Route path="/mauritius-rules-resources/:slug"><Redirect to="/courses" /></Route>
            <Route path="/onboarding" component={OnboardingPage} />
            <Route path="/company">{() => <RequireCompanyAdmin><CompanyDashboard /></RequireCompanyAdmin>}</Route>
            <Route path="/company/subscribe">{() => <RequireCompanyAdmin><Subscribe /></RequireCompanyAdmin>}</Route>
            <Route path="/company/challenges-review">{() => <RequireCompanyAdmin><ChallengesReview /></RequireCompanyAdmin>}</Route>
            <Route path="/company/employees">{() => <RequireCompanyAdmin><CompanyEmployees /></RequireCompanyAdmin>}</Route>
            <Route path="/company/certificates">{() => <RequireCompanyAdmin><CompanyCertificates /></RequireCompanyAdmin>}</Route>
            <Route path="/company/leaderboards">{() => <RequireCompanyAdmin><CompanyLeaderboards /></RequireCompanyAdmin>}</Route>
            <Route path="/company/compliance">{() => <RequireCompanyAdmin><CompanyCompliance /></RequireCompanyAdmin>}</Route>
            <Route path="/company/reports">{() => <RequireCompanyAdmin><CompanyReports /></RequireCompanyAdmin>}</Route>
            <Route path="/company/recycling">{() => <RequireCompanyAdmin><CompanyRecycling /></RequireCompanyAdmin>}</Route>
            <Route path="/company/sustainability">{() => <RequireCompanyAdmin><SustainabilityImpact /></RequireCompanyAdmin>}</Route>
            <Route path="/company/training-follow-up">{() => <RequireCompanyAdmin><TrainingFollowUpPage /></RequireCompanyAdmin>}</Route>
            {/* /company/training-impact — Intentionally disabled. Page preserved dormant. */}
            <Route path="/admin" component={AdminPanel} />
            <Route path="/admin/recycling" component={AdminRecycling} />
            <Route path="/platform-admin" component={PlatformAdminOverview} />
            <Route path="/platform-admin/organisations" component={PlatformAdminOrganisations} />
            <Route path="/platform-admin/accounts" component={PlatformAdminAccounts} />
            <Route path="/platform-admin/activity" component={PlatformAdminActivity} />
            <Route path="/platform-admin/health" component={PlatformAdminHealth} />
            <Route path="/platform-admin/insights" component={PlatformAdminInsights} />
            <Route path="/platform-admin/sectors" component={PlatformAdminSectors} />
            <Route path="/platform-admin/learning-paths" component={PlatformAdminLearningPaths} />
            <Route path="/platform-admin/courses" component={PlatformAdminCourses} />
            <Route path="/platform-admin/courses/:id/preview">
              {(params) => <Redirect to={`/platform-admin/preview/${params.id}`} replace />}
            </Route>
            <Route path="/platform-admin/subscriptions" component={PlatformAdminSubscriptions} />
            <Route path="/platform-admin/preview/:id" component={AdminCoursePreview} />
            <Route path="/platform-admin/sdg-mapping" component={PlatformAdminSdgMapping} />
            <Route path="/company/assignments"><Redirect to="/company/employees" /></Route>
            {/* Catch-all fallback */}
            <Route><Redirect to="/dashboard" /></Route>
          </Switch>
          <Toaster />
        </TooltipProvider>
      </LanguageProvider>
    </ClerkApiTokenBridge>
  </QueryClientProvider>
</ClerkProvider>
  );
}

export function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
