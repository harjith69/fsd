import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Lock, Mail, ArrowRight, ShieldCheck, Award, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'hod') navigate('/hod');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      {/* Aesthetic Blurred Gradient Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#5B6CFF]/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#2EC4A6]/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-5xl bg-white rounded-3xl border border-[#ECEEF7] shadow-[0_20px_60px_rgba(91,108,255,0.08)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
        {/* Left Side: Modern Academic Hero Illustration */}
        <div className="lg:col-span-6 bg-gradient-to-br from-[#5B6CFF] to-[#4A59E8] p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle decoration elements */}
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-black/10 blur-2xl pointer-events-none" />

          {/* Top Logo */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight">AcademiaPulse</span>
              <p className="text-xs text-white/80 font-medium">Faculty Performance Hub</p>
            </div>
          </div>

          {/* Center Graphic & Highlights */}
          <div className="relative z-10 my-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Next-Gen Academic Analytics</span>
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
              Unified Accreditation & Performance Intelligence
            </h2>
            <p className="text-sm text-white/90 mt-3 leading-relaxed">
              Consolidating teaching workload, publications, funded consultancy, and patents into a single accredited Performance Index.
            </p>

            {/* Feature Pills */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                <ShieldCheck className="w-5 h-5 text-emerald-300 shrink-0" />
                <span className="text-xs font-medium">
                  Automated NAAC Criteria 2 & 3 Compliance Audits
                </span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                <Award className="w-5 h-5 text-amber-300 shrink-0" />
                <span className="text-xs font-medium">
                  Real-time HoD Verification & Digital Score Engine
                </span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="relative z-10 text-[11px] text-white/70">
            Approved for Autonomous Engineering Colleges & Universities
          </div>
        </div>

        {/* Right Side: Clean Login Form */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-[#1B2140] tracking-tight">
              Welcome back
            </h3>
            <p className="text-xs text-[#8A91AD] mt-1">
              Sign in to manage academic records and view appraisal metrics.
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600 font-medium"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. faculty1@college.edu"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••••••"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-2"
            >
              Sign In to Dashboard <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          {/* One-Click Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-[#ECEEF7]">
            <p className="text-xs font-semibold text-[#8A91AD] mb-3">
              Quick Demo Logins (Click to autofill):
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@college.edu', 'Admin@123')}
                className="px-3 py-2 text-left rounded-xl border border-[#ECEEF7] bg-[#F7F8FC] hover:bg-[#EEF0FF] hover:border-[#5B6CFF]/30 transition-all text-xs"
              >
                <div className="font-bold text-[#1B2140]">👑 Admin</div>
                <div className="text-[10px] text-[#8A91AD]">Dean Academic</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('hod.cse@college.edu', 'Hod@123')}
                className="px-3 py-2 text-left rounded-xl border border-[#ECEEF7] bg-[#F7F8FC] hover:bg-[#EEF0FF] hover:border-[#5B6CFF]/30 transition-all text-xs"
              >
                <div className="font-bold text-[#1B2140]">🏢 HoD</div>
                <div className="text-[10px] text-[#8A91AD]">CSE Dept</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('faculty1@college.edu', 'Faculty@123')}
                className="px-3 py-2 text-left rounded-xl border border-[#ECEEF7] bg-[#F7F8FC] hover:bg-[#EEF0FF] hover:border-[#5B6CFF]/30 transition-all text-xs"
              >
                <div className="font-bold text-[#1B2140]">👨‍🏫 Faculty</div>
                <div className="text-[10px] text-[#8A91AD]">Dr. Priya Sharma</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
