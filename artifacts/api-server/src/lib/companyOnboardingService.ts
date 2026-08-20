import {
  db,
  companiesTable,
  employeesTable,
  companySubscriptionsTable,
  subscriptionPlansTable,
  employeeBandsTable,
  planPricesTable,
  coursesTable,
  enrollmentsTable,
  courseAssignmentsTable,
} from "@workspace/db";
import { eq, and, or, sql } from "drizzle-orm";
import { assignTrainingToCompanyEmployees } from "./assignmentService.js";
import {
  calculateSubscriptionPricing,
  calculateAuthoritativePricing,
  PricingCalculationResult,
  EnterprisePricingBreakdown,
} from "./subscriptionPricingService";

export type OnboardingStage =
  | "DRAFT"
  | "PENDING_ADMIN_INVITATION"
  | "ADMIN_INVITED"
  | "ADMIN_INVITATION_ACCEPTED"
  | "ORGANISATION_SETUP_IN_PROGRESS"
  | "READY_FOR_EMPLOYEE_SETUP"
  | "READY_FOR_COURSE_ASSIGNMENT"
  | "ACTIVE"
  | "company_created"
  | "profile_incomplete"
  | "subscription_required"
  | "admin_ready"
  | "employees_pending"
  | "course_assignment_pending"
  | "ready_for_learning";

export interface CompanyOnboardingStatus {
  companyId: number;
  companyName: string;
  stage: OnboardingStage;
  completedSteps: string[];
  incompleteSteps: string[];
  blockingIssues: string[];
  recommendedNextAction: string;
  employeeCapacity: {
    currentCount: number;
    limit: number;
    remaining: number;
  };
  hasAdmin: boolean;
  hasActiveSubscription: boolean;
  hasAssignedCourses: boolean;
  activeLearnerCount: number;
}

export async function getCompanyOnboardingStatus(companyId: number): Promise<CompanyOnboardingStatus> {
  const [company] = await db
    .select()
    .from(companiesTable)
    .where(eq(companiesTable.id, companyId))
    .limit(1);

  if (!company) {
    throw new Error(`Company with ID ${companyId} not found`);
  }

  const completedSteps: string[] = [];
  const incompleteSteps: string[] = [];
  const blockingIssues: string[] = [];

  // 1. Profile check
  const isProfileComplete = Boolean(company.name && company.slug);
  if (isProfileComplete) {
    completedSteps.push("profile_complete");
  } else {
    incompleteSteps.push("profile_complete");
    blockingIssues.push("Company profile details (name or slug) are incomplete.");
  }

  // 2. Subscription & Band check
  const subscriptions = await db
    .select({
      status: companySubscriptionsTable.status,
      maxEmployees: employeeBandsTable.maximumEmployees,
    })
    .from(companySubscriptionsTable)
    .leftJoin(employeeBandsTable, eq(companySubscriptionsTable.employeeBandId, employeeBandsTable.id))
    .where(eq(companySubscriptionsTable.companyId, companyId));

  const activeSub = subscriptions.find((s) => s.status === "ACTIVE" || s.status === "PENDING");
  const hasActiveSubscription = Boolean(activeSub) || Boolean(company.planId);

  const limit = activeSub?.maxEmployees ?? company.maxEmployees ?? 50;

  if (hasActiveSubscription) {
    completedSteps.push("subscription_active");
  } else {
    incompleteSteps.push("subscription_active");
    blockingIssues.push("Company has no active subscription plan.");
  }

  // 3. Admin check
  const employees = await db
    .select()
    .from(employeesTable)
    .where(eq(employeesTable.companyId, companyId));

  const hasAdmin = employees.some((e) => e.role === "admin" && e.status === "active");
  if (hasAdmin) {
    completedSteps.push("admin_assigned");
  } else {
    incompleteSteps.push("admin_assigned");
    blockingIssues.push("No active company administrator has been assigned.");
  }

  const currentCount = employees.length;
  const remaining = Math.max(0, limit - currentCount);

  // 4. Employee check
  const acceptedEmployees = employees.filter((e) => e.invitationStatus === "accepted");
  const hasEmployees = employees.length > 0;
  if (hasEmployees) {
    completedSteps.push("employees_invited");
  } else {
    incompleteSteps.push("employees_invited");
  }

  // 5. Course Assignment check
  const assignments = await db
    .select({ id: courseAssignmentsTable.id })
    .from(courseAssignmentsTable)
    .where(eq(courseAssignmentsTable.companyId, companyId));

  const enrollments = await db
    .select({ id: enrollmentsTable.id, status: enrollmentsTable.status })
    .from(enrollmentsTable)
    .where(eq(enrollmentsTable.companyId, companyId));

  const hasAssignedCourses = assignments.length > 0 || enrollments.length > 0;
  if (hasAssignedCourses) {
    completedSteps.push("courses_assigned");
  } else {
    incompleteSteps.push("courses_assigned");
  }

  const activeLearnerCount = acceptedEmployees.length;

  let stage: OnboardingStage = "DRAFT";
  let recommendedNextAction = "Complete company profile details.";

  if (!isProfileComplete) {
    stage = "DRAFT";
    recommendedNextAction = "Complete company profile details.";
  } else if (!hasActiveSubscription) {
    stage = "ORGANISATION_SETUP_IN_PROGRESS";
    recommendedNextAction = "Select a subscription plan and employee band.";
  } else if (!hasAdmin) {
    stage = "PENDING_ADMIN_INVITATION";
    recommendedNextAction = "Assign a company administrator.";
  } else if (!hasEmployees) {
    stage = "READY_FOR_EMPLOYEE_SETUP";
    recommendedNextAction = "Invite employees individually or bulk-import via CSV.";
  } else if (!hasAssignedCourses) {
    stage = "READY_FOR_COURSE_ASSIGNMENT";
    recommendedNextAction = "Assign Sustainability Foundations (ELH-01) to your team.";
  } else {
    stage = "ACTIVE";
    recommendedNextAction = "Monitor team training progress on your Company Dashboard.";
  }

  return {
    companyId,
    companyName: company.name,
    stage,
    completedSteps,
    incompleteSteps,
    blockingIssues,
    recommendedNextAction,
    employeeCapacity: {
      currentCount,
      limit,
      remaining,
    },
    hasAdmin,
    hasActiveSubscription,
    hasAssignedCourses,
    activeLearnerCount,
  };
}

