/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Server, Shield, KeyRound, Radio, Database, HardDrive, RefreshCw, 
  Terminal, ShieldCheck, ShieldAlert, Cpu, Heart, CheckCircle2, AlertCircle, FileLock2, Trash2
} from 'lucide-react';
import { AppSettings } from '../types';
import PINDialog from './PINDialog';

interface ControlPanelProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onResetLedger: () => void;
  salesCount: number;
  expensesCount: number;
}

export default function ControlPanel({
  settings,
  onUpdateSettings,
  onResetLedger,
  salesCount,
  expensesCount,
}: ControlPanelProps) {
  const [logs, setLogs] = useState<Array<{ id: string; msg: string; type: 'info' | 'success' | 'warn' | 'error' }>>([]);
  const [tempIsOnline, setTempIsOnline] = useState<boolean>(settings.serverIsOnline);
  const [isConfiguringPin, setIsConfiguringPin] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // Generate simulated traffic logs
  useEffect(() => {
    // Initial logs
    setLogs([
      { id: '1', msg: 'System initialized. Secure local database storage parsed.', type: 'success' },
      { id: '2', msg: `Storage contains ${salesCount} Phone Sales records, ${expensesCount} General Expenses.`, type: 'info' },
      { id: '3', msg: `Parent Org UK Enterprises security layer online.`, type: 'info' },
      { id: '4', msg: `Sync Tunnel status: ${settings.serverIsOnline ? 'CONNECTED (Cloud Run API)' : 'SANDBOXED (Local Cache Only)'}`, type: settings.serverIsOnline ? 'success' : 'warn' },
    ]);
  }, []);

  // Scroll mock terminal log
  const addLog = (msg: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    const freshLog = {
      id: `${Date.now()}-${Math.random()}`,
      msg: `[${new Date().toLocaleTimeString()}] ${msg}`,
      type,
    };
    setLogs((prev) => [freshLog, ...prev.slice(0, 15)]);
  };

  const handleServerToggle = (currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    const update = { ...settings, serverIsOnline: nextStatus };
    onUpdateSettings(update);
    setTempIsOnline(nextStatus);

    if (nextStatus) {
      addLog('Enabling local and remote Express server connection...', 'info');
      setTimeout(() => {
        addLog('Host: 0.0.0.0 | Port: 3000 online routing. Dynamic proxy established!', 'success');
        addLog('Database synchronizer: ONLINE. Syncing client state in background.', 'success');
      }, 550);
    } else {
      addLog('App server offline toggle fired by Owner.', 'warn');
      setTimeout(() => {
        addLog('Express listeners cleared. App operating in Standalone Local Offline Mode.', 'warn');
        addLog('Sync operations halted. Save states are queued locally.', 'error');
      }, 550);
    }
  };

  const handlePinToggle = () => {
    if (settings.pinLockEnabled) {
      // Disabling PIN lock
      const update = { ...settings, pinLockEnabled: false };
      onUpdateSettings(update);
      addLog('Owner PIN Lock disabled successfully.', 'warn');
    } else {
      // Enabling PIN - force them to set it!
      setIsConfiguringPin(true);
    }
  };

  const saveNewPinCode = (newCode: string) => {
    const update = { ...settings, pinLockEnabled: true, pinCode: newCode };
    onUpdateSettings(update);
    setIsConfiguringPin(false);
    addLog(`Owner PIN Lock enabled successfully with Code: [ ${newCode} ]`, 'success');
  };

  return (
    <div id="control-panel-section" className="space-y-6 max-w-4xl mx-auto">
      {/* Visual Header */}
      <div className="flex flex-col md:flex-row items-center md:justify-between gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-[0_4px_22px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
          <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100 text-indigo-600">
            <Radio className={`w-8 h-8 ${settings.serverIsOnline ? 'animate-pulse text-indigo-600' : 'text-slate-400'}`} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-855 leading-tight font-sans">Owner Control Panel & Operations</h2>
            <p className="text-xs text-slate-400 font-sans mt-1">Configure security layers, memory bounds, and simulated full-stack servers</p>
          </div>
        </div>

        {/* Server state pill */}
        <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2 font-mono text-xs ${
          settings.serverIsOnline 
            ? 'bg-emerald-50 text-emerald-600 border-emerald-200 font-bold' 
            : 'bg-slate-50 text-slate-400 border-slate-200 font-bold'
        }`}>
          <span className={`w-2.5 h-2.5 rounded-full ${settings.serverIsOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
          <span>SERVER: {settings.serverIsOnline ? 'ONLINE' : 'OFFLINE'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module A: Server Controller */}
        <div id="server-config" className="bg-white border border-slate-200 rounded-3xl p-6 shadow-[0_4px_22px_rgba(0,0,0,0.02)] relative overflow-hidden">
          {/* Subtle logo vector */}
          <Server className="absolute -bottom-6 -right-6 w-32 h-32 text-slate-200/20 pointer-events-none" />

          <h3 className="text-sm font-bold tracking-wider text-slate-600 uppercase font-mono mb-4 flex items-center gap-2">
            <Radio className="w-4 h-4 text-indigo-500" /> Server Control Engine
          </h3>

          <p className="text-xs text-slate-500 font-sans mb-6 leading-relaxed">
            Toggle virtual database connection. ON simulates remote cloud synchronization. OFF shuts down listeners and suspends sync operations.
          </p>

          {/* Large Master Switch Switch */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-105 shadow-inner mb-6">
            <div className="flex gap-3 items-center">
              <Server className={`w-5 h-5 ${settings.serverIsOnline ? 'text-indigo-500' : 'text-slate-400'}`} />
              <div>
                <p className="text-sm font-bold text-slate-800 font-sans text-left">Corporate Express App Server</p>
                <p className={`text-[11px] font-mono text-left ${settings.serverIsOnline ? 'text-emerald-600 font-semibold' : 'text-slate-500'}`}>
                  {settings.serverIsOnline ? 'Listen thread 0.0.0.0:3000' : 'De-allocated thread pool'}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleServerToggle(settings.serverIsOnline)}
              id="server-on-off-toggle"
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.serverIsOnline ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.serverIsOnline ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Active Status Board */}
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-150">
              <p className="text-[10px] text-slate-400 font-bold font-sans">PING LATENCY</p>
              <p className="text-sm font-bold text-slate-700 mt-1">{settings.serverIsOnline ? '14 ms (OK)' : '∞ (TIMEOUT)'}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-150">
              <p className="text-[10px] text-slate-400 font-bold font-sans">REST LISTENERS</p>
              <p className="text-sm font-bold text-slate-700 mt-1">{settings.serverIsOnline ? '6 handlers active' : 'None'}</p>
            </div>
          </div>
        </div>

        {/* Module B: Security Locks Configuration */}
        <div id="security-config" className="bg-white border border-slate-200 rounded-3xl p-6 shadow-[0_4px_22px_rgba(0,0,0,0.02)] relative overflow-hidden">
          <Shield className="absolute -bottom-6 -right-6 w-32 h-32 text-slate-200/20 pointer-events-none" />

          <h3 className="text-sm font-bold tracking-wider text-slate-600 uppercase font-mono mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-500" /> Terminal PIN Locks
          </h3>

          <p className="text-xs text-slate-500 font-sans mb-6 leading-relaxed">
            Restrict unauthorized changes. Requires entering a 4-digit numeric passcode to unlock security-sensitive system settings.
          </p>

          <div className="space-y-4">
            {/* PIN Enable Row */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-105">
              <div className="flex items-center gap-3">
                <KeyRound className={`w-5 h-5 ${settings.pinLockEnabled ? 'text-indigo-500' : 'text-slate-400'}`} />
                <div>
                  <p className="text-sm font-bold text-slate-800 font-sans text-left">Owner PIN Restriction</p>
                  <p className="text-[10px] text-slate-400 font-mono text-left">Requires passcode dots verification on refresh</p>
                </div>
              </div>

              <button
                onClick={handlePinToggle}
                id="pin-lock-toggle"
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.pinLockEnabled ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.pinLockEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Change Code Trigger */}
            {settings.pinLockEnabled && (
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-105">
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-700 font-sans">Active passcode: <span className="text-indigo-600 font-mono tracking-widest ml-1 font-bold">{settings.pinCode}</span></p>
                  <p className="text-[10px] text-slate-400 font-sans mt-0.5">Click modify to set a new numeric credential</p>
                </div>

                <button
                  onClick={() => setIsConfiguringPin(true)}
                  id="modify-pin-button"
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-mono text-[11px] rounded-xl border border-indigo-200 font-bold cursor-pointer transition-all"
                >
                  MODIFY PIN
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Terminal logs viewer */}
      <div id="virtual-terminal" className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h4 className="text-xs font-semibold tracking-widest text-slate-400 uppercase font-mono flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" /> Virtual Server Console Output
          </h4>
          <span className="text-[10px] px-2 py-0.5 bg-slate-950 border border-slate-800 rounded-md font-mono text-slate-500 uppercase font-bold">
            Live Stream
          </span>
        </div>

        <div className="h-44 overflow-y-auto font-mono text-xs text-slate-300 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800 pr-2 text-left">
          {logs.map((log) => {
            let col = 'text-slate-400';
            if (log.type === 'success') col = 'text-emerald-400 font-medium';
            if (log.type === 'warn') col = 'text-amber-400';
            if (log.type === 'error') col = 'text-red-400 font-semibold';
            return (
              <div key={log.id} className="flex gap-2 leading-relaxed">
                <span className="text-slate-600 select-none">&gt;</span>
                <span className={col}>{log.msg}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Database Management Controls */}
      <div id="database-management" className="bg-white border border-red-100 rounded-3xl p-6 shadow-[0_4px_22px_rgba(0,0,0,0.02)]">
        <h3 className="text-sm font-bold tracking-wider text-red-500 uppercase font-mono mb-2 flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-red-500" /> Danger Zone
        </h3>
        <p className="text-xs text-slate-500 mb-4 leading-relaxed font-sans text-left">
          Erase all sales history, repair costs, and expenditure records permanently.
        </p>

        {showResetConfirm ? (
          <div className="flex items-center gap-3 p-4 bg-red-50/50 border border-red-200 rounded-2xl">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <div className="flex-1 text-left">
              <p className="text-xs font-bold text-red-700 uppercase">Are you absolutely sure?</p>
              <p className="text-[11px] text-slate-400">This action is completely destructive and cannot be undone.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onResetLedger();
                  setShowResetConfirm(false);
                  addLog('Entire local storage database WIPED.', 'error');
                }}
                id="confirm-erase-button"
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-mono text-[11px] rounded-xl font-bold cursor-pointer transition-colors"
              >
                YES, ERASE ALL
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-mono text-[11px] rounded-xl cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="text-left">
            <button
              onClick={() => setShowResetConfirm(true)}
              id="wipe-data-trigger"
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-mono text-xs rounded-xl border border-red-100 font-bold cursor-pointer transition-colors"
            >
              WIPE DEVICE LOCAL DATABASE
            </button>
          </div>
        )}
      </div>

      {/* Developer Credit Footer */}
      <div className="pt-8 border-t border-slate-200/60 dark:border-slate-800/80 text-center text-xs font-mono text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5">
        <span>Developed by</span>
        <span className="text-indigo-600 dark:text-indigo-400 font-bold font-sans">"Vasudev"</span>
        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
      </div>

      {/* Password configuration gate overlay */}
      <AnimatePresence>
        {isConfiguringPin && (
          <PINDialog
            correctPin=""
            isSettingMode={true}
            onSetNewPin={saveNewPinCode}
            onSuccess={() => {}}
            onCancelSetting={() => setIsConfiguringPin(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
