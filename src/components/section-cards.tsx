"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  TrendingUpIcon,
  TrendingDownIcon,
  Users,
  Receipt,
  Wallet,
  Activity,
} from "lucide-react";

import { getSectionCardsData } from "@/actions/dashboard";

/* =========================================================
   TYPES
========================================================= */

type SectionCardsData = Awaited<ReturnType<typeof getSectionCardsData>>;

/* =========================================================
   HELPERS
========================================================= */

function formatUGX(value: number) {
  return `UGX ${value.toLocaleString("en-UG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function formatPercentage(value: number) {
  if (!Number.isFinite(value)) {
    return "0%";
  }

  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

/* =========================================================
   SKELETON
========================================================= */

function CardSkeleton() {
  return (
    <Card className="@container/card">
      <CardHeader>
        <div className="h-4 w-28 animate-pulse rounded bg-muted" />

        <div className="mt-2 h-9 w-36 animate-pulse rounded bg-muted" />

        <CardAction>
          <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
        </CardAction>
      </CardHeader>

      <CardFooter className="flex-col items-start gap-2">
        <div className="h-4 w-48 animate-pulse rounded bg-muted" />

        <div className="h-3 w-56 animate-pulse rounded bg-muted" />
      </CardFooter>
    </Card>
  );
}

/* =========================================================
   EMPTY / ERROR
========================================================= */

function CardsError() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="@container/card">
          <CardHeader>
            <CardDescription>Dashboard data</CardDescription>

            <CardTitle className="text-xl">—</CardTitle>
          </CardHeader>

          <CardFooter>
            <p className="text-sm text-muted-foreground">
              Unable to load data.
            </p>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export function SectionCards() {
  const [data, setData] = React.useState<SectionCardsData>(null);

  const [loading, setLoading] = React.useState(true);

  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;

    async function loadCards() {
      try {
        setLoading(true);

        const result = await getSectionCardsData();

        if (mounted) {
          setData(result);
        }
      } catch (error) {
        console.error("Failed to load dashboard cards:", error);

        if (mounted) {
          setError(true);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadCards();

    return () => {
      mounted = false;
    };
  }, []);

  /* Loading */
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    );
  }

  /* Error */
  if (error || !data) {
    return <CardsError />;
  }

  const revenueUp = data.revenueGrowth >= 0;

  const customersUp = data.customerGrowth >= 0;

  const invoicesUp = data.invoiceGrowth >= 0;

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {/* =====================================================
          TOTAL REVENUE
      ===================================================== */}

      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <Wallet className="size-4" />
            Total Revenue
          </CardDescription>

          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatUGX(data.totalRevenue)}
          </CardTitle>

          <CardAction>
            <Badge variant="outline">
              {revenueUp ? <TrendingUpIcon /> : <TrendingDownIcon />}

              {formatPercentage(data.revenueGrowth)}
            </Badge>
          </CardAction>
        </CardHeader>

        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {revenueUp
              ? "Revenue is growing this month"
              : "Revenue is down this month"}

            {revenueUp ? (
              <TrendingUpIcon className="size-4" />
            ) : (
              <TrendingDownIcon className="size-4" />
            )}
          </div>

          <div className="text-muted-foreground">
            Compared with the previous month
          </div>
        </CardFooter>
      </Card>

      {/* =====================================================
          NEW CUSTOMERS
      ===================================================== */}

      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <Users className="size-4" />
            New Customers
          </CardDescription>

          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data.newCustomers.toLocaleString("en-UG")}
          </CardTitle>

          <CardAction>
            <Badge variant="outline">
              {customersUp ? <TrendingUpIcon /> : <TrendingDownIcon />}

              {formatPercentage(data.customerGrowth)}
            </Badge>
          </CardAction>
        </CardHeader>

        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {customersUp
              ? "Customer growth is increasing"
              : "Customer growth has slowed"}

            {customersUp ? (
              <TrendingUpIcon className="size-4" />
            ) : (
              <TrendingDownIcon className="size-4" />
            )}
          </div>

          <div className="text-muted-foreground">
            {data.totalCustomers.toLocaleString("en-UG")} total customers
          </div>
        </CardFooter>
      </Card>

      {/* =====================================================
          ACTIVE ACCOUNTS
      ===================================================== */}

      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <Activity className="size-4" />
            Active Accounts
          </CardDescription>

          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data.activeAccounts.toLocaleString("en-UG")}
          </CardTitle>

          <CardAction>
            <Badge variant="outline">
              {data.activeAccountRate >= 0 ? (
                <TrendingUpIcon />
              ) : (
                <TrendingDownIcon />
              )}

              {formatPercentage(data.activeAccountRate)}
            </Badge>
          </CardAction>
        </CardHeader>

        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {data.activeAccounts === 0
              ? "No active customers yet"
              : `${data.activeAccounts.toLocaleString(
                  "en-UG",
                )} active customers`}
          </div>

          <div className="text-muted-foreground">
            Customers with invoice activity
          </div>
        </CardFooter>
      </Card>

      {/* =====================================================
          INVOICE GROWTH
      ===================================================== */}

      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <Receipt className="size-4" />
            Invoice Growth
          </CardDescription>

          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatPercentage(data.invoiceGrowth)}
          </CardTitle>

          <CardAction>
            <Badge variant="outline">
              {invoicesUp ? <TrendingUpIcon /> : <TrendingDownIcon />}

              {formatPercentage(data.invoiceGrowth)}
            </Badge>
          </CardAction>
        </CardHeader>

        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {invoicesUp
              ? "More invoices this month"
              : "Fewer invoices this month"}

            {invoicesUp ? (
              <TrendingUpIcon className="size-4" />
            ) : (
              <TrendingDownIcon className="size-4" />
            )}
          </div>

          <div className="text-muted-foreground">
            {data.totalInvoices.toLocaleString("en-UG")} invoices in total
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
