import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Bot, 
  ShieldCheck, 
  Zap, 
  CheckCircle, 
  ArrowRight, 
  FileText, 
  Cpu 
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-brand-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Intelli<span className="text-brand-600">Desk</span></span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-8">
            <Sparkles className="w-3.5 h-3.5" /> Next-Gen Enterprise IT Service Management
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            AI-Powered IT Support & <br />
            <span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">
              Intelligent Troubleshooting
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Resolve common technical problems instantly through conversational RAG diagnostics grounded in company SOPs. Automatically escalate unresolved issues into structured, prioritized tickets.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-2xl shadow-lg shadow-brand-600/25 transition-all hover:-translate-y-0.5"
            >
              Launch Platform <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-base font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-2xl shadow-sm transition-all"
            >
              Register Employee Account
            </Link>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center mb-6">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Conversational AI Deflection</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Step-by-step diagnostic loops help employees resolve Wi-Fi, VPN, printer, and Outlook issues before a ticket is ever submitted.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">pgvector RAG Search</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Grounds troubleshooting advice in verified company documentation using cosine vector similarity search directly inside PostgreSQL.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Smart Auto-Escalation</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                When troubleshooting fails, the AI packages diagnostic transcripts into concise summaries with predicted priority and assigned queues.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        IntelliDesk Enterprise Platform • Spring Boot 3 + React 18 + PostgreSQL pgvector
      </footer>
    </div>
  );
}
