import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Terminal, 
  Shield, 
  Cpu, 
  Database, 
  FileText, 
  CheckCircle2, 
  ArrowRight,
  Layers,
  Sparkles,
  Zap
} from 'lucide-react';

const NODES = [
  {
    id: 'query',
    step: '01',
    name: 'Multi-Turn Prompt',
    tech: 'React 18 + WebSocket',
    desc: 'Employee submits an incident or diagnostic response. Sanitized and validated via Spring Security.',
    specs: 'Payload: < 2KB • Tokenized with tiktoken • Strict rate-limited endpoint',
    icon: Terminal,
    color: 'from-cyan-500 to-blue-600',
    borderColor: 'border-cyan-500/40',
    tagColor: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400',
  },
  {
    id: 'spring',
    step: '02',
    name: 'Spring AI Orchestrator',
    tech: 'Spring Boot 3.3.5',
    desc: 'Binds conversational context, system prompts, role constraints, and dispatches embedding queries.',
    specs: 'ChatClient API • Stateless JWT Session • Asynchronous Virtual Threads (Java 21)',
    icon: Cpu,
    color: 'from-blue-600 to-indigo-600',
    borderColor: 'border-blue-500/40',
    tagColor: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400',
  },
  {
    id: 'pgvector',
    step: '03',
    name: 'pgvector HNSW Search',
    tech: 'PostgreSQL 16 (pgvector)',
    desc: 'Executes cosine distance <=> search over SOP embeddings using an HNSW vector index in < 25ms.',
    specs: 'Table: document_chunks • Vector Dimension: 1536 • Index: HNSW (m=16, ef_construction=64)',
    icon: Database,
    color: 'from-indigo-600 to-violet-600',
    borderColor: 'border-indigo-500/40',
    tagColor: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
  },
  {
    id: 'tika',
    step: '04',
    name: 'SOP Grounding Engine',
    tech: 'Apache Tika 2.9',
    desc: 'Extracts relevant SOP chunks with metadata headers and injects authoritative instructions into context.',
    specs: 'Chunk size: 500 tokens • Overlap: 100 tokens • Zero-hallucination policy',
    icon: FileText,
    color: 'from-violet-600 to-purple-600',
    borderColor: 'border-violet-500/40',
    tagColor: 'bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400',
  },
  {
    id: 'action',
    step: '05',
    name: 'Self-Heal or Escalate',
    tech: 'ITSM Engine + JPA',
    desc: 'Resolves issue autonomously or auto-generates a prioritized ticket with AI diagnostic summary.',
    specs: 'Tables: tickets, ticket_history, audit_logs • SLA Timer starts automatically',
    icon: CheckCircle2,
    color: 'from-purple-600 to-emerald-500',
    borderColor: 'border-emerald-500/40',
    tagColor: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
  },
];

export default function InteractiveArchitectureFlow() {
  const [selectedNodeId, setSelectedNodeId] = useState('pgvector');
  const activeNode = NODES.find((n) => n.id === selectedNodeId) || NODES[2];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Visual Pipeline Nodes */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {NODES.map((node) => {
          const Icon = node.icon;
          const isSelected = selectedNodeId === node.id;

          return (
            <motion.button
              key={node.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedNodeId(node.id)}
              className={`p-4 rounded-3xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? `bg-white dark:bg-[#0d1322] ${node.borderColor} shadow-xl shadow-cyan-500/10 ring-2 ring-cyan-500/30`
                  : 'bg-white/60 dark:bg-[#0d1322]/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-black text-slate-400">{node.step}</span>
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${node.color} text-white flex items-center justify-center shadow-sm`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>
                <h5 className="font-black text-xs text-slate-900 dark:text-white leading-tight">
                  {node.name}
                </h5>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                  {node.tech}
                </p>
              </div>

              {isSelected && (
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1 text-[10px] font-bold text-cyan-500">
                  <span>Selected</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Selected Node Deep-Dive Panel */}
      <motion.div
        key={activeNode.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800 shadow-xl space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${activeNode.color} text-white flex items-center justify-center shadow-md`}>
              <activeNode.icon className="w-5 h-5" />
            </div>
            <div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${activeNode.tagColor}`}>
                Step {activeNode.step} • {activeNode.tech}
              </span>
              <h4 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                {activeNode.name}
              </h4>
            </div>
          </div>
          <span className="text-xs font-mono text-emerald-500 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Live Pipeline Verified
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
          {activeNode.desc}
        </p>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-500" />
            <span>{activeNode.specs}</span>
          </div>
          <span className="text-[10px] text-slate-400">Low-latency enterprise design</span>
        </div>
      </motion.div>
    </div>
  );
}
