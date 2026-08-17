import { Layout } from "@/components/layout/Layout";
import {
  getListEmployeesQueryKey,
  useAddEmployee,
  useListCourses,
  useListEmployees,
  useRemoveEmployee,
  useUpdateEmployee,
} from "@workspace/api-client-react";
import type { Course, Employee } from "@workspace/api-client-react";
import { useAssignCompanyCourses, useCreateEmployeeInvitation } from "@/lib/lms-api";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, UserCircle, ArrowLeft, Pencil, Trash2, Send, ClipboardList, Copy, CheckCircle2, Sparkles } from "lucide-react";
import { SmartRecommendationDialog } from "@/components/SmartRecommendationDialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";

import { useLanguage } from "@/context/LanguageContext";

const EMPTY_FORM = {
  name: "",
  email: "",
  department: "",
  jobTitle: "",
  role: "employee",
};

type EmployeeFormState = typeof EMPTY_FORM;
type ManagedEmployee = Employee & {
  jobTitle?: string | null;
  invitationStatus?: "not_invited" | "invited" | "accepted";
  invitationSentAt?: string | null;
  invitationAcceptedAt?: string | null;
};

function normaliseForm(values: EmployeeFormState) {
  return {
    name: values.name.trim(),
    email: values.email.trim(),
    department: values.department.trim() || null,
    jobTitle: values.jobTitle.trim() || null,
    role: values.role as "employee" | "manager" | "admin",
  };
}

function employeeStatusLabel(employee: ManagedEmployee): string {
  if (employee.invitationStatus === "accepted") return "Active";
  if (employee.invitationStatus === "invited") return "Invited";
  return "Not invited";
}

import { useUser } from "@clerk/react";
import { hasCapability } from "@/lib/authHelpers";