export async function validateEmployeeCapacity(
  companyId: number,
  countToAdd: number = 1
): Promise<{ allowed: boolean; limit: number; currentCount: number; remaining: number }> {
  const status = await getCompanyOnboardingStatus(companyId);
  const allowed = status.employeeCapacity.remaining >= countToAdd;
  return {
    allowed,
    limit: status.employeeCapacity.limit,
    currentCount: status.employeeCapacity.currentCount,
    remaining: status.employeeCapacity.remaining,
  };
}

export async function reconcileTenantIdentity(
  clerkUserId: string,
  email: string,
  companyId: number
): Promise<{ reconciled: boolean; role: string }> {
  const clauses = [eq(employeesTable.clerkUserId, clerkUserId)];
  if (email) {
    clauses.push(sql`lower(${employeesTable.email}) = ${email.toLowerCase()}`);
  }

  const [existing] = await db
    .select()
    .from(employeesTable)
    .where(and(eq(employeesTable.companyId, companyId), or(...clauses)))
    .limit(1);

  if (existing) {
    if (!existing.clerkUserId) {
      await db
        .update(employeesTable)
        .set({ clerkUserId, invitationStatus: "accepted", invitationAcceptedAt: new Date() })
        .where(eq(employeesTable.id, existing.id));
    }
    return { reconciled: true, role: existing.role };
  }

  return { reconciled: false, role: "employee" };
}

export interface OnboardCompanyInput {
  userId: string;
  email: string | null;
  adminName: string;
  companyName: string;
  employeeCount?: number;
  employeeBandCode?: string; // 'UP_TO_25' | 'FROM_26_TO_50' | 'FROM_51_TO_80' | 'FROM_81_TO_120' | 'OVER_120'
  planCode?: string; // 'ESSENTIAL' | 'PROFESSIONAL' | 'COMPLETE'
  billingInterval?: string; // 'MONTHLY' | 'YEARLY'
}

export interface OnboardCompanyResult {
  outcome: "success" | "tailored_contact_required" | "already_onboarded";
  message?: string;
  company?: any;
  employee?: any;
  subscription?: any;
  monthlyAmount?: number | null;
  pricingBreakdown?: PricingCalculationResult | EnterprisePricingBreakdown;
  onboardingStage?: string;
}

