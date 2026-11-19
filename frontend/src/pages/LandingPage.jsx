import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ThemeToggle from '../components/ThemeToggle';
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
  Activity
} from 'lucide-react';

export default function LandingPage() {
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
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070b14] text-slate-900 dark:text-white overflow-x-hidden relative flex flex-col transition-colors duration-300 font-sans">
      {/* Background Animated Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 left-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-[128px] animate-blob" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[128px] animate-blob animation-delay-2000" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none -z-10" />

      {/* Navigation Header */}
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

      {/* Hero Section */}
      <main className="flex-1">
        <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
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
              className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1] max-w-5xl"
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

            {/* Live Interactive Mockup Card */}
            <motion.div
              variants={itemVariants}
              className="mt-16 w-full max-w-4xl mx-auto rounded-3xl p-2 bg-gradient-to-b from-cyan-500/20 via-brand-500/10 to-transparent shadow-2xl shadow-cyan-500/10"
            >
              <div className="bg-white dark:bg-[#0d1322] rounded-[22px] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                {/* Window Chrome Header */}
                <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="text-xs font-mono text-slate-400 dark:text-slate-500 ml-2">intellidesk-ai-agent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                      RAG Connected
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-500/30">
                      pgvector Active
                    </span>
                  </div>
                </div>

                {/* Simulated Conversation Feed */}
                <div className="p-6 sm:p-8 space-y-4 text-left font-sans bg-slate-50/40 dark:bg-slate-950/40">
                  {/* User message */}
                  <div className="flex items-start gap-3 justify-end">
                    <div className="bg-gradient-to-r from-cyan-600 to-brand-600 text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-md text-sm shadow-md">
                      <p className="font-medium">My corporate VPN disconnects automatically every 5 minutes while working from home.</p>
                      <span className="text-[10px] text-cyan-200 block text-right mt-1">10:42 AM</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/60 border border-cyan-200 dark:border-cyan-700/60 flex items-center justify-center text-cyan-800 dark:text-cyan-200 font-bold text-xs flex-shrink-0">
                      SN
                    </div>
                  </div>

                  {/* AI response with RAG citation badge */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 via-brand-500 to-violet-600 flex items-center justify-center text-white text-xs shadow-md flex-shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-none p-4 max-w-xl text-sm shadow-sm space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">IntelliDesk AI</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-500/30">
                          SOP-IT-VPN-001 (Section 3.2)
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                        I've analyzed the Palo Alto GlobalProtect SOP. A 5-minute timeout is typically caused by IPsec UDP port throttling on home Wi-Fi. Let's switch to the SSL fallback tunnel:
                      </p>

                      {/* Interactive Step Card */}
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Diagnostic Step 1 of 3</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                            Action Required
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Open GlobalProtect Settings &gt; Troubleshooting &gt; Enable <strong>"Prefer SSL Tunnel over IPsec (TCP Port 443)"</strong>.
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <button className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors">
                            ✓ Worked, Issue Solved!
                          </button>
                          <button className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                            Didn't work, next step
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Live Metrics Showcase Strip */}
        <section className="border-y border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0a0f1d] py-12 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-black text-cyan-500 tracking-tight">52%</p>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">Tier-1 Deflection Rate</p>
            </div>
            <div>
              <p className="text-4xl font-black text-brand-500 tracking-tight">&lt; 250ms</p>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">Vector Search Latency</p>
            </div>
            <div>
              <p className="text-4xl font-black text-violet-500 tracking-tight">15 Tables</p>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">ACID Relational Architecture</p>
            </div>
            <div>
              <p className="text-4xl font-black text-emerald-500 tracking-tight">100%</p>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">Audit Trail Accountability</p>
            </div>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold tracking-widest uppercase text-cyan-500">Enterprise Capabilities</h2>
            <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Designed for modern IT departments and enterprise scale
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-6">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Conversational Self-Service</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">
                Guided multi-turn diagnostic loops ask the right technical questions and verify user configuration before logging tickets.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-6">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">pgvector RAG Pipeline</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">
                Apache Tika extracts manuals, chunks them, and stores vector embeddings directly in PostgreSQL using an HNSW cosine index.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Contextual Escalation</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">
                When an issue requires physical hardware or human privileges, the AI generates a ticket with an AI summary of all attempted steps.
              </p>
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
          <p>© 2026 IntelliDesk. Built with Java 21, Spring Boot 3, React 18, and pgvector.</p>
        </div>
      </footer>
    </div>
  );
}
