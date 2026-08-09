
"use client";

import * as React from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";

import {
  FileText,
  DollarSign,
  CheckCircle2,
  Clock,
  Users,
  Package,
  ArrowRight,
  Plus,
  UserPlus,
  PackagePlus,
  FilePlus2,
} from "lucide-react";

import { getDashboardData } from "@/actions/dashboard";

/* =========================================================
   ROUTES
   Change these to match your actual application routes.
========================================================= */

const ROUTES = {
  clients: "/dashboard/clients",
  products: "/dashboard/products",
  invoices: "/dashboard/invoices",
};

/* =========================================================
   TYPES
========================================================= */

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

/* =========================================================
   STATUS
========================================================= */

const STATUS_COLORS: Record<string, string> = {
  paid: "var(--chart-1)",
  pending: "var(--chart-2)",
  draft: "var(--chart-3)",
  sent: "var(--chart-4)",
  canceled: "var(--chart-5)",
  cancled: "var(--chart-5)",
};

const STATUS_LABELS: Record<string, string> = {
  paid: "Paid",
  pending: "Pending",
  draft: "Draft",
  sent: "Sent",
  canceled: "Cancelled",
  cancled: "Cancelled",
};

/* =========================================================
   CHART CONFIG
========================================================= */

const revenueConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

