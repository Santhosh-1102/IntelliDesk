import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import { 
  Sparkles, 
  Lock, 
  Mail, 
  AlertCircle, 
  Loader2, 
  User, 
  Headset, 
  Shield, 
  ArrowRight,
  Check
} from 'lucide-react';

export default function LoginPage() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialEmail = queryParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      if (data.roles.includes('ROLE_ADMIN')) {
        navigate('/admin');
      } else if (data.roles.includes('ROLE_SUPPORT_ENGINEER')) {
        navigate('/engineer');
      } else {
        navigate('/employee');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (demoEmail, roleName) => {
    setEmail(demoEmail);
    setPassword('Password@123');
    setSelectedRole(roleName);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070b14] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300 font-sans">
      {/* Ambient Glowing Cyber Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[600px] pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-10 left-10 w-96 h-96 bg-cyan-500/20 dark:bg-cyan-500/15 rounded-full blur-[128px] animate-blob" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-violet-600/25 dark:bg-violet-600/20 rounded-full blur-[128px] animate-blob animation-delay-2000" />
      </div>

      <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none -z-10" />

      {/* Floating Top Nav with Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Brand Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8"
      >
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <motion.div
            whileHover={{ scale: 1.08, rotate: 6 }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-brand-500 to-violet-600 flex items-center justify-center text-white shadow-xl shadow-cyan-500/30"
          >
            <Sparkles className="w-6 h-6 animate-pulse" />
          </motion.div>
          <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Intelli<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-brand-400 to-violet-400">Desk</span>
          </span>
        </Link>
        <h2 className="mt-4 text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Sign In to Your Workspace
        </h2>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 font-medium">
          Enterprise technical support & AI diagnostic platform
        </p>
      </motion.div>

      {/* Card Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="bg-white/90 dark:bg-[#0d1322]/90 backdrop-blur-2xl py-8 px-6 sm:px-10 shadow-2xl shadow-slate-200/50 dark:shadow-black/60 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl relative overflow-hidden">
          {/* Subtle Accent Glow Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-brand-500 to-violet-600" />

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 flex items-start gap-3 text-rose-700 dark:text-rose-300 text-sm shadow-sm"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="employee@intellidesk.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/60 focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 focus:border-transparent text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all font-medium text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/60 focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 focus:border-transparent text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all font-medium text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-brand-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Authenticating...
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Quick-Fill Demo Cards */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80">
            <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 text-center">
              Quick-Fill Demo Roles
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials('employee@intellidesk.com', 'Employee')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  selectedRole === 'Employee'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 dark:border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-400/40'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                Employee
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('engineer@intellidesk.com', 'Engineer')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  selectedRole === 'Engineer'
                    ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-400 dark:border-cyan-500 text-cyan-800 dark:text-cyan-300 ring-2 ring-cyan-400/40'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/30'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-cyan-100 dark:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300 flex items-center justify-center">
                  <Headset className="w-4 h-4" />
                </div>
                Engineer
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('admin@intellidesk.com', 'Admin')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  selectedRole === 'Admin'
                    ? 'bg-violet-50 dark:bg-violet-950/60 border-violet-400 dark:border-violet-500 text-violet-800 dark:text-violet-300 ring-2 ring-violet-400/40'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-violet-50/50 dark:hover:bg-violet-950/30'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                Admin
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-cyan-500 hover:text-cyan-400 transition-colors">
              Create an account →
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
