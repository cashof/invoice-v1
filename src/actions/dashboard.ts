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

export async function getSectionCardsData() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/login");

  // Get the logged-in user's organization
  const [org] = await db
    .select()
    .from(organization)
    .where(eq(organization.userId, session.user.id))
    .limit(1);

  if (!org) return null;

  const orgId = org.id;

  // ---------------------------------------------------------
  // Get all invoices for this organization
  // ---------------------------------------------------------

  const allInvoices = await db
    .select({
      id: invoices.id,
      total: invoices.total,
      status: invoices.status,
      createdAt: invoices.createdAt,
      clientId: invoices.clientId,
    })
    .from(invoices)
    .where(eq(invoices.organizationId, orgId));

  // ---------------------------------------------------------
  // Get all clients for this organization
  // ---------------------------------------------------------

  const allClients = await db
    .select({
      id: clients.id,
      createdAt: clients.createdAt,
    })
    .from(clients)
    .where(eq(clients.organizationId, orgId));

  // ---------------------------------------------------------
  // Date helpers
  // ---------------------------------------------------------

  const now = new Date();

  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const previousMonthEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    0,
    23,
    59,
    59,
    999,
  );

  // ---------------------------------------------------------
  // Revenue calculations
  // ---------------------------------------------------------

  let totalRevenue = 0;

  let currentMonthRevenue = 0;
  let previousMonthRevenue = 0;

  let currentMonthInvoices = 0;
  let previousMonthInvoices = 0;

  for (const invoice of allInvoices) {
    const amount = Number(invoice.total ?? 0);

    totalRevenue += Number.isFinite(amount) ? amount : 0;

    const createdAt = new Date(invoice.createdAt);

    // Current month
    if (createdAt >= currentMonthStart) {
      currentMonthRevenue += amount;
      currentMonthInvoices++;
    }

    // Previous month
    if (createdAt >= previousMonthStart && createdAt <= previousMonthEnd) {
      previousMonthRevenue += amount;
      previousMonthInvoices++;
    }
  }

  // ---------------------------------------------------------
  // Revenue growth
  // ---------------------------------------------------------

  let revenueGrowth = 0;

  if (previousMonthRevenue === 0) {
    revenueGrowth = currentMonthRevenue > 0 ? 100 : 0;
  } else {
    revenueGrowth =
      ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) *
      100;
  }

  // ---------------------------------------------------------
  // Customer calculations
  // ---------------------------------------------------------

  let newCustomers = 0;
  let previousMonthCustomers = 0;

  for (const client of allClients) {
    const createdAt = new Date(client.createdAt);

    // Customers created this month
    if (createdAt >= currentMonthStart) {
      newCustomers++;
    }

    // Customers created previous month
    if (createdAt >= previousMonthStart && createdAt <= previousMonthEnd) {
      previousMonthCustomers++;
    }
  }

  // ---------------------------------------------------------
  // Customer growth
  // ---------------------------------------------------------

  let customerGrowth = 0;

  if (previousMonthCustomers === 0) {
    customerGrowth = newCustomers > 0 ? 100 : 0;
  } else {
    customerGrowth =
      ((newCustomers - previousMonthCustomers) / previousMonthCustomers) * 100;
  }

  // ---------------------------------------------------------
  // Active accounts
  //
  // An account is considered active if the client has
  // at least one invoice belonging to the organization.
  // ---------------------------------------------------------

  const activeClientIds = new Set<string>();

  for (const invoice of allInvoices) {
    if (invoice.clientId) {
      activeClientIds.add(invoice.clientId);
    }
  }

  const activeAccounts = activeClientIds.size;

  const totalCustomers = allClients.length;

  const activeAccountRate =
    totalCustomers === 0 ? 0 : (activeAccounts / totalCustomers) * 100;

  // ---------------------------------------------------------
  // Invoice growth
  // ---------------------------------------------------------

  let invoiceGrowth = 0;

  if (previousMonthInvoices === 0) {
    invoiceGrowth = currentMonthInvoices > 0 ? 100 : 0;
  } else {
    invoiceGrowth =
      ((currentMonthInvoices - previousMonthInvoices) / previousMonthInvoices) *
      100;
  }

  // ---------------------------------------------------------
  // Return data
  // ---------------------------------------------------------

  return {
    totalRevenue,
    revenueGrowth,

    newCustomers,
    totalCustomers,
    customerGrowth,

    activeAccounts,
    activeAccountRate,

    totalInvoices: allInvoices.length,
    invoiceGrowth,

    currentMonthRevenue,
    previousMonthRevenue,

    currentMonthInvoices,
    previousMonthInvoices,
  };
}