const radarConfig = {
  value: {
    label: "Count",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

/* =========================================================
   HELPERS
========================================================= */

function formatUGX(value: number | string | null | undefined) {
  const amount =
    typeof value === "string"
      ? Number.parseFloat(value)
      : Number(value ?? 0);

  if (!Number.isFinite(amount)) {
    return "UGX 0";
  }

  return `UGX ${amount.toLocaleString("en-UG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

/* =========================================================
   SKELETONS
========================================================= */

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-7 w-32 rounded-md bg-muted" />
        <div className="h-4 w-64 rounded-md bg-muted" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="space-y-3">
              <div className="h-4 w-28 rounded bg-muted" />
              <div className="h-8 w-24 rounded bg-muted" />
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader className="space-y-2">
            <div className="h-5 w-40 rounded bg-muted" />
            <div className="h-4 w-56 rounded bg-muted" />
          </CardHeader>

          <CardContent>
            <div className="h-[220px] rounded-lg bg-muted" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-2">
            <div className="h-5 w-32 rounded bg-muted" />
            <div className="h-4 w-40 rounded bg-muted" />
          </CardHeader>

          <CardContent>
            <div className="mx-auto h-[180px] w-[180px] rounded-full bg-muted" />
          </CardContent>
        </Card>
      </div>

      {/* Radar + Products */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="space-y-2">
            <div className="h-5 w-32 rounded bg-muted" />
            <div className="h-4 w-52 rounded bg-muted" />
          </CardHeader>

          <CardContent>
            <div className="h-[220px] rounded-lg bg-muted" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-2">
            <div className="h-5 w-32 rounded bg-muted" />
            <div className="h-4 w-52 rounded bg-muted" />
          </CardHeader>

          <CardContent className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between"
              >
                <div className="space-y-2">
                  <div className="h-4 w-28 rounded bg-muted" />
                  <div className="h-3 w-20 rounded bg-muted" />
                </div>

                <div className="h-4 w-24 rounded bg-muted" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Clients */}
      <Card>
        <CardHeader className="space-y-2">
          <div className="h-5 w-32 rounded bg-muted" />
          <div className="h-4 w-52 rounded bg-muted" />
        </CardHeader>

        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between border-b pb-4 last:border-0"
            >
              <div className="space-y-2">
                <div className="h-4 w-32 rounded bg-muted" />
                <div className="h-3 w-24 rounded bg-muted" />
              </div>

              <div className="h-4 w-24 rounded bg-muted" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/* =========================================================
   EMPTY DASHBOARD
========================================================= */

function EmptyDashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome to your dashboard
        </h1>

        <p className="max-w-2xl text-sm text-muted-foreground">
          You don't have any invoices yet. Set up your business by
          adding your clients and products, then create your first
          invoice.
        </p>
      </div>

      {/* Main empty state */}
      <Card className="overflow-hidden border-dashed">
        <CardContent className="flex flex-col items-center justify-center px-6 py-12 text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <FileText className="h-7 w-7" />
          </div>

          <h2 className="text-xl font-semibold">
            Create your first invoice
          </h2>

          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Start by adding the information you need to create
            professional invoices for your customers.
          </p>

          <Link
            href={ROUTES.invoices}
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Create Invoice
          </Link>
        </CardContent>
      </Card>

      {/* Setup steps */}
      <div>
        <div className="mb-4">
          <h2 className="font-semibold">
            Get started
          </h2>

          <p className="text-sm text-muted-foreground">
            Complete these steps before creating your invoice.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Client */}
          <Link href={ROUTES.clients} className="group">
            <Card className="h-full transition-colors group-hover:border-primary">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <UserPlus className="h-5 w-5" />
                </div>

                <CardTitle className="text-base">
                  Add a client
                </CardTitle>

                <CardDescription>
                  Add the customers you invoice regularly.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex items-center text-sm font-medium">
                  Add client
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Product */}
          <Link href={ROUTES.products} className="group">
            <Card className="h-full transition-colors group-hover:border-primary">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <PackagePlus className="h-5 w-5" />
                </div>

                <CardTitle className="text-base">
                  Add a product
                </CardTitle>

                <CardDescription>
                  Add the products or services you sell.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex items-center text-sm font-medium">
                  Add product
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Invoice */}
          <Link href={ROUTES.invoices} className="group">
            <Card className="h-full transition-colors group-hover:border-primary">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <FilePlus2 className="h-5 w-5" />
                </div>

                <CardTitle className="text-base">
                  Create an invoice
                </CardTitle>

                <CardDescription>
                  Select a client and products to create an invoice.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex items-center text-sm font-medium">
                  Create invoice
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

export default function InvoiceDashboard() {
  const [data, setData] = React.useState<DashboardData>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);

        const result = await getDashboardData();

        if (mounted) {
          setData(result);
        }
      } catch (error) {
        console.error("Failed to load dashboard:", error);

        if (mounted) {
          setError(true);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  /* Loading */
  if (loading) {
    return <DashboardSkeleton />;
  }

  /* Error */
  if (error || !data) {
    return (
      <Card>
        <CardContent className="flex min-h-[300px] flex-col items-center justify-center text-center">
          <FileText className="mb-4 h-10 w-10 text-muted-foreground" />

          <h2 className="font-semibold">
            Unable to load dashboard
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Something went wrong while loading your dashboard.
          </p>
        </CardContent>
      </Card>
    );
  }

  /*
   * This should be based on the database.
   *
   * Once there are no invoices, show onboarding instead
   * of empty charts and tables.
   */
  if (data.totalInvoices === 0) {
    return <EmptyDashboard />;
  }

  /* =========================================================
     CHART DATA
  ========================================================= */

  const pieData = Object.entries(data.statusBreakdown)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({
      name: STATUS_LABELS[key] ?? key,
      value,
      key,
    }));

  const radarData = Object.entries(data.statusBreakdown).map(
    ([key, value]) => ({
      status: STATUS_LABELS[key] ?? key,
      value,
    }),
  );

  const collectionRate =
    data.totalRevenue > 0
      ? ((data.paidRevenue / data.totalRevenue) * 100).toFixed(1)
      : "0";

  return (
    <div className="space-y-6">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Dashboard
        </h1>

        <p className="text-sm text-muted-foreground">
          Overview of your business performance
        </p>
      </div>

      {/* =====================================================
          STAT CARDS
      ===================================================== */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Total Invoices
            </CardDescription>

            <CardTitle className="text-3xl">
              {data.totalInvoices}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Revenue
            </CardDescription>

            <CardTitle className="text-2xl md:text-3xl">
              {formatUGX(data.totalRevenue)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Collected
            </CardDescription>

            <CardTitle className="text-2xl md:text-3xl">
              {formatUGX(data.paidRevenue)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Collection Rate
            </CardDescription>

            <CardTitle className="text-3xl">
              {collectionRate}%
            </CardTitle>
          </CardHeader>
        </Card>

      </div>

      {/* =====================================================
          REVENUE + STATUS
      ===================================================== */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        {/* Revenue */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>

            <CardDescription>
              Monthly revenue from your invoices
            </CardDescription>
          </CardHeader>

          <CardContent>
            <ChartContainer
              config={revenueConfig}
              className="h-[220px] w-full"
            >
              <AreaChart data={data.revenueChart}>
                <defs>
                  <linearGradient
                    id="fillRevenue"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--primary)"
                      stopOpacity={0.2}
                    />

                    <stop
                      offset="95%"
                      stopColor="var(--primary)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid vertical={false} />

                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) =>
                    `UGX ${Number(value).toLocaleString("en-UG")}`
                  }
                />

                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) =>
                        formatUGX(Number(value))
                      }
                    />
                  }
                />

                <Area
                  dataKey="revenue"
                  type="natural"
                  fill="url(#fillRevenue)"
                  stroke="var(--primary)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Status</CardTitle>

            <CardDescription>
              Breakdown by status
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col items-center">
            {pieData.length === 0 ? (
              <div className="flex h-[180px] items-center justify-center text-sm text-muted-foreground">
                No status data available.
              </div>
            ) : (
              <>
                <ResponsiveContainer
                  width="100%"
                  height={180}
                >
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      paddingAngle={3}
                    >
                      {pieData.map((entry) => (
                        <Cell
                          key={entry.key}
                          fill={
                            STATUS_COLORS[entry.key] ??
                            "var(--primary)"
                          }
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      formatter={(value, name) => [
                        `${value}`,
                        name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  {pieData.map((entry) => (
                    <div
                      key={entry.key}
                      className="flex items-center gap-1 text-xs"
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{
                          background:
                            STATUS_COLORS[entry.key],
                        }}
                      />

                      {entry.name} ({entry.value})
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

      </div>

      {/* =====================================================
          RADAR + PRODUCTS
      ===================================================== */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

        {/* Radar */}
        <Card>
          <CardHeader>
            <CardTitle>Status Radar</CardTitle>

            <CardDescription>
              Invoice distribution across statuses
            </CardDescription>
          </CardHeader>

          <CardContent>
            <ChartContainer
              config={radarConfig}
              className="h-[220px] w-full"
            >
              <RadarChart data={radarData}>
                <PolarGrid />

                <PolarAngleAxis
                  dataKey="status"
                  className="text-xs"
                />

                <Radar
                  dataKey="value"
                  stroke="var(--primary)"
                  fill="var(--primary)"
                  fillOpacity={0.15}
                />

                <ChartTooltip
                  content={<ChartTooltipContent />}
                />
              </RadarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Top Products
            </CardTitle>

            <CardDescription>
              Most used products in invoices
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>

                  <TableHead className="text-center">
                    Used
                  </TableHead>

                  <TableHead className="text-right">
                    Revenue
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {data.topProducts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No products yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.topProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">
                            {product.name}
                          </p>

                          {product.description && (
                            <p className="max-w-[140px] truncate text-xs text-muted-foreground">
                              {product.description}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-center text-sm">
                        {product.timesUsed}x
                      </TableCell>

                      <TableCell className="text-right text-sm font-medium">
                        {formatUGX(product.totalRevenue)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </div>

      {/* =====================================================
          TOP CLIENTS
      ===================================================== */}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Top Clients
          </CardTitle>

          <CardDescription>
            Clients ranked by total invoices
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>

                <TableHead>Contact</TableHead>

                <TableHead className="text-center">
                  Invoices
                </TableHead>

                <TableHead className="text-right">
                  Total Billed
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.topClients.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No clients yet.
                  </TableCell>
                </TableRow>
              ) : (
                data.topClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">
                      {client.name}
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground">
                      {client.email ?? client.phone ?? "—"}
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge variant="secondary">
                        {client.invoiceCount}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right font-medium">
                      {formatUGX(client.totalBilled)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