export async function onboardCompany(input: OnboardCompanyInput): Promise<OnboardCompanyResult> {
  const { userId, email, adminName, companyName, employeeCount: rawCount, employeeBandCode, planCode = "ESSENTIAL" } = input;

  if (!userId) {
    throw new Error("Authentication required");
  }
  if (!companyName || !companyName.trim()) {
    throw new Error("Company name is required");
  }

  // 1. Check if user already has an employee record
  const [existingEmp] = await db
    .select()
    .from(employeesTable)
    .where(eq(employeesTable.clerkUserId, userId))
    .limit(1);

  if (existingEmp) {
    if (existingEmp.role === "admin") {
      const [existingComp] = await db
        .select()
        .from(companiesTable)
        .where(eq(companiesTable.id, existingEmp.companyId))
        .limit(1);

      const [existingSub] = await db
        .select()
        .from(companySubscriptionsTable)
        .where(eq(companySubscriptionsTable.companyId, existingEmp.companyId))
        .limit(1);

      return {
        outcome: "already_onboarded",
        message: "Account is already linked to an active company as administrator",
        company: existingComp,
        employee: existingEmp,
        subscription: existingSub,
        onboardingStage: "onboarding-complete",
      };
    } else {
      throw new Error("Existing employee membership found. Contact your company administrator.");
    }
  }

  // 2. Resolve Employee Band & Headcount
  let bandCode = employeeBandCode;
  let employeeCount = rawCount;

  if (!bandCode) {
    const countToCheck = employeeCount || 10;
    if (countToCheck <= 25) bandCode = "UP_TO_25";
    else if (countToCheck <= 50) bandCode = "FROM_26_TO_50";
    else if (countToCheck <= 80) bandCode = "FROM_51_TO_80";
    else if (countToCheck <= 120) bandCode = "FROM_81_TO_120";
    else bandCode = "OVER_120";
  }

  if (employeeCount === undefined) {
    if (bandCode === "UP_TO_25") employeeCount = 25;
    else if (bandCode === "FROM_26_TO_50") employeeCount = 50;
    else if (bandCode === "FROM_51_TO_80") employeeCount = 80;
    else if (bandCode === "FROM_81_TO_120") employeeCount = 120;
    else employeeCount = 150;
  }

  // 3. Resolve Employee Band Record & Subscription Plan Record from DB
  const [band] = await db
    .select()
    .from(employeeBandsTable)
    .where(eq(employeeBandsTable.code, bandCode))
    .limit(1);

  if (!band) {
    throw new Error(`Invalid employee band code: ${bandCode}`);
  }

  const [plan] = await db
    .select()
    .from(subscriptionPlansTable)
    .where(eq(subscriptionPlansTable.code, planCode))
    .limit(1);

  const planId = plan?.id ?? 1;

  // 4. Derive Authoritative Pricing Server-Side
  const pricingBreakdown = calculateAuthoritativePricing({
    planCode: plan?.code ?? "ESSENTIAL",
    employeeCount,
    bandCode: band.code,
    billingInterval: input.billingInterval,
  });

  const includedCapacity = pricingBreakdown.includedMaxEmployees;

  // 5. Real Database Transaction: Company -> First Admin Employee -> Subscription
  const slugBase = companyName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const slug = `${slugBase}-${Date.now().toString(36)}`;

  return await db.transaction(async (tx) => {
    const [company] = await tx
      .insert(companiesTable)
      .values({
        name: companyName.trim(),
        slug,
        employeeCount: employeeCount,
        maxEmployees: includedCapacity,
        planId,
      })
      .returning();

    const [adminEmployee] = await tx
      .insert(employeesTable)
      .values({
        companyId: company.id,
        clerkUserId: userId,
        email: email ? email.toLowerCase() : `admin_${company.id}@example.com`,
        name: adminName || "Company Admin",
        role: "admin",
        status: "active",
        invitationStatus: "accepted",
        invitationAcceptedAt: new Date(),
      })
      .returning();

    const [subscription] = await tx
      .insert(companySubscriptionsTable)
      .values({
        companyId: company.id,
        subscriptionPlanId: planId,
        employeeBandId: band.id,
        status: "PENDING", // Initialized as PENDING until commercial payment confirmation
        currency: "MUR",
        billingInterval: pricingBreakdown.billingInterval,
        discountPercentage: String(pricingBreakdown.discountPercentage),
        agreedMonthlyAmount: pricingBreakdown.finalMonthlyAmount.toFixed(2),
        agreedYearlyAmount: pricingBreakdown.finalYearlyAmount.toFixed(2),
        pricingSource: "STANDARD",
        startsAt: new Date(),
      })
      .returning();

    return {
      outcome: "success",
      company,
      employee: adminEmployee,
      subscription,
      monthlyAmount: pricingBreakdown.finalMonthlyAmount,
      pricingBreakdown,
      onboardingStage: "onboarding-complete",
    };
  });
}

