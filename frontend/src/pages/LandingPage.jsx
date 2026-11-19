import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '../components/ThemeToggle';
import InteractiveAiSandbox from '../components/InteractiveAiSandbox';
import InteractiveRolePreview from '../components/InteractiveRolePreview';
import InteractiveArchitectureFlow from '../components/InteractiveArchitectureFlow';
import { 
  Sparkles, 
  Bot, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Cpu, 
  Layers, 
  ChevronRight,
  Database,
  Terminal,
  Activity,
  Plus,
  Minus,
  MessageSquare,
  Shield,
  HelpCircle,
  Clock,
  UserCheck
} from 'lucide-react';

const FAQS = [
  {
    q: 'How does IntelliDesk ensure the AI does not hallucinate technical commands?',
    a: 'Every answer is strictly grounded through a retrieval-augmented generation (RAG) pipeline against enterprise SOP documents indexed in PostgreSQL using pgvector with HNSW indexing. If cosine similarity falls below 0.82, the system automatically triggers an escalation ticket rather than guessing.',
  },
  {
    q: 'Can employees run automated diagnostics directly from the chat?',
    a: 'Yes. The system delivers structured diagnostic action steps. Verified troubleshooting scripts can be tested safely, and when a step resolves the issue, the session automatically marks the incident as self-resolved with zero IT engineer overhead.',
  },
  {
    q: 'How does automatic ticket escalation work when troubleshooting fails?',
    a: 'If a self-service diagnostic step fails or physical hardware intervention is required, IntelliDesk compiles a full AI diagnostic transcript, classifies the category and urgency, calculates SLA targets, and generates a structured ticket directly routed to the right support engineer queue.',
  },
  {
    q: 'What backend architecture powers the vector search and data isolation?',
    a: 'IntelliDesk runs on Java 21 LTS with Spring Boot 3.3.5 and Spring AI. Embeddings are stored natively in PostgreSQL 16 with pgvector and an HNSW cosine distance index. Relational integrity is enforced across 15 ACID tables with role-based access control (RBAC).',
  },
];

