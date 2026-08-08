"use client";

import * as React from "react";
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
  Legend,
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
} from "lucide-react";
import { getDashboardData } from "@/actions/dashboard";
import { format } from "date-fns";

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

const STATUS_COLORS: Record<string, string> = {
  paid: "var(--chart-1)",
  pending: "var(--chart-2)",
  draft: "var(--chart-3)",
  sent: "var(--chart-4)",
  cancled: "var(--chart-5)",
};

const STATUS_LABELS: Record<string, string> = {
  paid: "Paid",
  pending: "Pending",
  draft: "Draft",
  sent: "Sent",
  cancled: "Cancelled",
};

const revenueConfig = {
  revenue: { label: "Revenue ($)", color: "var(--primary)" },
} satisfies ChartConfig;

const radarConfig = {
  value: { label: "Count", color: "var(--primary)" },
} satisfies ChartConfig;

export default function InvoiceDashboard() {
  const [data, setData] = React.useState<DashboardData>(null);

  React.useEffect(() => {
    getDashboardData().then(setData);
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Loading dashboard...
      </div>
    );
  }

  const pieData = Object.entries(data.statusBreakdown)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({ name: STATUS_LABELS[key] ?? key, value, key }));

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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your business performance
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> Total Invoices
            </CardDescription>
            <CardTitle className="text-3xl">{data.totalInvoices}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" /> Total Revenue
            </CardDescription>
            <CardTitle className="text-3xl">
              ${data.totalRevenue.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Collected
            </CardDescription>
            <CardTitle className="text-3xl">
              ${data.paidRevenue.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" /> Collection Rate
            </CardDescription>
            <CardTitle className="text-3xl">{collectionRate}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Area Chart - Revenue Over Time */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
            <CardDescription>Monthly revenue from all invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueConfig} className="h-[220px] w-full">
              <AreaChart data={data.revenueChart}>
                <defs>
                  <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--primary)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--primary)"
                      stopOpacity={0.05}
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
                  tickFormatter={(v) => `$${v}`}
                />
                <ChartTooltip
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Area
                  dataKey="revenue"
                  type="natural"
                  fill="url(#fillRevenue)"
                  stroke="var(--primary)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Pie Chart - Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Status</CardTitle>
            <CardDescription>Breakdown by status</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={180}>
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
                      fill={STATUS_COLORS[entry.key] ?? "#888"}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(v, name) => [`${v}`, name]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {pieData.map((entry) => (
                <div
                  key={entry.key}
                  className="flex items-center gap-1 text-xs"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: STATUS_COLORS[entry.key] }}
                  />
                  {entry.name} ({entry.value})
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Status Radar</CardTitle>
            <CardDescription>
              Invoice distribution across statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={radarConfig} className="h-[220px] w-full">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="status" className="text-xs" />
                <Radar
                  dataKey="value"
                  stroke="var(--primary)"
                  fill="var(--primary)"
                  fillOpacity={0.3}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
              </RadarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-4 w-4" /> Top Products
            </CardTitle>
            <CardDescription>Most used products in invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-center">Used</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topProducts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-muted-foreground py-6"
                    >
                      No products yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.topProducts.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{p.name}</p>
                          {p.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                              {p.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {p.timesUsed}x
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        ${parseFloat(p.totalRevenue).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Top Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Top Clients
          </CardTitle>
          <CardDescription>Clients ranked by total invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-center">Invoices</TableHead>
                <TableHead className="text-right">Total Billed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.topClients.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground py-6"
                  >
                    No clients yet.
                  </TableCell>
                </TableRow>
              ) : (
                data.topClients.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c.email ?? c.phone}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{c.invoiceCount}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${parseFloat(c.totalBilled).toFixed(2)}
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
