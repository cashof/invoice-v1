"use server";

import { db } from "@/lib/db";
import {
  invoices,
  invoiceItems,
  organization,
  clients,
  products,
} from "@/db/orgSchema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { invoiceType } from "@/types";
import { eq, and } from "drizzle-orm";

export async function createInvoice(data: invoiceType) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/login");

  try {
    const [org] = await db
      .select()
      .from(organization)
      .where(eq(organization.userId, session.user.id))
      .limit(1);

    if (!org)
      return { error: "No organization found. Please create one first." };

    // Check for duplicate invoice number within the same organization
    const [existing] = await db
      .select({ id: invoices.id })
      .from(invoices)
      .where(
        and(
          eq(invoices.invoiceNumber, data.invoiceNumber),
          eq(invoices.organizationId, org.id),
        ),
      )
      .limit(1);

    if (existing) {
      return {
        error: `Invoice number "${data.invoiceNumber}" already exists. Please use a different number.`,
      };
    }

    const [newInvoice] = await db
      .insert(invoices)
      .values({
        organizationId: org.id,
        clientId: data.clientId,
        invoiceNumber: data.invoiceNumber,
        status: data.status as
          | "pending"
          | "cancled"
          | "draft"
          | "sent"
          | "paid", // ← cast to match DB enum
        issueDate: new Date(data.issueDate),
        dueDate: new Date(data.dueDate),
        subtotal: String(data.subtotal),
        tax: String(data.tax ?? 0),
        total: String(data.total),
        notes: data.notes ?? null,
      })
      .returning({ id: invoices.id });

    if (!newInvoice) return { error: "Failed to create invoice." };

    if (data.invoiceItems?.length) {
      await db.insert(invoiceItems).values(
        data.invoiceItems.map((item) => ({
          invoiceId: newInvoice.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: String(item.unitPrice),
          total: String(item.quantity * item.unitPrice),
        })),
      );
    }

    revalidatePath("/invoice"); // ← revalidate the invoice list page
    return { success: true, invoiceId: newInvoice.id };
  } catch (err) {
    console.error("Failed to create invoice:", err);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function getClients() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  try {
    const [org] = await db
      .select()
      .from(organization)
      .where(eq(organization.userId, session.user.id))
      .limit(1);

    if (!org) return [];

    return db
      .select({ id: clients.id, name: clients.name, email: clients.email })
      .from(clients)
      .where(eq(clients.organizationId, org.id));
  } catch (err) {
    console.error("Failed to fetch clients:", err);
    return [];
  }
}

export async function getProducts() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  try {
    const [org] = await db
      .select()
      .from(organization)
      .where(eq(organization.userId, session.user.id))
      .limit(1);

    if (!org) return [];

    return db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
      })
      .from(products)
      .where(eq(products.organizationId, org.id));
  } catch (err) {
    console.error("Failed to fetch products:", err);
    return [];
  }
}
