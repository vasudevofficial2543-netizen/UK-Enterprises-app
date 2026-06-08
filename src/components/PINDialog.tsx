/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Unlock, ShieldAlert, KeyRound } from 'lucide-react';

interface PINDialogProps {
  correctPin: string;
  onSuccess: () => void;
  isSettingMode?: boolean; // If true, we are setting a new PIN rather than unlocking
  onSetNewPin?: (pin: string) => void;
  onCancelSetting?: () => void;
}

export default function PINDialog({
  correctPin,
  onSuccess,
  isSettingMode = false,
  onSetNewPin,
  onCancelSetting,
}: PINDialogProps) {
  const [pin, setPin] = useState<string>('');
  const [errorCount, setErrorCount] = useState<number>(0);
  const [shake, setShake] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string>(
    isSettingMode ? 'Set a new 4-digit PIN lock code' : 'Access Restricted - Enter Owner Passcode'
  );

  // Keypad keys
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Clear', '0', 'Delete'];

  const handleKeyPress = (value: string) => {
    if (value === 'Clear') {
      setPin('');
      return;
    }

    if (value === 'Delete') {
      setPin((prev) => prev.slice(0, -1));
      return;
    }

    if (pin.length < 4) {
      const nextPin = pin + value;
      setPin(nextPin);
    }
  };

  // Keyboard navigation support - lets owner type directly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(key)) {
        if (pin.length < 4) setPin((prev) => prev + key);
      } else if (key === 'Enter') {
        // Trigger submit
      } else if (key === 'Backspace') {
        setPin((prev) => prev.slice(0, -1));
      } else if (key === 'Escape' && isSettingMode && onCancelSetting) {
        onCancelSetting();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, isSettingMode, onCancelSetting]);

  useEffect(() => {
    // When 4 digits are completed, check automatically!
    if (pin.length === 4) {
      if (isSettingMode) {
        if (onSetNewPin) {
          onSetNewPin(pin);
          onSuccess();
          setPin('');
          setFeedbackMsg('New passcode configured successfully');
        }
      } else {
        if (pin === correctPin) {
          setFeedbackMsg('Access granted. Welcome back!');
          setTimeout(() => {
            onSuccess();
          }, 300);
        } else {
          setShake(true);
          setPin('');
          setErrorCount((prev) => prev + 1);
          setFeedbackMsg('Password incorrect. Please verify credentials!');
          setTimeout(() => setShake(false), 500);
        }
      }
    }
  }, [pin, correctPin, isSettingMode, onSetNewPin, onSuccess]);

  return (
    <div id="pin-lock-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 text-slate-800 p-4 backdrop-blur-md">
      {/* Background lights */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className={`w-full max-w-[340px] bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)] text-center relative ${
          shake ? 'animate-bounce' : ''
        }`}
        style={{
          animation: shake ? 'shake 0.5s ease-in-out' : undefined,
        }}
      >
        {/* Style injection for shake animation */}
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
            20%, 40%, 60%, 80% { transform: translateX(6px); }
          }
        `}</style>

        {/* Lock emblem */}
        <div id="pin-lock-emblem" className="flex justify-center mb-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            {isSettingMode ? (
              <KeyRound className="w-8 h-8 text-indigo-600 animate-pulse" />
            ) : errorCount > 0 ? (
              <ShieldAlert className="w-8 h-8 text-red-500 animate-pulse" />
            ) : (
              <Lock className="w-8 h-8 text-indigo-600" />
            )}
          </div>
        </div>

        {/* Header descriptions */}
        <h2 className="text-lg font-bold tracking-tight text-slate-800 font-sans">
          {isSettingMode ? 'Setup Owner Lock' : 'UK Enterprises Gate'}
        </h2>
        <p className={`text-xs mt-1 font-medium transition-all ${
          errorCount > 0 && !isSettingMode ? 'text-red-500 font-semibold font-sans' : 'text-slate-400 font-sans'
        }`}>
          {feedbackMsg}
        </p>

        {/* Passcode dots UI */}
        <div className="flex justify-center gap-4 my-8">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`w-4 h-4 rounded-full border transition-all duration-150 ${
                index < pin.length
                  ? isSettingMode
                    ? 'bg-indigo-600 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.4)]'
                    : 'bg-emerald-600 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                  : 'bg-slate-105 border-slate-100 shadow-inner'
              }`}
            />
          ))}
        </div>

        {/* Tactile Keypad */}
        <div className="grid grid-cols-3 gap-3">
          {keys.map((key) => {
            const isWordKey = ['Clear', 'Delete'].includes(key);
            return (
              <motion.button
                key={key}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleKeyPress(key)}
                className={`py-4 rounded-2xl text-lg font-bold select-none cursor-pointer border ${
                  isWordKey
                    ? 'bg-slate-50 border-slate-100 hover:bg-slate-100 text-xs text-slate-500 uppercase tracking-wider font-mono font-bold'
                    : 'bg-slate-50 border-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-800 font-sans font-extrabold text-xl'
                } transition-all duration-100 shadow-sm flex items-center justify-center`}
              >
                {key}
              </motion.button>
            );
          })}
        </div>

        {/* Back button for setting mode */}
        {isSettingMode && onCancelSetting && (
          <button
            onClick={onCancelSetting}
            className="mt-5 text-xs text-slate-400 hover:text-indigo-600 font-sans tracking-wider font-bold transition-colors outline-none cursor-pointer block mx-auto"
          >
            Cancel Lock Configuration
          </button>
        )}

        {/* Support device help instruction */}
        <p className="text-[10px] text-slate-400 font-sans mt-4">
          Fully optimized for numeric keypads & touch interfaces
        </p>
      </motion.div>
    </div>
  );
}
