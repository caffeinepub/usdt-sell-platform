import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  Clock,
  Globe,
  Lock,
  RefreshCcw,
  ShieldCheck,
  TrendingUp,
  Zap,
} from "lucide-react";
import { type Variants, motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useExchangeRates } from "../hooks/useQueries";

export function HomePage() {
  const { data: rates, isLoading } = useExchangeRates();
  const { identity, login, isLoggingIn } = useInternetIdentity();

  const usdRate = rates?.usdRate ?? 1.0;
  const inrRate = rates?.inrRate ?? 85.0;

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.12 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const steps = [
    {
      step: "01",
      title: "Enter Amount",
      description:
        "Enter the USDT amount you want to sell. See the payout amount instantly.",
      icon: Banknote,
    },
    {
      step: "02",
      title: "Choose Payout",
      description:
        "Select USD or INR payout, and pick your saved bank account.",
      icon: Globe,
    },
    {
      step: "03",
      title: "Get Paid",
      description:
        "Submit your order and receive funds directly to your bank account.",
      icon: CheckCircle2,
    },
  ];

  const features = [
    {
      icon: Zap,
      title: "Instant Conversion",
      description: "Real-time USDT to USD/INR rates with zero hidden fees",
    },
    {
      icon: ShieldCheck,
      title: "Bank-Grade Security",
      description:
        "Your assets secured by Internet Identity and ICP blockchain",
    },
    {
      icon: RefreshCcw,
      title: "Live Rate Updates",
      description:
        "Exchange rates refresh every 30 seconds for accurate pricing",
    },
    {
      icon: Clock,
      title: "Fast Processing",
      description: "Orders processed and funds dispatched within 24 hours",
    },
    {
      icon: Lock,
      title: "Non-Custodial",
      description:
        "We never hold your assets longer than needed for settlement",
    },
    {
      icon: TrendingUp,
      title: "Best Rates",
      description: "Competitive rates with transparent pricing — no surprises",
    },
  ];

  return (
    <main className="mesh-bg min-h-screen">
      {/* Hero */}
      <section className="relative pt-20 pb-24 px-4 overflow-hidden">
        {/* Decorative glow orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-64 h-64 rounded-full bg-chart-2/5 blur-3xl pointer-events-none" />

        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full border border-primary/30 text-primary bg-primary/10 mb-6">
                <TrendingUp className="w-3.5 h-3.5" />
                Live rates • USDT/USD: ${usdRate.toFixed(4)} • USDT/INR: ₹
                {inrRate.toFixed(2)}
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="font-display text-5xl md:text-7xl font-black leading-[1.05] mb-6"
            >
              Sell USDT <span className="text-primary">Instantly</span>
              <br />
              <span className="text-3xl md:text-5xl text-muted-foreground font-bold">
                to Your Bank Account
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Convert your USDT to USD or INR and receive payment directly to
              your bank account. Fast, secure, and transparent — powered by ICP
              blockchain.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              {identity ? (
                <Button
                  asChild
                  size="lg"
                  className="gap-2 text-base px-8 h-14 glow-teal"
                  data-ocid="home.sell_primary_button"
                >
                  <Link to="/sell">
                    Sell USDT Now
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
              ) : (
                <Button
                  onClick={login}
                  disabled={isLoggingIn}
                  size="lg"
                  className="gap-2 text-base px-8 h-14 glow-teal"
                  data-ocid="home.sell_primary_button"
                >
                  {isLoggingIn ? "Connecting..." : "Get Started"}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              )}
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-base px-8 h-14"
              >
                <Link to="/orders">View Orders</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Live Rate Cards */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid md:grid-cols-2 gap-6"
          >
            {/* USD Rate Card */}
            <div className="glass-card rounded-2xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-chart-1/20 flex items-center justify-center">
                    <span className="text-chart-1 font-bold text-lg">$</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">USDT → USD</p>
                    <p className="text-xs text-muted-foreground/60">
                      US Dollar
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-chart-4 bg-chart-4/10 px-2 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-chart-4 animate-pulse inline-block" />
                  Live
                </span>
              </div>
              {isLoading ? (
                <div className="h-10 bg-muted/50 rounded animate-pulse" />
              ) : (
                <p className="mono-num text-4xl font-bold text-foreground">
                  <span className="text-primary">$</span>
                  {usdRate.toFixed(4)}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-2">Per 1 USDT</p>
            </div>

            {/* INR Rate Card */}
            <div className="glass-card rounded-2xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-chart-3/20 flex items-center justify-center">
                    <span className="text-chart-3 font-bold text-lg">₹</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">USDT → INR</p>
                    <p className="text-xs text-muted-foreground/60">
                      Indian Rupee
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-chart-4 bg-chart-4/10 px-2 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-chart-4 animate-pulse inline-block" />
                  Live
                </span>
              </div>
              {isLoading ? (
                <div className="h-10 bg-muted/50 rounded animate-pulse" />
              ) : (
                <p className="mono-num text-4xl font-bold text-foreground">
                  <span className="text-chart-3">₹</span>
                  {inrRate.toFixed(2)}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-2">Per 1 USDT</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-4xl font-bold mb-3">
              How It Works
            </h2>
            <p className="text-muted-foreground">
              Three simple steps to sell your USDT
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="glass-card rounded-2xl p-6 shadow-card relative"
              >
                <span className="absolute top-4 right-4 mono-num text-5xl font-black text-muted/30 select-none">
                  {step.step}
                </span>
                <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mb-4">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-4xl font-bold mb-3">
              Why USDTSell?
            </h2>
            <p className="text-muted-foreground">
              Built for reliability and speed
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="glass-card rounded-xl p-5 shadow-xs flex gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl p-8 md:p-12 text-center relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.14 0.04 185) 0%, oklch(0.12 0.03 245) 100%)",
              border: "1px solid oklch(0.72 0.18 185 / 0.2)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 relative z-10">
              Ready to Sell Your USDT?
            </h2>
            <p className="text-muted-foreground mb-8 relative z-10">
              Join thousands of users who trust USDTSell for fast, secure USDT
              to fiat conversions.
            </p>
            <div className="relative z-10">
              {identity ? (
                <Button
                  asChild
                  size="lg"
                  className="gap-2 px-8 h-12 glow-teal"
                  data-ocid="home.sell_primary_button"
                >
                  <Link to="/sell">
                    Start Selling
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              ) : (
                <Button
                  onClick={login}
                  disabled={isLoggingIn}
                  size="lg"
                  className="gap-2 px-8 h-12 glow-teal"
                  data-ocid="home.sell_primary_button"
                >
                  {isLoggingIn ? "Connecting..." : "Get Started Free"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
