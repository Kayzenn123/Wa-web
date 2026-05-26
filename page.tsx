
"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Brain, Zap, Shield, ArrowRight, Play, CheckCircle } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 overflow-hidden">
        {/* Hero Section */}
        <section className="relative flex min-h-[90vh] items-center justify-center pt-20">
          <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent)]" />
          <div className="container relative z-10 px-4 text-center">
            <div className="mx-auto mb-6 flex max-w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary animate-fade-in">
              <Zap className="h-4 w-4 fill-primary" />
              Now in Private Beta
            </div>
            <h1 className="mx-auto mb-6 max-w-4xl text-5xl font-extrabold tracking-tight sm:text-7xl animate-slide-up">
              Orchestrate Your <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">AI Ecosystem</span> with Ease
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl animate-slide-up [animation-delay:200ms]">
              The visual node-based builder for modern developers. Connect models, tools, and platforms to build autonomous workflows in minutes.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-slide-up [animation-delay:400ms]">
              <Link href="/dashboard">
                <Button size="lg" className="h-12 gap-2 px-8 text-base shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)]">
                  Start Building <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="h-12 gap-2 border-border/50 px-8 text-base hover:bg-muted/50">
                <Play className="h-4 w-4 fill-current" /> Watch Demo
              </Button>
            </div>

            {/* Visual Preview */}
            <div className="mt-20 relative mx-auto max-w-5xl rounded-2xl border border-border/50 bg-card/30 p-4 shadow-2xl backdrop-blur-md animate-slide-up [animation-delay:600ms]">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="h-3 w-full rounded bg-muted/20" />
                <div className="h-3 w-full rounded bg-muted/20" />
                <div className="h-3 w-full rounded bg-muted/20" />
              </div>
              <div className="aspect-[16/9] w-full rounded-xl bg-background/50 snap-to-grid flex items-center justify-center overflow-hidden">
                <div className="relative h-full w-full">
                  {/* Mock Nodes */}
                  <div className="absolute top-[20%] left-[10%] w-48 rounded-lg border bg-card p-4 shadow-lg border-primary/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <span className="text-xs font-bold">Input Trigger</span>
                    </div>
                    <div className="h-2 w-full rounded bg-muted/30" />
                  </div>
                  <div className="absolute top-[50%] left-[40%] w-48 rounded-lg border bg-card p-4 shadow-lg border-accent/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-4 w-4 text-accent" />
                      <span className="text-xs font-bold">AI Processor</span>
                    </div>
                    <div className="h-2 w-full rounded bg-muted/30" />
                  </div>
                  <div className="absolute top-[30%] left-[70%] w-48 rounded-lg border bg-card p-4 shadow-lg border-green-500/50">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-xs font-bold">Output Success</span>
                    </div>
                    <div className="h-2 w-full rounded bg-muted/30" />
                  </div>
                  {/* Mock Connections */}
                  <svg className="absolute inset-0 h-full w-full pointer-events-none">
                    <path d="M 180 150 C 250 150, 300 250, 400 250" stroke="hsl(var(--primary))" strokeWidth="2" fill="none" strokeDasharray="5,5" className="animate-pulse" />
                    <path d="M 400 250 C 550 250, 600 180, 700 180" stroke="hsl(var(--accent))" strokeWidth="2" fill="none" strokeDasharray="5,5" className="animate-pulse" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 border-t border-border/50">
          <div className="container px-4">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to automate intelligence</h2>
              <p className="mt-4 text-muted-foreground">Built for power users who demand precision and control.</p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "Visual Node Builder", icon: Zap, desc: "Drag, drop, and connect. No complex YAML needed to design powerful logic flows." },
                { title: "Secure API Vault", icon: Shield, desc: "Your keys are encrypted at rest with AES-256. We never store them in plain text." },
                { title: "Real-time Monitoring", icon: Brain, desc: "Watch your workflows execute live with bioluminescent paths and real-time logs." }
              ].map((f) => (
                <div key={f.title} className="group rounded-2xl border border-border/50 bg-card/50 p-8 hover:bg-card/80 transition-colors">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold">{f.title}</h3>
                  <p className="text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 bg-card/30 py-12">
        <div className="container px-4">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">FlowMind</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2024 FlowMind. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
