import { useEffect, useRef, useState, type ReactNode } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useAuth, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from 'wouter';
import { QueryClientProvider, useQueryClient, QueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  setBaseUrl,
  setAuthTokenGetter,
} from "@workspace/api-client-react";

if (import.meta.env.VITE_API_URL) {
  setBaseUrl(import.meta.env.VITE_API_URL);
}

// Pages
import Home from "@/pages/home";
import Courses from "@/pages/courses";
import CourseDetail from "@/pages/courses/detail";
import LearningPaths from "@/pages/learning-paths";
import LearningPathDetail from "@/pages/learning-paths/detail";
import Challenges from "@/pages/challenges";
import Learn from "@/pages/learn";
import Quiz from "@/pages/quiz";
import Dashboard from "@/pages/dashboard";
import ImpactDashboard from "@/pages/impact";
import Pricing from "@/pages/pricing";
import InsightsLanding from "@/pages/Insights/index";
import InsightsArticlesList from "@/pages/Insights/articles";
import InsightsArticleDetail from "@/pages/Insights/article-detail";
import MauritiusResourcesList from "@/pages/Insights/mauritius-resources";
import MauritiusResourceDetail from "@/pages/Insights/mauritius-resource-detail";
import Certificates from "@/pages/certificates";
import VerifyCertificate from "@/pages/certificates/verify";
import CompanyDashboard from "@/pages/company";
import CompanyEmployees from "@/pages/company/employees";
import CompanyCertificates from "@/pages/company/certificates";
import CompanyLeaderboards from "@/pages/company/leaderboards";
import CompanyCompliance from "@/pages/company/compliance";
import CompanyReports from "@/pages/company/reports";
import SustainabilityImpact from "@/pages/sustainability";
import AdminPanel from "@/pages/admin";
import AdminRecycling from "@/pages/admin/recycling";
import CompanyRecycling from "@/pages/company/recycling";
import NotFound from "@/pages/not-found";

// Platform Admin Pages
import PlatformAdminOverview from "@/pages/platform-admin/overview";
import PlatformAdminSectors from "@/pages/platform-admin/sectors";
import PlatformAdminInsights from "@/pages/platform-admin/insights";
import PlatformAdminLearningPaths from "@/pages/platform-admin/learningPaths";
import PlatformAdminCourses from "@/pages/platform-admin/courses";
import AdminCoursePreview from "@/pages/platform-admin/preview";
import PlatformAdminSdgMapping from "@/pages/platform-admin/sdgMapping";

const queryClient = new QueryClient();

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');
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
    cardBox: "bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-xl border",
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
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-muted/30 px-4">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-muted/30 px-4">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
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
    <ClerkQueryClientCacheInvalidator />
    <TooltipProvider>
      <Switch>
            <Route path="/" component={HomeRedirect} />
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route path="/courses" component={Courses} />
            <Route path="/courses/:id" component={CourseDetail} />
            <Route path="/learning-paths" component={LearningPaths} />
            <Route path="/learning-paths/:slug" component={LearningPathDetail} />
            <Route path="/challenges" component={Challenges} />
            <Route path="/learn/:enrollmentId" component={Learn} />
            <Route path="/quiz/:courseId" component={Quiz} />
            <Route path="/certificates" component={Certificates} />
            <Route path="/certificates/verify/:code" component={VerifyCertificate} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/impact" component={ImpactDashboard} />
            <Route path="/pricing" component={Pricing} />
            <Route path="/made-for-mauritius">
              <Redirect to="/insights/mauritius-resources" />
            </Route>
            <Route path="/blog">
              <Redirect to="/insights/articles" />
            </Route>
            <Route path="/blog/:slug">
              {(params) => <Redirect to={`/insights/articles/${params.slug}`} />}
            </Route>
            <Route path="/insights" component={InsightsLanding} />
            <Route path="/insights/articles" component={InsightsArticlesList} />
            <Route path="/insights/articles/:slug" component={InsightsArticleDetail} />
            <Route path="/insights/mauritius-resources" component={MauritiusResourcesList} />
            <Route path="/insights/mauritius-resources/:slug" component={MauritiusResourceDetail} />
            <Route path="/company" component={CompanyDashboard} />
            <Route path="/company/employees" component={CompanyEmployees} />
            <Route path="/company/certificates" component={CompanyCertificates} />
            <Route path="/company/leaderboards" component={CompanyLeaderboards} />
            <Route path="/company/compliance" component={CompanyCompliance} />
            <Route path="/company/reports" component={CompanyReports} />
            <Route path="/company/recycling" component={CompanyRecycling} />
            <Route path="/company/sustainability" component={SustainabilityImpact} />
            <Route path="/admin" component={AdminPanel} />
            <Route path="/admin/recycling" component={AdminRecycling} />
            <Route path="/platform-admin" component={PlatformAdminOverview} />
            <Route path="/platform-admin/insights" component={PlatformAdminInsights} />
            <Route path="/platform-admin/sectors" component={PlatformAdminSectors} />
            <Route path="/platform-admin/learning-paths" component={PlatformAdminLearningPaths} />
            <Route path="/platform-admin/courses" component={PlatformAdminCourses} />
            <Route path="/platform-admin/courses/:id/preview" component={AdminCoursePreview} />
            <Route path="/platform-admin/sdg-mapping" component={PlatformAdminSdgMapping} />
            <Route component={NotFound} />
                </Switch>
      <Toaster />
    </TooltipProvider>
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
