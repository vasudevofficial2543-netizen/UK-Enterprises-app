/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, Smartphone, ShieldCheck, 
  ArrowRight, ShieldAlert, Cpu, Network, Database, LogOut, Code, Clock, BarChart3, HelpCircle, Layers, Sun, Moon
} from 'lucide-react';
import { PhoneSale, GeneralExpense, AppSettings } from '../types';
import PhonifyDashboard from './PhonifyDashboard';
import ControlPanel from './ControlPanel';
import PINDialog from './PINDialog';

interface MainScreenProps {
  sales: PhoneSale[];
  expenses: GeneralExpense[];
  settings: AppSettings;
  onAddSale: (sale: Omit<PhoneSale, 'id' | 'timestamp'>) => void;
  onAddExpense: (expense: Omit<GeneralExpense, 'id' | 'timestamp'>) => void;
  onDeleteSale: (id: string) => void;
  onDeleteExpense: (id: string) => void;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onResetLedger: () => void;
}

export default function MainScreen({
  sales,
  expenses,
  settings,
  onAddSale,
  onAddExpense,
  onDeleteSale,
  onDeleteExpense,
  onUpdateSettings,
  onResetLedger,
}: MainScreenProps) {
  const [currentSection, setCurrentSection] = useState<'home' | 'phonify' | 'controls'>('home');
  const [showPinUnlockGate, setShowPinUnlockGate] = useState<boolean>(false);
  const [unlockedSections, setUnlockedSections] = useState<Record<string, boolean>>({});
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => localStorage.getItem('uk_theme_mode') === 'dark');

  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    localStorage.setItem('uk_theme_mode', nextDark ? 'dark' : 'light');
  };

  // Compute total sales volume and overall metrics for previews
  const totalRevenue = sales.reduce((sum, item) => sum + item.sellingPrice + item.serviceCost, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0) + sales.reduce((sum, item) => sum + item.originalPrice, 0);
  const totalProfit = totalRevenue - totalExpenses;

  const handleSectionNavigate = (section: 'home' | 'phonify' | 'controls') => {
    if (section === 'controls') {
      if (settings.pinLockEnabled && !unlockedSections['controls']) {
        setShowPinUnlockGate(true);
        return;
      }
    }
    setCurrentSection(section);
  };

  const handleUnlockPinSuccess = () => {
    setUnlockedSections((prev) => ({ ...prev, controls: true }));
    setShowPinUnlockGate(false);
    setCurrentSection('controls');
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100 dark' : 'bg-slate-50 text-slate-800'}`}>
      {/* Top Professional Navigation Ribbon */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-all duration-300 ${
        isDarkMode 
          ? 'bg-slate-900/90 border-slate-800 shadow-[0_2px_15px_rgba(0,0,0,0.2)] text-white' 
          : 'bg-white/80 border-slate-200/60 shadow-[0_2px_15px_rgba(0,0,0,0.01)]'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div 
            onClick={() => setCurrentSection('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 flex items-center justify-center text-white font-extrabold text-sm tracking-tighter shadow-sm group-hover:from-indigo-500 group-hover:to-indigo-700 transition-all duration-300">
              UK
            </div>
            <div>
              <h1 className={`text-sm font-extrabold tracking-wider leading-none transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                UK ENTERPRISES
              </h1>
              <span className="text-[9px] hover:text-indigo-600 font-mono text-indigo-600 font-bold uppercase mt-1 block">Retail & Logistics</span>
            </div>
          </div>

          {/* Quick Breadcrumbs for desktop & tabs */}
          <div className="flex items-center gap-3">
            <nav className="flex items-center gap-1.5 font-mono text-xs">
              <button
                onClick={() => setCurrentSection('home')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer border ${
                  currentSection === 'home' 
                    ? isDarkMode ? 'bg-indigo-950/60 border-indigo-900 text-indigo-400 font-bold shadow-sm' : 'bg-indigo-50 border-indigo-100 text-indigo-600 font-bold shadow-sm' 
                    : isDarkMode ? 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800' : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                HOME
              </button>
              
              <button
                onClick={() => setCurrentSection('phonify')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border ${
                  currentSection === 'phonify' 
                    ? isDarkMode ? 'bg-indigo-950/60 border-indigo-900 text-indigo-400 font-bold shadow-sm' : 'bg-indigo-50 border-indigo-100 text-indigo-600 font-bold shadow-sm'  
                    : isDarkMode ? 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800' : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-indigo-500" />
                <span>PHONIFYMOBILES</span>
              </button>

              <button
                onClick={() => handleSectionNavigate('controls')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border ${
                  currentSection === 'controls' 
                    ? isDarkMode ? 'bg-slate-800 border-slate-750 text-white font-bold shadow-sm' : 'bg-slate-900 border-slate-950 text-white font-bold shadow-sm' 
                    : isDarkMode ? 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800' : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
                <span>CONTROL PANEL</span>
              </button>
            </nav>

            {/* Elegant Sun / Moon switcher */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700/60' 
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200/60'
              }`}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area Wrap */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
        <AnimatePresence mode="wait">
          {/* 1. UK ENTERPRISES HOME SECTION */}
          {currentSection === 'home' && (
            <motion.div
              key="home-section"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Sleek Navigation and Stats Hub Header */}
              <div id="corporate-welcome-card" className={`relative p-6 rounded-3xl border transition-all overflow-hidden ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-white shadow-none' : 'bg-white border-slate-200/80 shadow-[0_4px_22px_rgba(0,0,0,0.02)]'
              }`}>
                {/* Visual grid accent */}
                <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="space-y-2">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider font-bold ${
                      isDarkMode ? 'bg-indigo-950/50 border border-indigo-900 text-indigo-400' : 'bg-indigo-50 border border-indigo-100/80 text-indigo-700'
                    }`}>
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" /> UK ENTERPRISES ADMIN HUB
                    </div>
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-indigo-600" />
                      <h2 className="text-xl font-bold tracking-tight font-sans">
                        Retail Management Station
                      </h2>
                    </div>
                  </div>
                  
                  {/* Status pills or neat controls */}
                  <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold border ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-150 text-slate-600'}`}>
                      <Layers className="w-3.5 h-3.5 text-indigo-600" />
                      Ledger Status: Active
                    </span>
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold border ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-150 text-slate-600'}`}>
                      <Network className="w-3.5 h-3.5 text-indigo-600" />
                      Port 3000 Secured
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid: Sub-Division Directory */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5 justify-start">
                  <Building2 className="w-3.5 h-3.5 text-indigo-500" /> Sub-Division Registers
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Division 1: Phonifymobiles specialized workshop */}
                  <div 
                    onClick={() => setCurrentSection('phonify')}
                    id="phonify-division-card" 
                    className={`group relative p-6 border rounded-3xl cursor-pointer transition-all duration-300 transform scroll-smooth ${
                      isDarkMode 
                        ? 'bg-slate-900 hover:bg-slate-850 border-slate-800 hover:border-indigo-500 text-white shadow-none' 
                        : 'bg-white hover:bg-slate-50/50 border-slate-200/80 hover:border-indigo-400 shadow-[0_4px_22px_rgba(0,0,0,0.02)] hover:shadow-xl hover:shadow-indigo-500/5'
                    }`}
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 group-hover:bg-indigo-500/10 rounded-bl-3xl transition-colors" />

                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-2xl border transition-colors ${
                        isDarkMode ? 'bg-slate-950 border-slate-800 text-indigo-400' : 'bg-indigo-50 border-indigo-100/65 text-indigo-600'
                      }`}>
                        <Smartphone className="w-6 h-6 animate-pulse" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-md font-bold font-sans transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900 group-hover:text-indigo-600'}`}>phonifyMOBILES</h4>
                          <span className="text-[9px] font-mono px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md font-bold tracking-wider">LEDGER ACTIVE</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 text-xs text-indigo-650 font-mono font-bold pt-2">
                          <span>OPEN SPECIALIZED WORKSPACE</span>
                          <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Division 2: Stats Hub preview */}
                  <div id="general-stats-card" className={`relative p-6 border rounded-3xl transition-colors ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-white shadow-none' : 'bg-white border-slate-200/85 shadow-[0_4px_22px_rgba(0,0,0,0.02)]'
                  }`}>
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-2xl border ${
                        isDarkMode ? 'bg-slate-950 border-slate-800 text-violet-400' : 'bg-violet-105 bg-indigo-50 text-violet-600 border-violet-100'
                      }`}>
                        <BarChart3 className="w-6 h-6" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <h4 className="text-md font-bold font-sans">Corporate Consolidated Preview</h4>
                        
                        {/* Live mini stats values */}
                        <div className="grid grid-cols-2 gap-4 pt-1 font-mono text-xs">
                          <div className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-200/50'}`}>
                            <span className="text-[10px] text-slate-400 block font-bold">Consolidated Sales</span>
                            <span className={`text-sm font-extrabold mt-1 block ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>₹{totalRevenue.toLocaleString()}</span>
                          </div>
                          <div className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-200/50'}`}>
                            <span className="text-[10px] text-slate-400 block font-bold">Consolidated Net</span>
                            <span className={`text-sm font-extrabold mt-1 block ${totalProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                              ₹{totalProfit.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Corporate details section */}
              <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 border-t pt-6 font-mono text-[11px] ${
                isDarkMode ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'
              }`}>
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-500" />
                  <span>Secure storage: Local Database Sandbox</span>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-500" />
                  <span>Terminal Status: {settings.serverIsOnline ? 'Server Listener 3050 Active' : 'Stand-Alone Cache'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <span>Local Session: 2026 Active Ledger</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* 2. DEDICATED PHONIFYMOBILES WORKSPACE */}
          {currentSection === 'phonify' && (
            <motion.div
              key="phonify-section"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentSection('home')}
                    className="px-3.5 py-1.5 bg-slate-200/80 hover:bg-slate-250 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-mono font-bold tracking-wider cursor-pointer transition-colors border border-slate-300/60 shadow-sm"
                  >
                    ← BACK TO HOME
                  </button>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 font-sans flex items-center gap-2 leading-none">
                      <Smartphone className="w-5 h-5 text-indigo-600" /> PhonifyMobiles Division
                    </h2>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">Specialized workspace for retail and technical jobs</p>
                  </div>
                </div>

                <div className="text-right text-[10px] text-slate-400 font-mono">
                  Module Root: UK-ENT // ID: PhonifyMobiles
                </div>
              </div>

              {/* Direct dashboard component */}
              <PhonifyDashboard
                sales={sales}
                expenses={expenses}
                onAddSale={onAddSale}
                onAddExpense={onAddExpense}
                onDeleteSale={onDeleteSale}
                onDeleteExpense={onDeleteExpense}
                serverIsOnline={settings.serverIsOnline}
              />
            </motion.div>
          )}

          {/* 3. OWNER CONTROL PANEL SECTION */}
          {currentSection === 'controls' && (
            <motion.div
              key="config-section"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                <button
                  onClick={() => setCurrentSection('home')}
                  className="px-3.5 py-1.5 bg-slate-200/80 hover:bg-slate-250 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-mono font-bold tracking-wider cursor-pointer transition-colors border border-slate-300/60 shadow-sm"
                >
                  ← BACK TO HOME
                </button>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 font-sans leading-none">Owner Administration Panel</h2>
                  <p className="text-[11px] text-slate-400 font-mono mt-1">Configure root configurations, local sandbox resets, lock systems and app portals</p>
                </div>
              </div>

              <ControlPanel
                settings={settings}
                onUpdateSettings={onUpdateSettings}
                onResetLedger={onResetLedger}
                salesCount={sales.length}
                expensesCount={expenses.length}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Persistent global footer */}
      <footer className={`border-t py-5 px-4 text-center text-[10px] font-mono transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-slate-900 border-slate-800 text-slate-500 shadow-none' 
          : 'bg-white border-slate-200/80 text-slate-400 shadow-[0_-2px_15px_rgba(0,0,0,0.01)]'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>UK Enterprises Retail Hub • All Rights Reserved © 2026</span>
          <span className="flex items-center gap-1.5 font-mono">
            <span className={`w-2 h-2 rounded-full ${settings.serverIsOnline ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'}`} />
            <span>Virtual Cloud Engine: {settings.serverIsOnline ? 'ON (0.0.0.0:3000)' : 'SANDBOXED'}</span>
          </span>
        </div>
      </footer>

      {/* Dialog PIN unlock gate wrapper */}
      <AnimatePresence>
        {showPinUnlockGate && (
          <PINDialog
            correctPin={settings.pinCode}
            onSuccess={handleUnlockPinSuccess}
            onCancelSetting={() => setShowPinUnlockGate(false)}
            isSettingMode={false}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
