import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { aiService } from '../../services/aiService';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import {
  Bot,
  Sparkles,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Clock,
  Terminal,
  ShieldAlert,
  ChevronRight,
  MessageSquare,
  HelpCircle,
  ExternalLink,
  Layers,
  Wrench,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  X
} from 'lucide-react';

const SUGGESTED_PROMPTS = [
  {
    category: 'Network',
    title: 'VPN Keeps Disconnecting',
    prompt: 'My corporate VPN keeps disconnecting every 10 minutes when working from home. How can I fix this?'
  },
  {
    category: 'Dev Tools',
    title: 'Docker Desktop Engine Error',
    prompt: 'Docker Desktop says "Docker Engine stopped" and fails to start after a reboot.'
  },
  {
    category: 'Access',
    title: 'Git Permission Denied',
    prompt: 'I am getting "Permission denied (publickey)" error when trying to git push to repository.'
  },
  {
    category: 'Software',
    title: 'Outlook Stuck on Loading',
    prompt: 'Microsoft Outlook is stuck on the "Loading Profile" splash screen and will not open.'
  }
];

export default function AiChatAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [sessionStatus, setSessionStatus] = useState('ACTIVE');
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [recentSessions, setRecentSessions] = useState([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);
  const [activeStepFeedback, setActiveStepFeedback] = useState({});

  // Escalation Modal
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
  const [escalatePriority, setEscalatePriority] = useState('MEDIUM');
  const [escalateNotes, setEscalateNotes] = useState('');
  const [isEscalating, setIsEscalating] = useState(false);
  const [escalatedTicketInfo, setEscalatedTicketInfo] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    loadRecentSessions();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadRecentSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const data = await aiService.getUserSessions(0, 15);
      setRecentSessions(data.content || []);
    } catch (err) {
      console.error('Error loading past AI sessions:', err);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handleStartNewChat = () => {
    setSessionId(null);
    setSessionStatus('ACTIVE');
    setMessages([]);
    setEscalatedTicketInfo(null);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleSelectSession = async (selectedSessionId) => {
    if (selectedSessionId === sessionId) return;
    try {
      setIsSending(true);
      const details = await aiService.getSessionDetails(selectedSessionId);
      setSessionId(details.sessionId);
      setSessionStatus(details.status);
      setEscalatedTicketInfo(
        details.escalatedTicketNumber
          ? { ticketNumber: details.escalatedTicketNumber }
          : null
      );

      // Map backend messages into view model
      const allSteps = details.steps || details.diagnosticSteps || [];
      const mapped = (details.messages || []).map((m, idx, arr) => {
        // Only attach all steps to the most recent assistant message to prevent duplicate past cards
        const isLastAssistant =
          m.senderType === 'ASSISTANT' &&
          !arr.slice(idx + 1).some((next) => next.senderType === 'ASSISTANT');
        return {
          id: m.id || Math.random(),
          sender: m.senderType,
          content: m.content,
          timestamp: m.createdAt,
          diagnosticSteps: isLastAssistant ? allSteps : []
        };
      });
      setMessages(mapped);
    } catch (err) {
      console.error('Error loading session details:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isSending) return;

    setInputMessage('');
    const userMessageId = Date.now();
    const newUserMsg = {
      id: userMessageId,
      sender: 'USER',
      content: text,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setIsSending(true);

    try {
      const response = await aiService.sendMessage({
        message: text,
        sessionId: sessionId || undefined
      });

      // Update sessionId if new
      if (response.sessionId) {
        setSessionId(response.sessionId);
      }
      if (response.sessionStatus) {
        setSessionStatus(response.sessionStatus);
      }

      const assistantMsg = {
        id: Date.now() + 1,
        sender: 'ASSISTANT',
        content: response.reply,
        timestamp: new Date().toISOString(),
        diagnosticSteps: response.steps || response.diagnosticSteps || [],
        escalationSuggested: response.escalationSuggested,
        escalationReason: response.escalationReason
      };

      setMessages((prev) => [...prev, assistantMsg]);
      loadRecentSessions(); // Refresh list in sidebar
    } catch (err) {
      console.error('Error sending message to AI:', err);
      const errorMsg = {
        id: Date.now() + 2,
        sender: 'ASSISTANT',
        content:
          '⚠️ Our AI Diagnostic Assistant encountered a temporary connection issue. Please retry in a moment or create an IT ticket directly.',
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleStepFeedback = async (step, worked) => {
    if (!step || !step.id) return;
    const stepKey = step.id;
    setActiveStepFeedback((prev) => ({ ...prev, [stepKey]: 'SUBMITTING' }));

    try {
      const response = await aiService.submitStepFeedback({
        stepId: step.id,
        worked,
        userNotes: worked ? 'Self-resolved successfully' : 'Did not resolve the issue'
      });

      setActiveStepFeedback((prev) => ({
        ...prev,
        [stepKey]: worked ? 'RESOLVED' : 'FAILED'
      }));

      if (worked) {
        setSessionStatus('RESOLVED');
        // Confetti Celebration
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      // Append assistant's confirmation response
      if (response.reply) {
        const confirmMsg = {
          id: Date.now(),
          sender: 'ASSISTANT',
          content: response.reply,
          timestamp: new Date().toISOString(),
          diagnosticSteps: response.steps || response.diagnosticSteps || []
        };
        setMessages((prev) => [...prev, confirmMsg]);
      }
      loadRecentSessions();
    } catch (err) {
      console.error('Error submitting step feedback:', err);
      setActiveStepFeedback((prev) => ({ ...prev, [stepKey]: null }));
    }
  };

  const handleEscalateSession = async () => {
    if (!sessionId || isEscalating) return;
    setIsEscalating(true);

    try {
      const response = await aiService.escalateSession({
        sessionId,
        priority: escalatePriority,
        additionalNotes: escalateNotes.trim()
      });

      setSessionStatus('ESCALATED');
      if (response.ticketNumber) {
        setEscalatedTicketInfo({ ticketNumber: response.ticketNumber });
      }

      if (response.reply) {
        const escalationConfirmation = {
          id: Date.now(),
          sender: 'ASSISTANT',
          content: response.reply,
          timestamp: new Date().toISOString()
        };
        setMessages((prev) => [...prev, escalationConfirmation]);
      }

      setIsEscalateModalOpen(false);
      loadRecentSessions();
    } catch (err) {
      console.error('Error escalating session:', err);
    } finally {
      setIsEscalating(false);
    }
  };

  const copyToClipboard = (text, stepIndex) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(stepIndex);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070b14] flex flex-col font-sans transition-colors duration-300">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Main Desktop Sidebar */}
        <Sidebar />

        {/* Sessions Drawer / Sub-Sidebar (Collapsible on Mobile) */}
        <div className="w-80 bg-white/50 dark:bg-[#0a0f1d]/60 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col hidden lg:flex">
          {/* Header */}
          <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Diagnostic Sessions
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartNewChat}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-cyan-400 border border-brand-500/20 transition-all"
            >
              <RefreshCw className="w-3 h-3" /> New Chat
            </motion.button>
          </div>

          {/* Session List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {isLoadingSessions ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin mb-2 text-cyan-500" />
                <span className="text-xs font-medium">Loading history...</span>
              </div>
            ) : recentSessions.length === 0 ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500 px-4">
                <Bot className="w-8 h-8 mx-auto mb-2 opacity-40 text-cyan-500" />
                <p className="text-xs font-medium">No past diagnostic sessions found.</p>
                <p className="text-[11px] text-slate-400 mt-1">Start a conversation to get step-by-step IT help.</p>
              </div>
            ) : (
              recentSessions.map((s) => {
                const isActive = s.sessionId === sessionId;
                return (
                  <button
                    key={s.sessionId}
                    onClick={() => handleSelectSession(s.sessionId)}
                    className={`w-full text-left p-3 rounded-2xl transition-all border ${
                      isActive
                        ? 'bg-gradient-to-r from-brand-50 to-cyan-50/50 dark:from-cyan-950/40 dark:to-brand-950/30 border-cyan-500/40 shadow-sm'
                        : 'bg-white/40 dark:bg-slate-900/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 border-slate-200/60 dark:border-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {s.category || 'General IT'}
                      </span>
                      <span
                        className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          s.status === 'RESOLVED'
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : s.status === 'ESCALATED'
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        }`}
                      >
                        {s.status}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">
                      {s.querySnippet || 'Technical inquiry'}
                    </p>
                    <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                      <span>{new Date(s.startedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                      <span className="font-mono text-[9px] opacity-70">#{s.sessionId.slice(0, 8)}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Main Interactive Chat Area */}
        <main className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-slate-50/50 dark:bg-[#070b14]">
          {/* Top Session Status Bar */}
          <div className="px-6 py-3.5 bg-white/70 dark:bg-[#090e1c]/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#090e1c] ring-2 ring-emerald-500/30 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-bold text-slate-900 dark:text-white">
                    IntelliDesk AI Specialist
                  </h1>
                  <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 rounded-md">
                    SOP Diagnostic Engine
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Interactive multi-turn troubleshooting with automated escalation
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Status Badge */}
              <span
                className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                  sessionStatus === 'RESOLVED'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : sessionStatus === 'ESCALATED'
                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
                    : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30'
                }`}
              >
                {sessionStatus === 'RESOLVED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                {sessionStatus === 'ESCALATED' && <ShieldAlert className="w-3.5 h-3.5" />}
                {sessionStatus === 'ACTIVE' && <Wrench className="w-3.5 h-3.5 animate-spin-slow" />}
                {sessionStatus}
              </span>

              {/* Escalate Button */}
              {sessionStatus === 'ACTIVE' && sessionId && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setIsEscalateModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-sm shadow-amber-500/20 transition-all"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Convert to Human Ticket
                </motion.button>
              )}

              {/* Escalated Info Link */}
              {escalatedTicketInfo && (
                <Link
                  to="/employee"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/30 hover:bg-purple-500/20 transition-all"
                >
                  <span>Ticket {escalatedTicketInfo.ticketNumber}</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {messages.length === 0 ? (
              /* Empty State / Welcome Screen */
              <div className="max-w-3xl mx-auto py-10">
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-500 via-brand-500 to-violet-600 flex items-center justify-center text-white mx-auto shadow-2xl shadow-cyan-500/30">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    How can I assist your IT workflow today?
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
                    I diagnose IT issues step-by-step using verified corporate Standard Operating Procedures. If an issue cannot be self-resolved, I summarize and escalate it to an engineer.
                  </p>
                </motion.div>

                {/* Suggested Prompt Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-8">
                  {SUGGESTED_PROMPTS.map((item, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSendMessage(item.prompt)}
                      className="text-left p-4 rounded-2xl bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800/80 hover:border-cyan-500/50 dark:hover:border-cyan-500/50 shadow-sm hover:shadow-lg hover:shadow-cyan-500/5 transition-all group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/70 text-cyan-600 dark:text-cyan-400 border border-cyan-200/50 dark:border-cyan-500/20">
                          {item.category}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                      </div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {item.prompt}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : (
              /* Message Bubbles */
              <div className="max-w-4xl mx-auto space-y-6">
                {messages.map((msg, idx) => {
                  const isUser = msg.sender === 'USER';
                  return (
                    <motion.div
                      key={msg.id || idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {/* Assistant Avatar */}
                      {!isUser && (
                        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 to-violet-600 flex-shrink-0 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                      )}

                      <div className={`max-w-2xl space-y-3 ${isUser ? 'items-end' : 'items-start'}`}>
                        {/* Bubble */}
                        <div
                          className={`p-4 rounded-3xl text-sm leading-relaxed ${
                            isUser
                              ? 'bg-gradient-to-r from-brand-600 via-brand-500 to-violet-600 text-white rounded-tr-xs shadow-md shadow-brand-500/20'
                              : 'bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-xs shadow-sm'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>

                        {/* Diagnostic Step Cards (Attached to Assistant Message) */}
                        {!isUser && msg.diagnosticSteps && msg.diagnosticSteps.length > 0 && (
                          <div className="space-y-3 w-full">
                            {msg.diagnosticSteps.map((step) => {
                              const stepKey = step.id || step.stepNumber;
                              const stepState = activeStepFeedback[stepKey] || (step.status === 'SUCCEEDED' ? 'RESOLVED' : step.status === 'FAILED' ? 'FAILED' : null);
                              const isStepResolved = stepState === 'RESOLVED';
                              const isStepFailed = stepState === 'FAILED';
                              const stepTitle = step.title || step.stepTitle || `Step ${step.stepNumber}`;
                              const instructions = step.instructions || step.description;
                              const command = step.commandToRun || step.commandSnippet;

                              return (
                                <motion.div
                                  key={stepKey}
                                  initial={{ opacity: 0, scale: 0.98 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className={`p-4 rounded-2xl border transition-all ${
                                    isStepResolved
                                      ? 'bg-emerald-950/20 border-emerald-500/40'
                                      : isStepFailed
                                      ? 'bg-rose-950/20 border-rose-500/30'
                                      : 'bg-gradient-to-br from-cyan-950/20 via-[#0a0f1d] to-brand-950/20 border-cyan-500/40 shadow-lg shadow-cyan-500/5'
                                  }`}
                                >
                                  {/* Step Header */}
                                  <div className="flex items-center justify-between gap-3 mb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs border border-cyan-500/30">
                                        {step.stepNumber}
                                      </span>
                                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                        {stepTitle}
                                      </h4>
                                    </div>
                                    <span
                                      className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                        isStepResolved
                                          ? 'bg-emerald-500/20 text-emerald-400'
                                          : isStepFailed
                                          ? 'bg-rose-500/20 text-rose-400'
                                          : 'bg-cyan-500/20 text-cyan-300'
                                      }`}
                                    >
                                      {isStepResolved ? 'Worked' : isStepFailed ? 'Failed' : 'Suggested Action'}
                                    </span>
                                  </div>

                                  {/* Step Description */}
                                  {instructions && (
                                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
                                      {instructions}
                                    </p>
                                  )}

                                  {/* CLI Command Box */}
                                  {command && (
                                    <div className="relative mb-3 rounded-xl bg-slate-950 border border-slate-800 p-3 font-mono text-xs text-cyan-300 flex items-center justify-between group">
                                      <div className="flex items-center gap-2 overflow-x-auto pr-8">
                                        <Terminal className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                                        <span>{command}</span>
                                      </div>
                                      <button
                                        onClick={() => copyToClipboard(command, stepKey)}
                                        className="absolute right-2 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-sans font-semibold flex items-center gap-1 transition-all"
                                      >
                                        {copiedCode === stepKey ? (
                                          <>
                                            <Check className="w-3 h-3 text-emerald-400" /> Copied
                                          </>
                                        ) : (
                                          <>
                                            <Copy className="w-3 h-3" /> Copy
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  )}

                                  {/* Expected Output */}
                                  {step.expectedOutput && (
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic mb-3">
                                      Expected outcome: {step.expectedOutput}
                                    </p>
                                  )}

                                  {/* Feedback Buttons */}
                                  {sessionStatus === 'ACTIVE' && !isStepResolved && (
                                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200/40 dark:border-slate-800/60">
                                      <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        disabled={stepState === 'SUBMITTING'}
                                        onClick={() => handleStepFeedback(step, true)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-sm shadow-emerald-500/20 transition-all disabled:opacity-50"
                                      >
                                        {stepState === 'SUBMITTING' ? (
                                          <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                          <ThumbsUp className="w-3 h-3" />
                                        )}
                                        ✓ It Worked (Resolved)
                                      </motion.button>

                                      <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        disabled={stepState === 'SUBMITTING'}
                                        onClick={() => handleStepFeedback(step, false)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 hover:bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/30 transition-all disabled:opacity-50"
                                      >
                                        <ThumbsDown className="w-3 h-3" />
                                        ✕ Didn't Work
                                      </motion.button>
                                    </div>
                                  )}
                                </motion.div>
                              );
                            })}
                          </div>
                        )}

                        {/* Timestamp */}
                        <div
                          className={`text-[10px] text-slate-400 flex items-center gap-1 ${
                            isUser ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <Clock className="w-2.5 h-2.5" />
                          <span>
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>

                      {/* User Avatar */}
                      {isUser && (
                        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-brand-600 to-violet-600 flex-shrink-0 flex items-center justify-center text-white shadow-md shadow-brand-500/20 font-bold text-xs">
                          {user?.firstName?.charAt(0) || 'U'}
                        </div>
                      )}
                    </motion.div>
                  );
                })}

                {/* Real-time Assistant Typing Indicator */}
                {isSending && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3.5 items-center"
                  >
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 to-violet-600 flex-shrink-0 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="p-4 rounded-3xl bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800 rounded-tl-xs flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Analyzing SOP diagnostic tree & synthesizing steps...
                      </span>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Bottom Chat Input Bar */}
          <div className="p-4 bg-white/70 dark:bg-[#090e1c]/80 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80">
            <div className="max-w-4xl mx-auto">
              {sessionStatus === 'RESOLVED' ? (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center flex items-center justify-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  Issue self-resolved successfully! Need help with another problem?
                  <button
                    onClick={handleStartNewChat}
                    className="ml-2 underline hover:text-emerald-300"
                  >
                    Start New Chat
                  </button>
                </div>
              ) : sessionStatus === 'ESCALATED' ? (
                <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center flex items-center justify-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-300">
                  <ShieldAlert className="w-4 h-4" />
                  This session has been converted to an official IT Ticket.
                  <button
                    onClick={handleStartNewChat}
                    className="ml-2 underline hover:text-purple-200"
                  >
                    Start New Chat
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2 bg-white dark:bg-[#0c1222] rounded-2xl border border-slate-300 dark:border-slate-700/80 p-1.5 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20 shadow-sm transition-all"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Describe your IT issue, command output, or error message..."
                    className="flex-1 px-4 py-2 text-xs sm:text-sm bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                    disabled={isSending}
                  />

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!inputMessage.trim() || isSending}
                    className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20 hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isSending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </motion.button>
                </form>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Escalation Modal */}
      <AnimatePresence>
        {isEscalateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0c1222] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setIsEscalateModalOpen(false)}
                className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Convert to Support Ticket
                  </h3>
                  <p className="text-xs text-slate-400">
                    Our AI will bundle conversation history and diagnostic attempts into a structured ticket.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Priority Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Ticket Priority
                  </label>
                  <select
                    value={escalatePriority}
                    onChange={(e) => setEscalatePriority(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="LOW">Low - Minor inconvenience</option>
                    <option value="MEDIUM">Medium - Normal workflow affected</option>
                    <option value="HIGH">High - Urgent business impact</option>
                    <option value="CRITICAL">Critical - Work completely blocked</option>
                  </select>
                </div>

                {/* Additional User Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Additional Context for Human Engineer (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={escalateNotes}
                    onChange={(e) => setEscalateNotes(e.target.value)}
                    placeholder="Provide any hardware model, software version, or urgency details..."
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEscalateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isEscalating}
                  onClick={handleEscalateSession}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20 hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {isEscalating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ShieldAlert className="w-3.5 h-3.5" />
                  )}
                  Escalate & Open Ticket
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