export default function CompanyEmployees() {
  const { t } = useLanguage();
  const { user } = useUser();
  const queryClient = useQueryClient();
  const canManageEmployees = hasCapability(user, "employees.create");
  const { data: employeeData, isLoading } = useListEmployees();
  const { data: courses } = useListCourses();
  const addEmployee = useAddEmployee();
  const updateEmployee = useUpdateEmployee();
  const removeEmployee = useRemoveEmployee();
  const inviteEmployee = useCreateEmployeeInvitation();
  const assignCourses = useAssignCompanyCourses();
  const { toast } = useToast();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editing, setEditing] = useState<ManagedEmployee | null>(null);
  const [recommendingEmployee, setRecommendingEmployee] = useState<ManagedEmployee | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const employees = (employeeData ?? []) as ManagedEmployee[];

  const departments = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((employee) => {
      if (employee.department) set.add(employee.department);
    });
    return Array.from(set).sort();
  }, [employees]);

  const filteredEmployees = employees.filter((employee) =>
    [employee.name, employee.email, employee.department, employee.jobTitle]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(search.toLowerCase())),
  );

  const invalidateEmployees = () => {
    queryClient.invalidateQueries({ queryKey: getListEmployeesQueryKey() });
  };

  const toggleEmployee = (id: number) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  };

  const allVisibleSelected =
    filteredEmployees.length > 0 &&
    filteredEmployees.every((employee) => selectedIds.includes(employee.id));

  const handleInvite = async (employee: ManagedEmployee) => {
    try {
      const result = await inviteEmployee.mutateAsync(employee.id);
      setInviteLink(result.invitationLink);
      await navigator.clipboard?.writeText(result.invitationLink).catch(() => undefined);
      toast({
        title: "Invitation link created",
        description: result.emailSent ? "Invitation email sent." : "Link copied to clipboard and displayed above.",
      });
      invalidateEmployees();
    } catch (err: unknown) {
      toast({
        title: "Failed to generate invitation",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (employee: ManagedEmployee) => {
    if (!window.confirm(`Delete ${employee.name}? Their current assignments will be removed.`)) return;
    await removeEmployee.mutateAsync({ id: employee.id });
    setSelectedIds((current) => current.filter((id) => id !== employee.id));
    invalidateEmployees();
    toast({ title: "Employee deleted" });
  };

  return (
    <Layout>
      <div className="bg-primary/5 border-b py-8">
        <div className="container mx-auto px-4">
          <Link href="/company" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to overview
          </Link>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-serif mb-2">Manage Employees</h1>
              <p className="text-muted-foreground">Invite team members, keep employee details current, and assign training.</p>
            </div>
            {canManageEmployees && (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => setAssignOpen(true)}>
                  <ClipboardList className="mr-2 h-4 w-4" /> Assign Training
                </Button>
                <EmployeeDialog
                  open={isAddOpen}
                  onOpenChange={setIsAddOpen}
                  title="Add Employee"
                  submitLabel={addEmployee.isPending ? "Adding..." : "Add Employee"}
                  pending={addEmployee.isPending}
                  onSubmit={async (values) => {
                    try {
                      await addEmployee.mutateAsync({ data: normaliseForm(values) });
                      setIsAddOpen(false);
                      invalidateEmployees();
                      toast({ title: "Employee added" });
                    } catch (err: unknown) {
                      toast({
                        title: "Failed to add employee",
                        description: err instanceof Error ? err.message : "Please try again.",
                        variant: "destructive",
                      });
                    }
                  }}
                  trigger={<Button><Plus className="mr-2 h-4 w-4" /> Add Employee</Button>}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              className="pl-9"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {selectedIds.length} selected for assignment
          </p>
        </div>

        {inviteLink && (
          <div className="mb-6 rounded-xl border bg-primary/5 p-4 flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Invitation link ready</p>
              <p className="text-xs text-muted-foreground truncate">{inviteLink}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigator.clipboard?.writeText(inviteLink)}>
              <Copy className="mr-2 h-4 w-4" /> Copy
            </Button>
          </div>
        )}

        <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={allVisibleSelected}
                      onCheckedChange={(checked) => {
                        const visible = filteredEmployees.map((employee) => employee.id);
                        setSelectedIds((current) =>
                          checked
                            ? Array.from(new Set([...current, ...visible]))
                            : current.filter((id) => !visible.includes(id)),
                        );
                      }}
                    />
                  </TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Courses</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                      <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-12 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-28 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                      No employees found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(employee.id)}
                          onCheckedChange={() => toggleEmployee(employee.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <UserCircle className="h-8 w-8 text-muted-foreground shrink-0" />
                          <div>
                            <div className="font-medium text-foreground">{employee.name}</div>
                            <div className="text-xs text-muted-foreground">{employee.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{employee.department || "-"}</TableCell>
                      <TableCell>{employee.jobTitle || "-"}</TableCell>
                      <TableCell>
                        {employee.role === "admin" ? (
                          <Badge className="bg-emerald-800 hover:bg-emerald-900 text-white font-medium capitalize">
                            Admin
                          </Badge>
                        ) : employee.role === "manager" ? (
                          <Badge className="bg-purple-700 hover:bg-purple-800 text-white font-medium capitalize shadow-sm">
                            Manager
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-600 hover:bg-blue-700 text-white font-medium capitalize">
                            Employee
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={employee.invitationStatus === "accepted" ? "border-green-500/30 text-green-700" : ""}>
                          {employeeStatusLabel(employee)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        <span className="text-primary">{employee.completedCourses || 0}</span>
                        <span className="text-muted-foreground">/{employee.enrolledCourses || 0}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" title="Smart Recommendation" onClick={() => setRecommendingEmployee(employee)}>
                            <Sparkles className="h-4 w-4 text-emerald-600" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleInvite(employee)} disabled={inviteEmployee.isPending}>
                            <Send className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setEditing(employee)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(employee)} disabled={removeEmployee.isPending}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

      <EmployeeDialog
        key={editing?.id ?? "edit-closed"}
        open={Boolean(editing)}
        onOpenChange={(open) => !open && setEditing(null)}
        title="Edit Employee"
        initial={editing ? {
          name: editing.name,
          email: editing.email,
          department: editing.department ?? "",
          jobTitle: editing.jobTitle ?? "",
          role: editing.role,
        } : EMPTY_FORM}
        submitLabel={updateEmployee.isPending ? "Saving..." : "Save Changes"}
        pending={updateEmployee.isPending}
        onSubmit={async (values) => {
          if (!editing) return;
          try {
            await updateEmployee.mutateAsync({ id: editing.id, data: normaliseForm(values) });
            setEditing(null);
            invalidateEmployees();
            toast({ title: "Employee updated" });
          } catch (err: unknown) {
            toast({
              title: "Failed to update employee",
              description: err instanceof Error ? err.message : "Please try again.",
              variant: "destructive",
            });
          }
        }}
      />

      <AssignTrainingDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        employees={employees}
        courses={courses ?? []}
        departments={departments}
        selectedIds={selectedIds}
        pending={assignCourses.isPending}
        onAssign={async (payload) => {
          const result = await assignCourses.mutateAsync(payload);
          setAssignOpen(false);
          invalidateEmployees();
          toast({
            title: `Assigned ${result.assigned + (result.updated ?? 0)} training record${result.assigned + (result.updated ?? 0) === 1 ? "" : "s"}`,
            description: result.updated ? `${result.updated} existing assignment${result.updated === 1 ? "" : "s"} updated.` : undefined,
          });
        }}
      />

      <SmartRecommendationDialog
        open={Boolean(recommendingEmployee)}
        onOpenChange={(open) => !open && setRecommendingEmployee(null)}
        employee={recommendingEmployee}
        onSuccessAssignment={() => invalidateEmployees()}
      />
    </Layout>
  );
}

export const PRESET_DEPARTMENTS: {
  name: string;
  jobTitles: string[];
}[] = [
  {
    name: "Operations & Frontline",
    jobTitles: [
      "Operations Manager",
      "Site Supervisor",
      "Field Technician",
      "Line Operator",
      "Logistics & Stores Officer",
      "Frontline Team Member",
    ],
  },
  {
    name: "Facilities & Maintenance",
    jobTitles: [
      "Facilities Manager",
      "Maintenance Supervisor",
      "Building Engineer",
      "Health, Safety & Environment (HSE) Officer",
      "Property Officer",
    ],
  },
  {
    name: "Procurement & Supply Chain",
    jobTitles: [
      "Procurement Manager",
      "Purchasing Officer",
      "Buyer / Sourcing Specialist",
      "Supply Chain Coordinator",
      "Inventory Controller",
    ],
  },
  {
    name: "Human Resources & Administration",
    jobTitles: [
      "HR Manager",
      "HR Executive",
      "Training & Development Coordinator",
      "Office Administrator",
      "People & Culture Lead",
    ],
  },
  {
    name: "Finance & Accounting",
    jobTitles: [
      "CFO / Finance Director",
      "Finance Manager",
      "Senior Accountant",
      "Financial Analyst",
      "Accounts & Audit Officer",
    ],
  },
  {
    name: "Sales & Marketing",
    jobTitles: [
      "Sales Manager",
      "Marketing Executive",
      "Business Development Manager",
      "Brand & Communications Officer",
      "Client Relationship Specialist",
    ],
  },
  {
    name: "Executive & Management",
    jobTitles: [
      "Managing Director / CEO",
      "General Manager / COO",
      "Department Head",
      "Executive Director",
    ],
  },
  {
    name: "Sustainability & Green Team",
    jobTitles: [
      "Sustainability Champion",
      "Green Team Lead",
      "ESG Coordinator",
      "Environmental Officer",
    ],
  },
  {
    name: "General",
    jobTitles: [
      "Team Member",
      "Executive",
      "Associate",
      "Specialist",
    ],
  },
];

function EmployeeDialog({
  open,
  onOpenChange,
  title,
  initial = EMPTY_FORM,
  submitLabel,
  pending,
  onSubmit,
  trigger,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initial?: EmployeeFormState;
  submitLabel: string;
  pending: boolean;
  onSubmit: (values: EmployeeFormState) => Promise<void>;
  trigger?: ReactNode;
}) {
  const { toast } = useToast();
  const [values, setValues] = useState<EmployeeFormState>(initial);
  const [isCustomDept, setIsCustomDept] = useState(false);
  const [isCustomJobTitle, setIsCustomJobTitle] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(initial);
      const isPresetDept = PRESET_DEPARTMENTS.some((d) => d.name === initial.department);
      setIsCustomDept(Boolean(initial.department && !isPresetDept));
      
      const currentDeptObj = PRESET_DEPARTMENTS.find((d) => d.name === initial.department);
      const isPresetJob = currentDeptObj?.jobTitles.includes(initial.jobTitle);
      setIsCustomJobTitle(Boolean(initial.jobTitle && !isPresetJob));
    }
  }, [open, initial]);

  const setField = (field: keyof EmployeeFormState, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleDeptSelect = (dept: string) => {
    if (dept === "__custom__") {
      setIsCustomDept(true);
      setField("department", "");
    } else {
      setIsCustomDept(false);
      setField("department", dept);
      // Auto-select first recommended title if job title was empty
      const matched = PRESET_DEPARTMENTS.find((d) => d.name === dept);
      if (matched && matched.jobTitles.length > 0 && (!values.jobTitle || isCustomJobTitle)) {
        setIsCustomJobTitle(false);
      }
    }
  };

  const handleJobTitleSelect = (titleVal: string) => {
    if (titleVal === "__custom__") {
      setIsCustomJobTitle(true);
      setField("jobTitle", "");
    } else {
      setIsCustomJobTitle(false);
      setField("jobTitle", titleVal);
      // Auto-suggest role if manager/director title is selected
      const lower = titleVal.toLowerCase();
      if ((lower.includes("manager") || lower.includes("lead") || lower.includes("head") || lower.includes("director") || lower.includes("cfo") || lower.includes("coo") || lower.includes("ceo")) && values.role === "employee") {
        setField("role", "manager");
      }
    }
  };

  const currentDeptConfig = PRESET_DEPARTMENTS.find((d) => d.name === values.department);
  const availableJobTitles = currentDeptConfig
    ? currentDeptConfig.jobTitles
    : Array.from(new Set(PRESET_DEPARTMENTS.flatMap((d) => d.jobTitles)));

  const submit = async () => {
    if (!values.name.trim() || !values.email.trim()) {
      toast({ title: "Name and email are required", variant: "destructive" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      toast({ title: "Enter a valid email address", variant: "destructive" });
      return;
    }
    await onSubmit(values);
    setValues(EMPTY_FORM);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        setValues(next ? initial : EMPTY_FORM);
      }}
    >
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Employee Details
            </label>
            <Input placeholder="Full name (e.g. Jean Dupont)" value={values.name} onChange={(event) => setField("name", event.target.value)} />
          </div>

          <div className="space-y-1">
            <Input placeholder="Corporate email (e.g. j.dupont@company.mu)" value={values.email} onChange={(event) => setField("email", event.target.value)} />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {/* Department Preset / Custom */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Department</label>
              {!isCustomDept ? (
                <Select value={values.department || undefined} onValueChange={handleDeptSelect}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRESET_DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept.name} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="__custom__">✏️ Custom Department...</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex gap-1">
                  <Input
                    placeholder="Enter Department"
                    value={values.department}
                    onChange={(e) => setField("department", e.target.value)}
                    autoFocus
                  />
                  <Button type="button" variant="ghost" size="sm" onClick={() => setIsCustomDept(false)} className="text-xs shrink-0">
                    Presets
                  </Button>
                </div>
              )}
            </div>

            {/* Job Title Preset / Custom */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Job Title</label>
              {!isCustomJobTitle ? (
                <Select value={values.jobTitle || undefined} onValueChange={handleJobTitleSelect}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Job Title" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableJobTitles.map((titleItem) => (
                      <SelectItem key={titleItem} value={titleItem}>
                        {titleItem}
                      </SelectItem>
                    ))}
                    <SelectItem value="__custom__">✏️ Custom Job Title...</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex gap-1">
                  <Input
                    placeholder="Enter Job Title"
                    value={values.jobTitle}
                    onChange={(e) => setField("jobTitle", e.target.value)}
                    autoFocus
                  />
                  <Button type="button" variant="ghost" size="sm" onClick={() => setIsCustomJobTitle(false)} className="text-xs shrink-0">
                    Presets
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Account Role</label>
            <Select value={values.role} onValueChange={(value) => setField("role", value)}>
              <SelectTrigger><SelectValue placeholder="Select Role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Employee (Learner)</SelectItem>
                <SelectItem value="manager">Manager (Team Progress & Recommendations)</SelectItem>
                <SelectItem value="admin">Company Admin (Full LMS Access)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={pending} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AssignTrainingDialog({
  open,
  onOpenChange,
  employees,
  courses,
  departments,
  selectedIds,
  pending,
  onAssign,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: ManagedEmployee[];
  courses: Course[];
  departments: string[];
  selectedIds: number[];
  pending: boolean;
  onAssign: (payload: {
    courseIds: number[];
    employeeIds?: number[];
    department?: string;
    dueDate?: string;
  }) => Promise<void>;
}) {
  const { toast } = useToast();
  const [mode, setMode] = useState<"selected" | "department">("selected");
  const [courseIds, setCourseIds] = useState<number[]>([]);
  const [department, setDepartment] = useState("");
  const [dueDate, setDueDate] = useState("");

  const toggleCourse = (id: number) => {
    setCourseIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  };

  const submit = async () => {
    if (courseIds.length === 0) {
      toast({ title: "Select at least one course", variant: "destructive" });
      return;
    }
    if (mode === "selected" && selectedIds.length === 0) {
      toast({ title: "Select at least one employee", variant: "destructive" });
      return;
    }
    if (mode === "department" && !department) {
      toast({ title: "Select a department", variant: "destructive" });
      return;
    }
    await onAssign({
      courseIds,
      employeeIds: mode === "selected" ? selectedIds : undefined,
      department: mode === "department" ? department : undefined,
      dueDate: dueDate || undefined,
    });
    setCourseIds([]);
    setDepartment("");
    setDueDate("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Training</DialogTitle>
        </DialogHeader>
        <div className="grid gap-5">
          <div className="grid sm:grid-cols-2 gap-3">
            <Button type="button" variant={mode === "selected" ? "default" : "outline"} onClick={() => setMode("selected")}>
              Selected employees ({selectedIds.length})
            </Button>
            <Button type="button" variant={mode === "department" ? "default" : "outline"} onClick={() => setMode("department")}>
              By department
            </Button>
          </div>

          {mode === "department" && (
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
              <SelectContent>
                {departments.map((name) => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <div>
            <p className="text-sm font-medium mb-2">Courses</p>
            <div className="max-h-56 overflow-y-auto rounded-lg border divide-y">
              {courses.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">No courses available.</div>
              ) : (
                courses.map((course) => (
                  <label key={course.id} className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/40">
                    <Checkbox checked={courseIds.includes(course.id)} onCheckedChange={() => toggleCourse(course.id)} />
                    <span className="text-sm font-medium">{course.title}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <Input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />

          {mode === "selected" && selectedIds.length > 0 && (
            <div className="rounded-lg border bg-muted/20 p-3 text-sm text-muted-foreground">
              <CheckCircle2 className="mr-2 inline h-4 w-4 text-primary" />
              Assigning to {selectedIds.length} selected employee{selectedIds.length === 1 ? "" : "s"}.
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={pending}>
            {pending ? "Assigning..." : "Assign Courses"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
