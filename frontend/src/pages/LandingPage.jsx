import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Bot, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Cpu, 
  Layers, 
  MessageSquare, 
  Terminal, 
  Activity, 
  Shield, 
  ChevronRight
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
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 overflow-x-hidden relative flex flex-col">
      {/* Background Animated Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 left-1/4 w-96 h-96 bg-brand-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-40 left-1/3 w-96 h-96 bg-cyan-400/15 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none -z-10" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-brand-500/25 group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                Intelli<span className="text-brand-600">Desk</span>
              </span>
              <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                AI • ITSM
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 rounded-xl shadow-md shadow-brand-600/20 hover:shadow-lg hover:shadow-brand-600/30 transition-all hover:-translate-y-0.5"
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
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-brand-200/80 shadow-sm backdrop-blur-md text-xs font-semibold text-slate-800">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-brand-700 font-bold">IntelliDesk 2.0</span>
                <span className="text-slate-300">•</span>
                <span>Self-Healing Enterprise IT Troubleshooting</span>
              </div>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.1] max-w-5xl"
            >
              Autonomous IT Support & <br />
              <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Intelligent Incident Resolution
              </span>
            </motion.h1>

            {/* Sub-Headline */}
            <motion.p
              variants={itemVariants}
              className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl leading-relaxed"
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
                className="inline-flex items-center gap-2.5 px-7 py-3.5 text-base font-bold text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-700 hover:to-indigo-700 rounded-2xl shadow-xl shadow-brand-500/25 hover:shadow-2xl hover:shadow-brand-500/35 transition-all hover:-translate-y-1"
              >
                Launch Live Demo <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-base font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl shadow-sm transition-all hover:-translate-y-0.5"
              >
                Create Account
              </Link>
            </motion.div>

            {/* Live Interactive Mockup Card */}
            <motion.div
              variants={itemVariants}
              className="mt-16 w-full max-w-4xl mx-auto rounded-3xl p-2 bg-gradient-to-b from-brand-500/20 via-slate-200 to-slate-200/40 shadow-2xl shadow-indigo-500/10"
            >
              <div className="bg-white rounded-[22px] border border-slate-200 overflow-hidden shadow-sm">
                {/* Window Chrome Header */}
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="text-xs font-mono text-slate-400 ml-2">intellidesk-ai-copilot.agent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                      RAG Connected
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-50 text-purple-700 border border-purple-200">
                      pgvector Active
                    </span>
                  </div>
                </div>

                {/* Simulated Conversation Feed */}
                <div className="p-6 sm:p-8 space-y-4 text-left font-sans bg-slate-50/30">
                  {/* User message */}
                  <div className="flex items-start gap-3 justify-end">
                    <div className="bg-brand-600 text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-md text-sm shadow-sm">
                      <p className="font-medium">My corporate VPN disconnects automatically every 5 minutes while working from home.</p>
                      <span className="text-[10px] text-brand-200 block text-right mt-1">10:42 AM</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center text-brand-700 font-bold text-xs flex-shrink-0">
                      SN
                    </div>
                  </div>

                  {/* AI response with RAG citation badge */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white text-xs shadow-sm flex-shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 max-w-xl text-sm shadow-sm space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">IntelliDesk AI</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          SOP-IT-VPN-001 (Section 3.2)
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        I've analyzed the Palo Alto GlobalProtect SOP. A 5-minute timeout is typically caused by IPsec UDP port throttling on home Wi-Fi. Let's switch to the SSL fallback tunnel:
                      </p>

                      {/* Interactive Step Card */}
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">Diagnostic Step 1 of 3</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                            Action Required
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">
                          Open GlobalProtect Settings &gt; Troubleshooting &gt; Enable <strong>"Prefer SSL Tunnel over IPsec (TCP Port 443)"</strong>.
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <button className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors">
                            ✓ Worked, Issue Solved!
                          </button>
                          <button className="px-3 py-1 rounded-lg bg-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-300 transition-colors">
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
        <section className="border-y border-slate-200/80 bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-extrabold text-brand-600 tracking-tight">52%</p>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">Tier-1 Deflection Rate</p>
            </div>
            <div>
              <p className="text-4xl font-extrabold text-indigo-600 tracking-tight">&lt; 250ms</p>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">Vector Search Latency</p>
            </div>
            <div>
              <p className="text-4xl font-extrabold text-purple-600 tracking-tight">15 Tables</p>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">ACID Relational Architecture</p>
            </div>
            <div>
              <p className="text-4xl font-extrabold text-emerald-600 tracking-tight">100%</p>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">Audit Trail Accountability</p>
            </div>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold tracking-widest uppercase text-brand-600">Enterprise Capabilities</h2>
            <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Designed for modern IT departments and enterprise scale
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-6">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Conversational Self-Service</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Guided multi-turn diagnostic loops ask the right technical questions and verify user configuration before logging tickets.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">pgvector RAG Pipeline</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Apache Tika extracts manuals, chunks them, and stores vector embeddings directly in PostgreSQL using an HNSW cosine index.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Contextual Escalation</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                When an issue requires physical hardware or human privileges, the AI generates a ticket with an AI summary of all attempted steps.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span className="font-bold text-slate-800">IntelliDesk Enterprise</span>
          </div>
          <p>© 2026 IntelliDesk. Built with Java 21, Spring Boot 3, React 18, and pgvector.</p>
        </div>
      </footer>
    </div>
  );
}
