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
import { toast } from "@/components/ui/toast";
import { UserPlus } from "lucide-react";
import { createClient } from "@/actions/clients";

const clientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z
    .string()
    .email("Please enter a valid email.")
    .optional()
    .or(z.literal("")),
  phone: z.string().min(7, "Please enter a valid phone number."),
  address: z.string().min(2, "Address is required."),
});

type ClientType = z.infer<typeof clientSchema>;

export default function CreateClient() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<ClientType>({
    resolver: zodResolver(clientSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  function onSubmit(data: ClientType) {
    startTransition(async () => {
      const result = await createClient(data);
      if (result?.error) {
        toast.add({ type: "error", description: result.error });
        return;
      }
      toast.add({ type: "success", description: "Client has been created." });
      form.reset();
    });
  }

  return (
    <Card className="[--card-spacing:--spacing(6)]">
      <CardHeader>
        <UserPlus className="h-5 w-5 text-muted-foreground" />
        <CardTitle>Add Client</CardTitle>
        <CardDescription>
          Add a new client to your organization.
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
                <FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="John Doe"
                  disabled={isPending}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  Email{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="email"
                  placeholder="john@example.com"
                  disabled={isPending}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="phone"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Phone</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="tel"
                    placeholder="+256 700 123 456"
                    disabled={isPending}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>Include country code.</FieldDescription>
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="address"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Address</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="Kampala, Uganda"
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
            {isPending ? "Saving..." : "Add Client"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
