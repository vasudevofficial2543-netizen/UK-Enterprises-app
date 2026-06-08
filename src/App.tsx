/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import LoadingScreen from './components/LoadingScreen';
import PINDialog from './components/PINDialog';
import MainScreen from './components/MainScreen';
import ShutdownScreen from './components/ShutdownScreen';
import { PhoneSale, GeneralExpense, AppSettings } from './types';

// Default corporate seeds to demonstrate dynamic accounting calculations immediately
const INITIAL_SALES_SEED: PhoneSale[] = [];

const INITIAL_EXPENSES_SEED: GeneralExpense[] = [];

const DEFAULT_SETTINGS: AppSettings = {
  pinLockEnabled: true,
  pinCode: '1234', // Default seed passcode
  serverIsOnline: true, // Default Simulated App Server active
};

export default function App() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [appUnlocked, setAppUnlocked] = useState<boolean>(false);

  // Core Persistent States
  const [sales, setSales] = useState<PhoneSale[]>([]);
  const [expenses, setExpenses] = useState<GeneralExpense[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Database initialization on component mount
  useEffect(() => {
    // 1. Fetch sales
    const savedSales = localStorage.getItem('uk_phonify_sales_v2');
    if (savedSales) {
      setSales(JSON.parse(savedSales));
    } else {
      setSales(INITIAL_SALES_SEED);
      localStorage.setItem('uk_phonify_sales_v2', JSON.stringify(INITIAL_SALES_SEED));
    }

    // 2. Fetch expenses
    const savedExpenses = localStorage.getItem('uk_phonify_expenses_v2');
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    } else {
      setExpenses(INITIAL_EXPENSES_SEED);
      localStorage.setItem('uk_phonify_expenses_v2', JSON.stringify(INITIAL_EXPENSES_SEED));
    }

    // 3. Fetch configurations
    const savedSettings = localStorage.getItem('uk_phonify_settings_v2');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    } else {
      setSettings(DEFAULT_SETTINGS);
      localStorage.setItem('uk_phonify_settings_v2', JSON.stringify(DEFAULT_SETTINGS));
    }
  }, []);

  // --- MUTATOR HELPERS (Auto persistent) ---
  const handleAddSale = (newSale: Omit<PhoneSale, 'id' | 'timestamp'>) => {
    const saleWithMeta: PhoneSale = {
      ...newSale,
      id: `sale-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [saleWithMeta, ...sales];
    setSales(updated);
    localStorage.setItem('uk_phonify_sales_v2', JSON.stringify(updated));
  };

  const handleAddExpense = (newExpense: Omit<GeneralExpense, 'id' | 'timestamp'>) => {
    const expenseWithMeta: GeneralExpense = {
      ...newExpense,
      id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [expenseWithMeta, ...expenses];
    setExpenses(updated);
    localStorage.setItem('uk_phonify_expenses_v2', JSON.stringify(updated));
  };

  const handleDeleteSale = (id: string) => {
    const updated = sales.filter((item) => item.id !== id);
    setSales(updated);
    localStorage.setItem('uk_phonify_sales_v2', JSON.stringify(updated));
  };

  const handleDeleteExpense = (id: string) => {
    const updated = expenses.filter((item) => item.id !== id);
    setExpenses(updated);
    localStorage.setItem('uk_phonify_expenses_v2', JSON.stringify(updated));
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('uk_phonify_settings_v2', JSON.stringify(newSettings));
  };

  const handleResetLedger = () => {
    setSales([]);
    setExpenses([]);
    const clearedSettings = { ...settings, pinLockEnabled: false };
    setSettings(clearedSettings);
    
    localStorage.setItem('uk_phonify_sales_v2', JSON.stringify([]));
    localStorage.setItem('uk_phonify_expenses_v2', JSON.stringify([]));
    localStorage.setItem('uk_phonify_settings_v2', JSON.stringify(clearedSettings));
    setAppUnlocked(true); // reset unlock
  };

  // Render Pipeline
  // Screen A: Visual Brand Loading Splash Reveal
  if (isLoading) {
    return <LoadingScreen onFinished={() => setIsLoading(false)} />;
  }

  // Server Shutdown Verification Gate: if server is off, block the app
  if (!settings.serverIsOnline) {
    return (
      <ShutdownScreen
        correctPin={settings.pinCode}
        onReactivate={() => {
          handleUpdateSettings({ ...settings, serverIsOnline: true });
        }}
      />
    );
  }

  // Screen B: passcode Lock gate (If enabled)
  if (settings.pinLockEnabled && !appUnlocked) {
    return (
      <PINDialog
        correctPin={settings.pinCode}
        onSuccess={() => setAppUnlocked(true)}
        isSettingMode={false}
      />
    );
  }

  // Screen C: Core Interactive Navigation workspace and Business metrics
  return (
    <MainScreen
      sales={sales}
      expenses={expenses}
      settings={settings}
      onAddSale={handleAddSale}
      onAddExpense={handleAddExpense}
      onDeleteSale={handleDeleteSale}
      onDeleteExpense={handleDeleteExpense}
      onUpdateSettings={handleUpdateSettings}
      onResetLedger={handleResetLedger}
    />
  );
}
