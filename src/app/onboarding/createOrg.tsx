"use client";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
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
import { organizationSchema, orgType } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { OrigamiIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "@/components/ui/toast";
import { createOrganization } from "@/actions/organization";

export default function CreateOrg() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<orgType>({
    resolver: zodResolver(organizationSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      description: "",
      phone: "",
      address: "",
      p_o_box: "",
    },
  });

  function onSubmit(data: orgType) {
    startTransition(async () => {
      const result = await createOrganization(data);

      if (result) {
        toast.add({
          type: "success",
          description: "Organization has been created.",
        });
        form.reset();
      } else {
        toast.add({
          type: "error",
          description: "something went wrong !!",
        });
      }
    });
  }

  return (
    <div>
      <Card className="[--card-spacing:--spacing(6)] ">
        <CardHeader>
          <CardAction>
            <OrigamiIcon />
          </CardAction>
          <CardTitle>Create your organization</CardTitle>
          <CardDescription>
            Let's get you setup with your first organization.
          </CardDescription>
        </CardHeader>

        <FieldSeparator />
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="my-4" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Organization Name
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="InvoSend"
                    autoComplete="off"
                    disabled={isPending}
                  />
                  <FieldDescription>
                    Provide your organization name.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="my-4" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Organization Description (optional)
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="InvoSend we make invoice management easy for you"
                    autoComplete="off"
                    disabled={isPending}
                  />
                  <FieldDescription>
                    Provide more information about your organization.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="phone"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="my-4" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Phone Number</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="+123-456-789-568"
                    disabled={isPending}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="address"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="my-4" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Address</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="Kampala, Uganda"
                    disabled={isPending}
                  />
                  <FieldDescription>
                    Provide a concise address/location of your organization.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="p_o_box"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="my-4" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>P.O. Box</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="1234"
                    autoComplete="off"
                    disabled={isPending}
                  />
                  <FieldDescription>
                    Provide your Business Post Office Box.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </CardContent>

          <CardFooter className="gap-4 flex flex-row justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isPending}
            >
              Reset
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
