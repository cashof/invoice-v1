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
import { invoiceType } from "@/types";
import { eq } from "drizzle-orm";

// ==========================================
// Create Invoice
// ==========================================

export async function createInvoice(data: invoiceType) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  try {
    // Get the user's organization
    const [org] = await db
      .select()
      .from(organization)
      .where(eq(organization.userId, session.user.id))
      .limit(1);

    if (!org) {
      return {
        error: "No organization found. Please create one first.",
      };
    }

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
      .returning({
        id: invoices.id,
      });

    // Make sure invoice was created
    if (!newInvoice) {
      return {
        error: "Failed to create invoice.",
      };
    }

    // 2. Insert invoice items
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

    return {
      success: true,
      invoiceId: newInvoice.id,
    };
  } catch (err) {
    console.error("Failed to create invoice:", err);

    return {
      error: "Something went wrong. Please try again.",
    };
  }
}

// ==========================================
// Get Clients
// ==========================================

export async function getClients() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  try {
    // Get user's organization
    const [org] = await db
      .select()
      .from(organization)
      .where(eq(organization.userId, session.user.id))
      .limit(1);

    if (!org) {
      return [];
    }

    // Get clients belonging to the organization
    const result = await db
      .select({
        id: clients.id,
        name: clients.name,
        email: clients.email,
      })
      .from(clients)
      .where(eq(clients.organizationId, org.id));

    return result;
  } catch (err) {
    console.error("Failed to fetch clients:", err);

    return [];
  }
}

// ==========================================
// Get Products
// ==========================================

export async function getProducts() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  try {
    // Get user's organization
    const [org] = await db
      .select()
      .from(organization)
      .where(eq(organization.userId, session.user.id))
      .limit(1);

    if (!org) {
      return [];
    }

    // Get products belonging to the organization
    const result = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
      })
      .from(products)
      .where(eq(products.organizationId, org.id));

    return result;
  } catch (err) {
    console.error("Failed to fetch products:", err);

    return [];
  }
}
