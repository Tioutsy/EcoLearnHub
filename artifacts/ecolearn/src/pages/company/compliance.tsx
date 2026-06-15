import { Layout } from "@/components/layout/Layout";
import {
  useGetComplianceOverview,
  useListEmployees,
  useListCourses,
  useAssignCourse,
  useSendReminder,
  useRunRetrainingScan,
  useBulkImportEmployees,
  getGetComplianceOverviewQueryKey,
  getListEmployeesQueryKey,
} from "@workspace/api-client-react";
import type { ComplianceAssignment } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  CalendarX,
  CircleSlash,
  Bell,
  Upload,
  Download,
  ClipboardCheck,
  Send,
  FileSpreadsheet,
} from "lucide-react";
import * as XLSX from "xlsx";

const STATUS_META: Record<
  string,
  { label: string; className: string }
> = {
  compliant: {
    label: "Compliant",
    className: "bg-green-500/10 text-green-700 border-green-500/30",
  },
  expiring_soon: {
    label: "Expiring soon",
    className: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  },
  expired: {
    label: "Expired",
    className: "bg-red-500/10 text-red-700 border-red-500/30",
  },
  overdue: {
    label: "Overdue",
    className: "bg-orange-500/10 text-orange-700 border-orange-500/30",
  },
  not_started: {
    label: "Not started",
    className: "bg-slate-400/10 text-slate-600 border-slate-400/30",
  },
};

