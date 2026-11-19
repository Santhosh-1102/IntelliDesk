import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  Bot, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Terminal, 
  FileText, 
  Database, 
  Send, 
  RefreshCw, 
  Check, 
  AlertTriangle,
  Zap,
  Shield,
  Clock,
  ChevronRight,
  ExternalLink,
  Code
} from 'lucide-react';

const SCENARIOS = [
  {
    id: 'vpn',
    icon: '🌐',
    label: 'VPN Drop Loop',
    title: 'GlobalProtect VPN disconnects every 5 minutes on home Wi-Fi',
    category: 'Network & Connectivity',
    sopName: 'SOP-NET-014: Palo Alto GlobalProtect Troubleshooting.pdf',
    chunkId: 'chunk_8492',
    cosineSim: 0.948,
    solution: 'A 5-minute disconnect pattern indicates an MTU mismatch or home router IPsec UDP 4500 dropping keepalives. Fall back to SSL encapsulation over TCP 443.',
    steps: [
      {
        num: 1,
        title: 'Force SSL Tunnel Encapsulation',
        command: 'Set-GPConfig -EnforceTunnel "SSL-TCP-443" -AutoReconnect $true',
        output: 'Success: GlobalProtect configured to prefer SSL TCP 443. Keepalive interval reset to 60s.',
      },
      {
        num: 2,
        title: 'Flush DNS & Refresh DHCP Lease',
        command: 'ipconfig /flushdns ; ipconfig /renew',
        output: 'Successfully flushed the DNS Resolver Cache. IP configuration renewed.',
      }
    ],
    escalationSummary: 'User experienced repeated IPsec keepalive dropouts. Applied SOP-NET-014 SSL tunnel override. If issues persist, verify ISP packet throttling.',
  },
  {
    id: 'outlook',
    icon: '📧',
    label: 'Outlook 0x8004010F',
    title: 'Outlook fails to launch: "Cannot open default stores (0x8004010F)"',
    category: 'Application Software',
    sopName: 'SOP-APP-009: Microsoft 365 Outlook Profile Recovery.docx',
    chunkId: 'chunk_3108',
    cosineSim: 0.932,
    solution: 'Error 0x8004010F occurs when the Outlook Offline Address Book (OAB) or cached .ost file database header is locked or desynchronized.',
    steps: [
      {
        num: 1,
        title: 'Rebuild Corrupt Outlook OST Cache',
        command: 'outlook.exe /cleanreminders ; Remove-Item "$env:LOCALAPPDATA\\Microsoft\\Outlook\\*.ost"',
        output: 'Cached data files pruned. Outlook started in safe mode to recreate cached data store.',
      },
      {
        num: 2,
        title: 'Verify Autodiscover DNS Target',
        command: 'Test-NetConnection -ComputerName "autodiscover.office365.com" -Port 443',
        output: 'TcpTestSucceeded : True. Ping latency: 18ms. Autodiscover endpoint reachable.',
      }
    ],
    escalationSummary: 'Corrupt OST profile header cleared according to SOP-APP-009. Autodiscover validated.',
  },
  {
    id: 'docker',
    icon: '🐳',
    label: 'Docker Daemon EACCES',
    title: 'docker: Cannot connect to daemon at npipe:////./pipe/docker_engine (EACCES)',
    category: 'Developer Tools',
    sopName: 'SOP-DEV-022: Windows Docker Desktop WSL2 Integration.pdf',
    chunkId: 'chunk_5521',
    cosineSim: 0.965,
    solution: 'Windows named pipe ACL restriction or Docker config permission issue preventing current non-elevated shell from contacting Docker Desktop engine.',
    steps: [
      {
        num: 1,
        title: 'Grant Security Identifier on Docker Pipe',
        command: 'icacls "$env:USERPROFILE\\.docker\\config.json" /grant "${env:USERNAME}:F"',
        output: 'processed file: C:\\Users\\...\\.docker\\config.json. Successfully processed 1 file.',
      },
      {
        num: 2,
        title: 'Restart Docker Desktop Windows Service',
        command: 'Restart-Service *docker* -ErrorAction SilentlyContinue',
        output: 'Docker Desktop Engine service successfully restarted and listening on named pipe.',
      }
    ],
    escalationSummary: 'Docker Desktop named pipe permission issue resolved via ACL grant from SOP-DEV-022.',
  },
  {
    id: 'bitlocker',
    icon: '🔐',
    label: 'BitLocker Key Recovery',
    title: 'System prompted for 48-digit BitLocker recovery key after UEFI BIOS update',
    category: 'Hardware & Security',
    sopName: 'SOP-SEC-003: Azure AD Intune BitLocker Key Retrieval.pdf',
    chunkId: 'chunk_1204',
    cosineSim: 0.954,
    solution: 'TPM PCR registers invalidated after UEFI firmware update. Recovery key can be self-retrieved directly through Microsoft Entra ID Devices Portal.',
    steps: [
      {
        num: 1,
        title: 'Query Entra ID Device BitLocker Key Vault',
        command: 'Get-MgDeviceRegisteredOwnerKey -DeviceId "INTEL-CORP-LPT-492"',
        output: 'RecoveryKeyID: {98B4-A102-77F1} | 48-Digit Key retrieved securely from Azure AD Intune.',
      }
    ],
    escalationSummary: 'BitLocker recovery key verified and injected post-BIOS update. PCR validation restored.',
  }
];

