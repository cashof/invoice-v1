
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
} from "@/components/ui/dialog";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";

import {
  Eye,
  Pencil,
  Trash2,
  Search,
  FileText,
  Plus,
  ArrowUpDown,
  Download,
  Loader2,
} from "lucide-react";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

import {
  getInvoicesList,
  getInvoiceWithItems,
  updateInvoice,
  updateInvoiceStatus,
  deleteInvoice,
} from "@/actions/invoiceList";

/* =========================================================
   TYPES
========================================================= */

type Invoice = Awaited<ReturnType<typeof getInvoicesList>>[number];

type Status = "draft" | "sent" | "pending" | "paid" | "canceled";

/* =========================================================
   STATUS
========================================================= */

const STATUS_OPTIONS: Status[] = [
  "draft",
  "sent",
  "pending",
  "paid",
  "canceled",
];

const STATUS_LABELS: Record<Status, string> = {
  draft: "Draft",
  sent: "Sent",
  pending: "Pending",
  paid: "Paid",
  canceled: "Cancelled",
};

const STATUS_STYLES: Record<Status, string> = {
  draft: "bg-muted text-muted-foreground border-transparent",

  sent: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-transparent",

  pending:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-transparent",

  paid: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-transparent",

  canceled:
    "bg-red-500/10 text-red-600 dark:text-red-400 border-transparent",
};

/* =========================================================
   HELPERS
========================================================= */

function StatusBadge({ status }: { status: string }) {
  const s = (status as Status) ?? "draft";

  return (
    <Badge
      variant="outline"
      className={STATUS_STYLES[s] ?? STATUS_STYLES.draft}
    >
      {STATUS_LABELS[s] ?? status}
    </Badge>
  );
}

