/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Cpu, Database, Network } from 'lucide-react';

interface LoadingScreenProps {
  onFinished: () => void;
}

export default function LoadingScreen({ onFinished }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState('Securing UK-Ledger database Connection...');

  useEffect(() => {
    const totalDuration = 2400; // 2.4 seconds loading
    const intervalTime = 30;
    const increment = (100 / (totalDuration / intervalTime));

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    // Dynamic logging texts to make it feel highly realistic and professional
    const textTimer1 = setTimeout(() => {
      setStepText('Verifying client sandbox local parameters...');
    }, 600);

    const textTimer2 = setTimeout(() => {
      setStepText('Booting PhonifyMobiles telemetry hub...');
    }, 1200);

    const textTimer3 = setTimeout(() => {
      setStepText('Checking credential profiles & secure locks...');
    }, 1800);

    const textTimer4 = setTimeout(() => {
      setStepText('System ready. Loading dashboard!');
    }, 2250);

    const finishTimer = setTimeout(() => {
      onFinished();
    }, totalDuration + 250);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(textTimer1);
      clearTimeout(textTimer2);
      clearTimeout(textTimer3);
      clearTimeout(textTimer4);
      clearTimeout(finishTimer);
    };
  }, [onFinished]);

  return (
    <div id="loading-screen" className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800 font-sans overflow-hidden">
      {/* Absolute ambient lights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Branding Block */}
      <div className="relative flex flex-col items-center max-w-sm px-6 text-center">
        {/* Animated Custom Logo Emblem */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative mb-6"
        >
          {/* Logo Frame: Crown Shield Logo */}
          <div className="relative flex items-center justify-center w-24 h-24 rounded-3xl bg-white border-2 border-indigo-100 shadow-xl shadow-indigo-100/30">
            {/* Decorative decorative ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
              className="absolute inset-[3px] rounded-2xl border border-dashed border-indigo-400/40"
            />
            {/* Crown Shield SVG */}
            <svg 
              className="w-12 h-12 text-indigo-600" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>

          {/* Spark pulse */}
          <span className="absolute top-0 right-0 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-200 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-600"></span>
          </span>
        </motion.div>

        {/* Corporate Titles */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-3xl font-black tracking-tight text-slate-800 mb-1 font-sans"
        >
          UK ENTERPRISES
        </motion.h1>
        
        <motion.p
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-xs tracking-widest text-indigo-600 font-mono mb-8 uppercase font-bold"
        >
          Corporate retail & engineering workspace
        </motion.p>

        {/* Progress bar container */}
        <div id="loader-progress-box" className="w-56 h-1 w-full bg-slate-200 rounded-full overflow-hidden mb-4 relative">
          <motion.div
            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Dynamic Log Steps */}
        <div className="flex items-center gap-2 text-slate-500 text-xs font-mono justify-center h-5">
          <motion.p
            key={stepText}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-center text-slate-400 text-[11px] font-sans font-medium truncate max-w-[280px]"
          >
            {stepText}
          </motion.p>
        </div>

        {/* Loading details */}
        <span className="text-[10px] text-slate-405 font-sans mt-8 block font-medium">
          Client Build v2.4.9 • HTTPS Secured
        </span>
      </div>
    </div>
  );
}
