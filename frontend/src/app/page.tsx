'use client'
import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, MessageSquare, Shield, Users, Zap, Sparkles, Star, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * KU Pantip – Landing Page (Single-file React Component)
 * -----------------------------------------------------
 * Tech: React + Tailwind + framer-motion + shadcn/ui + lucide-react
 *
 * How to use:
 * - Drop this component into your Next.js app (e.g., app/page.tsx) and export as default.
 * - Replace placeholder images in the <img> tags with your assets.
 * - Update CTA links (href) to your actual routes.
 *
 * KU Colors (adjust if you have a design token setup):
 * - KU Green:   #006F3E
 * - KU Yellow:  #FDB515
 * - Dark Ink:   #132B28
 * - Soft Mint:  #E6F4EC
 * - Light Sand: #FFF7E0
 */

export default function KUPantipLanding() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Theme variables for quick palette tweaks */}
      <style>{`
        :root {
          --ku-green: #006F3E;
          --ku-yellow: #FDB515;
          --ku-ink: #132B28;
          --ku-mint: #E6F4EC;
          --ku-sand: #FFF7E0;
        }
      `}</style>

      <Navbar />
      <Hero />
      <TrustedBy />
      <FeatureShowcase />
      <CommunityPreview />
      <HowItWorks />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}

