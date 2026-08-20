import { useState, useMemo } from "react";
import { Link } from "wouter";
import { PlatformAdminLayout } from "@/components/layout/PlatformAdminLayout";
import {
  usePlatformAdminListCourses,
  usePlatformAdminListSectors,
  usePlatformAdminListSdgContributions,
  usePlatformAdminUpdateCourseMetadata,
  usePlatformAdminListLessons,
  usePlatformAdminCreateLesson,
  usePlatformAdminUpdateLesson,
  usePlatformAdminReorderLessons,
  usePlatformAdminListQuizQuestions,
  usePlatformAdminCreateQuizQuestion,
  usePlatformAdminUpdateQuizQuestion,
  usePlatformAdminReorderQuizQuestions,
  customFetch,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Edit,
  AlertCircle,
  Plus,
  ArrowUp,
  ArrowDown,
  Archive,
  BookOpen,
  Settings,
  HelpCircle,
  Trash2,
  Eye,
  FileText,
  CheckCircle,
  XCircle,
  Info,
  Award,
  Search,
  Filter,
  Globe,
  EyeOff,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

type ContentBlockType =
  | "heading"
  | "short_text"
  | "key_message"
  | "workplace_example"
  | "mauritian_example"
  | "practical_action"
  | "image"
  | "expandable"
  | "multiple_choice"
  | "decision_scenario"
  | "reflection"
  | "commitment";

interface ContentBlock {
  id: string;
  type: ContentBlockType;
  position: number;
  accessibilityLabel?: string;
  headingText?: string;
  bodyText?: string;
  imageUrl?: string;
  imageAlt?: string;
  expandableTitle?: string;
  expandableContent?: string;
  mcqQuestion?: string;
  mcqOptions?: string[];
  mcqCorrectIndex?: number;
  mcqCorrectExplanation?: string;
  mcqIncorrectExplanation?: string;
  decisionIntro?: string;
  decisionPrompt?: string;
  decisionChoices?: { label: string; correct: boolean; feedback: string }[];
  commitmentInstruction?: string;
  commitmentOptions?: { value: string; label: string; description: string }[];
}

export default function PlatformAdminCourses() {
  const queryClient = useQueryClient();

  // Queries
  const coursesQuery = usePlatformAdminListCourses();
  const sectorsQuery = usePlatformAdminListSectors();
  const sdgQuery = usePlatformAdminListSdgContributions();

  // State Management
  const [viewMode, setViewMode] = useState<"list" | "edit">("list");
  const [activeTab, setActiveTab] = useState<"metadata" | "lessons" | "quiz">("metadata");
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft" | "review">("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");

  // Create Course Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newCourseCode, setNewCourseCode] = useState("");
  const [newLevel, setNewLevel] = useState("Beginner");
  const [newDuration, setNewDuration] = useState(20);
  const [newDescription, setNewDescription] = useState("");
  const [newFullDescription, setNewFullDescription] = useState("");
  const [newStatus, setNewStatus] = useState<"draft" | "published">("draft");

  // Delete Course Confirmation State
  const [courseToDelete, setCourseToDelete] = useState<any | null>(null);
  const [isDeletingCourse, setIsDeletingCourse] = useState(false);

  // Lesson Block Editor States
  const [selectedLessonForBlocks, setSelectedLessonForBlocks] = useState<any | null>(null);
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Form Fields - General Course Metadata
  const [courseTitle, setCourseTitle] = useState("");
  const [courseSlug, setCourseSlug] = useState("");
  const [description, setDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(20);
  const [priceUsd, setPriceUsd] = useState("1400.00");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [passingScore, setPassingScore] = useState(80);
  const [status, setStatus] = useState<"draft" | "review" | "published">("draft");
  const [badgeName, setBadgeName] = useState("");
  const [badgeDescription, setBadgeDescription] = useState("");
  const [learningObjectives, setLearningObjectives] = useState("");

  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [intendedRoles, setIntendedRoles] = useState("");
  const [version, setVersion] = useState(1);
  const [reviewDate, setReviewDate] = useState("");
  const [recommendedNextCourseId, setRecommendedNextCourseId] = useState<number | "">("");
  const [includesCertificate, setIncludesCertificate] = useState(true);

  const [selectedSectors, setSelectedSectors] = useState<number[]>([]);
  const [selectedPrereqs, setSelectedPrereqs] = useState<number[]>([]);
  const [selectedSdg, setSelectedSdg] = useState<number[]>([]);

  // Lesson Dialog States
  const [showLessonDialog, setShowLessonDialog] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any | null>(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDuration, setLessonDuration] = useState(5);

  // Quiz Question Dialog States
  const [showQuizDialog, setShowQuizDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [quizQuestion, setQuizQuestion] = useState("");
  const [quizOptions, setQuizOptions] = useState<string[]>(["", "", "", ""]);
  const [quizCorrectOption, setQuizCorrectOption] = useState(0);
  const [quizCorrectExplanation, setQuizCorrectExplanation] = useState("");
  const [quizIncorrectExplanation, setQuizIncorrectExplanation] = useState("");
  const [quizOptionFeedback, setQuizOptionFeedback] = useState<string[]>(["", "", "", ""]);

  // Fetch Lessons & Questions dynamically when course is selected
  const { data: lessons = [], refetch: refetchLessons } = usePlatformAdminListLessons(
    editingCourseId || 0,
    { query: { enabled: !!editingCourseId } as any }
  );

  const { data: quizQuestions = [], refetch: refetchQuiz } = usePlatformAdminListQuizQuestions(
    editingCourseId || 0,
    { query: { enabled: !!editingCourseId } as any }
  );

  // Mutations
  const updateMetadataMutation = usePlatformAdminUpdateCourseMetadata({
    mutation: {
      onSuccess: () => {
        toast.success("Course settings saved successfully");
        queryClient.invalidateQueries({ queryKey: ["/api/platform-admin/courses"] });
        queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
        setViewMode("list");
        resetForm();
      },
      onError: (err: any) => {
        toast.error(`Error: ${err.message || "Failed to update course settings"}`);
      }
    }
  });

  const createLessonMutation = usePlatformAdminCreateLesson({
    mutation: {
      onSuccess: () => {
        toast.success("Lesson created successfully");
        refetchLessons();
        setShowLessonDialog(false);
        setLessonTitle("");
        setLessonDuration(5);
      },
      onError: (err: any) => toast.error(err.message || "Failed to create lesson")
    }
  });

  const updateLessonMutation = usePlatformAdminUpdateLesson({
    mutation: {
      onSuccess: () => {
        toast.success("Lesson updated successfully");
        refetchLessons();
        setShowLessonDialog(false);
        setEditingLesson(null);
        setLessonTitle("");
        setLessonDuration(5);
      },
      onError: (err: any) => toast.error(err.message || "Failed to update lesson")
    }
  });

  const reorderLessonsMutation = usePlatformAdminReorderLessons({
    mutation: {
      onSuccess: () => {
        toast.success("Lessons reordered successfully");
        refetchLessons();
      },
      onError: (err: any) => toast.error(err.message || "Failed to reorder lessons")
    }
  });

  const createQuestionMutation = usePlatformAdminCreateQuizQuestion({
    mutation: {
      onSuccess: () => {
        toast.success("Quiz question created successfully");
        refetchQuiz();
        setShowQuizDialog(false);
        resetQuizForm();
      },
      onError: (err: any) => toast.error(err.message || "Failed to create quiz question")
    }
  });

  const updateQuestionMutation = usePlatformAdminUpdateQuizQuestion({
    mutation: {
      onSuccess: () => {
        toast.success("Quiz question updated successfully");
        refetchQuiz();
        setShowQuizDialog(false);
        resetQuizForm();
      },
      onError: (err: any) => toast.error(err.message || "Failed to update quiz question")
    }
  });

  const reorderQuestionsMutation = usePlatformAdminReorderQuizQuestions({
    mutation: {
      onSuccess: () => {
        toast.success("Quiz questions reordered successfully");
        refetchQuiz();
      },
      onError: (err: any) => toast.error(err.message || "Failed to reorder quiz questions")
    }
  });

  const resetForm = () => {
    setEditingCourseId(null);
    setCourseTitle("");
    setCourseSlug("");
    setDescription("");
    setFullDescription("");
    setDurationMinutes(20);
    setPriceUsd("1400.00");
    setThumbnailUrl("");
    setPassingScore(80);
    setStatus("draft");
    setBadgeName("");
    setBadgeDescription("");
    setLearningObjectives("");
    setLevel("beginner");
    setIntendedRoles("");
    setVersion(1);
    setReviewDate("");
    setRecommendedNextCourseId("");
    setIncludesCertificate(true);
    setSelectedSectors([]);
    setSelectedPrereqs([]);
    setSelectedSdg([]);
  };

  const handleEditClick = (course: any) => {
    setEditingCourseId(course.id);
    setCourseTitle(course.title || "");
    setCourseSlug(course.slug || "");
    setDescription(course.description || "");
    setFullDescription(course.fullDescription || course.description || "");
    setDurationMinutes(course.durationMinutes || 20);
    setPriceUsd(String(course.priceUsd || "0.00"));
    setThumbnailUrl(course.thumbnailUrl || "");
    setPassingScore(course.passingScore || 80);
    setStatus(course.status || "draft");
    setBadgeName(course.badgeName || "");
    setBadgeDescription(course.badgeDescription || "");
    setLearningObjectives(
      Array.isArray(course.learningObjectives)
        ? course.learningObjectives.join("\n")
        : course.learningObjectives || ""
    );
    setLevel(course.level || "beginner");
    setIntendedRoles(
      Array.isArray(course.intendedRoles)
        ? course.intendedRoles.join("\n")
        : course.intendedRoles || ""
    );
    setVersion(course.version || 1);
    setReviewDate(course.reviewDate ? course.reviewDate.split("T")[0] : "");
    setRecommendedNextCourseId(course.recommendedNextCourseId || "");
    setIncludesCertificate(course.includesCertificate !== false);

    setSelectedSectors(course.sectors?.map((s: any) => s.id) || []);
    setSelectedPrereqs(course.prerequisites?.map((p: any) => p.id) || []);
    setSelectedSdg(course.sdgContributions?.map((sdg: any) => sdg.id) || []);

    setViewMode("edit");
    setActiveTab("metadata");
  };

  // Creation Handlers
  const handleNewTitleChange = (val: string) => {
    setNewTitle(val);
    const slugified = val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    setNewSlug(slugified);
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error("Please enter a course title");
      return;
    }
    setIsCreatingCourse(true);
    try {
      const payload = {
        title: newTitle.trim(),
        slug: newSlug.trim() || newTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        courseCode: newCourseCode.trim() || undefined,
        level: newLevel,
        durationMinutes: Number(newDuration) || 20,
        description: newDescription.trim(),
        fullDescription: newFullDescription.trim() || newDescription.trim(),
        status: newStatus,
      };

      const res = await customFetch<any>("/api/platform-admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      toast.success(`Course '${res.title}' created successfully!`);
      await queryClient.invalidateQueries({ queryKey: ["/api/platform-admin/courses"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/courses"] });

      // Reset form
      setNewTitle("");
      setNewSlug("");
      setNewCourseCode("");
      setNewDescription("");
      setNewFullDescription("");
      setNewLevel("Beginner");
      setNewDuration(20);
      setNewStatus("draft");
      setIsCreateModalOpen(false);

      // Open newly created course directly in editor
      handleEditClick(res);
    } catch (err: any) {
      toast.error(err.message || "Failed to create course");
    } finally {
      setIsCreatingCourse(false);
    }
  };

  // Toggle Publish Status
  const handleTogglePublishStatus = async (course: any, targetStatus: "published" | "draft") => {
    try {
      await updateMetadataMutation.mutateAsync({
        id: course.id,
        data: {
          status: targetStatus,
        } as any,
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/platform-admin/courses"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      if (targetStatus === "draft") {
        toast.success(`Course '${course.title}' unpublished and moved to Draft.`);
      } else {
        toast.success(`Course '${course.title}' published successfully!`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update course status");
    }
  };

  // Delete Course Handler
  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;
    setIsDeletingCourse(true);
    try {
      await customFetch(`/api/platform-admin/courses/${courseToDelete.id}`, {
        method: "DELETE",
      });
      toast.success(`Course '${courseToDelete.title}' has been deleted.`);
      await queryClient.invalidateQueries({ queryKey: ["/api/platform-admin/courses"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setCourseToDelete(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete course");
    } finally {
      setIsDeletingCourse(false);
    }
  };

  // Lesson Form Helpers
  const handleOpenLessonCreate = () => {
    setEditingLesson(null);
    setLessonTitle("");
    setLessonDuration(5);
    setShowLessonDialog(true);
  };

  const handleOpenLessonEdit = (lesson: any) => {
    setEditingLesson(lesson);
    setLessonTitle(lesson.title);
    setLessonDuration(lesson.durationMinutes);
    setShowLessonDialog(true);
  };

  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourseId) return;

    if (editingLesson) {
      updateLessonMutation.mutate({
        id: editingLesson.id,
        data: {
          title: lessonTitle,
          durationMinutes: Number(lessonDuration)
        }
      });
    } else {
      createLessonMutation.mutate({
        id: editingCourseId,
        data: {
          title: lessonTitle,
          durationMinutes: Number(lessonDuration),
          content: "Enter content here..."
        }
      });
    }
  };

  const handleToggleLessonArchive = (lesson: any) => {
    updateLessonMutation.mutate({
      id: lesson.id,
      data: {
        title: lesson.title,
        durationMinutes: lesson.durationMinutes,
        isArchived: !lesson.isArchived
      } as any
    });
  };

  // Lesson Block Helpers
  const handleOpenBlockEditor = (lesson: any) => {
    setSelectedLessonForBlocks(lesson);
    const existing = lesson.contentBlocks || [];
    setBlocks(Array.isArray(existing) ? existing : []);
    setIsPreviewMode(false);
  };

  const handleSaveBlocks = () => {
    if (!selectedLessonForBlocks) return;
    updateLessonMutation.mutate({
      id: selectedLessonForBlocks.id,
      data: {
        title: selectedLessonForBlocks.title,
        durationMinutes: selectedLessonForBlocks.durationMinutes,
        contentBlocks: blocks
      } as any
    });
    setSelectedLessonForBlocks(null);
  };

  const handleAddBlock = (type: ContentBlockType) => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type,
      position: blocks.length + 1,
      headingText: type === "heading" ? "New Section Heading" : undefined,
      bodyText: ["short_text", "key_message", "workplace_example", "mauritian_example", "practical_action"].includes(type)
        ? "Enter content description here..."
        : undefined,
      expandableTitle: type === "expandable" ? "Click to learn more" : undefined,
      expandableContent: type === "expandable" ? "Detailed additional information here..." : undefined,
      mcqQuestion: type === "multiple_choice" ? "What is the primary action required?" : undefined,
      mcqOptions: type === "multiple_choice" ? ["Option A", "Option B", "Option C"] : undefined,
      mcqCorrectIndex: type === "multiple_choice" ? 0 : undefined,
      decisionIntro: type === "decision_scenario" ? "Workplace Decision Scenario:" : undefined,
      decisionPrompt: type === "decision_scenario" ? "What is the best course of action?" : undefined,
      decisionChoices: type === "decision_scenario" ? [
        { label: "Option 1", correct: true, feedback: "Explanation for why this is correct." },
        { label: "Option 2", correct: false, feedback: "Explanation for why this is incorrect." }
      ] : undefined,
      commitmentInstruction: type === "commitment" ? "Select your action commitment for this module:" : undefined,
      commitmentOptions: type === "commitment" ? [
        { value: "action-1", label: "I will implement this practice in my department", description: "Take direct initiative." }
      ] : undefined
    };
    setBlocks([...blocks, newBlock]);
  };

  const handleUpdateBlock = (index: number, updated: ContentBlock) => {
    const next = [...blocks];
    next[index] = updated;
    setBlocks(next);
  };

  const handleUpdateBlockField = (index: number, field: keyof ContentBlock, value: any) => {
    const next = [...blocks];
    next[index] = { ...next[index], [field]: value };
    setBlocks(next);
  };

  const handleRemoveBlock = (index: number) => {
    const next = blocks.filter((_, i) => i !== index);
    const reIndexed = next.map((b, i) => ({ ...b, position: i + 1 }));
    setBlocks(reIndexed);
  };

  const handleMoveBlock = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === blocks.length - 1) return;

    const next = [...blocks];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;

    const reIndexed = next.map((b, i) => ({ ...b, position: i + 1 }));
    setBlocks(reIndexed);
  };

  const handleSaveMetadata = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourseId) return;

    if (selectedPrereqs.includes(editingCourseId)) {
      toast.error("A course cannot be its own prerequisite");
      return;
    }

    const payload = {
      title: courseTitle,
      slug: courseSlug,
      description,
      fullDescription,
      level,
      durationMinutes: Number(durationMinutes),
      priceUsd,
      thumbnailUrl,
      learningObjectives: learningObjectives.split("\n").map(line => line.trim()).filter(Boolean),
      includesCertificate,
      passingScore: Number(passingScore),
      status,
      badgeName: badgeName || null,
      badgeDescription: badgeDescription || null,
      intendedRoles: intendedRoles.split("\n").map(r => r.trim()).filter(Boolean),
      version: Number(version),
      reviewDate: reviewDate ? new Date(reviewDate).toISOString() : null,
      recommendedNextCourseId: recommendedNextCourseId === "" ? null : Number(recommendedNextCourseId),
      sectors: selectedSectors,
      prerequisites: selectedPrereqs,
      sdgContributions: selectedSdg,
    };

    updateMetadataMutation.mutate({
      id: editingCourseId,
      data: payload as any,
    });
  };

  const handleMoveLesson = (index: number, direction: "up" | "down") => {
    if (!editingCourseId) return;
    const activeList = lessons.filter((l: any) => !l.isArchived);
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === activeList.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const reordered = [...activeList];
    const temp = reordered[index]!;
    reordered[index] = reordered[targetIndex]!;
    reordered[targetIndex] = temp;

    reorderLessonsMutation.mutate({
      id: editingCourseId,
      data: reordered.map((l: any) => l.id),
    });
  };

  const handleMoveQuestion = (index: number, direction: "up" | "down") => {
    if (!editingCourseId) return;
    const activeList = quizQuestions.filter((q: any) => !q.isArchived);
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === activeList.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const reordered = [...activeList];
    const temp = reordered[index]!;
    reordered[index] = reordered[targetIndex]!;
    reordered[targetIndex] = temp;

    reorderQuestionsMutation.mutate({
      id: editingCourseId,
      data: reordered.map((q: any) => q.id),
    });
  };

  // Quiz Form Helpers
  const resetQuizForm = () => {
    setEditingQuestion(null);
    setQuizQuestion("");
    setQuizOptions(["", "", "", ""]);
    setQuizCorrectOption(0);
    setQuizCorrectExplanation("");
    setQuizIncorrectExplanation("");
    setQuizOptionFeedback(["", "", "", ""]);
  };

  const handleOpenQuizCreate = () => {
    resetQuizForm();
    setShowQuizDialog(true);
  };

  const handleOpenQuizEdit = (q: any) => {
    setEditingQuestion(q);
    setQuizQuestion(q.question);
    setQuizOptions(q.options || ["", "", "", ""]);
    setQuizCorrectOption(q.correctOption || 0);
    setQuizCorrectExplanation(q.correctExplanation || "");
    setQuizIncorrectExplanation(q.incorrectExplanation || "");
    setQuizOptionFeedback(q.optionFeedback || ["", "", "", ""]);
    setShowQuizDialog(true);
  };

  const handleToggleQuestionArchive = (q: any) => {
    updateQuestionMutation.mutate({
      id: q.id,
      data: {
        question: q.question,
        options: q.options,
        correctOption: q.correctOption,
        isArchived: !q.isArchived
      } as any
    });
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourseId) return;

    const payload = {
      question: quizQuestion,
      options: quizOptions.filter(o => o.trim() !== ""),
      correctOption: Number(quizCorrectOption),
      correctExplanation: quizCorrectExplanation,
      incorrectExplanation: quizIncorrectExplanation,
      optionFeedback: quizOptionFeedback
    };

    if (editingQuestion) {
      updateQuestionMutation.mutate({
        id: editingQuestion.id,
        data: payload
      });
    } else {
      createQuestionMutation.mutate({
        id: editingCourseId,
        data: payload
      });
    }
  };

  // Data helpers
  const courses = coursesQuery.data || [];
  const sectors = sectorsQuery.data || [];
  const sdgs = sdgQuery.data || [];
  const editingCourseTitle = courses.find((c: any) => c.id === editingCourseId)?.title || "";

  // Available unique levels
  const availableLevels = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c: any) => {
      if (c.level && typeof c.level === "string") {
        set.add(c.level);
      }
    });
    return Array.from(set);
  }, [courses]);

  // Counts for status pills
  const publishedCount = courses.filter((c: any) => (c.status || "").toLowerCase() === "published").length;
  const draftCount = courses.filter((c: any) => (c.status || "draft").toLowerCase() === "draft").length;
  const reviewCount = courses.filter((c: any) => (c.status || "").toLowerCase() === "review").length;

  // Filtered Courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c: any) => {
      // Status filter
      if (statusFilter !== "all") {
        const cStatus = (c.status || "draft").toLowerCase();
        if (statusFilter === "draft" && cStatus !== "draft") return false;
        if (statusFilter === "published" && cStatus !== "published") return false;
        if (statusFilter === "review" && cStatus !== "review") return false;
      }

      // Level filter
      if (levelFilter !== "all") {
        if ((c.level || "").toLowerCase() !== levelFilter.toLowerCase()) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = (c.title || "").toLowerCase().includes(q);
        const slugMatch = (c.slug || "").toLowerCase().includes(q);
        const codeMatch = (c.courseCode || "").toLowerCase().includes(q);
        if (!titleMatch && !slugMatch && !codeMatch) return false;
      }

      return true;
    });
  }, [courses, statusFilter, levelFilter, searchQuery]);

  return (
    <PlatformAdminLayout>
      {viewMode === "list" ? (
        // List Courses
        <div className="space-y-6">
          {/* Header with Title and Create Button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold font-serif">Global Content Management</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Create, review, and structure global courses, lessons, and compliance quiz parameters.
              </p>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-2 self-start sm:self-auto font-medium"
            >
              <Plus className="h-4 w-4" /> Create New Course
            </Button>
          </div>

          {/* Filtering & Search Control Bar */}
          <div className="bg-card border rounded-xl p-4 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Search Box */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by course title, code or slug..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Level Filter Dropdown */}
              <div className="flex items-center gap-2">
                <Label className="text-xs font-semibold text-muted-foreground shrink-0 flex items-center gap-1">
                  <Filter className="h-3.5 w-3.5" /> Level:
                </Label>
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger className="w-[200px] h-9 bg-background text-xs">
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels ({courses.length})</SelectItem>
                    {availableLevels.map((lvl) => (
                      <SelectItem key={lvl} value={lvl}>
                        {lvl}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {(statusFilter !== "all" || levelFilter !== "all" || searchQuery) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setStatusFilter("all");
                      setLevelFilter("all");
                      setSearchQuery("");
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 h-9 px-2"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Reset
                  </Button>
                )}
              </div>
            </div>

            {/* Status Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t text-sm">
              <span className="text-xs font-semibold text-muted-foreground mr-1">Status:</span>
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  statusFilter === "all"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All Courses <span className="ml-1 opacity-70">({courses.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("published")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                  statusFilter === "published"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                Published <span className="ml-0.5 opacity-80">({publishedCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("draft")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                  statusFilter === "draft"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                Drafts <span className="ml-0.5 opacity-80">({draftCount})</span>
              </button>
              {reviewCount > 0 && (
                <button
                  type="button"
                  onClick={() => setStatusFilter("review")}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                    statusFilter === "review"
                      ? "bg-amber-600 text-white shadow-sm"
                      : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
                  In Review <span className="ml-0.5 opacity-80">({reviewCount})</span>
                </button>
              )}

              <div className="ml-auto text-xs text-muted-foreground">
                Showing <strong className="text-foreground">{filteredCourses.length}</strong> of {courses.length} courses
              </div>
            </div>
          </div>

          {coursesQuery.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : coursesQuery.isError ? (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-lg p-4 flex gap-3 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
              <div>
                <span className="font-semibold">Failed to load courses:</span> {(coursesQuery.error as any)?.message || "API server connection failure"}
              </div>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="border border-dashed rounded-lg p-12 text-center text-muted-foreground bg-card">
              <BookOpen className="h-8 w-full mb-2 opacity-50 text-slate-400" />
              <p className="text-sm font-semibold">No matching courses found</p>
              <p className="text-xs mt-0.5 text-muted-foreground">
                Try adjusting your search query, status, or level filter.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setStatusFilter("all");
                  setLevelFilter("all");
                  setSearchQuery("");
                }}
              >
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="border rounded-xl bg-card shadow-xs overflow-hidden">
              <Table className="w-full">
                <TableHeader className="bg-slate-50/75 border-b">
                  <TableRow>
                    <TableHead className="py-3 px-4 text-xs font-semibold text-slate-700">Course</TableHead>
                    <TableHead className="py-3 px-3 text-xs font-semibold text-slate-700 w-36">Level</TableHead>
                    <TableHead className="py-3 px-3 text-xs font-semibold text-slate-700 w-28">Status</TableHead>
                    <TableHead className="py-3 px-4 text-right text-xs font-semibold text-slate-700 w-56">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map((course: any) => (
                    <TableRow key={course.id} className="hover:bg-slate-50/80 transition-colors border-b last:border-0">
                      <TableCell className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="font-semibold text-slate-900 text-sm flex flex-wrap items-center gap-1.5">
                            <span>{course.title}</span>
                            {course.courseCode && (
                              <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-mono text-muted-foreground bg-slate-50">
                                {course.courseCode}
                              </Badge>
                            )}
                            <span className="text-[11px] text-muted-foreground font-normal">v{course.version || 1}</span>
                          </div>
                          <p className="text-xs font-mono text-slate-500 truncate max-w-md">{course.slug}</p>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                          {course.level || "General"}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 px-3 whitespace-nowrap">
                        <Badge
                          variant={
                            course.status === "published"
                              ? "default"
                              : course.status === "review"
                              ? "outline"
                              : "secondary"
                          }
                          className={
                            course.status === "published"
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] tracking-wide"
                              : course.status === "review"
                              ? "border-amber-400 text-amber-600 bg-amber-50 font-semibold text-[10px]"
                              : "bg-blue-50 text-blue-700 border-blue-200 font-semibold text-[10px]"
                          }
                        >
                          {course.status ? course.status.toUpperCase() : "DRAFT"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Preview Link */}
                          <Link href={`/platform-admin/preview/${course.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2.5 text-xs text-slate-600 hover:text-slate-900 shadow-none"
                            >
                              <Eye className="h-3.5 w-3.5 mr-1" /> Preview
                            </Button>
                          </Link>

                          {/* Manage Course */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(course)}
                            className="h-8 px-2.5 text-xs text-primary hover:text-primary-hover border-primary/20 hover:bg-primary/5 shadow-none"
                          >
                            <Edit className="h-3.5 w-3.5 mr-1" /> Manage
                          </Button>

                          {/* Quick Publish / Unpublish Toggle */}
                          {course.status === "published" ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTogglePublishStatus(course, "draft")}
                              title="Unpublish course and return to Draft"
                              className="h-8 px-2 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                            >
                              <EyeOff className="h-3.5 w-3.5 mr-1" /> Unpublish
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTogglePublishStatus(course, "published")}
                              title="Publish course live to learners"
                              className="h-8 px-2 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            >
                              <Globe className="h-3.5 w-3.5 mr-1" /> Publish
                            </Button>
                          )}

                          {/* Delete Course */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCourseToDelete(course)}
                            title="Permanently delete course"
                            className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* CREATE NEW COURSE MODAL */}
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 font-serif text-xl">
                  <Sparkles className="h-5 w-5 text-emerald-600" /> Create New Course
                </DialogTitle>
                <DialogDescription>
                  Define the core metadata for a new global sustainability training course. You can add lessons and quiz questions immediately after creating it.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateCourse} className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="new-course-title">Course Title *</Label>
                  <Input
                    id="new-course-title"
                    required
                    placeholder="e.g. Workplace Decarbonization & Net Zero"
                    value={newTitle}
                    onChange={(e) => handleNewTitleChange(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="new-course-slug">Slug *</Label>
                    <Input
                      id="new-course-slug"
                      required
                      placeholder="e.g. workplace-decarbonization"
                      value={newSlug}
                      onChange={(e) => setNewSlug(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="new-course-code">Course Code (Optional)</Label>
                    <Input
                      id="new-course-code"
                      placeholder="e.g. ELH-35"
                      value={newCourseCode}
                      onChange={(e) => setNewCourseCode(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label>Level</Label>
                    <Select value={newLevel} onValueChange={setNewLevel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                        <SelectItem value="Applied Workplace Practice">Applied Workplace Practice</SelectItem>
                        <SelectItem value="ESG and Compliance">ESG and Compliance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Initial Status</Label>
                    <Select value={newStatus} onValueChange={(val: any) => setNewStatus(val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft (Unpublished)</SelectItem>
                        <SelectItem value="published">Published (Live)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="new-duration">Duration (Min)</Label>
                    <Input
                      id="new-duration"
                      type="number"
                      min={1}
                      max={180}
                      value={newDuration}
                      onChange={(e) => setNewDuration(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="new-desc">Short Description / Overview</Label>
                  <Textarea
                    id="new-desc"
                    rows={2}
                    placeholder="Brief 1-2 sentence overview of what learners will gain..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                  />
                </div>

                <DialogFooter className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateModalOpen(false)}
                    disabled={isCreatingCourse}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={isCreatingCourse || !newTitle.trim()}
                  >
                    {isCreatingCourse ? "Creating..." : "Create Course"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* DELETE COURSE CONFIRMATION DIALOG */}
          <Dialog open={!!courseToDelete} onOpenChange={(open) => !open && setCourseToDelete(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-rose-600 font-serif">
                  <Trash2 className="h-5 w-5" /> Delete Course
                </DialogTitle>
                <DialogDescription className="pt-2 text-slate-700">
                  Are you sure you want to permanently delete{" "}
                  <strong className="text-foreground">"{courseToDelete?.title}"</strong>?
                </DialogDescription>
              </DialogHeader>

              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-800 space-y-1 my-2">
                <p className="font-semibold flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" /> Warning: Irreversible Action
                </p>
                <p>
                  All associated lessons, content blocks, compliance quiz questions, and prerequisite dependencies will be permanently deleted from the database.
                </p>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCourseToDelete(null)}
                  disabled={isDeletingCourse}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteCourse}
                  disabled={isDeletingCourse}
                  className="bg-rose-600 hover:bg-rose-700 text-white"
                >
                  {isDeletingCourse ? "Deleting..." : "Delete Permanently"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      ) : selectedLessonForBlocks ? (
        // LESSON BLOCK EDITOR UI
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" size="icon" onClick={() => setSelectedLessonForBlocks(null)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Lesson Block Editor</span>
                <h2 className="text-xl font-bold font-serif">{selectedLessonForBlocks.title}</h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={isPreviewMode ? "default" : "outline"}
                size="sm"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="flex items-center gap-1.5"
              >
                <Eye className="h-4 w-4" /> {isPreviewMode ? "Edit Mode" : "Preview Blocks"}
              </Button>
              <Button size="sm" onClick={handleSaveBlocks}>
                Save & Close
              </Button>
            </div>
          </div>

          {isPreviewMode ? (
            // Rich Preview Mode
            <div className="max-w-2xl mx-auto space-y-6 bg-slate-50 border rounded-xl p-8 shadow-sm">
              <div className="text-center mb-8 border-b pb-4">
                <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Preview Learner Experience</span>
                <h1 className="text-2xl font-bold font-serif text-slate-800 mt-2">{selectedLessonForBlocks.title}</h1>
              </div>

              {blocks.length === 0 ? (
                <p className="text-sm text-center text-muted-foreground py-8">This lesson has no content blocks yet.</p>
              ) : (
                blocks.map((block) => {
                  switch (block.type) {
                    case "heading":
                      return <h2 key={block.id} className="text-xl font-bold font-serif text-slate-800 mt-6">{block.headingText || "Heading Text"}</h2>;
                    case "short_text":
                      return <p key={block.id} className="text-sm leading-relaxed text-slate-600">{block.bodyText || "Text content goes here."}</p>;
                    case "key_message":
                      return (
                        <div key={block.id} className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-md text-emerald-900 text-sm font-medium">
                          {block.bodyText || "Key take-away message."}
                        </div>
                      );
                    case "workplace_example":
                      return (
                        <div key={block.id} className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 block mb-1">Workplace Example</span>
                          <p className="text-sm text-blue-900">{block.bodyText}</p>
                        </div>
                      );
                    case "mauritian_example":
                      return (
                        <div key={block.id} className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 block mb-1">Mauritius Context</span>
                          <p className="text-sm text-amber-900">{block.bodyText}</p>
                        </div>
                      );
                    case "practical_action":
                      return (
                        <div key={block.id} className="bg-slate-100 border p-4 rounded-lg flex gap-3 text-slate-700">
                          <CheckCircle className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
                          <p className="text-sm">{block.bodyText || "Practical action description."}</p>
                        </div>
                      );
                    case "image":
                      return (
                        <div key={block.id} className="space-y-1">
                          <div className="bg-slate-200 border rounded-lg h-48 flex items-center justify-center overflow-hidden">
                            {block.imageUrl ? (
                              <img src={block.imageUrl} alt={block.imageAlt} className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-xs text-muted-foreground">Image Placeholder</span>
                            )}
                          </div>
                        </div>
                      );
                    case "expandable":
                      return (
                        <div key={block.id} className="border border-slate-300 rounded-lg p-4 bg-white">
                          <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                            <Plus className="h-4 w-4 text-primary" /> {block.expandableTitle || "Click to learn more"}
                          </p>
                          <p className="text-xs text-slate-600 mt-2 pl-6">{block.expandableContent || "Detailed content..."}</p>
                        </div>
                      );
                    case "multiple_choice":
                      return (
                        <div key={block.id} className="border-2 border-indigo-100 bg-indigo-50/20 rounded-xl p-5 space-y-3">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-700">Practice Check</span>
                          <h4 className="font-semibold text-slate-800 text-sm">{block.mcqQuestion || "Quiz question?"}</h4>
                          <div className="space-y-1.5">
                            {block.mcqOptions?.map((opt, oIdx) => (
                              <div key={oIdx} className={`text-xs p-2.5 rounded-lg border flex items-center justify-between ${oIdx === block.mcqCorrectIndex ? "border-emerald-300 bg-emerald-50/60 font-medium" : "border-slate-200 bg-white"}`}>
                                <span>{opt}</span>
                                {oIdx === block.mcqCorrectIndex && <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />}
                              </div>
                            ))}
                          </div>
                          {block.mcqCorrectExplanation && (
                            <p className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-200">
                              <span className="font-semibold">Explanation:</span> {block.mcqCorrectExplanation}
                            </p>
                          )}
                        </div>
                      );
                    case "decision_scenario":
                      return (
                        <div key={block.id} className="border-2 border-emerald-200 bg-emerald-50/10 rounded-xl p-5 space-y-3">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-800">Decision Scenario</span>
                          <p className="text-xs text-muted-foreground">{block.decisionIntro || "Scenario context..."}</p>
                          <h4 className="font-semibold text-slate-800 text-sm">{block.decisionPrompt || "What action will you take?"}</h4>
                          <div className="space-y-2 mt-2">
                            {block.decisionChoices?.map((choice, cIdx) => (
                              <div key={cIdx} className={`p-3 rounded-lg border text-xs space-y-1 ${choice.correct ? "border-emerald-300 bg-emerald-50/50" : "border-slate-200 bg-white"}`}>
                                <div className="font-medium flex items-center justify-between">
                                  <span>{choice.label}</span>
                                  {choice.correct ? <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-semibold">Recommended</span> : <span className="text-[10px] text-muted-foreground">Alternative</span>}
                                </div>
                                <p className="text-[11px] text-muted-foreground">{choice.feedback}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    case "commitment":
                      return (
                        <div key={block.id} className="border-2 border-teal-200 bg-teal-50/20 rounded-xl p-5 space-y-3">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-teal-800">Action Commitment</span>
                          <p className="text-xs text-slate-700">{block.commitmentInstruction || "Select your personal commitment:"}</p>
                          <div className="space-y-1.5">
                            {block.commitmentOptions?.map((opt, kIdx) => (
                              <div key={kIdx} className="p-2.5 rounded-lg border border-teal-200 bg-white text-xs flex items-center gap-2">
                                <Award className="h-4 w-4 text-teal-600 shrink-0" />
                                <div>
                                  <span className="font-semibold text-slate-800">{opt.label}</span>
                                  <p className="text-[10px] text-muted-foreground">{opt.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    case "reflection":
                      return (
                        <div key={block.id} className="border border-rose-200 bg-rose-50/20 rounded-xl p-5 space-y-2">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-rose-700">Workplace Reflection</span>
                          <p className="text-xs text-slate-700 leading-relaxed">{block.bodyText || "Reflect on how this applies in your organisation."}</p>
                        </div>
                      );
                    default:
                      return null;
                  }
                })
              )}
            </div>
          ) : (
            // Edit Mode List
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              {/* Blocks Canvas */}
              <div className="xl:col-span-8 space-y-4">
                {blocks.length === 0 ? (
                  <div className="border border-dashed rounded-xl p-12 text-center text-muted-foreground bg-card">
                    <BookOpen className="h-10 w-full mb-3 text-muted-foreground opacity-50" />
                    <h4 className="font-semibold text-sm">No Content Blocks</h4>
                    <p className="text-xs mt-1">Select block elements on the right panel to structure this lesson.</p>
                  </div>
                ) : (
                  blocks.map((block, index) => (
                    <Card key={block.id} className="shadow-xs border border-slate-200">
                      <CardHeader className="py-2.5 px-4 bg-slate-50 border-b flex flex-row items-center justify-between space-y-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">
                            Block {index + 1}: {block.type.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleMoveBlock(index, "up")} disabled={index === 0}>
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleMoveBlock(index, "down")} disabled={index === blocks.length - 1}>
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                          <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-rose-500 hover:text-rose-700" onClick={() => handleRemoveBlock(index)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 space-y-3 bg-white">
                        {/* Dynamic Input render based on block type */}
                        {block.type === "heading" && (
                          <div>
                            <Label className="text-xs">Heading Text</Label>
                            <Input
                              value={block.headingText || ""}
                              onChange={(e) => handleUpdateBlockField(index, "headingText", e.target.value)}
                              placeholder="e.g. Overview of Climate Realities"
                              className="mt-1 text-xs"
                            />
                          </div>
                        )}

                        {(block.type === "short_text" || block.type === "key_message" || block.type === "workplace_example" || block.type === "mauritian_example" || block.type === "practical_action" || block.type === "reflection") && (
                          <div>
                            <Label className="text-xs">Body Text Content</Label>
                            <Textarea
                              value={block.bodyText || ""}
                              onChange={(e) => handleUpdateBlockField(index, "bodyText", e.target.value)}
                              placeholder="Type paragraph content..."
                              className="mt-1 text-xs min-h-[60px]"
                            />
                          </div>
                        )}

                        {block.type === "image" && (
                          <div className="space-y-2">
                            <div>
                              <Label className="text-xs">Image URL</Label>
                              <Input
                                value={block.imageUrl || ""}
                                onChange={(e) => handleUpdateBlockField(index, "imageUrl", e.target.value)}
                                placeholder="https://..."
                                className="mt-1 text-xs"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Image Alt Text (Accessibility)</Label>
                              <Input
                                value={block.imageAlt || ""}
                                onChange={(e) => handleUpdateBlockField(index, "imageAlt", e.target.value)}
                                placeholder="Descriptive alt text..."
                                className="mt-1 text-xs"
                              />
                            </div>
                          </div>
                        )}

                        {block.type === "expandable" && (
                          <div className="space-y-2">
                            <div>
                              <Label className="text-xs">Expandable Summary Title</Label>
                              <Input
                                value={block.expandableTitle || ""}
                                onChange={(e) => handleUpdateBlockField(index, "expandableTitle", e.target.value)}
                                placeholder="Click title text..."
                                className="mt-1 text-xs"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Hidden Content (Shown on click)</Label>
                              <Textarea
                                value={block.expandableContent || ""}
                                onChange={(e) => handleUpdateBlockField(index, "expandableContent", e.target.value)}
                                placeholder="Details revealed on click..."
                                className="mt-1 text-xs min-h-[60px]"
                              />
                            </div>
                          </div>
                        )}

                        {block.type === "multiple_choice" && (
                          <div className="space-y-2 border-l-2 pl-3 border-indigo-200">
                            <div>
                              <Label className="text-xs">In-lesson Practice MCQ Question</Label>
                              <Input
                                value={block.mcqQuestion || ""}
                                onChange={(e) => handleUpdateBlockField(index, "mcqQuestion", e.target.value)}
                                placeholder="Question text..."
                                className="mt-1 text-xs"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {block.mcqOptions?.map((opt, oIdx) => (
                                <div key={oIdx}>
                                  <Label className="text-[10px]">Option {oIdx + 1}</Label>
                                  <Input
                                    value={opt}
                                    onChange={(e) => {
                                      const newOpts = [...(block.mcqOptions || [])];
                                      newOpts[oIdx] = e.target.value;
                                      handleUpdateBlockField(index, "mcqOptions", newOpts);
                                    }}
                                    className="text-xs"
                                  />
                                </div>
                              ))}
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <Label className="text-xs">Correct Option Index (0-based)</Label>
                                <Input
                                  type="number"
                                  value={block.mcqCorrectIndex || 0}
                                  onChange={(e) => handleUpdateBlockField(index, "mcqCorrectIndex", Number(e.target.value))}
                                  min={0}
                                  max={3}
                                  className="text-xs"
                                />
                              </div>
                              <div className="col-span-2">
                                <Label className="text-xs">Correct Option Explanation</Label>
                                <Input
                                  value={block.mcqCorrectExplanation || ""}
                                  onChange={(e) => handleUpdateBlockField(index, "mcqCorrectExplanation", e.target.value)}
                                  className="text-xs"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {block.type === "decision_scenario" && (
                          <div className="space-y-2 border-l-2 pl-3 border-emerald-200">
                            <div>
                              <Label className="text-xs">Scenario Introduction</Label>
                              <Input
                                value={block.decisionIntro || ""}
                                onChange={(e) => handleUpdateBlockField(index, "decisionIntro", e.target.value)}
                                className="mt-1 text-xs"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Interactive Decision Prompt</Label>
                              <Input
                                value={block.decisionPrompt || ""}
                                onChange={(e) => handleUpdateBlockField(index, "decisionPrompt", e.target.value)}
                                className="mt-1 text-xs"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs font-semibold">Choices (Minimum 2)</Label>
                              {block.decisionChoices?.map((choice, cIdx) => (
                                <div key={cIdx} className="grid grid-cols-6 gap-2 bg-slate-50 p-2 rounded border border-slate-100">
                                  <div className="col-span-3">
                                    <Label className="text-[10px]">Choice {cIdx + 1} Label</Label>
                                    <Input
                                      value={choice.label}
                                      onChange={(e) => {
                                        const next = [...(block.decisionChoices || [])];
                                        next[cIdx] = { ...choice, label: e.target.value };
                                        handleUpdateBlockField(index, "decisionChoices", next);
                                      }}
                                      className="text-xs"
                                    />
                                  </div>
                                  <div className="col-span-1 flex items-center pt-4">
                                    <label className="flex items-center gap-1 text-[11px]">
                                      <input
                                        type="checkbox"
                                        checked={choice.correct}
                                        onChange={(e) => {
                                          const next = [...(block.decisionChoices || [])];
                                          next[cIdx] = { ...choice, correct: e.target.checked };
                                          handleUpdateBlockField(index, "decisionChoices", next);
                                        }}
                                      />
                                      Correct
                                    </label>
                                  </div>
                                  <div className="col-span-2">
                                    <Label className="text-[10px]">Feedback message</Label>
                                    <Input
                                      value={choice.feedback}
                                      onChange={(e) => {
                                        const next = [...(block.decisionChoices || [])];
                                        next[cIdx] = { ...choice, feedback: e.target.value };
                                        handleUpdateBlockField(index, "decisionChoices", next);
                                      }}
                                      className="text-xs"
                                    />
                                  </div>
                                </div>
                              ))}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const nextChoices = [...(block.decisionChoices || []), { label: "New Choice", correct: false, feedback: "Feedback..." }];
                                  handleUpdateBlockField(index, "decisionChoices", nextChoices);
                                }}
                              >
                                <Plus className="h-3 w-3 mr-1" /> Add Choice
                              </Button>
                            </div>
                          </div>
                        )}

                        {block.type === "commitment" && (
                          <div className="space-y-2 border-l-2 pl-3 border-teal-200">
                            <div>
                              <Label className="text-xs">Commitment Header Instruction</Label>
                              <Input
                                value={block.commitmentInstruction || ""}
                                onChange={(e) => handleUpdateBlockField(index, "commitmentInstruction", e.target.value)}
                                className="mt-1 text-xs"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs font-semibold">Commitment Options</Label>
                              {block.commitmentOptions?.map((opt, kIdx) => (
                                <div key={kIdx} className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded border border-slate-100">
                                  <div>
                                    <Label className="text-[10px]">Commitment Label</Label>
                                    <Input
                                      value={opt.label}
                                      onChange={(e) => {
                                        const next = [...(block.commitmentOptions || [])];
                                        next[kIdx] = { ...opt, label: e.target.value };
                                        handleUpdateBlockField(index, "commitmentOptions", next);
                                      }}
                                      className="text-xs"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-[10px]">Description</Label>
                                    <Input
                                      value={opt.description}
                                      onChange={(e) => {
                                        const next = [...(block.commitmentOptions || [])];
                                        next[kIdx] = { ...opt, description: e.target.value };
                                        handleUpdateBlockField(index, "commitmentOptions", next);
                                      }}
                                      className="text-xs"
                                    />
                                  </div>
                                </div>
                              ))}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const nextOpts = [...(block.commitmentOptions || []), { value: `commit-${Date.now()}`, label: "Green Commit", description: "Save environment" }];
                                  handleUpdateBlockField(index, "commitmentOptions", nextOpts);
                                }}
                              >
                                <Plus className="h-3 w-3 mr-1" /> Add Choice
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Sidebar Block Palette */}
              <div className="xl:col-span-4 space-y-4">
                <Card className="border shadow-xs overflow-hidden">
                  <CardHeader className="py-2.5 px-3.5 bg-slate-50 border-b">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700">Content Palette</CardTitle>
                    <CardDescription className="text-[11px]">Insert layout components</CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 flex flex-col gap-1.5">
                    <Button type="button" variant="outline" size="sm" onClick={() => handleAddBlock("heading")} className="w-full justify-start gap-2 h-8 px-2.5 text-xs text-slate-700 hover:bg-slate-50 shadow-none">
                      <FileText className="h-3.5 w-3.5 shrink-0 text-slate-500" /> <span className="truncate">Heading</span>
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => handleAddBlock("short_text")} className="w-full justify-start gap-2 h-8 px-2.5 text-xs text-slate-700 hover:bg-slate-50 shadow-none">
                      <FileText className="h-3.5 w-3.5 shrink-0 text-slate-500" /> <span className="truncate">Paragraph</span>
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => handleAddBlock("key_message")} className="w-full justify-start gap-2 h-8 px-2.5 text-xs text-emerald-700 border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 shadow-none">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0 text-emerald-600" /> <span className="truncate">Key Takeaway</span>
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => handleAddBlock("practical_action")} className="w-full justify-start gap-2 h-8 px-2.5 text-xs text-slate-700 hover:bg-slate-50 shadow-none">
                      <CheckCircle className="h-3.5 w-3.5 shrink-0 text-slate-500" /> <span className="truncate">Green Action</span>
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => handleAddBlock("workplace_example")} className="w-full justify-start gap-2 h-8 px-2.5 text-xs text-blue-700 border-blue-200 bg-blue-50/30 hover:bg-blue-50 shadow-none">
                      <Info className="h-3.5 w-3.5 shrink-0 text-blue-600" /> <span className="truncate">Job Example</span>
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => handleAddBlock("mauritian_example")} className="w-full justify-start gap-2 h-8 px-2.5 text-xs text-amber-800 border-amber-200 bg-amber-50/30 hover:bg-amber-50 shadow-none">
                      <Info className="h-3.5 w-3.5 shrink-0 text-amber-600" /> <span className="truncate">Mauritius Info</span>
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => handleAddBlock("image")} className="w-full justify-start gap-2 h-8 px-2.5 text-xs text-slate-700 hover:bg-slate-50 shadow-none">
                      <Eye className="h-3.5 w-3.5 shrink-0 text-slate-500" /> <span className="truncate">Image Block</span>
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => handleAddBlock("expandable")} className="w-full justify-start gap-2 h-8 px-2.5 text-xs text-slate-700 hover:bg-slate-50 shadow-none">
                      <Plus className="h-3.5 w-3.5 shrink-0 text-slate-500" /> <span className="truncate">Click Reveal</span>
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => handleAddBlock("reflection")} className="w-full justify-start gap-2 h-8 px-2.5 text-xs text-rose-700 border-rose-200 bg-rose-50/30 hover:bg-rose-50 shadow-none">
                      <Edit className="h-3.5 w-3.5 shrink-0 text-rose-600" /> <span className="truncate">Reflection</span>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border shadow-xs overflow-hidden">
                  <CardHeader className="py-2.5 px-3.5 bg-slate-50 border-b">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700">Interactive Elements</CardTitle>
                    <CardDescription className="text-[11px]">Add checks and decisions</CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 flex flex-col gap-1.5">
                    <Button type="button" variant="outline" size="sm" onClick={() => handleAddBlock("multiple_choice")} className="w-full justify-start gap-2 h-8 px-2.5 text-xs text-indigo-700 border-indigo-200 bg-indigo-50/30 hover:bg-indigo-50 shadow-none">
                      <HelpCircle className="h-3.5 w-3.5 shrink-0 text-indigo-600" /> <span className="truncate">Quick Practice MCQ</span>
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => handleAddBlock("decision_scenario")} className="w-full justify-start gap-2 h-8 px-2.5 text-xs text-emerald-700 border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50 shadow-none">
                      <HelpCircle className="h-3.5 w-3.5 shrink-0 text-emerald-600" /> <span className="truncate">Interactive Decision</span>
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => handleAddBlock("commitment")} className="w-full justify-start gap-2 h-8 px-2.5 text-xs text-teal-700 border-teal-200 bg-teal-50/30 hover:bg-teal-50 shadow-none">
                      <Award className="h-3.5 w-3.5 shrink-0 text-teal-600" /> <span className="truncate">Commitment Checklist</span>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      ) : (
        // EDIT COURSE MULTI-TAB PAGE
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-4">
              <Button type="button" variant="outline" size="icon" onClick={() => setViewMode("list")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h2 className="text-2xl font-bold font-serif">Course Content Authoring</h2>
                <p className="text-xs text-muted-foreground">
                  Course: <span className="font-semibold text-primary font-serif text-sm">{editingCourseTitle}</span>
                </p>
              </div>
            </div>

            <div className="flex border rounded-lg overflow-hidden bg-slate-100 p-1 gap-1">
              <Button
                type="button"
                variant={activeTab === "metadata" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("metadata")}
                className="flex items-center gap-1.5"
              >
                <Settings className="h-4 w-4" /> Course Settings
              </Button>
              <Button
                type="button"
                variant={activeTab === "lessons" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("lessons")}
                className="flex items-center gap-1.5"
              >
                <BookOpen className="h-4 w-4" /> Lessons ({lessons.length})
              </Button>
              <Button
                type="button"
                variant={activeTab === "quiz" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("quiz")}
                className="flex items-center gap-1.5"
              >
                <HelpCircle className="h-4 w-4" /> Quiz Questions ({quizQuestions.length})
              </Button>
            </div>
          </div>

          {/* TAB 1: METADATA & GENERAL SETTINGS */}
          {activeTab === "metadata" && (
            <form onSubmit={handleSaveMetadata} className="space-y-6">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex gap-3 text-emerald-800 text-sm">
                <AlertCircle className="h-5 w-5 shrink-0 text-emerald-600" />
                <div>
                  <span className="font-semibold">Course Association Rule:</span> Linked SDG goal contributions must only belong to <span className="font-semibold">Education & Awareness</span> or <span className="font-semibold">Capacity Building</span> categories.
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6 bg-card border rounded-xl p-6 shadow-sm">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold font-serif border-b pb-2">General Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="c-title">Course Title *</Label>
                        <Input id="c-title" value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} required className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="c-slug">Slug *</Label>
                        <Input id="c-slug" value={courseSlug} onChange={(e) => setCourseSlug(e.target.value)} required className="mt-1" />
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="c-short">Short Description *</Label>
                        <Input id="c-short" value={description} onChange={(e) => setDescription(e.target.value)} required className="mt-1" />
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="c-full">Full Detailed Description</Label>
                        <Textarea id="c-full" value={fullDescription} onChange={(e) => setFullDescription(e.target.value)} className="mt-1 min-h-[80px]" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-lg font-semibold font-serif border-b pb-2">Parameters & Versioning</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="course-level">Learning Level *</Label>
                        <select
                          id="course-level"
                          value={level}
                          onChange={(e) => setLevel(e.target.value as any)}
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-1"
                          required
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="course-version">Course Version *</Label>
                        <Input id="course-version" type="number" value={version} onChange={(e) => setVersion(Number(e.target.value))} min={1} className="mt-1" required />
                      </div>

                      <div>
                        <Label htmlFor="c-duration">Estimated Duration (minutes)</Label>
                        <Input id="c-duration" type="number" value={durationMinutes} onChange={(e) => setDurationMinutes(Number(e.target.value))} className="mt-1" />
                      </div>

                      <div>
                        <Label htmlFor="c-score">Required Passing Score (%)</Label>
                        <Input id="c-score" type="number" value={passingScore} onChange={(e) => setPassingScore(Number(e.target.value))} min={0} max={100} className="mt-1" />
                      </div>

                      <div>
                        <Label htmlFor="course-review">Next Scheduled Review</Label>
                        <Input id="course-review" type="date" value={reviewDate} onChange={(e) => setReviewDate(e.target.value)} className="mt-1" />
                      </div>

                      <div>
                        <Label htmlFor="course-next">Recommended Next Course</Label>
                        <select
                          id="course-next"
                          value={recommendedNextCourseId}
                          onChange={(e) => setRecommendedNextCourseId(e.target.value === "" ? "" : Number(e.target.value))}
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-1"
                        >
                          <option value="">None</option>
                          {courses.filter((c: any) => c.id !== editingCourseId).map((c: any) => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <Label htmlFor="course-roles">Intended Roles (comma-separated)</Label>
                        <Input id="course-roles" value={intendedRoles} onChange={(e) => setIntendedRoles(e.target.value)} placeholder="e.g. Driver, Front Office Agent, Clerk" className="mt-1" />
                      </div>

                      <div className="sm:col-span-2">
                        <Label htmlFor="c-objectives">Learning Objectives (one per line)</Label>
                        <Textarea id="c-objectives" value={learningObjectives} onChange={(e) => setLearningObjectives(e.target.value)} placeholder="Add objectives..." className="mt-1 min-h-[60px]" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-lg font-semibold font-serif border-b pb-2">Reward Settings</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="c-badge">Awarded Badge Title</Label>
                        <Input id="c-badge" value={badgeName} onChange={(e) => setBadgeName(e.target.value)} className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="c-badgedesc">Badge Description</Label>
                        <Input id="c-badgedesc" value={badgeDescription} onChange={(e) => setBadgeDescription(e.target.value)} className="mt-1" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-lg font-semibold font-serif border-b pb-2">Release Settings</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="c-status">Course Status</Label>
                        <select
                          id="c-status"
                          value={status}
                          onChange={(e) => setStatus(e.target.value as any)}
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-1"
                        >
                          <option value="draft">Draft (Internal development)</option>
                          <option value="review">Review (Ready for approval)</option>
                          <option value="published">Published (Released to learners)</option>
                        </select>
                      </div>
                      <div className="flex items-center pt-6 pl-2">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={includesCertificate}
                            onChange={(e) => setIncludesCertificate(e.target.checked)}
                            className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                          />
                          <span className="text-sm font-semibold">Eligible for Certificate pdf generation</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 border-t pt-6">
                    <Button type="button" variant="outline" onClick={() => setViewMode("list")}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={updateMetadataMutation.isPending}>
                      {updateMetadataMutation.isPending ? "Saving..." : "Save Course Settings"}
                    </Button>
                  </div>
                </div>

                {/* Checklist sidebar */}
                <div className="space-y-6">
                  {/* Sectors */}
                  <Card>
                    <CardContent className="pt-6 text-xs space-y-3">
                      <Label className="font-bold text-xs mb-1 block">Assigned Sectors</Label>
                      <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2 bg-background">
                        {sectors.map((sec: any) => (
                          <label key={sec.id} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedSectors.includes(sec.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedSectors([...selectedSectors, sec.id]);
                                } else {
                                  setSelectedSectors(selectedSectors.filter(id => id !== sec.id));
                                }
                              }}
                            />
                            {sec.name}
                          </label>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Prerequisites */}
                  <Card>
                    <CardContent className="pt-6 text-xs space-y-3">
                      <Label className="font-bold text-xs mb-1 block">Prerequisite Courses</Label>
                      <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2 bg-background">
                        {courses.filter((c: any) => c.id !== editingCourseId).map((c: any) => (
                          <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedPrereqs.includes(c.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedPrereqs([...selectedPrereqs, c.id]);
                                } else {
                                  setSelectedPrereqs(selectedPrereqs.filter(id => id !== c.id));
                                }
                              }}
                            />
                            {c.title}
                          </label>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* SDG goal mappings */}
                  <Card>
                    <CardContent className="pt-6 text-xs space-y-3">
                      <Label className="font-bold text-xs mb-1 block">SDG Goal Contributions</Label>
                      <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2 bg-background">
                        {sdgs.map((sdg: any) => {
                          const category = sdg.contributionCategory;
                          const isAllowed = ["education_awareness", "capacity_building"].includes(category);
                          return (
                            <label
                              key={sdg.id}
                              className={`flex items-start gap-2 p-1 rounded ${
                                isAllowed ? "cursor-pointer hover:bg-muted" : "opacity-40 cursor-not-allowed bg-rose-50/20"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedSdg.includes(sdg.id)}
                                disabled={!isAllowed}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedSdg([...selectedSdg, sdg.id]);
                                  } else {
                                    setSelectedSdg(selectedSdg.filter(id => id !== sdg.id));
                                  }
                                }}
                                className="mt-0.5"
                              />
                              <div>
                                <p className="font-medium leading-none">{sdg.rationale}</p>
                                <span className="text-[9px] text-muted-foreground capitalize mt-0.5 block">{category.replace('_', ' ')}</span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: LESSONS LIST & MANAGEMENT */}
          {activeTab === "lessons" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold font-serif">Lessons Hierarchy</h3>
                  <p className="text-xs text-muted-foreground">Order, structure and add lesson elements to the pilot delivery flow.</p>
                </div>
                <Button size="sm" onClick={handleOpenLessonCreate} className="flex items-center gap-1">
                  <Plus className="h-4 w-4" /> Add Lesson
                </Button>
              </div>

              {lessons.length === 0 ? (
                <div className="border border-dashed rounded-lg p-12 text-center text-muted-foreground bg-card">
                  <BookOpen className="h-8 w-full mb-2 opacity-50" />
                  <p className="text-sm font-semibold">No lessons found</p>
                  <p className="text-xs mt-0.5">Click 'Add Lesson' to begin creating content.</p>
                </div>
              ) : (
                <div className="border rounded-lg bg-card overflow-hidden shadow-xs">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Blocks Count</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lessons.map((lesson: any, index: number) => (
                        <TableRow key={lesson.id} className={lesson.isArchived ? "opacity-60 bg-slate-50/50" : ""}>
                          <TableCell className="font-semibold text-xs">#{index + 1}</TableCell>
                          <TableCell className="font-semibold text-sm">
                            {lesson.title}
                            {lesson.isArchived && <span className="text-rose-500 font-bold ml-1.5 text-[9px] uppercase">[Archived]</span>}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{lesson.durationMinutes} mins</TableCell>
                          <TableCell className="text-xs font-medium">
                            <Badge variant="secondary">
                              {lesson.contentBlocks ? lesson.contentBlocks.length : 0} blocks
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={lesson.isArchived ? "secondary" : "default"}>
                              {lesson.isArchived ? "Archived" : "Active"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right flex items-center justify-end gap-1.5">
                            <Button type="button" variant="outline" size="sm" onClick={() => handleOpenBlockEditor(lesson)} className="h-7 text-xs flex items-center gap-1">
                              <Edit className="h-3.5 w-3.5" /> Edit Blocks
                            </Button>
                            <Button type="button" variant="ghost" size="sm" onClick={() => handleOpenLessonEdit(lesson)} className="h-7 text-xs">
                              Rename
                            </Button>
                            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-rose-500" onClick={() => handleToggleLessonArchive(lesson)}>
                              <Archive className="h-3.5 w-3.5" />
                            </Button>
                            {!lesson.isArchived && (
                              <>
                                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleMoveLesson(index, "up")} disabled={index === 0}>
                                  <ArrowUp className="h-3.5 w-3.5" />
                                </Button>
                                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleMoveLesson(index, "down")} disabled={index === lessons.filter((l: any) => !l.isArchived).length - 1}>
                                  <ArrowDown className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Lesson Create/Edit Dialog */}
              {showLessonDialog && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                  <Card className="w-full max-w-md bg-white shadow-xl">
                    <CardHeader className="py-4 border-b bg-slate-50">
                      <CardTitle className="text-lg font-serif">{editingLesson ? "Rename Lesson" : "Create Lesson"}</CardTitle>
                    </CardHeader>
                    <form onSubmit={handleSaveLesson}>
                      <CardContent className="p-4 space-y-4">
                        <div>
                          <Label htmlFor="les-title" className="text-xs">Lesson Title *</Label>
                          <Input id="les-title" value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} required className="mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="les-duration" className="text-xs">Duration (Minutes)</Label>
                          <Input id="les-duration" type="number" value={lessonDuration} onChange={(e) => setLessonDuration(Number(e.target.value))} required className="mt-1" />
                        </div>
                      </CardContent>
                      <div className="p-4 border-t flex justify-end gap-2 bg-slate-50">
                        <Button type="button" variant="outline" size="sm" onClick={() => setShowLessonDialog(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" size="sm">
                          Save
                        </Button>
                      </div>
                    </form>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: QUIZ QUESTIONS */}
          {activeTab === "quiz" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold font-serif">Assessment Quiz Editor</h3>
                  <p className="text-xs text-muted-foreground">Setup employee evaluation and correct/incorrect judgment feedbacks.</p>
                </div>
                <Button size="sm" onClick={handleOpenQuizCreate} className="flex items-center gap-1">
                  <Plus className="h-4 w-4" /> Add Question
                </Button>
              </div>

              {quizQuestions.length === 0 ? (
                <div className="border border-dashed rounded-lg p-12 text-center text-muted-foreground bg-card">
                  <HelpCircle className="h-8 w-full mb-2 opacity-50" />
                  <p className="text-sm font-semibold">No questions found</p>
                  <p className="text-xs mt-0.5">Click 'Add Question' to setup the certification quiz.</p>
                </div>
              ) : (
                <div className="border rounded-lg bg-card overflow-hidden shadow-xs">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Question</TableHead>
                        <TableHead>Options Count</TableHead>
                        <TableHead>Correct Option</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quizQuestions.map((q: any, index: number) => (
                        <TableRow key={q.id} className={q.isArchived ? "opacity-60 bg-slate-50/50" : ""}>
                          <TableCell className="font-semibold text-xs">#{index + 1}</TableCell>
                          <TableCell className="font-semibold text-sm max-w-md truncate">
                            {q.question}
                            {q.isArchived && <span className="text-rose-500 font-bold ml-1.5 text-[9px] uppercase">[Archived]</span>}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{q.options ? q.options.length : 0} options</TableCell>
                          <TableCell className="text-xs font-semibold text-emerald-600">
                            {q.options && q.options[q.correctOption] ? q.options[q.correctOption] : `Index ${q.correctOption}`}
                          </TableCell>
                          <TableCell>
                            <Badge variant={q.isArchived ? "secondary" : "default"}>
                              {q.isArchived ? "Archived" : "Active"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right flex items-center justify-end gap-1.5">
                            <Button type="button" variant="outline" size="sm" onClick={() => handleOpenQuizEdit(q)} className="h-7 text-xs flex items-center gap-1">
                              <Edit className="h-3.5 w-3.5" /> Edit
                            </Button>
                            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-rose-500" onClick={() => handleToggleQuestionArchive(q)}>
                              <Archive className="h-3.5 w-3.5" />
                            </Button>
                            {!q.isArchived && (
                              <>
                                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleMoveQuestion(index, "up")} disabled={index === 0}>
                                  <ArrowUp className="h-3.5 w-3.5" />
                                </Button>
                                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleMoveQuestion(index, "down")} disabled={index === quizQuestions.filter((qst: any) => !qst.isArchived).length - 1}>
                                  <ArrowDown className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Quiz Create/Edit dialog */}
              {showQuizDialog && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
                  <Card className="w-full max-w-2xl bg-white shadow-xl my-8">
                    <CardHeader className="py-4 border-b bg-slate-50">
                      <CardTitle className="text-lg font-serif">{editingQuestion ? "Edit Quiz Question" : "Create Quiz Question"}</CardTitle>
                    </CardHeader>
                    <form onSubmit={handleSaveQuestion}>
                      <CardContent className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div>
                          <Label htmlFor="quiz-q" className="text-xs">Question Prompt Text *</Label>
                          <Input id="quiz-q" value={quizQuestion} onChange={(e) => setQuizQuestion(e.target.value)} required className="mt-1 text-xs" />
                        </div>

                        {/* Options Inputs */}
                        <div className="space-y-3 pt-2">
                          <Label className="text-xs font-semibold">Options (Select the correct one on the left radio button)</Label>
                          {quizOptions.map((opt, oIdx) => (
                            <div key={oIdx} className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="correct-option-radio"
                                checked={quizCorrectOption === oIdx}
                                onChange={() => setQuizCorrectOption(oIdx)}
                                className="h-4 w-4 text-primary"
                              />
                              <Input
                                value={opt}
                                onChange={(e) => {
                                  const next = [...quizOptions];
                                  next[oIdx] = e.target.value;
                                  setQuizOptions(next);
                                }}
                                placeholder={`Option Choice ${oIdx + 1}`}
                                required={oIdx < 2} // Require at least 2 options
                                className="text-xs"
                              />
                            </div>
                          ))}
                        </div>

                        {/* Explanations & feedback */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4">
                          <div>
                            <Label htmlFor="expl-corr" className="text-xs">Correct Explanation Feedback</Label>
                            <Textarea
                              id="expl-corr"
                              value={quizCorrectExplanation}
                              onChange={(e) => setQuizCorrectExplanation(e.target.value)}
                              placeholder="Explanation shown when learner picks correct answer..."
                              className="mt-1 text-xs min-h-[60px]"
                            />
                          </div>
                          <div>
                            <Label htmlFor="expl-incorr" className="text-xs">Incorrect Explanation Feedback</Label>
                            <Textarea
                              id="expl-incorr"
                              value={quizIncorrectExplanation}
                              onChange={(e) => setQuizIncorrectExplanation(e.target.value)}
                              placeholder="Explanation shown when learner picks wrong answer..."
                              className="mt-1 text-xs min-h-[60px]"
                            />
                          </div>
                        </div>

                        {/* Individual Option Feedbacks */}
                        <div className="space-y-2 border-t pt-4">
                          <Label className="text-xs font-semibold">Individual Option Explanations (Optional)</Label>
                          {quizOptions.map((opt, oIdx) => (
                            <div key={oIdx}>
                              <Label className="text-[10px] text-slate-500">Choice {oIdx + 1} Feedback hint</Label>
                              <Input
                                value={quizOptionFeedback[oIdx] || ""}
                                onChange={(e) => {
                                  const next = [...quizOptionFeedback];
                                  next[oIdx] = e.target.value;
                                  setQuizOptionFeedback(next);
                                }}
                                placeholder={`Hint specific to picking choice ${oIdx + 1}...`}
                                className="text-xs"
                              />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                      <div className="p-4 border-t flex justify-end gap-2 bg-slate-50">
                        <Button type="button" variant="outline" size="sm" onClick={() => setShowQuizDialog(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" size="sm">
                          Save Question
                        </Button>
                      </div>
                    </form>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </PlatformAdminLayout>
  );
}