export default function LandingPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070b14] text-slate-900 dark:text-white overflow-x-hidden relative flex flex-col transition-colors duration-300 font-sans selection:bg-cyan-500 selection:text-white">
      {/* Dynamic Background Glowing Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[700px] pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[140px] animate-blob" />
        <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[140px] animate-blob animation-delay-2000" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none -z-10" />

      {/* Sticky Top Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-white/80 dark:bg-[#070b14]/85 border-b border-slate-200/80 dark:border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ scale: 1.08, rotate: 6 }}
              className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-brand-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25"
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Intelli<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-brand-400 to-violet-400">Desk</span>
              </span>
              <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-500/30">
                AI • ITSM
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-cyan-500 via-brand-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 rounded-xl shadow-md shadow-cyan-500/25 transition-all hover:-translate-y-0.5"
            >
              Open Console <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 space-y-24">
        {/* Hero Section */}
        <section className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center"
          >
            {/* Pill Badge */}
            <motion.div variants={itemVariants} className="mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 border border-cyan-500/30 shadow-sm backdrop-blur-md text-xs font-bold text-slate-800 dark:text-slate-200">
                <span className="flex h-2 w-2 rounded-full bg-cyan-500 animate-ping" />
                <span className="text-cyan-600 dark:text-cyan-400 font-extrabold">IntelliDesk 2.0</span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span>Self-Healing Enterprise IT Troubleshooting</span>
              </div>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.08] max-w-5xl"
            >
              Autonomous IT Support & <br />
              <span className="bg-gradient-to-r from-cyan-400 via-brand-400 to-violet-400 bg-clip-text text-transparent">
                Intelligent Incident Resolution
              </span>
            </motion.h1>

            {/* Sub-Headline */}
            <motion.p
              variants={itemVariants}
              className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed font-medium"
            >
              Resolve 50% of employee technical problems in real-time using conversational RAG grounded in company SOPs. Automatically convert unresolved issues into prioritized, contextual tickets.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="mt-10 flex flex-wrap items-center justify-center gap-4"
            >
              <Link
                to="/login"
                className="inline-flex items-center gap-2.5 px-8 py-3.5 text-base font-bold text-white bg-gradient-to-r from-cyan-500 via-brand-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 rounded-2xl shadow-xl shadow-cyan-500/25 transition-all hover:-translate-y-1"
              >
                Launch Live Demo <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-base font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm transition-all hover:-translate-y-0.5"
              >
                Create Account
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Feature 1: The Interactive AI Diagnostics Sandbox */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-black tracking-widest uppercase text-cyan-500">Live Interactive Simulator</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Test Real Technical Incidents In Real-Time
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Click any scenario below to experience grounded vector retrieval, simulated command execution, and automated escalation.
            </p>
          </div>

          <InteractiveAiSandbox />
        </section>

        {/* Live Metrics Showcase Strip */}
        <section className="border-y border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0a0f1d] py-14 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <p className="text-5xl font-black text-cyan-500 tracking-tight">52.4%</p>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tier-1 Deflection Rate</p>
              <p className="text-[11px] text-slate-400">Self-resolved without human tickets</p>
            </div>
            <div className="space-y-1">
              <p className="text-5xl font-black text-brand-500 tracking-tight">&lt; 25ms</p>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Vector Search Latency</p>
              <p className="text-[11px] text-slate-400">pgvector HNSW Cosine indexing</p>
            </div>
            <div className="space-y-1">
              <p className="text-5xl font-black text-violet-500 tracking-tight">15 Tables</p>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">ACID Relational Model</p>
              <p className="text-[11px] text-slate-400">Complete audit trail & RBAC</p>
            </div>
            <div className="space-y-1">
              <p className="text-5xl font-black text-emerald-500 tracking-tight">99.8%</p>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">SLA Adherence</p>
              <p className="text-[11px] text-slate-400">Automated incident escalation</p>
            </div>
          </div>
        </section>

        {/* Feature 2: Interactive Role Switcher Explorer */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-black tracking-widest uppercase text-violet-500">Tailored Workspaces</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              One Unified Platform, Three Tailored Experiences
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Explore how IntelliDesk personalizes the interface for Employees, IT Support Engineers, and Executive Administrators.
            </p>
          </div>

          <InteractiveRolePreview />
        </section>

        {/* Feature 3: Interactive Architecture Pipeline */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-black tracking-widest uppercase text-cyan-500">Under The Hood</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Explore The End-to-End RAG Architecture
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Click any stage in the pipeline to reveal technical specifications, latencies, and underlying components.
            </p>
          </div>

          <InteractiveArchitectureFlow />
        </section>

        {/* FAQ Section */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto pb-12">
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-black tracking-widest uppercase text-cyan-500">Frequently Asked Questions</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Enterprise Grade By Design
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;

              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1322] overflow-hidden transition-all shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 dark:text-white hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 flex-shrink-0">
                      {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-5 pb-5 pt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium border-t border-slate-100 dark:border-slate-800/60">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto pb-20">
          <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-cyan-600 via-brand-600 to-violet-700 text-white text-center relative overflow-hidden shadow-2xl shadow-cyan-500/20">
            <div className="max-w-2xl mx-auto space-y-4 relative z-10">
              <h3 className="text-3xl sm:text-4xl font-black tracking-tight">
                Ready to Experience Next-Gen IT Troubleshooting?
              </h3>
              <p className="text-sm text-cyan-100 font-medium">
                Try the live application right now with pre-seeded demo accounts for Employees, IT Engineers, and Admins.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/login"
                  className="px-8 py-3.5 rounded-2xl bg-white text-slate-900 font-black text-sm hover:bg-slate-50 shadow-xl transition-all hover:scale-105"
                >
                  Sign In with Demo Role
                </Link>
                <Link
                  to="/register"
                  className="px-8 py-3.5 rounded-2xl bg-cyan-900/40 border border-white/30 text-white font-bold text-sm hover:bg-cyan-900/60 transition-all"
                >
                  Create New Account
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070b14] py-8 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-500" />
            <span className="font-bold text-slate-800 dark:text-slate-200">IntelliDesk Enterprise</span>
          </div>
          <p>© 2026 IntelliDesk. Built with Java 21, Spring Boot 3, React 18, and PostgreSQL pgvector.</p>
        </div>
      </footer>
    </div>
  );
}
