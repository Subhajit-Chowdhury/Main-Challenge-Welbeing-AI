/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { LandingPage } from './components/LandingPage';

function MainAppContent() {
  const { user, isLoading } = useAuth();
  const [showWorkspace, setShowWorkspace] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="relative flex items-center justify-center">
          <div className="h-12 w-12 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin" />
        </div>
        <p className="mt-4 text-sm text-slate-400 font-medium tracking-wide">
          Verifying secure session integrity...
        </p>
      </div>
    );
  }

  // If already logged in, show workspace immediately
  if (user) {
    return <Dashboard />;
  }

  // Show landing page by default, unless user has clicked "Enter Workspace" / "Sign In"
  if (!showWorkspace) {
    return <LandingPage onEnterWorkspace={() => setShowWorkspace(true)} />;
  }

  return <LoginPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