export async function getResumableOnboardingStatus(userId: string): Promise<{
  stage: "NO_COMPANY" | "PLAN_REQUIRED" | "PAYMENT_PENDING" | "CUSTOM_QUOTE_REQUIRED" | "COMPLETED";
  hasCompany: boolean;
  role?: string;
  company?: any;
  subscription?: any;
  pricingBreakdown?: any;
  nextStepUrl: string;
  completedSteps: string[];
  incompleteSteps: string[];
}> {
  if (!userId) {
    return {
      stage: "NO_COMPANY",
      hasCompany: false,
      nextStepUrl: "/onboarding",
      completedSteps: [],
      incompleteSteps: ["account_creation", "company_details", "plan_selection", "payment"],
    };
  }

  // Check if user is Platform Administrator (Owner Bootstrap)
  const bootstrapEmail = (process.env.PLATFORM_ADMIN_BOOTSTRAP_EMAIL ?? "slennon2206@gmail.com").toLowerCase();
  let userEmail: string | null = null;
  try {
    const { clerkClient } = await import("@clerk/express");
    const clerkUser = await clerkClient.users.getUser(userId);
    userEmail =
      clerkUser?.emailAddresses?.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress?.toLowerCase() ??
      clerkUser?.emailAddresses?.[0]?.emailAddress?.toLowerCase() ??
      null;
  } catch {
    // ignore
  }

  if (userEmail && userEmail === bootstrapEmail) {
    return {
      stage: "COMPLETED",
      hasCompany: true,
      role: "platform_admin",
      nextStepUrl: "/platform-admin",
      completedSteps: ["account_creation", "company_details", "plan_selection", "payment", "onboarding_completed"],
      incompleteSteps: [],
    };
  }

  const [emp] = await db
    .select()
    .from(employeesTable)
    .where(eq(employeesTable.clerkUserId, userId))
    .limit(1);

  if (!emp) {
    return {
      stage: "NO_COMPANY",
      hasCompany: false,
      nextStepUrl: "/onboarding",
      completedSteps: ["account_creation"],
      incompleteSteps: ["company_details", "plan_selection", "payment"],
    };
  }

  const [company] = await db
    .select()
    .from(companiesTable)
    .where(eq(companiesTable.id, emp.companyId))
    .limit(1);

  if (!company) {
    return {
      stage: "NO_COMPANY",
      hasCompany: false,
      nextStepUrl: "/onboarding",
      completedSteps: ["account_creation"],
      incompleteSteps: ["company_details", "plan_selection", "payment"],
    };
  }

  // Non-admin employee with existing company
  if (emp.role !== "admin") {
    return {
      stage: "COMPLETED",
      hasCompany: true,
      role: emp.role,
      company,
      nextStepUrl: "/home",
      completedSteps: ["account_creation", "company_details", "plan_selection", "payment", "onboarding_completed"],
      incompleteSteps: [],
    };
  }

  // Infracare Complimentary Test Bypass Check
  const isInfracare =
    company.name?.toLowerCase().includes("infracare") ||
    Boolean(company.slug && company.slug.toLowerCase().includes("infracare"));

  if (isInfracare) {
    return {
      stage: "COMPLETED",
      hasCompany: true,
      role: "admin",
      company,
      subscription: {
        status: "ACTIVE",
        planCode: "COMPLETE",
        planName: "Complete (Test Account)",
        agreedMonthlyAmount: "0.00",
      },
      nextStepUrl: "/home",
      completedSteps: ["account_creation", "company_details", "plan_selection", "payment", "onboarding_completed"],
      incompleteSteps: [],
    };
  }

  // Admin: Check subscription
  const matchingSubs = await db
    .select({
      id: companySubscriptionsTable.id,
      companyId: companySubscriptionsTable.companyId,
      status: companySubscriptionsTable.status,
      currency: companySubscriptionsTable.currency,
      billingInterval: companySubscriptionsTable.billingInterval,
      agreedMonthlyAmount: companySubscriptionsTable.agreedMonthlyAmount,
      agreedYearlyAmount: companySubscriptionsTable.agreedYearlyAmount,
      planCode: subscriptionPlansTable.code,
      planName: subscriptionPlansTable.name,
      planDescription: subscriptionPlansTable.description,
      bandCode: employeeBandsTable.code,
      bandLabel: employeeBandsTable.label,
      minEmployees: employeeBandsTable.minimumEmployees,
      maxEmployees: employeeBandsTable.maximumEmployees,
    })
    .from(companySubscriptionsTable)
    .leftJoin(subscriptionPlansTable, eq(companySubscriptionsTable.subscriptionPlanId, subscriptionPlansTable.id))
    .leftJoin(employeeBandsTable, eq(companySubscriptionsTable.employeeBandId, employeeBandsTable.id))
    .where(eq(companySubscriptionsTable.companyId, company.id))
    .orderBy(sql`CASE WHEN ${companySubscriptionsTable.status} = 'ACTIVE' THEN 1 WHEN ${companySubscriptionsTable.status} = 'PENDING' THEN 2 ELSE 3 END`, companySubscriptionsTable.id);

  const subscription = matchingSubs[0];

  if (!subscription) {
    return {
      stage: "PLAN_REQUIRED",
      hasCompany: true,
      role: "admin",
      company,
      nextStepUrl: "/onboarding",
      completedSteps: ["account_creation", "company_details"],
      incompleteSteps: ["plan_selection", "payment"],
    };
  }

  const subStatus = (subscription.status || "").toUpperCase();

  if (subStatus === "ACTIVE") {
    return {
      stage: "COMPLETED",
      hasCompany: true,
      role: "admin",
      company,
      subscription,
      nextStepUrl: "/home",
      completedSteps: ["account_creation", "company_details", "plan_selection", "payment", "onboarding_completed"],
      incompleteSteps: [],
    };
  }

  if (subStatus === "CUSTOM_QUOTE_REQUIRED" || subscription.bandCode === "OVER_120") {
    return {
      stage: "CUSTOM_QUOTE_REQUIRED",
      hasCompany: true,
      role: "admin",
      company,
      subscription,
      nextStepUrl: "/onboarding",
      completedSteps: ["account_creation", "company_details", "plan_selection"],
      incompleteSteps: ["quote_confirmation"],
    };
  }

  // PENDING or PENDING_PAYMENT
  return {
    stage: "PAYMENT_PENDING",
    hasCompany: true,
    role: "admin",
    company,
    subscription,
    nextStepUrl: "/onboarding",
    completedSteps: ["account_creation", "company_details", "plan_selection"],
    incompleteSteps: ["payment"],
  };
}

