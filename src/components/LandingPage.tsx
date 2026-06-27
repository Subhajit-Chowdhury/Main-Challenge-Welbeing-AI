import React from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  Layers, 
  Cpu, 
  Smartphone, 
  ShieldCheck, 
  ArrowRight, 
  Github, 
  Code2, 
  Database, 
  WifiOff, 
  CheckCircle2, 
  Gauge
} from 'lucide-react';
import { Button } from '../../components/ui/button';

interface LandingPageProps {
  onEnterWorkspace: () => void;
}

export function LandingPage({ onEnterWorkspace }: LandingPageProps) {
  // Decorative feature list for Bento grid
  const features = [
    {
      icon: <Layers className="h-6 w-6 text-blue-400" />,
      title: "Clean Architecture",
      description: "Strict layer separation dividing core business rules, database access, state contexts, and presentation layers."
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-emerald-400" />,
      title: "Data Sandboxing",
      description: "Every student's data is fully isolated at the storage level, guaranteeing zero cross-contamination of workspace states."
    },
    {
      icon: <Smartphone className="h-6 w-6 text-indigo-400" />,
      title: "Installable PWA",
      description: "Equipped with service workers and an asset manifest. Install it directly onto your desktop or mobile device."
    },
    {
      icon: <WifiOff className="h-6 w-6 text-amber-400" />,
      title: "Offline Resiliency",
      description: "Local caching mechanisms allow you to edit notes, view modules, and check statistics even with no network connection."
    },
    {
      icon: <Cpu className="h-6 w-6 text-purple-400" />,
      title: "State Persistence",
      description: "Robust local-first persistence synced dynamically with standard cloud backends for durable study records."
    },
    {
      icon: <Gauge className="h-6 w-6 text-pink-400" />,
      title: "Blazing Performance",
      description: "Optimized Vite bundles combined with React state isolation for fluid, layout-shift-free interactions."
    }
  ];

  return (
    <div id="landing-page-container" className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30 selection:text-white relative overflow-hidden">
      {/* Dynamic Background Accents */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation Header */}
      <nav className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-4 py-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <Layers className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold font-heading text-white tracking-tight">
              WORKSPACE.IO
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
              <CheckCircle2 className="h-3 w-3" /> PWA Production Ready
            </span>
            <Button
              id="nav-enter-workspace-btn"
              onClick={onEnterWorkspace}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs sm:text-sm py-2 px-4 rounded-lg active:scale-[0.98] transition-all cursor-pointer"
            >
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="space-y-6"
        >
          {/* Tagline */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-xs text-slate-400 font-medium">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            <span>Clean Architecture Study Platform</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl font-bold font-heading text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
            The Ultimate Isolated Workspace <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
              For Structured Modern Learning
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
            Boost your learning efficiency with local-first offline state persistence, secure multi-student database sandboxing, and pristine responsive workspace controllers.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              id="hero-enter-workspace-btn"
              onClick={onEnterWorkspace}
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium px-8 py-6 rounded-xl shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 flex items-center justify-center gap-2 group cursor-pointer"
            >
              Enter Workspace 
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-8 py-3 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 rounded-xl flex items-center justify-center gap-2 transition-all font-medium text-sm cursor-pointer"
            >
              <Github className="h-4 w-4" />
              View on GitHub
            </a>
          </div>
        </motion.div>
      </section>

      {/* Tech Stack Banner */}
      <section className="py-8 bg-slate-900/30 border-y border-slate-900/80 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center items-center gap-8 sm:gap-16 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <span className="flex items-center gap-2"><Code2 className="h-4 w-4 text-blue-500" /> React 19 + TS</span>
          <span className="flex items-center gap-2"><Database className="h-4 w-4 text-indigo-500" /> Supabase DB</span>
          <span className="flex items-center gap-2"><Layers className="h-4 w-4 text-purple-500" /> Tailwind v4</span>
          <span className="flex items-center gap-2"><Smartphone className="h-4 w-4 text-pink-500" /> PWA Certified</span>
        </div>
      </section>

      {/* Features Section (Bento Grid) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-3">
          <h2 className="text-3xl font-bold font-heading text-white tracking-tight">
            Engineered For Absolute Precision
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto text-sm sm:text-base">
            Every layer is crafted with modularity and clean architectural guidelines in mind.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className="p-6 bg-slate-900/40 border border-slate-900 hover:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl inline-block">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold font-heading text-white tracking-tight">{feat.title}</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{feat.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bottom Call to Action Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto mb-16">
        <div className="p-8 sm:p-12 bg-gradient-to-br from-blue-900/20 to-indigo-950/20 border border-blue-500/10 rounded-3xl text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          <h3 className="text-2xl sm:text-3xl font-bold font-heading text-white tracking-tight mb-3">
            Ready to experience clean architecture first-hand?
          </h3>
          <p className="text-slate-400 max-w-xl mx-auto text-xs sm:text-sm mb-6 leading-relaxed">
            Deploy notes, test real-time PWA install mechanisms, and inspect state caching directly in your browser.
          </p>
          <Button
            id="bottom-cta-workspace-btn"
            onClick={onEnterWorkspace}
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-6 rounded-lg active:scale-[0.98] transition-all cursor-pointer"
          >
            Enter Workspace Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 px-4 text-center text-xs text-slate-500">
        <p>© 2026 Workspace.io. All rights reserved. Clean Software Engineering Standards.</p>
      </footer>
    </div>
  );
}
