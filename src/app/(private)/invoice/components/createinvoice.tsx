"use client";

import { invoiceSchema, invoiceType } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useTransition, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { Plus, Trash2, FileText } from "lucide-react";
import { createInvoice, getClients, getProducts } from "@/actions/invoice";

type Client = { id: string; name: string; email: string | null };
type Product = { id: string; name: string; description: string | null };

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending" },
  { value: "sent", label: "Sent" },
  { value: "paid", label: "Paid" },
  { value: "canceled", label: "Canceled" },
] as const;

export default function CreateInvoice() {
  const [isPending, startTransition] = useTransition();
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Load clients and products on mount
  useEffect(() => {
    getClients().then(setClients);
    getProducts().then(setProducts);
  }, []);

  const form = useForm<invoiceType>({
    resolver: zodResolver(invoiceSchema),
    mode: "onBlur",
    defaultValues: {
      clientId: "",
      invoiceNumber: "",
      status: "draft",
      issueDate: "",
      dueDate: "",
      subtotal: 0,
      tax: 0,
      total: 0,
      notes: "",
      invoiceItems: [{ productId: "", quantity: 1, unitPrice: 0, total: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "invoiceItems",
  });

  const watchItems = form.watch("invoiceItems");
  const watchTax = form.watch("tax");
  const subtotal = watchItems.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0,
  );
  const total = subtotal + (watchTax || 0);

  // Auto-fill unit price when product is selected
  function handleProductSelect(index: number, productId: string) {
    form.setValue(`invoiceItems.${index}.productId`, productId);
  }

  function onSubmit(data: invoiceType) {
    startTransition(async () => {
      const result = await createInvoice({
        ...data,
        subtotal,
        total,
      });

      if (result?.error) {
        toast.add({ type: "error", description: result.error });
        return;
      }

      toast.add({ type: "success", description: "Invoice has been created." });
      form.reset();
    });
  }

  return (
    <div>
      <Card className="[--card-spacing:--spacing(6)]">
        <CardHeader>
          <FileText className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Create Invoice</CardTitle>
          <CardDescription>
            Fill in the details below to generate a new invoice.
          </CardDescription>
        </CardHeader>

        <FieldSeparator />

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {/* Client Select */}
            <Controller
              name="clientId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Client</FieldLabel>
                  <Select
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                    disabled={isPending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No clients found
                        </SelectItem>
                      ) : (
                        clients.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name} {c.email ? `— ${c.email}` : ""}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    Choose the client for this invoice.
                  </FieldDescription>
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Invoice Number + Status */}
            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="invoiceNumber"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Invoice Number</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      placeholder="INV-001"
                      disabled={isPending}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="status"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Status</FieldLabel>
                    <Select
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                      disabled={isPending}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(({ value, label }) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            {/* Issue Date + Due Date */}
            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="issueDate"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Issue Date</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="date"
                      disabled={isPending}
                      aria-invalid={fieldState.invalid}
                    />
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
                    <FieldLabel htmlFor={field.name}>Due Date</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="date"
                      disabled={isPending}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <FieldSeparator />

            {/* Invoice Items */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Invoice Items</p>

              <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground px-1">
                <span className="col-span-5">Product</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-3 text-center">Unit Price</span>
                <span className="col-span-1 text-center">Total</span>
                <span className="col-span-1" />
              </div>

              {fields.map((f, index) => {
                const qty = watchItems[index]?.quantity || 0;
                const price = watchItems[index]?.unitPrice || 0;
                const lineTotal = qty * price;

                return (
                  <div
                    key={f.id}
                    className="grid grid-cols-12 gap-2 items-start"
                  >
                    {/* Product Select */}
                    <div className="col-span-5">
                      <Controller
                        name={`invoiceItems.${index}.productId`}
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <Select
                              value={field.value ?? ""}
                              onValueChange={(val) =>
                                handleProductSelect(index, val)
                              }
                              disabled={isPending}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                              <SelectContent>
                                {products.length === 0 ? (
                                  <SelectItem value="none" disabled>
                                    No products found
                                  </SelectItem>
                                ) : (
                                  products.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>
                                      {p.name}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            {fieldState.error && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </div>

                    {/* Quantity */}
                    <div className="col-span-2">
                      <Controller
                        name={`invoiceItems.${index}.quantity`}
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <Input
                              {...field}
                              type="number"
                              min={1}
                              placeholder="1"
                              className="text-center"
                              disabled={isPending}
                            />
                            {fieldState.error && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </div>

                    {/* Unit Price */}
                    <div className="col-span-3">
                      <Controller
                        name={`invoiceItems.${index}.unitPrice`}
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <Input
                              {...field}
                              type="number"
                              min={0}
                              step="0.01"
                              placeholder="0.00"
                              className="text-center"
                              disabled={isPending}
                            />
                            {fieldState.error && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </div>

                    {/* Line Total */}
                    <div className="col-span-1 flex items-center justify-center pt-2">
                      <span className="text-sm text-muted-foreground">
                        ${lineTotal.toFixed(2)}
                      </span>
                    </div>

                    {/* Remove */}
                    <div className="col-span-1 flex justify-center pt-2">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1 || isPending}
                        className="text-muted-foreground hover:text-destructive disabled:opacity-30 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {form.formState.errors.invoiceItems?.root && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.invoiceItems.root.message}
                </p>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={() =>
                  append({ productId: "", quantity: 1, unitPrice: 0, total: 0 })
                }
                disabled={isPending}
              >
                <Plus className="h-4 w-4" /> Add Item
              </Button>
            </div>

            <FieldSeparator />

            {/* Totals */}
            <div className="flex flex-col items-end gap-2 text-sm">
              <div className="flex justify-between w-48">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between w-48 items-center gap-2">
                <span className="text-muted-foreground">Tax ($)</span>
                <Controller
                  name="tax"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      min={0}
                      step="0.01"
                      className="w-24 text-right h-7 text-sm"
                      disabled={isPending}
                    />
                  )}
                />
              </div>

              <div className="flex justify-between w-48 font-semibold border-t pt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Notes */}
            <Controller
              name="notes"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Notes{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    rows={2}
                    placeholder="Any additional notes for the client..."
                    disabled={isPending}
                  />
                  <FieldDescription>
                    These will appear at the bottom of the invoice.
                  </FieldDescription>
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </CardContent>

          <CardFooter className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isPending}
            >
              Reset
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Create Invoice"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
