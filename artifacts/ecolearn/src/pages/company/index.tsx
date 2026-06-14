import { Layout } from "@/components/layout/Layout";
import { useGetMyCompany, useGetDashboardStats } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Building2, Users, GraduationCap, Award, Settings, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CompanyDashboard() {
  const { data: company, isLoading: isLoadingCompany } = useGetMyCompany();
  const { data: stats, isLoading: isLoadingStats } = useGetDashboardStats();

  return (
    <Layout>
      <div className="bg-primary/5 border-b py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-serif mb-2">Company Overview</h1>
              {isLoadingCompany ? (
                <Skeleton className="h-6 w-48" />
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground font-medium">
                  <Building2 className="h-4 w-4" />
                  {company?.name} • {company?.industry}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" asChild>
                <Link href="/company/employees"><Users className="mr-2 h-4 w-4" /> Manage Employees</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/impact"><Award className="mr-2 h-4 w-4" /> Impact Report</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                {isLoadingStats ? <Skeleton className="h-7 w-16 mt-1" /> : (
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold">{stats?.totalEmployees || 0}</h3>
                    {company?.maxEmployees && <span className="text-sm text-muted-foreground">/ {company.maxEmployees}</span>}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-10 w-10 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Learners</p>
                {isLoadingStats ? <Skeleton className="h-7 w-16 mt-1" /> : (
                  <h3 className="text-2xl font-bold">{stats?.activeEmployees || 0}</h3>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-10 w-10 bg-green-500/10 rounded-lg flex items-center justify-center text-green-600">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Certificates Earned</p>
                {isLoadingStats ? <Skeleton className="h-7 w-16 mt-1" /> : (
                  <h3 className="text-2xl font-bold">{stats?.certificatesIssued || 0}</h3>
                )}
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-10 w-10 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-600">
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Needs Retraining</p>
                {isLoadingStats ? <Skeleton className="h-7 w-16 mt-1" /> : (
                  <h3 className="text-2xl font-bold">{stats?.employeesNeedingRetraining || 0}</h3>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-serif">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
              <Link href="/company/employees">
                <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors h-full cursor-pointer flex flex-col items-start text-left">
                  <div className="h-8 w-8 bg-primary/10 rounded flex items-center justify-center text-primary mb-3">
                    <Users className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold mb-1">Add Employees</h3>
                  <p className="text-sm text-muted-foreground flex-1">Invite team members to join your organization.</p>
                  <ArrowRight className="h-4 w-4 text-primary mt-2" />
                </div>
              </Link>
              <Link href="/courses">
                <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors h-full cursor-pointer flex flex-col items-start text-left">
                  <div className="h-8 w-8 bg-secondary/10 rounded flex items-center justify-center text-secondary mb-3">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold mb-1">Assign Training</h3>
                  <p className="text-sm text-muted-foreground flex-1">Browse catalog to assign new courses.</p>
                  <ArrowRight className="h-4 w-4 text-secondary mt-2" />
                </div>
              </Link>
            </div>
          </div>

          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold font-serif mb-6">Current Plan</h2>
            {isLoadingCompany ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full mt-4" />
              </div>
            ) : (
              <div>
                <div className="inline-block bg-primary/10 text-primary font-bold px-3 py-1 rounded-full text-sm mb-4">
                  {company?.planName || 'Free Plan'}
                </div>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Seats Used</span>
                    <span className="font-medium">{company?.employeeCount} / {company?.maxEmployees || '∞'}</span>
                  </div>
                  <div className="w-full bg-secondary/20 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full" 
                      style={{ width: `${Math.min(100, (company?.employeeCount || 0) / (company?.maxEmployees || 1) * 100)}%` }}
                    />
                  </div>
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/pricing">Manage Subscription</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}