function formatUGX(value: string | number | null | undefined) {
  const amount =
    typeof value === "string"
      ? Number.parseFloat(value)
      : Number(value ?? 0);

  if (!Number.isFinite(amount)) {
    return "UGX 0";
  }

  return `UGX ${amount.toLocaleString("en-UG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function toDateInputValue(value: unknown) {
  if (!value) return "";

  const d = new Date(value as string);

  if (Number.isNaN(d.getTime())) {
    return "";
  }

  return format(d, "yyyy-MM-dd");
}

/* =========================================================
   EDIT FORM
========================================================= */

const editSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required."),

  issueDate: z.string().min(1, "Issue date is required."),

  dueDate: z.string().min(1, "Due date is required."),

  notes: z
    .string()
    .max(1000, "Notes must be less than 1000 characters.")
    .optional()
    .or(z.literal("")),
});

type EditType = z.infer<typeof editSchema>;

/* =========================================================
   INVOICE LIST SKELETON
========================================================= */

function InvoiceListSkeleton() {
  return (
    <div className="space-y-4">
      {/* Search + filters */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Skeleton className="h-10 w-full sm:flex-1" />

        <div className="flex gap-1 overflow-hidden">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-9 w-20 shrink-0"
            />
          ))}
        </div>
      </div>

      {/* Mobile */}
      <div className="space-y-3 sm:hidden">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="space-y-3 rounded-lg border p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-32" />
              </div>

              <Skeleton className="h-5 w-24" />
            </div>

            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-24" />
            </div>

            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-20" />

              <div className="flex gap-1">
                {Array.from({ length: 4 }).map((_, actionIndex) => (
                  <Skeleton
                    key={actionIndex}
                    className="h-8 w-8"
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop */}
      <div className="hidden overflow-hidden rounded-lg border sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Issued</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">
                Total
              </TableHead>
              <TableHead className="text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {Array.from({ length: 6 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>

                <TableCell>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </TableCell>

                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>

                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>

                <TableCell>
                  <Skeleton className="h-7 w-20 rounded-full" />
                </TableCell>

                <TableCell>
                  <div className="flex justify-end">
                    <Skeleton className="h-4 w-24" />
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex justify-end gap-1">
                    {Array.from({ length: 4 }).map(
                      (_, actionIndex) => (
                        <Skeleton
                          key={actionIndex}
                          className="h-8 w-8"
                        />
                      ),
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

/* =========================================================
   EMPTY INVOICES
========================================================= */

function EmptyInvoices() {
  return (
    <Empty className="rounded-lg border border-dashed py-12">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileText className="h-6 w-6" />
        </EmptyMedia>

        <EmptyTitle>No invoices yet</EmptyTitle>

        <EmptyDescription className="max-w-md">
          You haven't created any invoices yet. Create your
          first invoice to start tracking payments, clients,
          and revenue.
        </EmptyDescription>
      </EmptyHeader>

      <EmptyContent>
        <Button >
          <Link href="/dashboard/invoices/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}

/* =========================================================
   FILTER EMPTY STATE
========================================================= */

function NoInvoiceResults({
  onClear,
}: {
  onClear: () => void;
}) {
  return (
    <Empty className="rounded-lg border border-dashed py-12">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Search className="h-6 w-6" />
        </EmptyMedia>

        <EmptyTitle>No invoices found</EmptyTitle>

        <EmptyDescription>
          No invoices match your current search or status
          filter.
        </EmptyDescription>
      </EmptyHeader>

      <EmptyContent>
        <Button variant="outline" onClick={onClear}>
          Clear filters
        </Button>
      </EmptyContent>
    </Empty>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function InvoiceList() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<Status | "all">("all");

  const [editInvoice, setEditInvoice] =
    useState<Invoice | null>(null);

  const [deleteId, setDeleteId] =
    useState<string | null>(null);

  const [downloadingId, setDownloadingId] =
    useState<string | null>(null);

  const [sortDesc, setSortDesc] = useState(true);

  const [isPending, startTransition] = useTransition();

  const form = useForm<EditType>({
    resolver: zodResolver(editSchema),

    defaultValues: {
      invoiceNumber: "",
      issueDate: "",
      dueDate: "",
      notes: "",
    },
  });

  /* =======================================================
     LOAD INVOICES
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function loadInvoices() {
      try {
        setLoading(true);

        const result = await getInvoicesList();

        if (mounted) {
          setInvoices(result);
        }
      } catch (error) {
        console.error(
          "Failed to load invoices:",
          error,
        );

        if (mounted) {
          toast.add({
            type: "error",
            description:
              "Failed to load invoices. Please try again.",
          });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadInvoices();

    return () => {
      mounted = false;
    };
  }, []);

  /* =======================================================
     EDIT
  ======================================================= */

  function openEdit(invoice: Invoice) {
    setEditInvoice(invoice);

    form.reset({
      invoiceNumber: invoice.invoiceNumber ?? "",

      issueDate: toDateInputValue(invoice.issueDate),

      dueDate: toDateInputValue(invoice.dueDate),

      notes: (invoice as any).notes ?? "",
    });
  }

  function handleEditSubmit(data: EditType) {
    if (!editInvoice) return;

    startTransition(async () => {
      const result = await updateInvoice(
        editInvoice.id,
        {
          invoiceNumber: data.invoiceNumber,
          issueDate: new Date(data.issueDate),
          dueDate: new Date(data.dueDate),
          notes: data.notes,
        },
      );

      if (result?.error) {
        toast.add({
          type: "error",
          description: result.error,
        });

        return;
      }

      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === editInvoice.id
            ? {
                ...inv,
                invoiceNumber:
                  data.invoiceNumber,
                issueDate:
                  new Date(data.issueDate),
                dueDate:
                  new Date(data.dueDate),
              }
            : inv,
        ),
      );

      toast.add({
        type: "success",
        description: "Invoice updated.",
      });

      setEditInvoice(null);
    });
  }

  /* =======================================================
     STATUS
  ======================================================= */

  function handleStatusChange(
    invoiceId: string,
    status: Status,
  ) {
    const previousInvoices = invoices;

    // Optimistic update
    setInvoices((current) =>
      current.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              status,
            }
          : inv,
      ),
    );

    startTransition(async () => {
      const result = await updateInvoiceStatus(
        invoiceId,
        status,
      );

      if (result?.error) {
        // Rollback
        setInvoices(previousInvoices);

        toast.add({
          type: "error",
          description: result.error,
        });

        return;
      }

      toast.add({
        type: "success",
        description: `Marked as ${STATUS_LABELS[status]}.`,
      });
    });
  }

  /* =======================================================
     DELETE
  ======================================================= */

  function handleDelete() {
    if (!deleteId) return;

    startTransition(async () => {
      const result = await deleteInvoice(deleteId);

      if (result?.error) {
        toast.add({
          type: "error",
          description: result.error,
        });

        return;
      }

      setInvoices((prev) =>
        prev.filter(
          (invoice) => invoice.id !== deleteId,
        ),
      );

      toast.add({
        type: "success",
        description: "Invoice deleted.",
      });

      setDeleteId(null);
    });
  }

  /* =======================================================
     DOWNLOAD PDF
  ======================================================= */

  async function handleDownloadPdf(
    invoiceId: string,
    invoiceNumber: string,
  ) {
    setDownloadingId(invoiceId);

    try {
      const full =
        await getInvoiceWithItems(invoiceId);

      if (!full) {
        throw new Error("Invoice not found");
      }

      const {
        generateInvoicePdfBlob,
      } = await import("./invoicePdf");

      const blob =
        await generateInvoicePdfBlob(full);

      const url =
        URL.createObjectURL(blob);

      const a =
        document.createElement("a");

      a.href = url;

      a.download = `Invoice-${
        invoiceNumber || invoiceId
      }.pdf`;

      document.body.appendChild(a);

      a.click();

      a.remove();

      URL.revokeObjectURL(url);
    } catch {
      toast.add({
        type: "error",
        description:
          "Couldn't generate the PDF. Try again.",
      });
    } finally {
      setDownloadingId(null);
    }
  }

  /* =======================================================
     FILTER + SORT
  ======================================================= */

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    const rows = invoices.filter((inv) => {
      const matchesSearch =
        !q ||
        inv.invoiceNumber
          ?.toLowerCase()
          .includes(q) ||
        inv.clientName
          ?.toLowerCase()
          .includes(q) ||
        inv.clientEmail
          ?.toLowerCase()
          .includes(q);

      const matchesStatus =
        statusFilter === "all" ||
        inv.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });

    return [...rows].sort((a, b) => {
      const diff =
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime();

      return sortDesc ? -diff : diff;
    });
  }, [
    invoices,
    search,
    statusFilter,
    sortDesc,
  ]);

  /* =======================================================
     OUTSTANDING
  ======================================================= */

  const totalOutstanding = invoices
    .filter(
      (inv) =>
        inv.status === "sent" ||
        inv.status === "pending",
    )
    .reduce(
      (sum, inv) =>
        sum +
        Number.parseFloat(
          inv.total ?? "0",
        ),
      0,
    );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="space-y-6">
      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Invoices
            </h1>

            {loading ? (
              <Skeleton className="h-5 w-16" />
            ) : (
              <span className="text-sm text-muted-foreground">
                {invoices.length} invoice
                {invoices.length !== 1
                  ? "s"
                  : ""}
              </span>
            )}
          </div>

          {!loading &&
            totalOutstanding > 0 && (
              <p className="mt-1 text-sm text-muted-foreground">
                {formatUGX(
                  totalOutstanding,
                )}{" "}
                outstanding
              </p>
            )}
        </div>

        <Button className={ "flex gap-2"}>
          <Link href="/dashboard/invoices/new">
            <Plus size={12}/>
            Add Invoice
          </Link>
        </Button>
      </div>

      {/* ===================================================
          LOADING
      =================================================== */}

      {loading ? (
        <InvoiceListSkeleton />
      ) : invoices.length === 0 ? (
        /* ================================================
           DATABASE EMPTY
        ================================================ */

        <EmptyInvoices />
      ) : (
        <>
          {/* ==============================================
             SEARCH + FILTERS
          ============================================== */}

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                placeholder="Search by invoice #, client name, or email..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="pl-9"
              />
            </div>

            <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
              <Button
                variant={
                  statusFilter === "all"
                    ? "secondary"
                    : "ghost"
                }
                size="sm"
                className="shrink-0"
                onClick={() =>
                  setStatusFilter("all")
                }
              >
                All
              </Button>

              {STATUS_OPTIONS.map((status) => (
                <Button
                  key={status}
                  variant={
                    statusFilter === status
                      ? "secondary"
                      : "ghost"
                  }
                  size="sm"
                  className="shrink-0"
                  onClick={() =>
                    setStatusFilter(status)
                  }
                >
                  {STATUS_LABELS[status]}
                </Button>
              ))}
            </div>
          </div>

          {/* ==============================================
             FILTER EMPTY
          ============================================== */}

          {filtered.length === 0 ? (
            <NoInvoiceResults
              onClear={() => {
                setSearch("");
                setStatusFilter("all");
              }}
            />
          ) : (
            <>
              {/* ==========================================
                 MOBILE CARDS
              ========================================== */}

              <div className="space-y-3 sm:hidden">
                {filtered.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="space-y-3 rounded-lg border p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          href={`/invoice/${invoice.id}`}
                          className="font-medium hover:underline"
                        >
                          {invoice.invoiceNumber}
                        </Link>

                        <div className="truncate text-sm text-muted-foreground">
                          {invoice.clientName ??
                            "—"}
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <div className="font-semibold">
                          {formatUGX(
                            invoice.total,
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        Issued{" "}
                        {invoice.issueDate
                          ? format(
                              new Date(
                                invoice.issueDate,
                              ),
                              "MMM d, yyyy",
                            )
                          : "—"}
                      </span>

                      <span>
                        Due{" "}
                        {invoice.dueDate
                          ? format(
                              new Date(
                                invoice.dueDate,
                              ),
                              "MMM d, yyyy",
                            )
                          : "—"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <Select
                        value={
                          invoice.status ??
                          "draft"
                        }
                        onValueChange={(value) =>
                          handleStatusChange(
                            invoice.id,
                            value as Status,
                          )
                        }
                        disabled={isPending}
                      >
                        <SelectTrigger className="border-none bg-transparent p-0 shadow-none focus:ring-0 [&>svg]:opacity-50">
                          <SelectValue>
                            <StatusBadge
                              status={
                                invoice.status ??
                                "draft"
                              }
                            />
                          </SelectValue>
                        </SelectTrigger>

                        <SelectContent>
                          {STATUS_OPTIONS.map(
                            (status) => (
                              <SelectItem
                                key={status}
                                value={status}
                              >
                                {
                                  STATUS_LABELS[
                                    status
                                  ]
                                }
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>

                      <div className="flex items-center gap-1">
                        <Link
                          href={`/invoice/${invoice.id}`}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>

                        <Button
                          variant="ghost"
                          size="sm"
                          title="Edit"
                          onClick={() =>
                            openEdit(invoice)
                          }
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          title="Download PDF"
                          disabled={
                            downloadingId ===
                            invoice.id
                          }
                          onClick={() =>
                            handleDownloadPdf(
                              invoice.id,
                              invoice.invoiceNumber,
                            )
                          }
                        >
                          {downloadingId ===
                          invoice.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          title="Delete"
                          className="text-destructive hover:text-destructive"
                          onClick={() =>
                            setDeleteId(
                              invoice.id,
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ==========================================
                 DESKTOP TABLE
              ========================================== */}

              <div className="hidden overflow-x-auto rounded-lg border sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        Invoice
                      </TableHead>

                      <TableHead>
                        Client
                      </TableHead>

                      <TableHead
                        className="cursor-pointer select-none whitespace-nowrap"
                        onClick={() =>
                          setSortDesc(
                            (value) =>
                              !value,
                          )
                        }
                      >
                        <span className="flex items-center gap-1">
                          Issued
                          <ArrowUpDown className="h-3 w-3" />
                        </span>
                      </TableHead>

                      <TableHead className="hidden lg:table-cell">
                        Due
                      </TableHead>

                      <TableHead>
                        Status
                      </TableHead>

                      <TableHead className="text-right">
                        Total
                      </TableHead>

                      <TableHead className="text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filtered.map(
                      (invoice) => (
                        <TableRow
                          key={invoice.id}
                        >
                          <TableCell className="whitespace-nowrap font-medium">
                            <Link
                              href={`/invoice/${invoice.id}`}
                              className="hover:underline"
                            >
                              {
                                invoice.invoiceNumber
                              }
                            </Link>
                          </TableCell>

                          <TableCell className="max-w-[180px]">
                            <div className="truncate text-sm">
                              {
                                invoice.clientName ??
                                "—"
                              }
                            </div>

                            <div className="truncate text-xs text-muted-foreground">
                              {invoice.clientEmail ??
                                invoice.clientPhone ??
                                ""}
                            </div>
                          </TableCell>

                          <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                            {invoice.issueDate
                              ? format(
                                  new Date(
                                    invoice.issueDate,
                                  ),
                                  "MMM d, yyyy",
                                )
                              : "—"}
                          </TableCell>

                          <TableCell className="hidden whitespace-nowrap text-sm text-muted-foreground lg:table-cell">
                            {invoice.dueDate
                              ? format(
                                  new Date(
                                    invoice.dueDate,
                                  ),
                                  "MMM d, yyyy",
                                )
                              : "—"}
                          </TableCell>

                          <TableCell>
                            <Select
                              value={
                                invoice.status ??
                                "draft"
                              }
                              onValueChange={(
                                value,
                              ) =>
                                handleStatusChange(
                                  invoice.id,
                                  value as Status,
                                )
                              }
                              disabled={
                                isPending
                              }
                            >
                              <SelectTrigger className="h-7 w-[110px] border-none bg-transparent p-0 shadow-none focus:ring-0 [&>svg]:opacity-50">
                                <SelectValue>
                                  <StatusBadge
                                    status={
                                      invoice.status ??
                                      "draft"
                                    }
                                  />
                                </SelectValue>
                              </SelectTrigger>

                              <SelectContent>
                                {STATUS_OPTIONS.map(
                                  (status) => (
                                    <SelectItem
                                      key={status}
                                      value={
                                        status
                                      }
                                    >
                                      {
                                        STATUS_LABELS[
                                          status
                                        ]
                                      }
                                    </SelectItem>
                                  ),
                                )}
                              </SelectContent>
                            </Select>
                          </TableCell>

                          <TableCell className="whitespace-nowrap text-right font-medium">
                            {formatUGX(
                              invoice.total,
                            )}
                          </TableCell>

                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Link
                                href={`/invoice/${invoice.id}`}
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="View"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>

                              <Button
                                variant="ghost"
                                size="sm"
                                title="Edit"
                                onClick={() =>
                                  openEdit(
                                    invoice,
                                  )
                                }
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                title="Download PDF"
                                disabled={
                                  downloadingId ===
                                  invoice.id
                                }
                                onClick={() =>
                                  handleDownloadPdf(
                                    invoice.id,
                                    invoice.invoiceNumber,
                                  )
                                }
                              >
                                {downloadingId ===
                                invoice.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Download className="h-4 w-4" />
                                )}
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                title="Delete"
                                className="text-destructive hover:text-destructive"
                                onClick={() =>
                                  setDeleteId(
                                    invoice.id,
                                  )
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </>
      )}

      {/* ===================================================
          EDIT DIALOG
      =================================================== */}

      <Dialog
        open={!!editInvoice}
        onOpenChange={(open) =>
          !open &&
          setEditInvoice(null)
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Edit Invoice
            </DialogTitle>

            <DialogDescription>
              Update the invoice number, dates,
              or notes. Line items are managed
              from the invoice detail page.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={form.handleSubmit(
              handleEditSubmit,
            )}
            className="space-y-4"
          >
            {/* Invoice Number */}

            <Controller
              name="invoiceNumber"
              control={form.control}
              render={({
                field,
                fieldState,
              }) => (
                <Field
                  data-invalid={
                    fieldState.invalid
                  }
                >
                  <FieldLabel>
                    Invoice Number
                  </FieldLabel>

                  <Input
                    {...field}
                    disabled={isPending}
                  />

                  {fieldState.error && (
                    <FieldError
                      errors={[
                        fieldState.error,
                      ]}
                    />
                  )}
                </Field>
              )}
            />

            {/* Dates */}

            <div className="grid grid-cols-2 gap-3">
              <Controller
                name="issueDate"
                control={form.control}
                render={({
                  field,
                  fieldState,
                }) => (
                  <Field
                    data-invalid={
                      fieldState.invalid
                    }
                  >
                    <FieldLabel>
                      Issue Date
                    </FieldLabel>

                    <Input
                      type="date"
                      {...field}
                      disabled={isPending}
                    />

                    {fieldState.error && (
                      <FieldError
                        errors={[
                          fieldState.error,
                        ]}
                      />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="dueDate"
                control={form.control}
                render={({
                  field,
                  fieldState,
                }) => (
                  <Field
                    data-invalid={
                      fieldState.invalid
                    }
                  >
                    <FieldLabel>
                      Due Date
                    </FieldLabel>

                    <Input
                      type="date"
                      {...field}
                      disabled={isPending}
                    />

                    {fieldState.error && (
                      <FieldError
                        errors={[
                          fieldState.error,
                        ]}
                      />
                    )}
                  </Field>
                )}
              />
            </div>

            {/* Notes */}

            <Controller
              name="notes"
              control={form.control}
              render={({
                field,
                fieldState,
              }) => (
                <Field
                  data-invalid={
                    fieldState.invalid
                  }
                >
                  <FieldLabel>
                    Notes{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </FieldLabel>

                  <Textarea
                    {...field}
                    rows={3}
                    placeholder="Payment terms, thank-you note, etc."
                    disabled={isPending}
                  />

                  {fieldState.error && (
                    <FieldError
                      errors={[
                        fieldState.error,
                      ]}
                    />
                  )}
                </Field>
              )}
            />

            {/* Footer */}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setEditInvoice(null)
                }
                disabled={isPending}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isPending}
              >
                {isPending
                  ? "Saving..."
                  : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ===================================================
          DELETE CONFIRMATION
      =================================================== */}

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) =>
          !open && setDeleteId(null)
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete Invoice
            </AlertDialogTitle>

            <AlertDialogDescription>
              Are you sure you want to delete
              this invoice? This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isPending}
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending
                ? "Deleting..."
                : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

