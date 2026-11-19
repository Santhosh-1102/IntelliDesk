import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '../components/ThemeToggle';
import { 
  Sparkles, 
  Lock, 
  Mail, 
  User, 
  Building, 
  AlertCircle, 
  Loader2, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Headset
} from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: 'Engineering',
    password: '',
    role: 'ROLE_EMPLOYEE',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isDuplicateEmail, setIsDuplicateEmail] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
    if (isDuplicateEmail) setIsDuplicateEmail(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsDuplicateEmail(false);
    setLoading(true);

    try {
      await register(formData);
      navigate(formData.role === 'ROLE_SUPPORT_ENGINEER' ? '/engineer' : '/employee');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed. Please check your information.';
      setError(msg);
      if (msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('duplicate')) {
        setIsDuplicateEmail(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordMeetsReq = formData.password.length >= 6;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070b14] relative overflow-hidden flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-cyan-500 selection:text-white transition-colors duration-300">
      {/* Dynamic Background Mesh & Glowing Orbs */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none -z-10" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-[128px] animate-blob pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-[128px] animate-blob animation-delay-2000 pointer-events-none" />

      {/* Floating Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Main Glassmorphic Container */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-xl relative z-10"
      >
        <div className="bg-white/90 dark:bg-[#0d1322]/90 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-black/60 relative overflow-hidden">
          {/* Ambient Accent Border Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-brand-500 to-violet-600" />

          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2.5 group mb-3">
              <motion.div
                whileHover={{ rotate: 10, scale: 1.08 }}
                className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-brand-500 to-violet-600 flex items-center justify-center text-white shadow-xl shadow-cyan-500/30"
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
              <div className="text-left">
                <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Intelli<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-brand-400 to-violet-400">Desk</span>
                </span>
                <span className="text-[10px] font-bold tracking-widest text-cyan-600 dark:text-cyan-400 block uppercase">Enterprise ITSM</span>
              </div>
            </Link>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Create your account</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">
              Join the self-service IT diagnostic & troubleshooting platform
            </p>
          </div>

          {/* Error Message with Smart Duplicate Email Action */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/40 text-rose-700 dark:text-rose-200 text-sm overflow-hidden shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500 dark:text-rose-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold text-rose-800 dark:text-rose-200">{error}</p>
                    {isDuplicateEmail && (
                      <div className="mt-2.5 pt-2.5 border-t border-rose-200 dark:border-rose-500/20 flex items-center justify-between">
                        <span className="text-xs text-rose-600 dark:text-rose-300">Account already exists. Sign in?</span>
                        <Link
                          to={`/login?email=${encodeURIComponent(formData.email)}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-100 dark:bg-rose-500/20 hover:bg-rose-200 dark:hover:bg-rose-500/30 text-rose-800 dark:text-rose-200 text-xs font-bold transition-colors"
                        >
                          Sign In Now <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Registration Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Account Type Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Account Purpose / Workspace Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'ROLE_EMPLOYEE' })}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                    formData.role === 'ROLE_EMPLOYEE'
                      ? 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-500 text-cyan-900 dark:text-white shadow-lg shadow-cyan-500/10 ring-2 ring-cyan-500/30'
                      : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                    formData.role === 'ROLE_EMPLOYEE' ? 'bg-cyan-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}>
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black">Employee</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Self-Service IT & Chat</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'ROLE_SUPPORT_ENGINEER' })}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                    formData.role === 'ROLE_SUPPORT_ENGINEER'
                      ? 'bg-violet-50 dark:bg-violet-950/40 border-violet-500 text-violet-900 dark:text-white shadow-lg shadow-violet-500/10 ring-2 ring-violet-500/30'
                      : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                    formData.role === 'ROLE_SUPPORT_ENGINEER' ? 'bg-violet-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}>
                    <Headset className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black">IT Engineer</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Triage & Resolve</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  First Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Santhosh"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/60 focus:bg-white dark:focus:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="N"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/60 focus:bg-white dark:focus:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm transition-all font-medium"
                />
              </div>
            </div>

            {/* Work Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="santhosh@company.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/60 focus:bg-white dark:focus:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm transition-all font-medium"
                />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Department
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/60 focus:bg-white dark:focus:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm transition-all appearance-none cursor-pointer font-medium"
                >
                  <option value="Engineering" className="bg-white dark:bg-slate-900">Engineering & Development</option>
                  <option value="Product" className="bg-white dark:bg-slate-900">Product & Design</option>
                  <option value="IT Operations" className="bg-white dark:bg-slate-900">IT & Infrastructure</option>
                  <option value="Marketing" className="bg-white dark:bg-slate-900">Marketing</option>
                  <option value="Sales" className="bg-white dark:bg-slate-900">Sales & Operations</option>
                  <option value="Finance" className="bg-white dark:bg-slate-900">Finance & Legal</option>
                  <option value="Human Resources" className="bg-white dark:bg-slate-900">Human Resources</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <span className={`text-[11px] font-bold transition-colors ${passwordMeetsReq ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                  {passwordMeetsReq ? '✓ 6+ characters' : 'Min 6 characters'}
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/60 focus:bg-white dark:focus:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-brand-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" /> Creating your profile...
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-cyan-600 dark:text-cyan-400 hover:underline transition-colors">
                Sign in to your account →
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
