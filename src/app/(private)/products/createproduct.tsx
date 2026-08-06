"use client";

import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { Package } from "lucide-react";
import { createProduct } from "@/actions/products";

const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters."),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters.")
    .optional()
    .or(z.literal("")),
});

type ProductType = z.infer<typeof productSchema>;

export default function CreateProduct() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProductType>({
    resolver: zodResolver(productSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      description: "",
    },
  });

  function onSubmit(data: ProductType) {
    startTransition(async () => {
      const result = await createProduct(data);
      if (result?.error) {
        toast.add({ type: "error", description: result.error });
        return;
      }
      toast.add({ type: "success", description: "Product has been created." });
      form.reset();
    });
  }

  return (
    <Card className="[--card-spacing:--spacing(6)]">
      <CardHeader>
        <Package className="h-5 w-5 text-muted-foreground" />
        <CardTitle>Add Product</CardTitle>
        <CardDescription>
          Add a new product or service to your organization.
        </CardDescription>
      </CardHeader>

      <FieldSeparator />

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Product Name</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="e.g. Web Design Package"
                  disabled={isPending}
                  aria-invalid={fieldState.invalid}
                />
                <FieldDescription>
                  The name of the product or service you offer.
                </FieldDescription>
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  Description{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </FieldLabel>
                <Textarea
                  {...field}
                  id={field.name}
                  rows={3}
                  placeholder="Briefly describe what this product or service includes..."
                  disabled={isPending}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
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
            {isPending ? "Saving..." : "Add Product"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
