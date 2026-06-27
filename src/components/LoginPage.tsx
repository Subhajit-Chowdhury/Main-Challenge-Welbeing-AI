import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { KeyRound, Mail, User as UserIcon, Eye, EyeOff, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/button';

export function LoginPage() {
  const { login, error, isLoading, clearError } = useAuth();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const demoUsers = [
    { username: 'student1', email: 'student1@example.com', label: 'Student 1' },
    { username: 'student2', email: 'student2@example.com', label: 'Student 2' },
    { username: 'student3', email: 'student3@example.com', label: 'Student 3' },
  ];

  const handleDemoClick = (username: string) => {
    setLocalError(null);
    clearError();
    setUsernameOrEmail(username);
    setPassword('demo123');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!usernameOrEmail.trim()) {
      setLocalError('Please enter your username or email.');
      return;
    }
    if (!password) {
      setLocalError('Please enter your password.');
      return;
    }

    await login(usernameOrEmail, password);
  };

  return (
    <div id="login-page-container" className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Dynamic Background Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-slate-900 border border-slate-800 rounded-2xl mb-4 shadow-xl shadow-slate-950/50">
            <Sparkles className="h-8 w-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold font-heading tracking-tight text-white mb-2">
            Clean Architecture Workspace
          </h1>
          <p className="text-sm text-slate-400">
            Access your secure, isolated study environment
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-slate-950/80">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Display Errors */}
            {(localError || error) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg p-3.5 flex items-start gap-2.5"
              >
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{localError || error}</span>
              </motion.div>
            )}

            {/* Username/Email Input */}
            <div className="space-y-1.5">
              <label htmlFor="username-input" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <UserIcon className="h-5 w-5" />
                </div>
                <input
                  id="username-input"
                  type="text"
                  placeholder="student1 or student1@example.com"
                  value={usernameOrEmail}
                  onChange={(e) => {
                    setUsernameOrEmail(e.target.value);
                    if (localError) setLocalError(null);
                    clearError();
                  }}
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-sm"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password-input" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <KeyRound className="h-5 w-5" />
                </div>
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (localError) setLocalError(null);
                    clearError();
                  }}
                  disabled={isLoading}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-sm"
                />
                <button
                  type="button"
                  id="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 focus:outline-none"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-lg shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-3 text-slate-500 font-semibold tracking-wider">
                Or Quick Access Demo Accounts
              </span>
            </div>
          </div>

          {/* Quick Access Grid */}
          <div className="grid grid-cols-3 gap-2">
            {demoUsers.map((demo) => (
              <button
                key={demo.username}
                id={`demo-user-btn-${demo.username}`}
                type="button"
                onClick={() => handleDemoClick(demo.username)}
                disabled={isLoading}
                className={`p-2 rounded-lg border text-xs font-medium transition-all duration-150 text-center flex flex-col items-center gap-1 cursor-pointer ${
                  usernameOrEmail === demo.username
                    ? 'bg-blue-500/10 border-blue-500/40 text-blue-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <CheckCircle2 className={`h-3.5 w-3.5 ${usernameOrEmail === demo.username ? 'text-blue-400' : 'text-slate-600'}`} />
                <span>{demo.label}</span>
              </button>
            ))}
          </div>

          {/* Security Note */}
          <div className="mt-6 text-center text-[11px] text-slate-500 leading-normal">
            Passwords are hashed using a robust <strong className="text-slate-400">bcrypt algorithm</strong>, securing your identity before transmitting to the data layer.
          </div>
        </div>
      </motion.div>
    </div>
  );
}