function fmtDate(value: string | null | undefined): string {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function CompanyCompliance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading } = useGetComplianceOverview();
  const { data: employees } = useListEmployees();
  const { data: courses } = useListCourses();

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: getGetComplianceOverviewQueryKey(),
    });
  };

  const assignCourse = useAssignCourse({
    mutation: { onSuccess: invalidate },
  });
  const sendReminder = useSendReminder();
  const retrainingScan = useRunRetrainingScan({
    mutation: { onSuccess: invalidate },
  });
  const bulkImport = useBulkImportEmployees({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getListEmployeesQueryKey(),
        });
        invalidate();
      },
    },
  });

  const summary = data?.summary;

  const departments = useMemo(() => {
    const set = new Set<string>();
    (employees ?? []).forEach((e) => {
      if (e.department) set.add(e.department);
    });
    return Array.from(set).sort();
  }, [employees]);

  const cards = [
    {
      key: "compliant",
      label: "Compliant",
      value: summary?.compliant ?? 0,
      icon: ShieldCheck,
      color: "text-green-600 bg-green-500/10",
    },
    {
      key: "expiring",
      label: "Expiring soon",
      value: summary?.expiringSoon ?? 0,
      icon: Clock,
      color: "text-amber-600 bg-amber-500/10",
    },
    {
      key: "expired",
      label: "Expired",
      value: summary?.expired ?? 0,
      icon: CalendarX,
      color: "text-red-600 bg-red-500/10",
    },
    {
      key: "overdue",
      label: "Overdue",
      value: summary?.overdue ?? 0,
      icon: ShieldAlert,
      color: "text-orange-600 bg-orange-500/10",
    },
    {
      key: "not_started",
      label: "Not started",
      value: summary?.notStarted ?? 0,
      icon: CircleSlash,
      color: "text-slate-600 bg-slate-400/10",
    },
  ];

  return (
    <Layout>
      <div className="bg-primary/5 border-b py-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm font-medium text-primary mb-3">
            <ClipboardCheck className="h-4 w-4" />
            HR and compliance
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-serif mb-2">
                Training Compliance
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                Track mandatory training across your organisation. Monitor
                expiry dates, assign courses by department, and send reminders to
                keep every team compliant.
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                variant="outline"
                disabled={retrainingScan.isPending}
                onClick={async () => {
                  const result = await retrainingScan.mutateAsync();
                  toast({
                    title:
                      result.notified > 0
                        ? `${result.notified} retraining notice${result.notified === 1 ? "" : "s"} sent`
                        : "No retraining needed",
                    description:
                      result.notified > 0
                        ? "Employees with expired training were notified."
                        : result.skipped > 0
                          ? `${result.skipped} already notified in the last 7 days.`
                          : "Every certification is still valid.",
                  });
                }}
              >
                <Bell className="h-4 w-4" />
                {retrainingScan.isPending ? "Scanning..." : "Run retraining scan"}
              </Button>
              <ImportEmployeesDialog
                onImport={async (rows) => {
                  const result = await bulkImport.mutateAsync({
                    data: { employees: rows },
                  });
                  return result;
                }}
                pending={bulkImport.isPending}
              />
              <AssignCourseDialog
                courses={(courses ?? []).map((c) => ({
                  id: c.id,
                  title: c.title,
                }))}
                employees={(employees ?? []).map((e) => ({
                  id: e.id,
                  name: e.name,
                  department: e.department ?? null,
                }))}
                departments={departments}
                pending={assignCourse.isPending}
                onAssign={async (payload) => {
                  const result = await assignCourse.mutateAsync({
                    data: payload,
                  });
                  toast({
                    title: `Assigned to ${result.assigned} employee${result.assigned === 1 ? "" : "s"}`,
                    description:
                      result.skipped > 0
                        ? `${result.skipped} already had this course.`
                        : undefined,
                  });
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 space-y-10">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-xl" />
              ))}
          </div>
        ) : (
          <>
            <div className="bg-card border rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Overall compliance rate
                  </p>
                  <p className="text-4xl font-bold font-serif text-primary">
                    {summary?.complianceRate ?? 0}%
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {summary?.total ?? 0} mandatory training assignments tracked
                </p>
              </div>
              <Progress value={summary?.complianceRate ?? 0} className="h-2" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {cards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.key}
                    className="bg-card border rounded-xl p-5 flex flex-col gap-3"
                  >
                    <div
                      className={`h-10 w-10 rounded-lg flex items-center justify-center ${card.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{card.value}</p>
                      <p className="text-sm text-muted-foreground">
                        {card.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {data && data.courses.length > 0 && (
              <div>
                <h2 className="text-xl font-bold font-serif mb-4">
                  Compliance by course
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {data.courses.map((c) => (
                    <div key={c.courseId} className="bg-card border rounded-xl p-5">
                      <p className="font-semibold mb-1 line-clamp-2">{c.title}</p>
                      <p className="text-sm text-muted-foreground mb-3">
                        {c.compliant} of {c.total} compliant
                      </p>
                      <Progress value={c.complianceRate} className="h-2 mb-1" />
                      <p className="text-right text-sm font-medium text-primary">
                        {c.complianceRate}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-xl font-bold font-serif mb-4">
                Employee training status
              </h2>
              {!data || data.assignments.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed rounded-2xl bg-muted/10">
                  <ClipboardCheck className="h-14 w-14 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-bold mb-2">
                    No training assigned yet
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Assign a mandatory course to your team to start tracking
                    compliance.
                  </p>
                </div>
              ) : (
                <div className="bg-card border rounded-2xl overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Due</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.assignments.map((row) => (
                        <ComplianceRow
                          key={row.id}
                          row={row}
                          onRemind={async (type) => {
                            await sendReminder.mutateAsync({
                              data: {
                                employeeId: row.employeeId,
                                courseId: row.courseId,
                                type,
                              },
                            });
                            toast({
                              title:
                                type === "retraining"
                                  ? "Retraining notice sent"
                                  : "Reminder sent",
                              description: `Notified ${row.employeeName}.`,
                            });
                          }}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

function ComplianceRow({
  row,
  onRemind,
}: {
  row: ComplianceAssignment;
  onRemind: (type: "reminder" | "retraining") => Promise<void>;
}) {
  const [pending, setPending] = useState(false);
  const meta = STATUS_META[row.status] ?? STATUS_META.not_started;
  const needsRetraining = row.status === "expired";
  const needsReminder =
    row.status === "overdue" ||
    row.status === "not_started" ||
    row.status === "expiring_soon";

  const handle = async (type: "reminder" | "retraining") => {
    setPending(true);
    try {
      await onRemind(type);
    } finally {
      setPending(false);
    }
  };

  return (
    <TableRow>
      <TableCell>
        <p className="font-medium">{row.employeeName}</p>
        {row.department && (
          <p className="text-xs text-muted-foreground">{row.department}</p>
        )}
      </TableCell>
      <TableCell className="max-w-[220px]">
        <span className="line-clamp-2">{row.courseTitle}</span>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {fmtDate(row.dueDate)}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {fmtDate(row.expiresAt)}
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={meta.className}>
          {meta.label}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        {needsRetraining ? (
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => handle("retraining")}
          >
            <Bell className="h-3.5 w-3.5 mr-1.5" />
            Retrain
          </Button>
        ) : needsReminder ? (
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => handle("reminder")}
          >
            <Send className="h-3.5 w-3.5 mr-1.5" />
            Remind
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">No action</span>
        )}
      </TableCell>
    </TableRow>
  );
}

function AssignCourseDialog({
  courses,
  employees,
  departments,
  pending,
  onAssign,
}: {
  courses: { id: number; title: string }[];
  employees: { id: number; name: string; department: string | null }[];
  departments: string[];
  pending: boolean;
  onAssign: (payload: {
    courseId: number;
    employeeIds?: number[];
    department?: string;
    dueDate?: string;
  }) => Promise<void>;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"department" | "employees">("department");
  const [courseId, setCourseId] = useState<string>("");
  const [department, setDepartment] = useState<string>("");
  const [selected, setSelected] = useState<number[]>([]);
  const [dueDate, setDueDate] = useState<string>("");

  const reset = () => {
    setCourseId("");
    setDepartment("");
    setSelected([]);
    setDueDate("");
    setMode("department");
  };

  const submit = async () => {
    if (!courseId) {
      toast({ title: "Select a course", variant: "destructive" });
      return;
    }
    if (mode === "department" && !department) {
      toast({ title: "Select a department", variant: "destructive" });
      return;
    }
    if (mode === "employees" && selected.length === 0) {
      toast({ title: "Select at least one employee", variant: "destructive" });
      return;
    }
    await onAssign({
      courseId: Number(courseId),
      department: mode === "department" ? department : undefined,
      employeeIds: mode === "employees" ? selected : undefined,
      dueDate: dueDate || undefined,
    });
    setOpen(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <ClipboardCheck className="h-4 w-4 mr-2" />
          Assign training
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign mandatory training</DialogTitle>
          <DialogDescription>
            Assign a course to a whole department or selected employees.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Course</Label>
            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant={mode === "department" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("department")}
            >
              By department
            </Button>
            <Button
              type="button"
              variant={mode === "employees" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("employees")}
            >
              Select employees
            </Button>
          </div>

          {mode === "department" ? (
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Employees</Label>
              <div className="max-h-48 overflow-y-auto border rounded-lg p-2 space-y-1">
                {employees.map((e) => {
                  const checked = selected.includes(e.id);
                  return (
                    <label
                      key={e.id}
                      className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50 cursor-pointer text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(ev) => {
                          setSelected((prev) =>
                            ev.target.checked
                              ? [...prev, e.id]
                              : prev.filter((id) => id !== e.id),
                          );
                        }}
                      />
                      <span className="flex-1">{e.name}</span>
                      {e.department && (
                        <span className="text-xs text-muted-foreground">
                          {e.department}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Due date (optional)</Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={pending}>
            {pending ? "Assigning..." : "Assign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type ImportRow = {
  name: string;
  email: string;
  department?: string;
  role?: string;
};

function ImportEmployeesDialog({
  onImport,
  pending,
}: {
  onImport: (
    rows: ImportRow[],
  ) => Promise<{ created: number; skipped: number; errors: string[] }>;
  pending: boolean;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setRows([]);
    setFileName("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      {
        name: "Jane Doe",
        email: "jane@company.mu",
        department: "Finance",
        role: "employee",
      },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employees");
    XLSX.writeFile(wb, "employee-import-template.xlsx");
  };

  const handleFile = async (file: File) => {
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
      const parsed: ImportRow[] = json.map((r) => ({
        name: String(r.name ?? r.Name ?? "").trim(),
        email: String(r.email ?? r.Email ?? "").trim(),
        department: String(r.department ?? r.Department ?? "").trim(),
        role: String(r.role ?? r.Role ?? "employee").trim(),
      }));
      setFileName(file.name);
      setRows(parsed);
    } catch {
      toast({
        title: "Could not read file",
        description: "Please upload a valid .xlsx spreadsheet.",
        variant: "destructive",
      });
    }
  };

  const submit = async () => {
    if (rows.length === 0) return;
    const result = await onImport(rows);
    toast({
      title: `Imported ${result.created} employee${result.created === 1 ? "" : "s"}`,
      description:
        result.errors.length > 0
          ? `${result.errors.length} row(s) skipped due to errors.`
          : result.skipped > 0
            ? `${result.skipped} duplicate(s) skipped.`
            : undefined,
    });
    setOpen(false);
    reset();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Bulk import
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Bulk import employees</DialogTitle>
          <DialogDescription>
            Upload an Excel file with columns: name, email, department, role.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Button variant="outline" size="sm" onClick={downloadTemplate}>
            <Download className="h-4 w-4 mr-2" />
            Download template
          </Button>

          <label className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/30 transition-colors">
            <FileSpreadsheet className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-sm font-medium">
              {fileName || "Click to choose an .xlsx file"}
            </span>
            <span className="text-xs text-muted-foreground mt-1">
              The first sheet will be imported
            </span>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </label>

          {rows.length > 0 && (
            <div className="border rounded-lg max-h-48 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.slice(0, 50).map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>{r.name || "-"}</TableCell>
                      <TableCell>{r.email || "-"}</TableCell>
                      <TableCell>{r.department || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {rows.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {rows.length} row{rows.length === 1 ? "" : "s"} ready to import.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={pending || rows.length === 0}>
            {pending ? "Importing..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