function Navbar() {
  return (
    <div className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <a href="#" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl grid place-items-center"
                 style={{ background: "var(--ku-green)" }}>
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="font-semibold tracking-tight" style={{ color: "var(--ku-ink)" }}>KU Pantip</div>
          </a>

          <div className="hidden gap-6 md:flex">
            <a className="text-sm hover:text-gray-900 text-gray-600" href="#features">Features</a>
            <a className="text-sm hover:text-gray-900 text-gray-600" href="#communities">Communities</a>
            <a className="text-sm hover:text-gray-900 text-gray-600" href="#faq">FAQ</a>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" className="hidden sm:inline-flex">Sign in</Button>
            <Button className="rounded-2xl px-4"
              style={{ background: "var(--ku-green)", color: "white" }}
              asChild>
              <a href="/auth/register">Get started</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-40" aria-hidden>
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl"
             style={{ background: "var(--ku-mint)" }} />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full blur-3xl"
             style={{ background: "var(--ku-sand)" }} />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-black leading-tight tracking-tight"
              style={{ color: "var(--ku-ink)" }}
            >
              A KU community that moves as fast as your ideas.
            </motion.h1>
            <p className="mt-5 text-gray-600 text-lg">
              KU Pantip is a modern, privacy‑minded Reddit‑style forum for Kasetsart University. Discover communities, spark discussions, and share knowledge—without the clutter.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button className="rounded-2xl px-5 h-11" asChild
                style={{ background: "var(--ku-green)", color: "white" }}>
                <a href="/auth/register" className="flex items-center gap-2">
                  Create account <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button className="rounded-2xl px-5 h-11 border"
                variant="outline" asChild>
                <a href="#features" className="flex items-center gap-2">
                  See features <ChevronRight className="h-4 w-4" />
                </a>
              </Button>
            </div>

            <ul className="mt-6 flex flex-wrap gap-5 text-sm text-gray-600">
              <li className="flex items-center gap-2"><Shield className="h-4 w-4"/>Secure by design</li>
              <li className="flex items-center gap-2"><Zap className="h-4 w-4"/>Fast & responsive</li>
              <li className="flex items-center gap-2"><Users className="h-4 w-4"/>For KU students & staff</li>
            </ul>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            {/* Screenshot / Mockup Placeholder */}
            <div className="aspect-[16/10] rounded-2xl overflow-hidden ring-1 ring-black/5 shadow-xl">
              <img
                src="/screenshots/ku-pantip-feed-placeholder.png"
                alt="KU Pantip feed screenshot"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 hidden md:block">
              <div className="rounded-2xl bg-white shadow-lg ring-1 ring-gray-100 p-4 w-64">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl grid place-items-center"
                       style={{ background: "var(--ku-green)" }}>
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Live Discussions</div>
                    <div className="text-xs text-gray-500">Real‑time threads & replies</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function TrustedBy() {
  return (
    <section className="py-10 border-y bg-white/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-gray-500">Loved by KU students across faculties</p>
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-6 opacity-80">
          {[
            "Engineering", "Science", "Economics", "Humanities", "Agriculture", "Architecture",
          ].map((name) => (
            <div key={name} className="rounded-xl border bg-white py-3 text-center text-xs">
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureShowcase() {
  const cards = [
    {
      icon: <Users className="h-5 w-5" />, title: "Communities (Sub‑KU)",
      desc: "Organize posts by interests—clubs, faculties, courses, research, marketplace, and more.",
    },
    {
      icon: <MessageSquare className="h-5 w-5" />, title: "Threaded Replies",
      desc: "Crystal‑clear conversations with nested comments, mentions, and markdown support.",
    },
    {
      icon: <Shield className="h-5 w-5" />, title: "Moderation Tools",
      desc: "Role‑based mod actions, report queues, and community rules to keep things healthy.",
    },
    {
      icon: <Zap className="h-5 w-5" />, title: "Lightning Fast",
      desc: "Optimized Next.js stack with smart caching and image handling.",
    },
  ];

  return (
    <section id="features" className="py-20 bg-[var(--ku-mint)]/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold" style={{ color: "var(--ku-ink)" }}>Features you’ll actually use</h2>
          <p className="mt-2 text-gray-600">Built for real student life—fast, simple, and inclusive.</p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <Card key={c.title} className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="h-10 w-10 rounded-xl grid place-items-center mb-4"
                     style={{ background: "var(--ku-sand)" }}>
                  <div style={{ color: "var(--ku-ink)" }}>{c.icon}</div>
                </div>
                <div className="font-semibold text-lg" style={{ color: "var(--ku-ink)" }}>{c.title}</div>
                <p className="mt-2 text-sm text-gray-600">{c.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-14 grid lg:grid-cols-2 gap-8 items-center">
          <div className="rounded-2xl overflow-hidden ring-1 ring-black/5 shadow">
            <img src="/screenshots/post-composer-placeholder.png" alt="Post composer"
                 className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="text-2xl font-bold" style={{ color: "var(--ku-ink)" }}>Create posts in seconds</h3>
            <p className="mt-2 text-gray-600">Drag‑drop images, paste links, or write long‑form with markdown. Tag communities and set post flair to reach the right people.</p>
            <ul className="mt-4 space-y-2 text-sm text-gray-600 list-disc list-inside">
              <li>Image & file uploads (MinIO/S3 ready)</li>
              <li>Markdown + code blocks</li>
              <li>Polls & events (optional)</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function CommunityPreview() {
  const items = [
    { name: "r/KU‑Market", desc: "Buy & sell textbooks, gadgets, dorm supplies.", posts: "12.3k" },
    { name: "r/KU‑Courses", desc: "Course reviews, notes, Q&A, and study groups.", posts: "8.1k" },
    { name: "r/KU‑Clubs", desc: "Find your people—sports, tech, culture, arts.", posts: "5.7k" },
  ];

  return (
    <section id="communities" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold" style={{ color: "var(--ku-ink)" }}>Communities that feel alive</h2>
            <p className="mt-2 text-gray-600">Explore trending groups or create your own. Moderation is built‑in.</p>
          </div>
          <Button variant="outline" asChild className="rounded-2xl">
            <a href="/create-community">Create community</a>
          </Button>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {items.map((c) => (
            <Card key={c.name} className="rounded-2xl hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl grid place-items-center"
                         style={{ background: "var(--ku-green)" }}>
                      <Star className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold" style={{ color: "var(--ku-ink)" }}>{c.name}</div>
                      <div className="text-xs text-gray-500">{c.posts} posts</div>
                    </div>
                  </div>
                  <a href="/c/ku-market" className="text-sm text-gray-600 hover:text-gray-900">View</a>
                </div>
                <p className="mt-4 text-sm text-gray-600">{c.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { title: "Sign up", desc: "Create an account with your KU email or any email.", n: 1 },
    { title: "Join communities", desc: "Subscribe to topics you care about.", n: 2 },
    { title: "Post & discuss", desc: "Share ideas, ask questions, and help others.", n: 3 },
  ];

  return (
    <section className="py-20 bg-[var(--ku-sand)]/60">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-extrabold" style={{ color: "var(--ku-ink)" }}>Getting started is simple</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3 text-left">
          {steps.map((s) => (
            <div key={s.n} className="rounded-2xl border bg-white p-6">
              <div className="h-9 w-9 rounded-xl grid place-items-center font-bold text-white"
                   style={{ background: "var(--ku-green)" }}>
                {s.n}
              </div>
              <div className="mt-4 font-semibold" style={{ color: "var(--ku-ink)" }}>{s.title}</div>
              <p className="mt-1 text-sm text-gray-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const faqs = [
    { q: "Is KU Pantip only for KU?", a: "It’s KU‑first. Public guests can read most content; posting may require account verification depending on community rules." },
    { q: "Does it support Thai & English?", a: "Yes. Posts and UI can be bilingual—your communities set their preferences." },
    { q: "Is there mobile support?", a: "Absolutely—responsive UI works great on phones with fast image loading." },
  ];

  return (
    <section id="faq" className="py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-center" style={{ color: "var(--ku-ink)" }}>FAQ</h2>
        <div className="mt-10 space-y-4">
          {faqs.map((f, i) => (
            <details key={i} className="group rounded-2xl border p-5 bg-white">
              <summary className="cursor-pointer list-none font-semibold flex items-center justify-between gap-4">
                <span>{f.q}</span>
                <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-2 text-sm text-gray-600">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-10 text-center shadow-xl ring-1 ring-black/5"
             style={{ background: "linear-gradient(135deg, var(--ku-green), #0b8f55)" }}>
          <h3 className="text-white text-2xl md:text-3xl font-extrabold">Join KU Pantip today</h3>
          <p className="mt-2 text-white/80">Start posting, learn faster, and connect with people who get it.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild className="rounded-2xl px-5 h-11 bg-white text-gray-900 hover:bg-white/90">
              <a href="/auth/register">Create free account</a>
            </Button>
            <Button asChild className="rounded-2xl px-5 h-11 border border-white bg-transparent text-white hover:bg-white/10">
              <a href="/auth/login">Sign in</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-2xl grid place-items-center" style={{ background: "var(--ku-green)" }}>
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="font-semibold" style={{ color: "var(--ku-ink)" }}>KU Pantip</div>
            </div>
            <p className="mt-3 text-sm text-gray-600">A clean, fast, and friendly forum for KU.</p>
          </div>

          <div>
            <div className="font-semibold mb-3">Product</div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a className="hover:text-gray-900" href="#features">Features</a></li>
              <li><a className="hover:text-gray-900" href="#communities">Communities</a></li>
              <li><a className="hover:text-gray-900" href="#faq">FAQ</a></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold mb-3">Company</div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a className="hover:text-gray-900" href="/about">About</a></li>
              <li><a className="hover:text-gray-900" href="/contact">Contact</a></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold mb-3">Legal</div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a className="hover:text-gray-900" href="/terms">Terms</a></li>
              <li><a className="hover:text-gray-900" href="/privacy">Privacy</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t pt-6 text-xs text-gray-500">
          <div>© {new Date().getFullYear()} KU Pantip. All rights reserved.</div>
          <div className="flex items-center gap-3">
            <span>Made for Kasetsart University</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
