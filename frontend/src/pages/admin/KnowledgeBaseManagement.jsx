import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import knowledgeService from '../../services/knowledgeService';
import {
  BookOpen,
  Upload,
  FileText,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  Eye,
  RefreshCw,
  Layers,
  Database,
  Cpu,
  Sparkles,
  AlertCircle,
  FileUp,
  X,
  File,
  ChevronRight,
  Info
} from 'lucide-react';

const CATEGORIES = [
  'General IT SOP',
  'VPN & Remote Access',
  'Network & Connectivity',
  'Hardware & Peripherals',
  'Application & Software',
  'Security & Identity',
  'Access & Credentials'
];

export default function KnowledgeBaseManagement() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState(CATEGORIES[0]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);

  // Chunk inspection modal
  const [inspectingDoc, setInspectingDoc] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [loadingChunks, setLoadingChunks] = useState(false);

  // Interactive RAG Retrieval tester
  const [testQuery, setTestQuery] = useState('');
  const [testResults, setTestResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const fileInputRef = useRef(null);

  // Knowledge gaps state
  const [knowledgeGaps, setKnowledgeGaps] = useState([]);
  const [loadingGaps, setLoadingGaps] = useState(false);

  useEffect(() => {
    loadDocuments(page);
    loadKnowledgeGaps();
  }, [page]);

  const loadDocuments = async (pageNum = 0) => {
    setLoading(true);
    try {
      const data = await knowledgeService.getDocuments(pageNum, 10);
      setDocuments(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error('Failed to load knowledge documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadKnowledgeGaps = async () => {
    setLoadingGaps(true);
    try {
      const data = await knowledgeService.getKnowledgeGaps(0, 10);
      setKnowledgeGaps(data || []);
    } catch (err) {
      console.error('Failed to load knowledge gaps:', err);
    } finally {
      setLoadingGaps(false);
    }
  };

  const handleIngestForGap = (gap) => {
    setUploadCategory(gap.category || CATEGORIES[0]);
    setUploadTitle(`SOP: ${gap.query ? gap.query.substring(0, 45) : gap.category}`);
    setIsUploadModalOpen(true);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileSelected(file);
    }
  };

  const handleFileSelected = (file) => {
    setUploadFile(file);
    setUploadError(null);
    if (!uploadTitle) {
      // Auto-suggest title based on filename
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setUploadTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('Please choose a document file to upload');
      return;
    }
    if (!uploadTitle.trim()) {
      setUploadError('Please provide a descriptive title for this document');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('title', uploadTitle.trim());
    formData.append('category', uploadCategory);

    try {
      const res = await knowledgeService.uploadDocument(formData);
      setUploadSuccess(`Ingested "${res.title}" successfully into ${res.totalChunks} searchable chunks!`);
      setUploadFile(null);
      setUploadTitle('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      loadDocuments(0);
      setTimeout(() => {
        setIsUploadModalOpen(false);
        setUploadSuccess(null);
      }, 1500);
    } catch (err) {
      console.error('Document ingestion error:', err);
      setUploadError(err.response?.data?.message || 'Failed to ingest document. Ensure file is a valid PDF, DOCX, TXT, or MD.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggleActive = async (docId) => {
    try {
      await knowledgeService.toggleDocumentActive(docId);
      setDocuments((prev) =>
        prev.map((d) => (d.id === docId ? { ...d, active: !d.active } : d))
      );
    } catch (err) {
      console.error('Failed to toggle document status:', err);
      alert('Could not update document status');
    }
  };

  const handleDelete = async (doc) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${doc.title}" and its ${doc.totalChunks} chunks?`)) {
      return;
    }
    try {
      await knowledgeService.deleteDocument(doc.id);
      loadDocuments(page);
    } catch (err) {
      console.error('Failed to delete document:', err);
      alert('Could not delete document');
    }
  };

  const handleInspectChunks = async (doc) => {
    setInspectingDoc(doc);
    setLoadingChunks(true);
    setChunks([]);
    try {
      const data = await knowledgeService.getDocumentChunks(doc.id);
      setChunks(data || []);
    } catch (err) {
      console.error('Failed to load chunks:', err);
    } finally {
      setLoadingChunks(false);
    }
  };

  const handleTestSearch = async (e) => {
    e?.preventDefault();
    if (!testQuery.trim()) return;

    setIsSearching(true);
    setSearched(true);
    try {
      const results = await knowledgeService.searchChunks(testQuery.trim(), 4);
      setTestResults(results || []);
    } catch (err) {
      console.error('Search error:', err);
      setTestResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Compute aggregate stats
  const totalChunksCount = documents.reduce((acc, d) => acc + (d.totalChunks || 0), 0);
  const activeDocsCount = documents.filter((d) => d.active).length;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070b14] flex flex-col font-sans transition-colors duration-300">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 space-y-8 overflow-x-hidden">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                <span>Phase 7 • Knowledge Base & Hybrid RAG Engine</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Corporate Knowledge Base Management
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Ingest IT SOPs, parse documents with Apache Tika, create semantic overlapping chunks, and power AI troubleshooting with verified citations.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-brand-600 via-cyan-600 to-violet-600 hover:opacity-95 text-white shadow-lg shadow-cyan-500/20 transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>Ingest New SOP Document</span>
            </motion.button>
          </div>

          {/* Metric Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Total Documents</span>
                <div className="w-8 h-8 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-cyan-400">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {totalElements}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Ingested SOPs & Manuals</p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Indexed Chunks</span>
                <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {totalChunksCount}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Overlapping Semantic Chunks</p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Active SOPs</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {activeDocsCount}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Actively Queried by RAG</p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Search Engine</span>
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                  <Database className="w-4 h-4" />
                </div>
              </div>
              <div className="text-lg font-black text-slate-900 dark:text-white truncate">
                pgvector + Full-Text
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sub-5ms Hybrid Retrieval</p>
            </div>
          </div>

          {/* Interactive RAG Retrieval Sandbox */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Live RAG Retrieval Tester
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Test what knowledge chunks are retrieved when an employee reports an incident to the AI.
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                Ranked by PostgreSQL ts_rank_cd & trigram match
              </span>
            </div>

            <form onSubmit={handleTestSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={testQuery}
                  onChange={(e) => setTestQuery(e.target.value)}
                  placeholder="e.g., GlobalProtect VPN timeout 504, Wi-Fi connected no internet, Kerberos clock drift..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching || !testQuery.trim()}
                className="px-5 py-2.5 rounded-2xl text-sm font-bold bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white shadow-sm transition-all flex items-center gap-2"
              >
                {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Retrieve Chunks</span>
              </button>
            </form>

            {/* Test Results */}
            {searched && (
              <div className="space-y-3 pt-2">
                {testResults.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-800 text-center text-xs text-slate-500">
                    No relevant SOP chunks matched this query. Try ingesting sample documents below or adjusting your keywords.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {testResults.map((result, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-cyan-500/20 dark:border-cyan-500/30 space-y-2 relative overflow-hidden"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-cyan-600 dark:text-cyan-400 truncate max-w-[200px]">
                            {result.documentTitle}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20">
                            Chunk #{result.chunkIndex} • {Math.round(result.relevanceScore * 100)}% Match
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-4 leading-relaxed font-mono">
                          {result.chunkContent}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Document Inventory Section */}
          <div className="bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Ingested Knowledge Documents
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage corporate SOPs, view parsed chunks, and toggle active search status.
                </p>
              </div>

              <button
                onClick={() => loadDocuments(page)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Refresh Documents"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loading ? (
              <div className="py-16 text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-cyan-500 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-medium">Loading documents...</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                  <FileText className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  No knowledge documents ingested yet
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Upload IT troubleshooting guides or standard operating procedures (PDF, DOCX, TXT, MD) to enable AI RAG context injection.
                </p>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-600 text-white transition-all shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Ingest First SOP</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-3.5">Document Title & File</th>
                      <th className="px-6 py-3.5">Category</th>
                      <th className="px-6 py-3.5">Chunks</th>
                      <th className="px-6 py-3.5">File Size</th>
                      <th className="px-6 py-3.5">Ingested</th>
                      <th className="px-6 py-3.5 text-center">RAG Active</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800">
                    {documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400 flex-shrink-0">
                              <File className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white truncate">
                                {doc.title}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate">
                                {doc.fileName} • <span className="uppercase font-semibold">{doc.fileType}</span>
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-block whitespace-nowrap px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
                            {doc.category || 'General'}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20">
                            {doc.totalChunks} chunks
                          </span>
                        </td>

                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                          {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB` : 'N/A'}
                        </td>

                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                          {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'N/A'}
                        </td>

                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleToggleActive(doc.id)}
                            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                              doc.active
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                          >
                            {doc.active ? 'Active' : 'Disabled'}
                          </button>
                        </td>

                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleInspectChunks(doc)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 transition-colors"
                            title="Inspect Chunks"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(doc)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Delete Document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Detected Knowledge Gaps & Missing SOPs Section */}
          <div className="bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Detected Knowledge Gaps (Missing SOPs)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Employee queries that lacked matching SOP documentation or failed self-service.
                  </p>
                </div>
              </div>
              <button
                onClick={loadKnowledgeGaps}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Refresh Gaps"
              >
                <RefreshCw className={`w-4 h-4 ${loadingGaps ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loadingGaps ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Loading knowledge gap insights...
              </div>
            ) : knowledgeGaps.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 text-center">
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>No unaddressed knowledge gaps detected! All reported incidents have matching SOP coverage.</span>
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {knowledgeGaps.map((gap) => (
                  <div
                    key={gap.conversationId}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-amber-500/20 space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                        {gap.category || 'General IT'}
                      </span>
                      {gap.escalatedTicketNumber && (
                        <span className="font-mono text-[11px] font-bold text-slate-400">
                          Ticket {gap.escalatedTicketNumber}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2">
                      "{gap.query}"
                    </p>
                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        {gap.occurredAt ? new Date(gap.occurredAt).toLocaleDateString() : 'Recent'}
                      </span>
                      <button
                        onClick={() => handleIngestForGap(gap)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 transition-all"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Create SOP for This</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Upload SOP Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                    <FileUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Ingest Knowledge Document
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Upload PDF, DOCX, TXT, or MD files for Apache Tika parsing & semantic chunking.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {uploadError && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{uploadSuccess}</span>
                </div>
              )}

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                {/* Drag and drop zone */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-500/60 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-900/40"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt,.md"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelected(e.target.files[0]);
                      }
                    }}
                  />
                  {uploadFile ? (
                    <div className="flex items-center justify-center gap-3 text-cyan-600 dark:text-cyan-400">
                      <File className="w-6 h-6" />
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-xs">
                          {uploadFile.name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {(uploadFile.size / 1024).toFixed(1)} KB • Click or drop to replace
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Click to upload or drag & drop SOP document
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Supported: PDF, DOCX, TXT, MD (Max 25MB)
                      </p>
                    </div>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Document Title *
                  </label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="e.g., GlobalProtect VPN Troubleshooting SOP"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Submit button */}
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-brand-600 to-cyan-600 hover:opacity-95 disabled:opacity-50 text-white shadow-md shadow-cyan-500/20 transition-all flex items-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Parsing with Apache Tika & Chunking...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Parse & Ingest</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Inspect Chunks Modal */}
      <AnimatePresence>
        {inspectingDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl max-h-[85vh] bg-white dark:bg-[#0c1222] border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-6 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-violet-500" />
                    <span>Chunks Inspection: {inspectingDoc.title}</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {chunks.length} sliding-window chunks indexed into PostgreSQL.
                  </p>
                </div>
                <button
                  onClick={() => setInspectingDoc(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loadingChunks ? (
                  <div className="py-12 text-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-cyan-500 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">Loading chunk fragments...</p>
                  </div>
                ) : chunks.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    No chunks found for this document.
                  </div>
                ) : (
                  chunks.map((chunk) => (
                    <div
                      key={chunk.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-violet-600 dark:text-violet-400">
                          Chunk Fragment #{chunk.chunkIndex}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          ~{chunk.tokenCount} tokens
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono leading-relaxed bg-white dark:bg-[#070b14] p-3 rounded-xl border border-slate-200 dark:border-slate-800/60">
                        {chunk.chunkContent}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
