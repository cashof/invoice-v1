import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Package,
  Users,
  BarChart3,
  Download,
  Zap,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

// NOTE: I don't know your actual auth routes, so CTAs below point at
// /login for everything (sign up + sign in). If you have a separate
// /signup, swap the primary CTA hrefs to that.

const APP_NAME = "Invoice Hub"; // swap for your actual app name

const FEATURES = [
  {
    icon: FileText,
    title: "Professional invoices",
    description:
      "Build clean, itemized invoices in seconds and share them as polished, client-ready PDFs.",
  },
  {
    icon: Package,
    title: "Product catalog",
    description:
      "Set up the products and services you bill for once, then reuse them on every invoice.",
  },
  {
    icon: Users,
    title: "Client records",
    description:
      "Keep client contact info in one place so you're never retyping it invoice after invoice.",
  },
  {
    icon: Zap,
    title: "Status tracking",
    description:
      "Mark invoices draft, sent, pending, or paid, and see exactly what's outstanding at a glance.",
  },
  {
    icon: Download,
    title: "One-click PDF export",
    description:
      "Download a shareable PDF of any invoice, ready to email or print, no formatting required.",
  },
  {
    icon: BarChart3,
    title: "Revenue dashboard",
    description:
      "Track total revenue, what's been collected, and your best clients and products over time.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Add your products & clients",
    description: "Set up what you sell and who you sell it to, just once.",
  },
  {
    step: "02",
    title: "Create & send an invoice",
    description:
      "Pick a client, add line items, set a due date — done in under a minute.",
  },
  {
    step: "03",
    title: "Track it to paid",
    description:
      "Update status as it moves along, and watch your dashboard fill in.",
  },
];

export default function Home() {
  return (
    <div className="min-h-full bg-zinc-50 dark:bg-black">
      {/* Nav */}
      <header className="border-b bg-white/80 dark:bg-black/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-8 h-16 flex items-center justify-between">
          <span className="font-bold text-lg">{APP_NAME}</span>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-foreground">
              How it works
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 sm:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="max-w-2xl">
          <Badge variant="outline" className="mb-4 text-xs font-medium">
            Simple invoicing for small businesses
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-black dark:text-zinc-50 leading-tight">
            Invoicing, without the busywork.
          </h1>
          <p className="mt-5 text-lg leading-8 text-zinc-600 dark:text-zinc-400 max-w-xl">
            Set up your products and clients once, then turn them into polished
            invoices in a couple of clicks — with PDFs your clients can actually
            open and pay from.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto">
                Get started free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                See how it works
              </Button>
            </a>
          </div>
          <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4" />
            No credit card required
          </div>
        </div>

        {/* Illustrative preview card */}
        <Card className="mt-14 max-w-2xl shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Invoice</p>
                <p className="font-semibold">#INV-0042</p>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-transparent">
                Paid
              </Badge>
            </div>
            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Website design package
                </span>
                <span>$1,200.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Logo & brand kit</span>
                <span>$450.00</span>
              </div>
            </div>
            <div className="flex justify-between font-semibold border-t pt-3">
              <span>Total</span>
              <span>$1,650.00</span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Features */}
      <section id="features" className="border-t bg-white dark:bg-zinc-950/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-8 py-16 sm:py-20">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Everything you need to get paid
          </h2>
          <p className="mt-2 text-muted-foreground max-w-lg">
            No bloated accounting suite. Just the pieces that matter for billing
            clients and staying on top of what's owed.
          </p>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <Card key={f.title}>
                <CardContent className="p-5 space-y-2">
                  <f.icon className="h-5 w-5 text-foreground" />
                  <h3 className="font-semibold text-sm">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {f.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="mx-auto max-w-6xl px-4 sm:px-8 py-16 sm:py-20"
      >
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Up and running in minutes
        </h2>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
          {STEPS.map((s) => (
            <div key={s.step}>
              <span className="text-sm font-mono text-muted-foreground">
                {s.step}
              </span>
              <h3 className="font-semibold mt-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="border-t bg-white dark:bg-zinc-950/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-8 py-16 sm:py-20 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Ready to send your first invoice?
          </h2>
          <p className="mt-2 text-muted-foreground">
            It's free to start, and takes less time than writing one by hand.
          </p>
          <Link href="/login">
            <Button size="lg" className="mt-6">
              Get started free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </span>
          <div className="flex items-center gap-4">
            <a href="#features" className="hover:text-foreground">
              Features
            </a>
            <Link href="/login" className="hover:text-foreground">
              Log in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
