import { Layout } from "@/components/layout/Layout";
import {
  useListCourses,
  useListEmployees,
} from "@workspace/api-client-react";
import { useTrainingReport, type TrainingReportParams } from "@/lib/lms-api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Download,
  FileSpreadsheet,
  Filter,
} from "lucide-react";
import { Link } from "wouter";
import { useMemo, useState } from "react";

const ALL = "all";

const STATUS_META: Record<string, { label: string; className: string }> = {
  not_started: {
    label: "Not Started",
    className: "bg-slate-400/10 text-slate-700 border-slate-400/30",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-blue-500/10 text-blue-700 border-blue-500/30",
  },
  completed: {
    label: "Completed",
    className: "bg-green-500/10 text-green-700 border-green-500/30",
  },
  overdue: {
    label: "Overdue",
    className: "bg-red-500/10 text-red-700 border-red-500/30",
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

function csvValue(value: unknown): string {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export default function CompanyReports() {
  const [employeeId, setEmployeeId] = useState(ALL);
  const [department, setDepartment] = useState(ALL);
  const [courseId, setCourseId] = useState(ALL);
  const [status, setStatus] = useState(ALL);

  const { data: employees } = useListEmployees();
  const { data: courses } = useListCourses();
  const params: TrainingReportParams = {
    employeeId: employeeId === ALL ? undefined : Number(employeeId),
    department: department === ALL ? undefined : department,
    courseId: courseId === ALL ? undefined : Number(courseId),
    status: status === ALL ? undefined : status as TrainingReportParams["status"],
  };
  const { data: rows, isLoading } = useTrainingReport(params);

  const departments = useMemo(() => {
    const set = new Set<string>();
    (employees ?? []).forEach((employee) => {
      if (employee.department) set.add(employee.department);
    });
    return Array.from(set).sort();
  }, [employees]);

  const exportCsv = () => {
    const data = rows ?? [];
    const header = [
      "Employee",
      "Email",
      "Department",
      "Job title",
      "Course",
      "Assigned",
      "Due date",
      "Completed",
      "Progress %",
      "Status",
      "Certificate reference",
    ];
    const body = data.map((row) => [
      row.employeeName,
      row.email,
      row.department ?? "",
      row.jobTitle ?? "",
      row.courseTitle,
      fmtDate(row.assignedAt),
      fmtDate(row.dueDate),
      fmtDate(row.completedAt),
      row.progressPct,
      STATUS_META[row.status]?.label ?? row.status,
      row.certificateCode ?? "",
    ]);
    const csv = [header, ...body]
      .map((line) => line.map(csvValue).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ecolearn-training-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="bg-primary/5 border-b py-8">
        <div className="container mx-auto px-4">
          <Link href="/company" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to overview
          </Link>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
                <FileSpreadsheet className="h-4 w-4" />
                ESG-ready training data
              </div>
              <h1 className="text-3xl font-bold font-serif mb-2">Training Reports</h1>
              <p className="text-muted-foreground max-w-2xl">
                Filter assignment progress by employee, department, course, and status.
              </p>
            </div>
            <Button onClick={exportCsv} disabled={!rows?.length}>
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold mb-4">
            <Filter className="h-4 w-4 text-primary" />
            Filters
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger><SelectValue placeholder="Employee" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All employees</SelectItem>
                {(employees ?? []).map((employee) => (
                  <SelectItem key={employee.id} value={String(employee.id)}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All departments</SelectItem>
                {departments.map((name) => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger><SelectValue placeholder="Course" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All courses</SelectItem>
                {(courses ?? []).map((course) => (
                  <SelectItem key={course.id} value={String(course.id)}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All statuses</SelectItem>
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Certificate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(6).fill(0).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-52" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : rows?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      No training records match these filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows?.map((row) => {
                    const meta = STATUS_META[row.status] ?? STATUS_META.not_started;
                    return (
                      <TableRow key={row.assignmentId}>
                        <TableCell>
                          <div className="font-medium">{row.employeeName}</div>
                          <div className="text-xs text-muted-foreground">{row.email}</div>
                        </TableCell>
                        <TableCell>
                          <div>{row.department ?? "-"}</div>
                          {row.jobTitle && (
                            <div className="text-xs text-muted-foreground">{row.jobTitle}</div>
                          )}
                        </TableCell>
                        <TableCell className="min-w-[220px]">{row.courseTitle}</TableCell>
                        <TableCell>{fmtDate(row.dueDate)}</TableCell>
                        <TableCell className="font-medium">{row.progressPct}%</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={meta.className}>{meta.label}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {row.certificateCode ?? "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
