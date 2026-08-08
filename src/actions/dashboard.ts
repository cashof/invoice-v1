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
import { eq, sql, desc } from "drizzle-orm";

export async function getDashboardData() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const [org] = await db
    .select()
    .from(organization)
    .where(eq(organization.userId, session.user.id))
    .limit(1);

  if (!org) return null;

  const orgId = org.id;

  // All invoices
  const allInvoices = await db
    .select({
      id: invoices.id,
      status: invoices.status,
      total: invoices.total,
      createdAt: invoices.createdAt,
    })
    .from(invoices)
    .where(eq(invoices.organizationId, orgId));

  // Status breakdown
  const statusBreakdown = {
    paid: 0,
    pending: 0,
    draft: 0,
    sent: 0,
    cancled: 0,
  };
  let totalRevenue = 0;
  let paidRevenue = 0;

  for (const inv of allInvoices) {
    const amount = parseFloat(inv.total ?? "0");
    totalRevenue += amount;
    statusBreakdown[inv.status as keyof typeof statusBreakdown] =
      (statusBreakdown[inv.status as keyof typeof statusBreakdown] || 0) + 1;
    if (inv.status === "paid") paidRevenue += amount;
  }

  // Revenue by month (last 6 months)
  const revenueByMonth: Record<string, number> = {};
  for (const inv of allInvoices) {
    const month = new Date(inv.createdAt).toLocaleString("en-US", {
      month: "short",
      year: "2-digit",
    });
    revenueByMonth[month] =
      (revenueByMonth[month] || 0) + parseFloat(inv.total ?? "0");
  }
  const revenueChart = Object.entries(revenueByMonth)
    .slice(-6)
    .map(([month, revenue]) => ({ month, revenue }));

  // Top clients by invoice count
  const topClients = await db
    .select({
      id: clients.id,
      name: clients.name,
      email: clients.email,
      phone: clients.phone,
      invoiceCount: sql<number>`count(${invoices.id})`.as("invoice_count"),
      totalBilled: sql<string>`coalesce(sum(${invoices.total}), 0)`.as(
        "total_billed",
      ),
    })
    .from(clients)
    .leftJoin(invoices, eq(invoices.clientId, clients.id))
    .where(eq(clients.organizationId, orgId))
    .groupBy(clients.id, clients.name, clients.email, clients.phone)
    .orderBy(desc(sql`invoice_count`))
    .limit(5);

  // Top products by usage
  const topProducts = await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      timesUsed: sql<number>`count(${invoiceItems.id})`.as("times_used"),
      totalRevenue: sql<string>`coalesce(sum(${invoiceItems.total}), 0)`.as(
        "total_revenue",
      ),
    })
    .from(products)
    .leftJoin(invoiceItems, eq(invoiceItems.productId, products.id))
    .where(eq(products.organizationId, orgId))
    .groupBy(products.id, products.name, products.description)
    .orderBy(desc(sql`times_used`))
    .limit(5);

  return {
    totalInvoices: allInvoices.length,
    totalRevenue,
    paidRevenue,
    statusBreakdown,
    revenueChart,
    topClients,
    topProducts,
  };
}