export async function saveCompanyDetails(input: {
  userId: string;
  email: string | null;
  adminName: string;
  companyName: string;
  industry?: string;
  employeeCount?: number;
}): Promise<{ company: any; employee: any; stage: "PLAN_REQUIRED" }> {
  const { userId, email, adminName, companyName, industry, employeeCount = 15 } = input;

  if (!userId) throw new Error("Authentication required");
  if (!companyName || !companyName.trim()) throw new Error("Company name is required");

  // Check if admin already exists
  const [existingEmp] = await db
    .select()
    .from(employeesTable)
    .where(eq(employeesTable.clerkUserId, userId))
    .limit(1);

  if (existingEmp) {
    if (existingEmp.role !== "admin") {
      throw new Error("Existing employee account found. Contact your company administrator.");
    }

    // Update existing company
    const [updatedCompany] = await db
      .update(companiesTable)
      .set({
        name: companyName.trim(),
        industry: industry?.trim() || null,
        employeeCount: employeeCount,
        updatedAt: new Date(),
      })
      .where(eq(companiesTable.id, existingEmp.companyId))
      .returning();

    return {
      company: updatedCompany,
      employee: existingEmp,
      stage: "PLAN_REQUIRED",
    };
  }

  // Create new company and first admin employee in a transaction
  const slugBase = companyName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const slug = `${slugBase}-${Date.now().toString(36)}`;

  return await db.transaction(async (tx) => {
    const [company] = await tx
      .insert(companiesTable)
      .values({
        name: companyName.trim(),
        slug,
        industry: industry?.trim() || null,
        employeeCount: employeeCount,
        maxEmployees: 25,
      })
      .returning();

    const [adminEmployee] = await tx
      .insert(employeesTable)
      .values({
        companyId: company.id,
        clerkUserId: userId,
        email: email ? email.toLowerCase() : `admin_${company.id}@example.com`,
        name: adminName || "Company Administrator",
        role: "admin",
        status: "active",
        invitationStatus: "accepted",
        invitationAcceptedAt: new Date(),
      })
      .returning();

    return {
      company,
      employee: adminEmployee,
      stage: "PLAN_REQUIRED",
    };
  });
}

