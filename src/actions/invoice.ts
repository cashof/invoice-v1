"use server";

import { db } from "@/lib/db";
import { invoices, invoiceItems, organization } from "@/db/orgSchema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { invoiceType } from "@/types";
import { eq } from "drizzle-orm";

export async function createInvoice(data: invoiceType) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/login");

  // Get the user's organization
  const org = await db.query.organization.findFirst({
    where: eq(organization.userId, session.user.id),
  });

  if (!org) {
    return { error: "No organization found. Please create one first." };
  }

  try {
    // 1. Insert invoice
    const [newInvoice] = await db
      .insert(invoices)
      .values({
        organizationId: org.id,
        clientId: data.clientId,
        invoiceNumber: data.invoiceNumber,
        status: data.status,
        issueDate: new Date(data.issueDate),
        dueDate: new Date(data.dueDate),
        subtotal: String(data.subtotal),
        tax: String(data.tax ?? 0),
        total: String(data.total),
        notes: data.notes ?? null,
      })
      .returning({ id: invoices.id });

    // 2. Insert all invoice items
    await db.insert(invoiceItems).values(
      data.invoiceItems.map((item) => ({
        invoiceId: newInvoice.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: String(item.unitPrice),
        total: String(item.quantity * item.unitPrice),
      })),
    );

    return { success: true, invoiceId: newInvoice.id };
  } catch (err) {
    console.error("Failed to create invoice:", err);
    return { error: "Something went wrong. Please try again." };
  }
}

// Fetch clients for the current user's organization
export async function getClients() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/login");

  const org = await db.query.organization.findFirst({
    where: eq(organization.userId, session.user.id),
  });

  if (!org) return [];

  return db.query.clients.findMany({
    where: (clients, { eq }) => eq(clients.organizationId, org.id),
    columns: { id: true, name: true, email: true },
  });
}

// Fetch products for the current user's organization
export async function getProducts() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/login");

  const org = await db.query.organization.findFirst({
    where: eq(organization.userId, session.user.id),
  });

  if (!org) return [];

  return db.query.products.findMany({
    where: (products, { eq }) => eq(products.organizationId, org.id),
    columns: { id: true, name: true, description: true },
  });
}
