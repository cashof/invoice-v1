"use server";

import { db } from "@/lib/db";
import {
  invoices,
  invoiceItems,
  clients,
  products,
  organization,
} from "@/db/orgSchema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getInvoicesList() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const [org] = await db
    .select()
    .from(organization)
    .where(eq(organization.userId, session.user.id))
    .limit(1);
  if (!org) return [];

  return db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      status: invoices.status,
      total: invoices.total,
      subtotal: invoices.subtotal,
      tax: invoices.tax,
      notes: invoices.notes,
      issueDate: invoices.issueDate,
      dueDate: invoices.dueDate,
      createdAt: invoices.createdAt,
      clientName: clients.name,
      clientEmail: clients.email,
      clientPhone: clients.phone,
      clientAddress: clients.address,
    })
    .from(invoices)
    .leftJoin(clients, eq(invoices.clientId, clients.id))
    .where(eq(invoices.organizationId, org.id))
    .orderBy(invoices.createdAt);
}

export async function getInvoiceWithItems(invoiceId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const [inv] = await db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      status: invoices.status,
      total: invoices.total,
      subtotal: invoices.subtotal,
      tax: invoices.tax,
      notes: invoices.notes,
      issueDate: invoices.issueDate,
      dueDate: invoices.dueDate,
      clientName: clients.name,
      clientEmail: clients.email,
      clientPhone: clients.phone,
      clientAddress: clients.address,
    })
    .from(invoices)
    .leftJoin(clients, eq(invoices.clientId, clients.id))
    .where(eq(invoices.id, invoiceId))
    .limit(1);

  if (!inv) return null;

  const items = await db
    .select({
      id: invoiceItems.id,
      quantity: invoiceItems.quantity,
      unitPrice: invoiceItems.unitPrice,
      total: invoiceItems.total,
      productName: products.name,
      productDescription: products.description,
    })
    .from(invoiceItems)
    .leftJoin(products, eq(invoiceItems.productId, products.id))
    .where(eq(invoiceItems.invoiceId, invoiceId));

  return { ...inv, items };
}

export async function updateInvoiceStatus(invoiceId: string, status: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  try {
    await db
      .update(invoices)
      .set({ status: status as any })
      .where(eq(invoices.id, invoiceId));
    revalidatePath("/invoice");
    return { success: true };
  } catch (err) {
    return { error: "Failed to update invoice." };
  }
}

export async function deleteInvoice(invoiceId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  try {
    await db.delete(invoices).where(eq(invoices.id, invoiceId));
    revalidatePath("/invoice");
    return { success: true };
  } catch (err) {
    return { error: "Failed to delete invoice." };
  }
}
