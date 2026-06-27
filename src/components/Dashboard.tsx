/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { wellnessDb } from '../../database/wellness-db';
import { WellnessLog, AppPreferences } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LogOut, 
  User as UserIcon, 
  Sparkles, 
  Plus, 
  Trash2, 
  Calendar, 
  FileText, 
  Clock,
  Heart,
  Activity,
  Brain,
  Coffee,
  BookOpen,
  LineChart,
  BarChart2,
  Lightbulb,
  Check,
  CalendarDays,
  PlusCircle,
  Inbox,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/button';

// Emojis for mood states
const MOOD_EMOJIS = {
  Excellent: { label: 'Excellent', char: '🤩', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25', hover: 'hover:bg-emerald-500/20', val: 5 },
  Good: { label: 'Good', char: '🙂', color: 'text-teal-400 bg-teal-500/10 border-teal-500/25', hover: 'hover:bg-teal-500/20', val: 4 },
  Okay: { label: 'Okay', char: '😐', color: 'text-amber-400 bg-amber-500/10 border-amber-500/25', hover: 'hover:bg-amber-500/20', val: 3 },
  Bad: { label: 'Bad', char: '😔', color: 'text-orange-400 bg-orange-500/10 border-orange-500/25', hover: 'hover:bg-orange-500/20', val: 2 },
  Awful: { label: 'Awful', char: '😭', color: 'text-rose-400 bg-rose-500/10 border-rose-500/25', hover: 'hover:bg-rose-500/20', val: 1 },
};

interface StudyNote {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
}

export function Dashboard() {
  const { user, logout, getUserStorageKey } = useAuth();
  
  // Wellness State
  const [logs, setLogs] = useState<WellnessLog[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [mood, setMood] = useState<WellnessLog['mood']>('Good');
  const [stressLevel, setStressLevel] = useState(4);
  const [sleepHours, setSleepHours] = useState(7);
  const [studyHours, setStudyHours] = useState(4);
  const [energyLevel, setEnergyLevel] = useState(7);
  const [journal, setJournal] = useState('');
  const [loggingStatus, setLoggingStatus] = useState<'idle' | 'saving' | 'success'>('idle');

  // Study Notes State (Existing functionality preserved)
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [activeTab, setActiveTab] = useState<'analytics' | 'notes'>('analytics');

  const notesStorageKey = getUserStorageKey('cleanapp_study_notes');

  // Load logs and notes on mount & whenever user changes
  useEffect(() => {
    if (!user) return;

    // Load wellness logs
    wellnessDb.getLogs(user.id).then((userLogs) => {
      setLogs(userLogs);
      
      // If there's an existing entry for today, prefill it
      const todayString = new Date().toISOString().split('T')[0];
      const todayLog = userLogs.find(l => l.date === todayString);
      if (todayLog) {
        setMood(todayLog.mood);
        setStressLevel(todayLog.stressLevel);
        setSleepHours(todayLog.sleepHours);
        setStudyHours(todayLog.studyHours);
        setEnergyLevel(todayLog.energyLevel);
        setJournal(todayLog.journal);
      }
    });

    // Load study notes
    try {
      const savedNotes = localStorage.getItem(notesStorageKey);
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      } else {
        const defaultNotes: StudyNote[] = [
          {
            id: `note-${user.id}-1`,
            title: `Welcome to your isolated workspace, ${user.username}!`,
            content: `This workspace is securely sandbox-isolated. Other demo students cannot view or edit these notes. Everything you write here is stored using user-specific keys.`,
            category: 'General',
            createdAt: new Date().toISOString()
          }
        ];
        setNotes(defaultNotes);
        localStorage.setItem(notesStorageKey, JSON.stringify(defaultNotes));
      }
    } catch (e) {
      console.error('[Dashboard] Error loading notes:', e);
    }
  }, [user, notesStorageKey]);

  // Handle saving wellness log
  const handleSaveWellness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoggingStatus('saving');

    const logPayload: Omit<WellnessLog, 'userId' | 'createdAt'> = {
      id: `log-${user.id}-${selectedDate}`,
      date: selectedDate,
      mood,
      stressLevel,
      sleepHours,
      studyHours,
      energyLevel,
      journal: journal.trim()
    };

    const success = await wellnessDb.saveLog(user.id, logPayload);
    if (success) {
      // Reload logs
      const updatedLogs = await wellnessDb.getLogs(user.id);
      setLogs(updatedLogs);
      setLoggingStatus('success');
      setTimeout(() => setLoggingStatus('idle'), 3000);
    } else {
      setLoggingStatus('idle');
    }
  };

  // Notes helper functions (Preserved features)
  const saveNotes = (updatedNotes: StudyNote[]) => {
    setNotes(updatedNotes);
    localStorage.setItem(notesStorageKey, JSON.stringify(updatedNotes));
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTitle.trim() || !newContent.trim()) return;

    const newNote: StudyNote = {
      id: `note-${user.id}-${Math.random().toString(36).substring(2, 9)}`,
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory,
      createdAt: new Date().toISOString()
    };

    const updated = [newNote, ...notes];
    saveNotes(updated);
    setNewTitle('');
    setNewContent('');
    setNewCategory('General');
  };

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    saveNotes(updated);
  };

  // --- STATS & ANALYTICS COMPUTATIONS ---
  const last7Logs = useMemo(() => {
    // Return logs sorted chronologically for charting
    return [...logs].slice(0, 7).reverse();
  }, [logs]);

  const weeklySummaryStats = useMemo(() => {
    if (logs.length === 0) {
      return { avgSleep: 0, totalStudy: 0, avgStress: 0, avgEnergy: 0, moodRatio: 'Neutral' };
    }
    const count = Math.min(logs.length, 7);
    const recentLogs = logs.slice(0, count);

    let sleepSum = 0;
    let studySum = 0;
    let stressSum = 0;
    let energySum = 0;
    let positiveMoodCount = 0;

    recentLogs.forEach(l => {
      sleepSum += l.sleepHours;
      studySum += l.studyHours;
      stressSum += l.stressLevel;
      energySum += l.energyLevel;
      if (l.mood === 'Excellent' || l.mood === 'Good') {
        positiveMoodCount++;
      }
    });

    return {
      avgSleep: parseFloat((sleepSum / count).toFixed(1)),
      totalStudy: parseFloat(studySum.toFixed(1)),
      avgStress: parseFloat((stressSum / count).toFixed(1)),
      avgEnergy: parseFloat((energySum / count).toFixed(1)),
      positiveMoodPercent: Math.round((positiveMoodCount / count) * 100)
    };
  }, [logs]);

  // Quick Insights engine based on correlation algorithms
  const quickInsights = useMemo(() => {
    if (logs.length < 3) {
      return [
        "Need more data. Log wellness factors for at least 3 days to unlock deep behavioral insights.",
        "Your workspace calculates correlations between study hours, sleep quality, and daily energy levels."
      ];
    }

    const insightsList: string[] = [];
    
    // Correlation 1: Sleep vs Study
    const sleepOnHighStudy = logs.filter(l => l.studyHours >= 5).map(l => l.sleepHours);
    if (sleepOnHighStudy.length > 0) {
      const avgSleepOnStudyDays = sleepOnHighStudy.reduce((a, b) => a + b, 0) / sleepOnHighStudy.length;
      if (avgSleepOnStudyDays < 6.5) {
        insightsList.push("🚨 High study load days are cutting into your sleep. Aim for at least 7 hours on intensive study days.");
      } else if (avgSleepOnStudyDays >= 7.5) {
        insightsList.push("🎯 Great job balancing study and rest! Your sleep remains stable even during high study periods.");
      }
    }

    // Correlation 2: Energy vs Sleep
    const energyOnGoodSleep = logs.filter(l => l.sleepHours >= 7.5).map(l => l.energyLevel);
    const energyOnBadSleep = logs.filter(l => l.sleepHours < 6.5).map(l => l.energyLevel);
    if (energyOnGoodSleep.length > 0 && energyOnBadSleep.length > 0) {
      const avgEnergyGoodSleep = energyOnGoodSleep.reduce((a, b) => a + b, 0) / energyOnGoodSleep.length;
      const avgEnergyBadSleep = energyOnBadSleep.reduce((a, b) => a + b, 0) / energyOnBadSleep.length;
      
      if (avgEnergyGoodSleep - avgEnergyBadSleep > 1.5) {
        insightsList.push("💡 Sleep is highly critical for your focus: Your daily energy drops by " + (avgEnergyGoodSleep - avgEnergyBadSleep).toFixed(1) + " points on short sleep days.");
      }
    }

    // Correlation 3: Stress vs Energy
    const stressHighEnergy = logs.filter(l => l.energyLevel >= 7).map(l => l.stressLevel);
    const stressLowEnergy = logs.filter(l => l.energyLevel < 5).map(l => l.stressLevel);
    if (stressHighEnergy.length > 0 && stressLowEnergy.length > 0) {
      const avgStressHighEnergy = stressHighEnergy.reduce((a, b) => a + b, 0) / stressHighEnergy.length;
      const avgStressLowEnergy = stressLowEnergy.reduce((a, b) => a + b, 0) / stressLowEnergy.length;
      if (avgStressLowEnergy > avgStressHighEnergy + 1) {
        insightsList.push("🧘 Your stress levels rise significantly when your energy is drained. Take regular study breaks to preserve vitality.");
      }
    }

    // Default positive insights if lists are empty
    if (insightsList.length === 0) {
      insightsList.push("✨ Sleep and study patterns are optimally balanced. Keep checking insights daily.");
      insightsList.push("💪 Maintain your logging habit to discover hidden wellness correlations over time.");
    }

    return insightsList.slice(0, 3);
  }, [logs]);

  // Clean SVG responsive helpers
  const svgWidth = 500;
  const svgHeight = 200;
  const padding = 30;

  // Render SVG Mood Timeline
  const moodTimelinePoints = useMemo(() => {
    if (last7Logs.length === 0) return '';
    const intervalX = (svgWidth - padding * 2) / Math.max(1, last7Logs.length - 1);
    
    return last7Logs.map((l, index) => {
      const x = padding + index * intervalX;
      // Mood value 1 to 5 maps to SVG height range
      const moodVal = MOOD_EMOJIS[l.mood]?.val || 3;
      const y = svgHeight - padding - ((moodVal - 1) / 4) * (svgHeight - padding * 2);
      return { x, y, log: l };
    });
  }, [last7Logs]);

  // Render SVG Energy vs Stress Timeline
  const energyTimelinePoints = useMemo(() => {
    if (last7Logs.length === 0) return { energy: [], stress: [] };
    const intervalX = (svgWidth - padding * 2) / Math.max(1, last7Logs.length - 1);
    
    const energy = last7Logs.map((l, index) => {
      const x = padding + index * intervalX;
      const y = svgHeight - padding - ((l.energyLevel - 1) / 9) * (svgHeight - padding * 2);
      return { x, y, log: l };
    });

    const stress = last7Logs.map((l, index) => {
      const x = padding + index * intervalX;
      const y = svgHeight - padding - ((l.stressLevel - 1) / 9) * (svgHeight - padding * 2);
      return { x, y, log: l };
    });

    return { energy, stress };
  }, [last7Logs]);

  return (
    <div id="dashboard-container" className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30">
      {/* Sticky Upper Navigation */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-4 py-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <span className="text-lg font-bold font-heading text-white tracking-tight">WORKSPACE.IO</span>
              <span className="ml-2 hidden md:inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest bg-blue-500/10 text-blue-400 rounded border border-blue-500/20">
                Secure Sandbox Session
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Nav Tabs */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  activeTab === 'notes'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Study Notebook
              </button>
            </div>

            {/* User Avatar & Info */}
            <div className="flex items-center gap-2.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              <UserIcon className="h-3.5 w-3.5 text-blue-400" />
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-slate-200">{user?.username}</p>
              </div>
            </div>

            {/* Logout */}
            <button
              id="logout-btn"
              onClick={logout}
              title="Logout from study sandbox"
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Core Container */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* Welcome Board */}
        <div className="p-6 sm:p-8 bg-gradient-to-br from-slate-900 to-indigo-950/20 border border-slate-900 rounded-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white tracking-tight">
              Aesthetic Wellness & Study Tracker 🌌
            </h2>
            <p className="text-slate-400 max-w-2xl text-xs sm:text-sm leading-relaxed">
              Maintain a detailed log of your emotional wellness, stress variables, energy metrics, and hours of productive study. Your data stays localized and securely partitioned.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-900">
              <Clock className="h-3.5 w-3.5 text-blue-400" />
              Isolated DB Active
            </span>
            <span className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-900">
              <Heart className="h-3.5 w-3.5 text-rose-400" />
              {logs.length} Logged Days
            </span>
          </div>
        </div>

        {/* Tab 1: Analytics / Dashboard Metrics */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LOGGER PANEL (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-400" />
                    <h3 className="font-heading font-semibold text-white text-base">Daily Workspace Entry</h3>
                  </div>
                  <input
                    id="log-date-picker"
                    type="date"
                    value={selectedDate}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-slate-950 text-slate-300 text-xs px-2 py-1 rounded border border-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <form onSubmit={handleSaveWellness} className="space-y-5">
                  
                  {/* Today's Mood */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Today's Mood
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {Object.entries(MOOD_EMOJIS).map(([key, item]) => (
                        <button
                          key={key}
                          type="button"
                          id={`mood-btn-${key.toLowerCase()}`}
                          onClick={() => setMood(key as WellnessLog['mood'])}
                          title={item.label}
                          className={`p-2.5 rounded-lg border text-lg flex flex-col items-center gap-1 transition-all duration-150 cursor-pointer ${
                            mood === key 
                              ? `${item.color} ring-2 ring-blue-500/30 scale-105` 
                              : `bg-slate-950/60 border-slate-900 text-slate-400 ${item.hover}`
                          }`}
                        >
                          <span>{item.char}</span>
                          <span className="text-[9px] font-medium hidden sm:block">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Stress Level */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <label htmlFor="stress-slider" className="font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Brain className="h-3.5 w-3.5 text-indigo-400" /> Stress Level
                      </label>
                      <span className="text-indigo-400 font-bold font-mono bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">{stressLevel} / 10</span>
                    </div>
                    <input
                      id="stress-slider"
                      type="range"
                      min="1"
                      max="10"
                      value={stressLevel}
                      onChange={(e) => setStressLevel(parseInt(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer bg-slate-950 rounded-lg h-1.5"
                    />
                  </div>

                  {/* Energy Level */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <label htmlFor="energy-slider" className="font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Coffee className="h-3.5 w-3.5 text-amber-400" /> Energy Level
                      </label>
                      <span className="text-amber-400 font-bold font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">{energyLevel} / 10</span>
                    </div>
                    <input
                      id="energy-slider"
                      type="range"
                      min="1"
                      max="10"
                      value={energyLevel}
                      onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer bg-slate-950 rounded-lg h-1.5"
                    />
                  </div>

                  {/* Productivity Variables Row */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Sleep Hours */}
                    <div className="space-y-1.5">
                      <label htmlFor="sleep-hours-input" className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                        Sleep Hours
                      </label>
                      <input
                        id="sleep-hours-input"
                        type="number"
                        min="0"
                        max="24"
                        step="0.5"
                        required
                        value={sleepHours}
                        onChange={(e) => setSleepHours(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-900 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-sm text-center font-semibold font-mono"
                      />
                    </div>

                    {/* Study Hours */}
                    <div className="space-y-1.5">
                      <label htmlFor="study-hours-input" className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                        Study Hours
                      </label>
                      <input
                        id="study-hours-input"
                        type="number"
                        min="0"
                        max="24"
                        step="0.5"
                        required
                        value={studyHours}
                        onChange={(e) => setStudyHours(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-900 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-sm text-center font-semibold font-mono"
                      />
                    </div>
                  </div>

                  {/* Daily Journal */}
                  <div className="space-y-1.5">
                    <label htmlFor="journal-textarea" className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Daily Study Journal
                    </label>
                    <textarea
                      id="journal-textarea"
                      rows={3}
                      placeholder="Today I focused on... Rested well... Felt slightly stressed due to..."
                      value={journal}
                      onChange={(e) => setJournal(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-900 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-xs resize-none"
                    />
                  </div>

                  {/* Save Button */}
                  <Button
                    id="save-wellness-btn"
                    type="submit"
                    disabled={loggingStatus === 'saving'}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    {loggingStatus === 'saving' ? (
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : loggingStatus === 'success' ? (
                      <span className="flex items-center gap-1"><Check className="h-4 w-4" /> Entry Saved!</span>
                    ) : (
                      'Save Today\'s Entry'
                    )}
                  </Button>
                </form>
              </div>
            </div>

            {/* ANALYTICS CHARTS & GRID (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* BENTO STATISTICS GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                
                {/* Sleep Stat */}
                <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-4 flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Avg Sleep (7D)</span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-2xl sm:text-3xl font-bold font-heading text-emerald-400">{weeklySummaryStats.avgSleep}</span>
                    <span className="text-xs text-slate-500 font-medium">hrs / night</span>
                  </div>
                  <div className="h-1 bg-slate-950 rounded-full overflow-hidden mt-3">
                    <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (weeklySummaryStats.avgSleep / 8) * 100)}%` }} />
                  </div>
                </div>

                {/* Study Hours Stat */}
                <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-4 flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Total Study (7D)</span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-2xl sm:text-3xl font-bold font-heading text-blue-400">{weeklySummaryStats.totalStudy}</span>
                    <span className="text-xs text-slate-500 font-medium">hrs total</span>
                  </div>
                  <div className="h-1 bg-slate-950 rounded-full overflow-hidden mt-3">
                    <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (weeklySummaryStats.totalStudy / 40) * 100)}%` }} />
                  </div>
                </div>

                {/* Avg Energy Stat */}
                <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-4 flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Avg Energy (7D)</span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-2xl sm:text-3xl font-bold font-heading text-amber-400">{weeklySummaryStats.avgEnergy}</span>
                    <span className="text-xs text-slate-500 font-medium">/ 10</span>
                  </div>
                  <div className="h-1 bg-slate-950 rounded-full overflow-hidden mt-3">
                    <div className="h-full bg-amber-500" style={{ width: `${weeklySummaryStats.avgEnergy * 10}%` }} />
                  </div>
                </div>

                {/* Avg Stress Stat */}
                <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-4 flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Avg Stress (7D)</span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-2xl sm:text-3xl font-bold font-heading text-indigo-400">{weeklySummaryStats.avgStress}</span>
                    <span className="text-xs text-slate-500 font-medium">/ 10</span>
                  </div>
                  <div className="h-1 bg-slate-950 rounded-full overflow-hidden mt-3">
                    <div className="h-full bg-indigo-500" style={{ width: `${weeklySummaryStats.avgStress * 10}%` }} />
                  </div>
                </div>

              </div>

              {/* WEEKLY SUMMARY (STUDY & SLEEP) AND TIMELINE GRAPHS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Mood & Energy Timeline (Custom SVG) */}
                <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-900">
                    <div className="flex items-center gap-2">
                      <LineChart className="h-4 w-4 text-amber-400" />
                      <h4 className="font-heading font-semibold text-white text-sm">Mood & Energy Timeline</h4>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">Last 7 Days</span>
                  </div>

                  {last7Logs.length < 2 ? (
                    <div className="h-44 flex flex-col items-center justify-center text-center">
                      <AlertCircle className="h-8 w-8 text-slate-700 mb-2" />
                      <p className="text-xs text-slate-500">Need at least 2 days of logs to populate timeline trends.</p>
                    </div>
                  ) : (
                    <div className="w-full">
                      {/* Responsive SVG Chart */}
                      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full overflow-visible">
                        {/* Grid lines */}
                        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                          const y = padding + ratio * (svgHeight - padding * 2);
                          return (
                            <line
                              key={i}
                              x1={padding}
                              y1={y}
                              x2={svgWidth - padding}
                              y2={y}
                              stroke="#1e293b"
                              strokeWidth="1"
                              strokeDasharray="4 4"
                            />
                          );
                        })}

                        {/* Mood line rendering */}
                        <path
                          d={moodTimelinePoints ? `M ${moodTimelinePoints.map(p => `${p.x} ${p.y}`).join(' L ')}` : ''}
                          fill="none"
                          stroke="url(#moodGradient)"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />

                        {/* Mood gradients */}
                        <defs>
                          <linearGradient id="moodGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#38bdf8" />
                            <stop offset="100%" stopColor="#818cf8" />
                          </linearGradient>
                        </defs>

                        {/* Interactive circles and emoji tags */}
                        {moodTimelinePoints && moodTimelinePoints.map((pt, idx) => (
                          <g key={idx}>
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r="5"
                              className="fill-blue-400 stroke-slate-950 stroke-2"
                            />
                            {/* Short Date Label below */}
                            <text
                              x={pt.x}
                              y={svgHeight - 8}
                              textAnchor="middle"
                              className="fill-slate-500 text-[9px] font-mono"
                            >
                              {pt.log.date.substring(5)}
                            </text>
                            {/* Emoji hovering above point */}
                            <text
                              x={pt.x}
                              y={pt.y - 10}
                              textAnchor="middle"
                              className="text-[11px]"
                            >
                              {MOOD_EMOJIS[pt.log.mood]?.char}
                            </text>
                          </g>
                        ))}
                      </svg>
                      {/* Legend */}
                      <div className="flex justify-center items-center gap-4 text-[10px] text-slate-500 font-medium pt-2">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> Daily Mood Trend</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sleep vs Study Hours Graph (Custom SVG Side-By-Side Bar Chart) */}
                <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-900">
                    <div className="flex items-center gap-2">
                      <BarChart2 className="h-4 w-4 text-emerald-400" />
                      <h4 className="font-heading font-semibold text-white text-sm">Sleep vs. Study Hours</h4>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">Last 7 Days</span>
                  </div>

                  {last7Logs.length === 0 ? (
                    <div className="h-44 flex flex-col items-center justify-center text-center">
                      <AlertCircle className="h-8 w-8 text-slate-700 mb-2" />
                      <p className="text-xs text-slate-500">Log entries to view study / sleep balance metrics.</p>
                    </div>
                  ) : (
                    <div className="w-full">
                      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full overflow-visible">
                        {/* Horizontal grid lines */}
                        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                          const y = padding + ratio * (svgHeight - padding * 2);
                          return (
                            <line
                              key={i}
                              x1={padding}
                              y1={y}
                              x2={svgWidth - padding}
                              y2={y}
                              stroke="#1e293b"
                              strokeWidth="1"
                              strokeDasharray="4 4"
                            />
                          );
                        })}

                        {/* Draw double bar groups */}
                        {last7Logs.map((l, index) => {
                          const groupWidth = (svgWidth - padding * 2) / last7Logs.length;
                          const startX = padding + index * groupWidth + (groupWidth - 28) / 2;
                          
                          // Normalize sleep and study relative to max 12 hours
                          const maxHourVal = 12;
                          const sleepBarH = (l.sleepHours / maxHourVal) * (svgHeight - padding * 2);
                          const studyBarH = (l.studyHours / maxHourVal) * (svgHeight - padding * 2);

                          return (
                            <g key={index}>
                              {/* Sleep Bar (Emerald) */}
                              <rect
                                x={startX}
                                y={svgHeight - padding - sleepBarH}
                                width="12"
                                height={Math.max(2, sleepBarH)}
                                rx="3"
                                className="fill-emerald-500/80 hover:fill-emerald-400 cursor-help"
                                title={`Sleep: ${l.sleepHours} hrs`}
                              />
                              {/* Study Bar (Blue) */}
                              <rect
                                x={startX + 15}
                                y={svgHeight - padding - studyBarH}
                                width="12"
                                height={Math.max(2, studyBarH)}
                                rx="3"
                                className="fill-blue-500/80 hover:fill-blue-400 cursor-help"
                                title={`Study: ${l.studyHours} hrs`}
                              />
                              {/* Axis Date Label */}
                              <text
                                x={startX + 13}
                                y={svgHeight - 8}
                                textAnchor="middle"
                                className="fill-slate-500 text-[9px] font-mono"
                              >
                                {l.date.substring(5)}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                      {/* Legend */}
                      <div className="flex justify-center items-center gap-6 text-[10px] text-slate-500 font-medium pt-2">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-1.5 rounded bg-emerald-500" /> Sleep Hours</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-1.5 rounded bg-blue-500" /> Study Hours</span>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* QUICK INSIGHTS PANEL */}
              <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-900">
                  <Lightbulb className="h-4 w-4 text-blue-400" />
                  <h4 className="font-heading font-semibold text-white text-sm">Wellness & Study Insights</h4>
                </div>
                <div className="space-y-3.5">
                  {quickInsights.map((insight, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-3 bg-slate-950/60 border border-slate-900/80 rounded-xl text-slate-300 text-xs sm:text-sm flex items-start gap-3"
                    >
                      <div className="mt-0.5 shrink-0 text-blue-400">✨</div>
                      <p className="leading-relaxed">{insight}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* RECENT JOURNALS */}
              <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-900">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-indigo-400" />
                    <h4 className="font-heading font-semibold text-white text-sm">Study Journal Logs</h4>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">Chronological</span>
                </div>

                <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                  {logs.filter(l => l.journal).length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-6">Your daily logs don't have any journal entries yet. Log today to start your journey.</p>
                  ) : (
                    logs.filter(l => l.journal).map((log) => (
                      <div key={log.id} className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                            <CalendarDays className="h-3 w-3 text-indigo-400" />
                            {log.date}
                          </span>
                          <span className="text-[11px] font-semibold text-blue-400 flex items-center gap-1">
                            Mood: {MOOD_EMOJIS[log.mood]?.char} {log.mood}
                          </span>
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed italic">
                          "{log.journal}"
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab 2: Study Notebook (Preserving Existing Core Functionality) */}
        {activeTab === 'notes' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Create Note Column */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900/60 border border-slate-900 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
                  <PlusCircle className="h-5 w-5 text-blue-400" />
                  <h3 className="font-heading font-semibold text-white text-base">New Study Note</h3>
                </div>

                <form onSubmit={handleCreateNote} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="note-title-input" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Title
                    </label>
                    <input
                      id="note-title-input"
                      type="text"
                      required
                      placeholder="Enter study topic title"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="note-category-select" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Category
                    </label>
                    <select
                      id="note-category-select"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-sm shadow-inner"
                    >
                      <option value="General">General</option>
                      <option value="Assignments">Assignments</option>
                      <option value="Exams">Exams</option>
                      <option value="Research">Research</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="note-content-textarea" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Content
                    </label>
                    <textarea
                      id="note-content-textarea"
                      required
                      rows={4}
                      placeholder="Write detailed notes, study reminders, or session thoughts here..."
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-sm resize-none"
                    />
                  </div>

                  <Button
                    id="create-note-btn"
                    type="submit"
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Add to Notebook
                  </Button>
                </form>
              </div>
            </div>

            {/* Notes List Column */}
            <div className="lg:col-span-8 space-y-4">
              <AnimatePresence mode="popLayout">
                {notes.length === 0 ? (
                  <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-12 text-center">
                    <Inbox className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <h4 className="text-base font-semibold text-slate-300 mb-1">Notebook is empty</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Start logging your assignments, research summaries, and study resources using the form on the left.
                    </p>
                  </div>
                ) : (
                  notes.map((note) => (
                    <motion.div
                      key={note.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.2 }}
                      className="bg-slate-900/40 border border-slate-900 hover:border-slate-800 rounded-xl p-5 shadow-sm transition-colors duration-150 relative group"
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-950 text-slate-400 rounded-full border border-slate-900 flex items-center gap-1">
                              {note.category}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(note.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-white tracking-tight leading-tight">
                            {note.title}
                          </h4>
                        </div>

                        {/* Delete note */}
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1.5 rounded-lg bg-slate-950 border border-slate-900 text-slate-500 hover:text-red-400 hover:border-red-500/20 active:scale-95 transition-all cursor-pointer"
                          title="Delete note"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                        {note.content}
                      </p>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