export async function savePlanSelection(input: {
  userId: string;
  planCode: string;
  employeeBandCode?: string;
  employeeCount?: number;
  billingInterval?: string;
}): Promise<{
  outcome: "success" | "tailored_quote_required";
  stage: "PAYMENT_PENDING" | "CUSTOM_QUOTE_REQUIRED";
  subscription?: any;
  pricingBreakdown?: any;
}> {
  const { userId, planCode = "ESSENTIAL", employeeBandCode, employeeCount: rawCount, billingInterval } = input;

  if (!userId) throw new Error("Authentication required");

  const [emp] = await db
    .select()
    .from(employeesTable)
    .where(eq(employeesTable.clerkUserId, userId))
    .limit(1);

  if (!emp || emp.role !== "admin") {
    throw new Error("Company administrator account required to select a plan");
  }

  let bandCode = employeeBandCode;
  let employeeCount = rawCount;

  if (!bandCode) {
    const countToCheck = employeeCount || 15;
    if (countToCheck <= 25) bandCode = "UP_TO_25";
    else if (countToCheck <= 50) bandCode = "FROM_26_TO_50";
    else if (countToCheck <= 80) bandCode = "FROM_51_TO_80";
    else if (countToCheck <= 120) bandCode = "FROM_81_TO_120";
    else bandCode = "OVER_120";
  }

  if (employeeCount === undefined) {
    if (bandCode === "UP_TO_25") employeeCount = 25;
    else if (bandCode === "FROM_26_TO_50") employeeCount = 50;
    else if (bandCode === "FROM_51_TO_80") employeeCount = 80;
    else if (bandCode === "FROM_81_TO_120") employeeCount = 120;
    else employeeCount = 150;
  }

  const [band] = await db
    .select()
    .from(employeeBandsTable)
    .where(eq(employeeBandsTable.code, bandCode))
    .limit(1);

  if (!band) throw new Error(`Invalid employee band code: ${bandCode}`);

  const [plan] = await db
    .select()
    .from(subscriptionPlansTable)
    .where(eq(subscriptionPlansTable.code, planCode))
    .limit(1);

  const planId = plan?.id ?? 1;

  if (bandCode === "OVER_120" || employeeCount > 120) {
    // Tailored quote enquiry flow
    const [sub] = await db
      .insert(companySubscriptionsTable)
      .values({
        companyId: emp.companyId,
        subscriptionPlanId: planId,
        employeeBandId: band.id,
        status: "CUSTOM_QUOTE_REQUIRED",
        currency: "MUR",
        billingInterval: "MONTHLY",
        pricingSource: "TAILORED",
        startsAt: new Date(),
      })
      .onConflictDoUpdate({
        target: companySubscriptionsTable.companyId,
        set: {
          subscriptionPlanId: planId,
          employeeBandId: band.id,
          status: "CUSTOM_QUOTE_REQUIRED",
          pricingSource: "TAILORED",
          updatedAt: new Date(),
        },
      })
      .returning();

    return {
      outcome: "tailored_quote_required",
      stage: "CUSTOM_QUOTE_REQUIRED",
      subscription: sub,
    };
  }

  // Standard server-authoritative calculation
  const pricingBreakdown = calculateAuthoritativePricing({
    planCode: plan?.code ?? "ESSENTIAL",
    employeeCount,
    bandCode: band.code,
    billingInterval,
  });

  const [subscription] = await db
    .insert(companySubscriptionsTable)
    .values({
      companyId: emp.companyId,
      subscriptionPlanId: planId,
      employeeBandId: band.id,
      status: "PENDING",
      currency: "MUR",
      billingInterval: pricingBreakdown.billingInterval,
      discountPercentage: String(pricingBreakdown.discountPercentage),
      agreedMonthlyAmount: pricingBreakdown.finalMonthlyAmount.toFixed(2),
      agreedYearlyAmount: pricingBreakdown.finalYearlyAmount.toFixed(2),
      pricingSource: "STANDARD",
      startsAt: new Date(),
    })
    .onConflictDoUpdate({
      target: companySubscriptionsTable.companyId,
      set: {
        subscriptionPlanId: planId,
        employeeBandId: band.id,
        status: "PENDING",
        currency: "MUR",
        billingInterval: pricingBreakdown.billingInterval,
        discountPercentage: String(pricingBreakdown.discountPercentage),
        agreedMonthlyAmount: pricingBreakdown.finalMonthlyAmount.toFixed(2),
        agreedYearlyAmount: pricingBreakdown.finalYearlyAmount.toFixed(2),
        pricingSource: "STANDARD",
        updatedAt: new Date(),
      },
    })
    .returning();

  await db
    .update(companiesTable)
    .set({
      planId,
      employeeCount,
      maxEmployees: band.maximumEmployees ?? 25,
      updatedAt: new Date(),
    })
    .where(eq(companiesTable.id, emp.companyId));

  return {
    outcome: "success",
    stage: "PAYMENT_PENDING",
    subscription,
    pricingBreakdown,
  };
}

