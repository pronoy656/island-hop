"use client";

import * as React from "react";
import {
  CheckCircle2,
  Edit2,
  FileQuestion,
  Plus,
  Tag,
  Trash2
} from "lucide-react";
import { toast } from "sonner";

import { FAQ_DATA, type FAQItem } from "@/data/faqs";
import { cn } from "@/lib/utils";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  ReusableSelect
} from "@/ui";
import {
  DashboardTableCard,
  StatusBadge,
  TablePagination,
  TableToolbar,
  type TableColumn,
  type TableToolbarTab
} from "@/widgets";

export interface ManagedFAQItem extends FAQItem {
  isPublished?: boolean;
  updatedAt?: string;
}

const STORAGE_KEY = "islandhop_admin_faqs_v1";

const CATEGORY_OPTIONS = [
  { value: "Booking", label: "Booking" },
  { value: "Cancellation & Refund", label: "Cancellation & Refund" },
  { value: "Payment", label: "Payment" },
  { value: "Travel Information", label: "Travel Information" }
];

export function FaqManagementView() {
  const [faqs, setFaqs] = React.useState<ManagedFAQItem[]>([]);
  const [isLoaded, setIsLoaded] = React.useState(false);

  // Load from localStorage or seed from FAQ_DATA
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ManagedFAQItem[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFaqs(parsed);
          setIsLoaded(true);
          return;
        }
      }
    } catch {
      // fallback to initial data
    }

    const initial = FAQ_DATA.map((item) => ({
      ...item,
      isPublished: true,
      updatedAt: new Date().toISOString()
    }));
    setFaqs(initial);
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever faqs change
  const saveFaqs = React.useCallback((items: ManagedFAQItem[]) => {
    setFaqs(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage error
    }
  }, []);

  // Filters, Search & Pagination
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("ALL");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(5);

  React.useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedCategory]);

  // Modal States
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<ManagedFAQItem | null>(null);
  const [deletingItem, setDeletingItem] = React.useState<ManagedFAQItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);

  // Form Fields
  const [formQuestion, setFormQuestion] = React.useState("");
  const [formCategory, setFormCategory] = React.useState<FAQItem["category"]>("Booking");
  const [formAnswer, setFormAnswer] = React.useState("");
  const [formIsPublished, setFormIsPublished] = React.useState(true);
  const [formErrors, setFormErrors] = React.useState<{ question?: string; answer?: string }>({});

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormQuestion("");
    setFormCategory("Booking");
    setFormAnswer("");
    setFormIsPublished(true);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: ManagedFAQItem) => {
    setEditingItem(item);
    setFormQuestion(item.question);
    setFormCategory(item.category);
    setFormAnswer(item.answer);
    setFormIsPublished(item.isPublished ?? true);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { question?: string; answer?: string } = {};

    if (!formQuestion.trim()) {
      errors.question = "Question title is required.";
    }
    if (!formAnswer.trim()) {
      errors.answer = "Answer content cannot be empty.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingItem) {
      // Update
      const updated = faqs.map((f) =>
        f.id === editingItem.id
          ? {
              ...f,
              question: formQuestion.trim(),
              category: formCategory,
              answer: formAnswer.trim(),
              isPublished: formIsPublished,
              updatedAt: new Date().toISOString()
            }
          : f
      );
      saveFaqs(updated);
      toast.success("FAQ updated successfully");
    } else {
      // Create
      const newFaq: ManagedFAQItem = {
        id: `faq-${Date.now()}`,
        question: formQuestion.trim(),
        category: formCategory,
        answer: formAnswer.trim(),
        isPublished: formIsPublished,
        updatedAt: new Date().toISOString()
      };
      saveFaqs([newFaq, ...faqs]);
      toast.success("New FAQ added successfully");
    }

    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deletingItem) return;
    const filtered = faqs.filter((f) => f.id !== deletingItem.id);
    saveFaqs(filtered);
    toast.success("FAQ removed");
    setIsDeleteModalOpen(false);
    setDeletingItem(null);
  };

  // Filtered List
  const filteredFaqs = React.useMemo(() => {
    return faqs.filter((item) => {
      if (selectedCategory !== "ALL" && item.category !== selectedCategory) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchesQuestion = item.question.toLowerCase().includes(q);
        const matchesAnswer = item.answer.toLowerCase().includes(q);
        const matchesCategory = item.category.toLowerCase().includes(q);
        return matchesQuestion || matchesAnswer || matchesCategory;
      }
      return true;
    });
  }, [faqs, selectedCategory, searchTerm]);

  // Pagination Calculations
  const totalFiltered = filteredFaqs.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);

  // Paginated List for Table View
  const paginatedFaqs = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredFaqs.slice(startIndex, startIndex + pageSize);
  }, [filteredFaqs, currentPage, pageSize]);

  // Metric Stats
  const stats = React.useMemo(() => {
    const total = faqs.length;
    const published = faqs.filter((f) => f.isPublished !== false).length;
    const categoriesCount = new Set(faqs.map((f) => f.category)).size;
    return { total, published, categoriesCount };
  }, [faqs]);

  // Table Columns
  const columns: TableColumn<ManagedFAQItem>[] = [
    {
      header: "#",
      className: "w-12 text-center",
      cell: (_, idx) => {
        const itemNumber = (currentPage - 1) * pageSize + idx + 1;
        return (
          <span className="font-mono text-xs font-semibold text-muted-foreground">
            #{itemNumber}
          </span>
        );
      }
    },
    {
      header: "QUESTION & ANSWER",
      headerClassName: "min-w-[280px]",
      className: "whitespace-normal min-w-[280px] max-w-2xl py-3",
      cell: (item) => (
        <div className="space-y-1 py-0.5 max-w-xl">
          <div className="font-bold text-xs sm:text-sm text-foreground leading-snug">
            {item.question}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {item.answer}
          </p>
        </div>
      )
    },
    {
      header: "CATEGORY",
      className: "w-48",
      cell: (item) => {
        const color =
          item.category === "Booking"
            ? "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400"
            : item.category === "Cancellation & Refund"
            ? "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
            : item.category === "Payment"
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400";

        return (
          <Badge variant="outline" className={cn("text-[10px] font-bold rounded-lg px-2.5 py-0.5 whitespace-nowrap", color)}>
            {item.category}
          </Badge>
        );
      }
    },
    {
      header: "STATUS",
      className: "w-28 text-center",
      cell: (item) => (
        <StatusBadge status={item.isPublished !== false ? "Active" : "Suspended"} />
      )
    },
    {
      header: "ACTIONS",
      align: "right",
      className: "w-32 text-right",
      cell: (item) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenEditModal(item)}
            className="h-8 gap-1 px-2.5 rounded-lg text-xs font-semibold"
          >
            <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDeletingItem(item);
              setIsDeleteModalOpen(true);
            }}
            className="h-8 px-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50"
            title="Delete FAQ"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )
    }
  ];

  // Tab configurations for TableToolbar
  const toolbarTabs: TableToolbarTab<string>[] = React.useMemo(() => {
    return [
      { value: "ALL", label: "All Topics", count: faqs.length },
      {
        value: "Booking",
        label: "Booking",
        count: faqs.filter((f) => f.category === "Booking").length
      },
      {
        value: "Cancellation & Refund",
        label: "Cancellation & Refund",
        count: faqs.filter((f) => f.category === "Cancellation & Refund").length
      },
      {
        value: "Payment",
        label: "Payment",
        count: faqs.filter((f) => f.category === "Payment").length
      },
      {
        value: "Travel Information",
        label: "Travel Information",
        count: faqs.filter((f) => f.category === "Travel Information").length
      }
    ];
  }, [faqs]);

  return (
    <div className="w-full space-y-5 px-4 py-6 sm:px-6 lg:px-8">
      {/* Clean Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            FAQ Management
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
            Create, edit, and organize passenger frequently asked questions ({faqs.length} total).
          </p>
        </div>

        <Button
          size="sm"
          onClick={handleOpenAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 h-9 text-xs font-semibold px-3.5 shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Add FAQ</span>
        </Button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Questions</p>
              <p className="text-2xl font-extrabold text-foreground mt-0.5">{stats.total}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <FileQuestion className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Published &amp; Active</p>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {stats.published}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Topic Categories</p>
              <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-0.5">
                {stats.categoriesCount}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
              <Tag className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reusable Search & Category Toolbar */}
      <TableToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search questions or answers..."
        activeTab={selectedCategory}
        onTabChange={setSelectedCategory}
        tabs={toolbarTabs}
      />

      {/* Table Management View */}
      <div className="flex flex-col gap-4">
        <DashboardTableCard
          title={
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-foreground">Questions Directory</span>
              <span className="text-xs font-normal text-muted-foreground">
                ({totalFiltered} items total)
              </span>
            </div>
          }
          columns={columns}
          data={paginatedFaqs}
          keyExtractor={(item) => item.id}
          emptyMessage="No questions found matching your filter criteria."
        />

        {/* Proper Table Pagination Component */}
        <TablePagination
          page={currentPage}
          totalPages={totalPages}
          totalCount={totalFiltered}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
          pageSizeOptions={[
            { value: "5", label: "5 per page" },
            { value: "10", label: "10 per page" },
            { value: "20", label: "20 per page" },
            { value: "50", label: "50 per page" }
          ]}
          itemName="FAQs"
        />
      </div>

      {/* ADD / EDIT MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSaveForm}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                <FileQuestion className="h-5 w-5 text-blue-600" />
                <span>{editingItem ? "Edit FAQ" : "Add New FAQ"}</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {editingItem
                  ? "Update question title, category topic, or explanation."
                  : "Create a new frequently asked question for passenger self-service."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Question Input */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Question Title *</Label>
                <Input
                  type="text"
                  placeholder="e.g. Can I travel with excess luggage?"
                  value={formQuestion}
                  onChange={(e) => {
                    setFormQuestion(e.target.value);
                    if (formErrors.question) {
                      setFormErrors((prev) => ({ ...prev, question: undefined }));
                    }
                  }}
                  className={cn("h-9 text-xs", formErrors.question && "border-rose-500")}
                />
                {formErrors.question && (
                  <p className="text-[11px] font-medium text-rose-500">{formErrors.question}</p>
                )}
              </div>

              {/* Category Dropdown */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Category Topic *</Label>
                <ReusableSelect
                  value={formCategory}
                  onValueChange={(val) => setFormCategory(val as FAQItem["category"])}
                  options={CATEGORY_OPTIONS}
                  className="h-9 text-xs w-full"
                />
              </div>

              {/* Answer Textarea */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Answer Explanation *</Label>
                <textarea
                  rows={4}
                  placeholder="Explain clearly in 2-4 sentences how passengers should resolve this question..."
                  value={formAnswer}
                  onChange={(e) => {
                    setFormAnswer(e.target.value);
                    if (formErrors.answer) {
                      setFormErrors((prev) => ({ ...prev, answer: undefined }));
                    }
                  }}
                  className={cn(
                    "w-full rounded-xl border border-input bg-background p-3 text-xs leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all resize-y",
                    formErrors.answer && "border-rose-500"
                  )}
                />
                {formErrors.answer && (
                  <p className="text-[11px] font-medium text-rose-500">{formErrors.answer}</p>
                )}
              </div>

              {/* Status Radio / Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="faq-publish-checkbox"
                  checked={formIsPublished}
                  onChange={(e) => setFormIsPublished(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-blue-600 focus:ring-blue-600 cursor-pointer"
                />
                <label
                  htmlFor="faq-publish-checkbox"
                  className="text-xs font-medium text-foreground cursor-pointer select-none"
                >
                  Publish immediately (visible to passengers on Help portal)
                </label>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="h-9 text-xs rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="h-9 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
              >
                {editingItem ? "Save Changes" : "Create FAQ"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <Trash2 className="h-5 w-5" />
              <span>Delete FAQ</span>
            </DialogTitle>
            <DialogDescription className="space-y-2 pt-2 text-xs">
              <p>
                Are you sure you want to remove the question:{" "}
                <span className="font-bold text-foreground">
                  &ldquo;{deletingItem?.question}&rdquo;
                </span>
                ?
              </p>
              <p className="text-muted-foreground text-[11px]">
                This action will remove the question from the passenger Help portal.
              </p>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t">
            <DialogClose asChild>
              <Button variant="outline" size="sm" className="rounded-xl text-xs font-semibold">
                Keep FAQ
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              className="rounded-xl text-xs font-bold"
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
