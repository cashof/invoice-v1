"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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

type Invoice = Awaited<ReturnType<typeof getInvoicesList>>[number];
type Status = "draft" | "sent" | "pending" | "paid" | "canceled";

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
  canceled: "bg-red-500/10 text-red-600 dark:text-red-400 border-transparent",
};

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

function toDateInputValue(value: unknown) {
  if (!value) return "";
  const d = new Date(value as string);
  if (Number.isNaN(d.getTime())) return "";
  return format(d, "yyyy-MM-dd");
}

export default function InvoiceList() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [sortDesc, setSortDesc] = useState(true);
  const [isPending, startTransition] = useTransition();

  const form = useForm<EditType>({
    resolver: zodResolver(editSchema),
    defaultValues: { invoiceNumber: "", issueDate: "", dueDate: "", notes: "" },
  });

  useEffect(() => {
    getInvoicesList()
      .then(setInvoices)
      .finally(() => setLoading(false));
  }, []);

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
      const result = await updateInvoice(editInvoice.id, {
        invoiceNumber: data.invoiceNumber,
        issueDate: new Date(data.issueDate),
        dueDate: new Date(data.dueDate),
        notes: data.notes,
      });
      if (result?.error) {
        toast.add({ type: "error", description: result.error });
        return;
      }
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === editInvoice.id
            ? {
                ...inv,
                invoiceNumber: data.invoiceNumber,
                issueDate: new Date(data.issueDate),
                dueDate: new Date(data.dueDate),
              }
            : inv,
        ),
      );
      toast.add({ type: "success", description: "Invoice updated." });
      setEditInvoice(null);
    });
  }

  function handleStatusChange(invoiceId: string, status: Status) {
    const prev = invoices;
    setInvoices((cur) =>
      cur.map((inv) => (inv.id === invoiceId ? { ...inv, status } : inv)),
    );
    startTransition(async () => {
      const result = await updateInvoiceStatus(invoiceId, status);
      if (result?.error) {
        setInvoices(prev);
        toast.add({ type: "error", description: result.error });
        return;
      }
      toast.add({
        type: "success",
        description: `Marked as ${STATUS_LABELS[status]}.`,
      });
    });
  }

  function handleDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      const result = await deleteInvoice(deleteId);
      if (result?.error) {
        toast.add({ type: "error", description: result.error });
        return;
      }
      setInvoices((prev) => prev.filter((inv) => inv.id !== deleteId));
      toast.add({ type: "success", description: "Invoice deleted." });
      setDeleteId(null);
    });
  }

  async function handleDownloadPdf(invoiceId: string, invoiceNumber: string) {
    setDownloadingId(invoiceId);
    try {
      const full = await getInvoiceWithItems(invoiceId);
      if (!full) throw new Error("not found");
      const { generateInvoicePdfBlob } = await import("./invoicePdf");
      const blob = await generateInvoicePdfBlob(full);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice-${invoiceNumber || invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.add({
        type: "error",
        description: "Couldn't generate the PDF. Try again.",
      });
    } finally {
      setDownloadingId(null);
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const rows = invoices.filter((inv) => {
      const matchesSearch =
        inv.invoiceNumber?.toLowerCase().includes(q) ||
        inv.clientName?.toLowerCase().includes(q) ||
        inv.clientEmail?.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    return rows.sort((a, b) => {
      const diff =
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortDesc ? -diff : diff;
    });
  }, [invoices, search, statusFilter, sortDesc]);

  const totalOutstanding = invoices
    .filter((inv) => inv.status === "sent" || inv.status === "pending")
    .reduce((sum, inv) => sum + parseFloat(inv.total ?? "0"), 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold">Invoices</h1>
          <p className="text-sm text-muted-foreground">
            {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
            {totalOutstanding > 0 && (
              <> · ${totalOutstanding.toFixed(2)} outstanding</>
            )}
          </p>
        </div>
        <Link href="/invoice/create" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <Plus /> New Invoice
          </Button>
        </Link>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by invoice #, client name, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
          <Button
            variant={statusFilter === "all" ? "secondary" : "ghost"}
            size="sm"
            className="shrink-0"
            onClick={() => setStatusFilter("all")}
          >
            All
          </Button>
          {STATUS_OPTIONS.map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "secondary" : "ghost"}
              size="sm"
              className="shrink-0"
              onClick={() => setStatusFilter(s)}
            >
              {STATUS_LABELS[s]}
            </Button>
          ))}
        </div>
      </div>

      {/* Empty / loading (shared) */}
      {loading ? (
        <div className="rounded-lg border py-16 text-center text-sm text-muted-foreground">
          Loading invoices...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border py-16 text-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <FileText className="h-8 w-8 opacity-30" />
            <p className="text-sm">
              {search || statusFilter !== "all"
                ? "No invoices match your filters."
                : "No invoices yet. Create your first one."}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Mobile: card list */}
          <div className="space-y-3 sm:hidden">
            {filtered.map((invoice) => (
              <div key={invoice.id} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      href={`/invoice/${invoice.id}`}
                      className="font-medium hover:underline"
                    >
                      {invoice.invoiceNumber}
                    </Link>
                    <div className="text-sm text-muted-foreground truncate">
                      {invoice.clientName ?? "—"}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-semibold">
                      ${parseFloat(invoice.total ?? "0").toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Issued{" "}
                    {invoice.issueDate
                      ? format(new Date(invoice.issueDate), "MMM d, yyyy")
                      : "—"}
                  </span>
                  <span>
                    Due{" "}
                    {invoice.dueDate
                      ? format(new Date(invoice.dueDate), "MMM d, yyyy")
                      : "—"}
                  </span>
                </div>

                <div className="flex items-center justify-center">
                  <Select
                    value={invoice.status ?? "draft"}
                    onValueChange={(v) =>
                      handleStatusChange(invoice.id, v as Status)
                    }
                    disabled={isPending}
                  >
                    <SelectTrigger className=" border-none bg-transparent p-0 shadow-none focus:ring-0 [&>svg]:opacity-50">
                      <SelectValue>
                        <StatusBadge status={invoice.status ?? "draft"} />
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-1">
                    <Link href={`/invoice/${invoice.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(invoice)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={downloadingId === invoice.id}
                      onClick={() =>
                        handleDownloadPdf(invoice.id, invoice.invoiceNumber)
                      }
                    >
                      {downloadingId === invoice.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(invoice.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden rounded-lg border sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead
                    className="cursor-pointer select-none whitespace-nowrap"
                    onClick={() => setSortDesc((v) => !v)}
                  >
                    <span className="flex items-center gap-1">
                      Issued <ArrowUpDown className="h-3 w-3" />
                    </span>
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium whitespace-nowrap">
                      <Link
                        href={`/invoice/${invoice.id}`}
                        className="hover:underline"
                      >
                        {invoice.invoiceNumber}
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-[180px]">
                      <div className="text-sm truncate">
                        {invoice.clientName ?? "—"}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {invoice.clientEmail ?? invoice.clientPhone ?? ""}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {invoice.issueDate
                        ? format(new Date(invoice.issueDate), "MMM d, yyyy")
                        : "—"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground whitespace-nowrap">
                      {invoice.dueDate
                        ? format(new Date(invoice.dueDate), "MMM d, yyyy")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={invoice.status ?? "draft"}
                        onValueChange={(v) =>
                          handleStatusChange(invoice.id, v as Status)
                        }
                        disabled={isPending}
                      >
                        <SelectTrigger className="h-7 w-[110px] border-none bg-transparent p-0 shadow-none focus:ring-0 [&>svg]:opacity-50">
                          <SelectValue>
                            <StatusBadge status={invoice.status ?? "draft"} />
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((s) => (
                            <SelectItem key={s} value={s}>
                              {STATUS_LABELS[s]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right font-medium whitespace-nowrap">
                      ${parseFloat(invoice.total ?? "0").toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/invoice/${invoice.id}`}>
                          <Button variant="ghost" size="sm" title="View">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Edit"
                          onClick={() => openEdit(invoice)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Download PDF"
                          disabled={downloadingId === invoice.id}
                          onClick={() =>
                            handleDownloadPdf(invoice.id, invoice.invoiceNumber)
                          }
                        >
                          {downloadingId === invoice.id ? (
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
                          onClick={() => setDeleteId(invoice.id)}
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
        </>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={!!editInvoice}
        onOpenChange={(o) => !o && setEditInvoice(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
            <DialogDescription>
              Update the invoice number, dates, or notes. Line items are managed
              from the invoice detail page.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit(handleEditSubmit)}
            className="space-y-4"
          >
            <Controller
              name="invoiceNumber"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Invoice Number</FieldLabel>
                  <Input {...field} disabled={isPending} />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <Controller
                name="issueDate"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Issue Date</FieldLabel>
                    <Input type="date" {...field} disabled={isPending} />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="dueDate"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Due Date</FieldLabel>
                    <Input type="date" {...field} disabled={isPending} />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
            <Controller
              name="notes"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>
                    Notes{" "}
                    <span className="text-muted-foreground font-normal">
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
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditInvoice(null)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this invoice? This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