export async function confirmOrderReview(input: {
  userId: string;
  agreedToTerms: boolean;
}): Promise<{
  outcome: "payment_pending" | "payment_ready";
  message: string;
  subscription: any;
}> {
  const { userId, agreedToTerms } = input;
  if (!userId) throw new Error("Authentication required");
  if (!agreedToTerms) throw new Error("You must agree to the Terms of Service and Privacy Policy to proceed");

  const [emp] = await db
    .select()
    .from(employeesTable)
    .where(eq(employeesTable.clerkUserId, userId))
    .limit(1);

  if (!emp || emp.role !== "admin") throw new Error("Company administrator account required");

  const [sub] = await db
    .select()
    .from(companySubscriptionsTable)
    .where(eq(companySubscriptionsTable.companyId, emp.companyId))
    .limit(1);

  if (!sub) throw new Error("No subscription plan selected");

  return {
    outcome: "payment_pending",
    message: "Your subscription order has been recorded. Online payment gateway is being finalised.",
    subscription: sub,
  };
}

export async function assignStarterCourse(
  companyId: number,
  adminUserId: string,
  courseCode: string = "ELH-01",
  dueDateDays: number = 30
): Promise<{ assignedCount: number; courseTitle: string }> {
  const [adminEmp] = await db
    .select()
    .from(employeesTable)
    .where(and(eq(employeesTable.clerkUserId, adminUserId), eq(employeesTable.companyId, companyId)))
    .limit(1);

  if (!adminEmp || adminEmp.role !== "admin") {
    throw new Error("Company administrator access required");
  }

  const [course] = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.courseCode, courseCode))
    .limit(1);

  if (!course) {
    throw new Error(`Starter course ${courseCode} not found`);
  }

  // Get active employees in company
  const activeEmployees = await db
    .select()
    .from(employeesTable)
    .where(and(eq(employeesTable.companyId, companyId), eq(employeesTable.status, "active")));

  if (activeEmployees.length === 0) {
    return { assignedCount: 0, courseTitle: course.title };
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + dueDateDays);

  const summary = await assignTrainingToCompanyEmployees({
    companyId,
    assignedByUserId: adminUserId,
    assignedByRole: "admin",
    courseIds: [course.id],
    employeeIds: activeEmployees.map((e) => e.id),
    dueDate: dueDate,
    assignmentSource: "required",
    skipEntitlementCheck: true,
  });

  return {
    assignedCount: summary.assignedCount,
    courseTitle: course.title,
  };
}