export default function InteractiveAiSandbox() {
  const [activeScenarioId, setActiveScenarioId] = useState('vpn');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [terminalOutput, setTerminalOutput] = useState('');
  const [isRunningCommand, setIsRunningCommand] = useState(false);
  const [statusState, setStatusState] = useState('IDLE'); // IDLE, RUNNING, SOLVED, ESCALATED
  const [showChunkModal, setShowChunkModal] = useState(false);

  const scenario = SCENARIOS.find((s) => s.id === activeScenarioId) || SCENARIOS[0];

  useEffect(() => {
    // Reset state on scenario change
    setCurrentStepIndex(0);
    setTerminalOutput('');
    setStatusState('IDLE');
  }, [activeScenarioId]);

  const handleRunCommand = () => {
    setIsRunningCommand(true);
    setTerminalOutput('');
    const currentStep = scenario.steps[currentStepIndex];

    setTimeout(() => {
      setTerminalOutput(currentStep.output);
      setIsRunningCommand(false);
    }, 800);
  };

  const handleResolve = () => {
    setStatusState('SOLVED');
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#06b6d4', '#8b5cf6', '#10b981', '#38bdf8'],
    });
  };

  const handleEscalate = () => {
    setStatusState('ESCALATED');
  };

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl bg-white/90 dark:bg-[#0d1322]/90 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xl dark:shadow-cyan-950/20 overflow-hidden font-sans relative">
      {/* Decorative Top Gradient Rim */}
      <div className="h-1.5 bg-gradient-to-r from-cyan-500 via-brand-500 to-violet-600" />

      {/* Top Banner: Scenario Selector */}
      <div className="p-4 sm:p-6 bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              Interactive AI Sandbox
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border border-violet-200/60 dark:border-violet-500/30">
              Live Simulation
            </span>
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
            Test Drive Autonomous IT Diagnostics
          </h3>
        </div>

        {/* Scenario Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-200/60 dark:bg-slate-800/80 p-1.5 rounded-2xl">
          {SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              onClick={() => setActiveScenarioId(sc.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeScenarioId === sc.id
                  ? 'bg-white dark:bg-[#070b14] text-cyan-600 dark:text-cyan-400 shadow-md shadow-cyan-500/10'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{sc.icon}</span>
              <span>{sc.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[440px]">
        {/* Left Column: Simulated Conversation & Vector Retrieval (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-8 space-y-5 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/30 flex flex-col justify-between">
          <div className="space-y-4">
            {/* User Incident Query */}
            <motion.div
              key={`user-${scenario.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 justify-end"
            >
              <div className="bg-gradient-to-r from-cyan-600 to-brand-600 text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-md shadow-md text-sm">
                <p className="font-semibold text-xs leading-relaxed">{scenario.title}</p>
                <div className="flex items-center justify-between text-[10px] text-cyan-200 mt-2 font-mono">
                  <span>Category: {scenario.category}</span>
                  <span>10:48 AM</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-xl bg-cyan-100 dark:bg-cyan-900/60 text-cyan-800 dark:text-cyan-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
                ME
              </div>
            </motion.div>

            {/* AI Vector Match Pill */}
            <motion.div
              key={`vector-${scenario.id}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="p-3 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400 flex items-center justify-center flex-shrink-0">
                  <Database className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-[11px] truncate">{scenario.sopName}</p>
                  <p className="text-[10px] text-slate-400 font-mono">Vector HNSW Match • {scenario.chunkId}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black font-mono bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30">
                  Cosine: {scenario.cosineSim}
                </span>
                <button
                  onClick={() => setShowChunkModal(true)}
                  className="p-1 text-slate-400 hover:text-cyan-500 transition-colors"
                  title="Inspect Chunk"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>

            {/* AI Assistant Grounded Response */}
            <motion.div
              key={`ai-${scenario.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-brand-500 to-violet-600 text-white flex items-center justify-center text-xs shadow-md flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-none p-4 text-xs shadow-sm space-y-2.5 max-w-lg">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-500" /> IntelliDesk RAG Engine
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">● High Confidence</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {scenario.solution}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Interactive Diagnostic Checklist Card */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Automated Diagnostic Step {currentStepIndex + 1} of {scenario.steps.length}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                Interactive Test
              </span>
            </div>

            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {scenario.steps[currentStepIndex].title}
            </p>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={handleRunCommand}
                disabled={isRunningCommand}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>{isRunningCommand ? 'Executing...' : 'Run Diagnostic Command'}</span>
              </button>

              {terminalOutput && statusState === 'IDLE' && (
                <>
                  <button
                    onClick={handleResolve}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Issue Solved!</span>
                  </button>
                  <button
                    onClick={handleEscalate}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
                  >
                    Escalate to Ticket
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Simulated Terminal & Live Escalation State (5 cols) */}
        <div className="lg:col-span-5 p-6 sm:p-8 bg-slate-900 dark:bg-black text-white flex flex-col justify-between">
          <div className="space-y-4">
            {/* Terminal Window Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-mono text-slate-400 ml-1">powershell.exe • agent-cli</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400">Sandbox Active</span>
            </div>

            {/* Script Display */}
            <div className="font-mono text-xs text-slate-300 space-y-2 bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
              <p className="text-slate-500 text-[10px]"># Diagnostic Script</p>
              <p className="text-cyan-300 break-all select-all">
                &gt; {scenario.steps[currentStepIndex].command}
              </p>
            </div>

            {/* Live Output */}
            {terminalOutput ? (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-mono text-[11px] text-emerald-400 bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-500/30 leading-relaxed"
              >
                <div className="flex items-center gap-1.5 text-emerald-300 font-bold mb-1">
                  <Check className="w-3.5 h-3.5" /> Output:
                </div>
                {terminalOutput}
              </motion.div>
            ) : (
              <div className="p-8 text-center text-slate-600 font-mono text-xs">
                Click &quot;Run Diagnostic Command&quot; to test script execution...
              </div>
            )}
          </div>

          {/* Dynamic Resolution Outcome Card */}
          <div className="pt-4 border-t border-slate-800">
            {statusState === 'SOLVED' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border border-emerald-500/50 text-white space-y-2 shadow-lg shadow-emerald-950/50"
              >
                <div className="flex items-center gap-2 text-emerald-400 font-black text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Deflection Success: Zero Human Intervention</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                  Incident autonomously resolved in <strong>14.2s</strong> without creating an IT ticket. Knowledge SOP verified.
                </p>
              </motion.div>
            )}

            {statusState === 'ESCALATED' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-2xl bg-gradient-to-r from-violet-950/80 to-purple-950/80 border border-violet-500/50 text-white space-y-2.5 shadow-lg shadow-violet-950/50"
              >
                <div className="flex items-center justify-between text-violet-300 font-bold text-xs">
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-violet-400" /> Auto-Escalated Ticket #TCK-202611-042
                  </span>
                  <span className="px-2 py-0.5 rounded bg-rose-500/30 text-rose-300 text-[10px]">HIGH</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                  AI Summary: <em>&quot;{scenario.escalationSummary}&quot;</em>
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-violet-500/20">
                  <span>Routing: Tier-2 Network Ops</span>
                  <span>Assigned: Alex Rivera</span>
                </div>
              </motion.div>
            )}

            {statusState === 'IDLE' && (
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" /> Real-time SOP Evaluation
                </span>
                <span className="font-mono text-[10px]">Latency: 182ms</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grounded SOP Chunk Inspection Drawer / Modal */}
      <AnimatePresence>
        {showChunkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowChunkModal(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#0d1322] rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-2xl z-10 space-y-4 text-slate-900 dark:text-white"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-500" />
                  <h4 className="font-black text-sm">Grounded Knowledge Chunk</h4>
                </div>
                <button
                  onClick={() => setShowChunkModal(false)}
                  className="text-xs font-bold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  ✕ Close
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                  <p><strong>Document:</strong> {scenario.sopName}</p>
                  <p><strong>Chunk Index:</strong> {scenario.chunkId}</p>
                  <p><strong>Similarity:</strong> <span className="text-cyan-500 font-bold">{scenario.cosineSim}</span> (HNSW Cosine)</p>
                </div>
                <div className="p-4 rounded-xl bg-cyan-50/50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-500/30 text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                  &quot;...When clients repeatedly disconnect at 5-minute intervals, inspect NAT traversal. Carrier-grade NAT commonly drops un-keepalived UDP state tables. Enforcing SSL fallback via TCP 443 bypasses state table drops...&quot;
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
