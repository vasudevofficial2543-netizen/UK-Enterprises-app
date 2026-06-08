/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, ServerCrash, Unlock, Sparkles, LogOut, Power } from 'lucide-react';

interface ShutdownScreenProps {
  correctPin: string;
  onReactivate: () => void;
}

export default function ShutdownScreen({ correctPin, onReactivate }: ShutdownScreenProps) {
  const [pin, setPin] = useState<string>('');
  const [errorWord, setErrorWord] = useState<string>('Connection Terminated');
  const [shake, setShake] = useState<boolean>(false);

  // Keyboard navigation support for typing passcode directly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(key)) {
        if (pin.length < 4) setPin((prev) => prev + key);
      } else if (key === 'Backspace') {
        setPin((prev) => prev.slice(0, -1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin]);

  useEffect(() => {
    if (pin.length === 4) {
      if (pin === correctPin) {
        setErrorWord('Verification accepted...');
        setTimeout(() => {
          onReactivate();
        }, 500);
      } else {
        setShake(true);
        setPin('');
        setErrorWord('Incorrect passcode');
        setTimeout(() => setShake(false), 500);
      }
    }
  }, [pin, correctPin, onReactivate]);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      setPin((prev) => prev + num);
    }
  };

  const handleClear = () => {
    setPin('');
  };

  return (
    <div id="shutdown-screen" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 text-slate-100 p-4 font-sans select-none overflow-hidden">
      {/* Dynamic background particles & visual elements */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{ animation: shake ? 'shake 0.5s ease-in-out' : undefined }}
        className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-center"
      >
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
            20%, 40%, 60%, 80% { transform: translateX(6px); }
          }
        `}</style>

        {/* Lock / Shutdown Status Header */}
        <div className="flex justify-center mb-5">
          <div className="relative">
            <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/20 text-red-500">
              <ServerCrash className="w-8 h-8 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600"></span>
            </span>
          </div>
        </div>

        <h2 className="text-xl font-bold tracking-tight text-white mb-1">
          Server Shutdown Triggered
        </h2>
        
        <p className={`text-xs ${shake ? 'text-red-400 font-bold' : 'text-slate-400'} font-mono mb-6 transition-all`}>
          {errorWord.toUpperCase()}
        </p>

        {/* Password Entry Visual Dots */}
        <div className="flex justify-center gap-3.5 mb-8">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-3.5 h-3.5 rounded-full border transition-all duration-150 ${
                idx < pin.length
                  ? 'bg-red-500 border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                  : 'bg-slate-950 border-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Digital Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2 px-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <motion.button
              key={num}
              whileTap={{ scale: 0.94 }}
              onClick={() => handleKeyPress(num)}
              className="py-3 bg-slate-950 hover:bg-slate-800 text-white border border-slate-850 font-extrabold text-lg rounded-xl transition-colors cursor-pointer"
            >
              {num}
            </motion.button>
          ))}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={handleClear}
            className="py-3 bg-slate-950 text-slate-400 border border-slate-850 text-[10px] font-bold font-mono tracking-wider rounded-xl uppercase hover:text-white cursor-pointer"
          >
            Clear
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => handleKeyPress('0')}
            className="py-3 bg-slate-950 hover:bg-slate-800 text-white border border-slate-850 font-extrabold text-lg rounded-xl transition-colors cursor-pointer"
          >
            0
          </motion.button>
          <div className="flex items-center justify-center p-3 text-[10px] text-slate-400 font-mono font-bold select-none border border-transparent">
            4-Digit
          </div>
        </div>

        <p className="text-[10px] text-slate-500 font-mono mt-6">
          System operational control: owner PIN verification required
        </p>
      </motion.div>
    </div>
  );
}
