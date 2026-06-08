/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, Plus, Search, Filter, Trash2, ArrowUpRight, ArrowDownLeft, 
  Settings, Database, Smartphone, Wrench, Wallet, Layers, Download, CheckCircle, HelpCircle, AlertTriangle
} from 'lucide-react';
import { PhoneSale, GeneralExpense, BusinessReport } from '../types';
import CustomChart from './CustomChart';
import { downloadBusinessReport } from '../utils/pdfGenerator';

interface PhonifyDashboardProps {
  sales: PhoneSale[];
  expenses: GeneralExpense[];
  onAddSale: (sale: Omit<PhoneSale, 'id' | 'timestamp'>) => void;
  onAddExpense: (expense: Omit<GeneralExpense, 'id' | 'timestamp'>) => void;
  onDeleteSale: (id: string) => void;
  onDeleteExpense: (id: string) => void;
  currencySymbol?: string;
  serverIsOnline: boolean;
}

export default function PhonifyDashboard({
  sales,
  expenses,
  onAddSale,
  onAddExpense,
  onDeleteSale,
  onDeleteExpense,
  currencySymbol = '₹',
  serverIsOnline,
}: PhonifyDashboardProps) {
  // Navigation tabs for the Phonify section
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'payments'>('overview');

  // Modal forms states
  const [showAddSaleModal, setShowAddSaleModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);

  // Search filter terms
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');

  // Input states for Phone Sale form
  const [saleProduct, setSaleProduct] = useState('');
  const [saleOriginal, setSaleOriginal] = useState('');
  const [saleSelling, setSaleSelling] = useState('');
  const [saleServiceCost, setSaleServiceCost] = useState('');
  const [saleCustomerName, setSaleCustomerName] = useState('');
  const [saleCustomerPhone, setSaleCustomerPhone] = useState('');
  const [saleNotes, setSaleNotes] = useState('');

  // Input states for Expenditure form
  const [expName, setExpName] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState<'Stock Purchase' | 'Utility Bills' | 'Salaries' | 'Rent' | 'Repair Parts' | 'Other'>('Stock Purchase');
  const [expNotes, setExpNotes] = useState('');

  // Toast confirmation message status
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // --- REPORT CALCULATOR ---
  const calculateReport = (): BusinessReport => {
    let totalSalesCount = 0;
    let totalServiceCount = 0;
    let totalRevenue = 0;
    let totalCostOfSales = 0;
    let generalExpenses = 0;

    sales.forEach((sale) => {
      totalSalesCount++;
      if (sale.serviceCost > 0) {
        totalServiceCount++;
      }
      totalRevenue += sale.sellingPrice + sale.serviceCost;
      totalCostOfSales += sale.originalPrice;
    });

    expenses.forEach((exp) => {
      generalExpenses += exp.amount;
    });

    const totalExpenditure = totalCostOfSales + generalExpenses;
    const netProfit = totalRevenue - totalExpenditure;
    const profitMargin = totalRevenue > 0 ? netProfit / totalRevenue : 0;

    return {
      totalSalesCount,
      totalServiceCount,
      totalRevenue,
      totalCostOfSales,
      generalExpenses,
      totalExpenditure,
      netProfit,
      profitMargin,
    };
  };

  const report = calculateReport();

  // Handle addition submit triggers
  const handleAddSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleProduct || !saleSelling) return;

    onAddSale({
      productName: saleProduct,
      originalPrice: Number(saleOriginal) || 0,
      sellingPrice: Number(saleSelling) || 0,
      serviceCost: Number(saleServiceCost) || 0,
      customerName: saleCustomerName || 'Guest Buyer',
      customerPhone: saleCustomerPhone || 'N/A',
      notes: saleNotes,
    });

    // Reset fields
    setSaleProduct('');
    setSaleOriginal('');
    setSaleSelling('');
    setSaleServiceCost('');
    setSaleCustomerName('');
    setSaleCustomerPhone('');
    setSaleNotes('');
    setShowAddSaleModal(false);

    triggerToast('Sales entry logged in local database!');
  };

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expName || !expAmount) return;

    onAddExpense({
      name: expName,
      amount: Number(expAmount) || 0,
      category: expCategory,
      notes: expNotes,
    });

    // Reset fields
    setExpName('');
    setExpAmount('');
    setExpCategory('Stock Purchase');
    setExpNotes('');
    setShowAddExpenseModal(false);

    triggerToast('Business expenditure entry logged!');
  };

  const handlePDFDownload = () => {
    downloadBusinessReport(sales, expenses, report, currencySymbol);
    triggerToast('Audit report downloaded successfully as PDF!');
  };

  // Filter lists based on search query
  const filteredSales = sales.filter((item) => {
    const term = searchQuery.toLowerCase();
    return (
      item.productName.toLowerCase().includes(term) ||
      item.customerName.toLowerCase().includes(term) ||
      item.customerPhone.includes(term)
    );
  });

  const filteredExpenses = expenses.filter((item) => {
    const term = searchQuery.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(term) || item.category.toLowerCase().includes(term);
    const matchesCategory = activeCategoryFilter === 'All' || item.category === activeCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div id="phonify-workspace" className="space-y-6">
      {/* Toast Alert overlay */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-3 bg-white border border-emerald-200 text-slate-900 text-xs font-mono rounded-2xl shadow-xl flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline Status Warning Header if server is off */}
      {!serverIsOnline && (
        <div id="offline-network-banner" className="bg-amber-50 border border-amber-200 text-slate-800 p-4 rounded-2xl flex items-center gap-3 text-xs font-mono shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="flex-1">
            <span className="font-extrabold text-amber-800">STANDALONE LOCAL MODE:</span> App is running disconnected from the server. New entries are stored locally.
          </div>
        </div>
      )}

      {/* Overview Metric Bento Grid */}
      <div id="bento-metrics-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1: Total Earnings */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl relative shadow-[0_4px_22px_rgba(0,0,0,0.02)] hover:shadow-xl hover:shadow-indigo-500/5 hover:border-slate-300 transition-all duration-300 overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">Gross Revenue</span>
            <span className="p-1 px-2.5 text-[10px] bg-emerald-50 text-emerald-700 font-mono rounded-lg border border-emerald-100 font-bold uppercase">Inflow</span>
          </div>
          <p className="text-3xl font-extrabold text-slate-950 tracking-tight font-sans mt-2">
            {currencySymbol}{report.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 1 })}
          </p>
          <div className="text-[10.5px] text-slate-500 font-mono mt-3 flex items-center gap-1.5">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
            <span>Includes repairs + product margins</span>
          </div>
        </div>

        {/* Metric 2: Estimated Expenditures */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl relative shadow-[0_4px_22px_rgba(0,0,0,0.02)] hover:shadow-xl hover:shadow-indigo-500/5 hover:border-slate-300 transition-all duration-300 overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">Total Expenditures</span>
            <span className="p-1 px-2.5 text-[10px] bg-rose-50 text-rose-700 font-mono rounded-lg border border-rose-100 font-bold uppercase text-red-500">Outflow</span>
          </div>
          <p className="text-3xl font-extrabold text-slate-950 tracking-tight font-sans mt-2">
            {currencySymbol}{report.totalExpenditure.toLocaleString(undefined, { minimumFractionDigits: 1 })}
          </p>
          <div className="text-[10.5px] text-slate-500 font-mono mt-3 flex justify-between">
            <span>Goods: {currencySymbol}{report.totalCostOfSales.toLocaleString()}</span>
            <span>Expenses: {currencySymbol}{report.generalExpenses.toLocaleString()}</span>
          </div>
        </div>

        {/* Metric 3: Profit Margins */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl relative shadow-[0_4px_22px_rgba(0,0,0,0.02)] hover:shadow-xl hover:shadow-indigo-500/5 hover:border-slate-300 transition-all duration-300 overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">Net Profit Ledger</span>
            <span className={`p-1 px-2.5 text-[10px] font-mono rounded-lg border font-bold uppercase ${
              report.netProfit >= 0 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                : 'bg-rose-50 text-rose-700 border-rose-100'
            }`}>
              {report.netProfit >= 0 ? 'PROFIT' : 'LOSS'}
            </span>
          </div>
          <p className={`text-3xl font-extrabold tracking-tight font-sans mt-2 ${
            report.netProfit >= 0 ? 'text-emerald-600' : 'text-red-500'
          }`}>
            {report.netProfit >= 0 ? '+' : '-'}{currencySymbol}{Math.abs(report.netProfit).toLocaleString(undefined, { minimumFractionDigits: 1 })}
          </p>
          <div className="text-[10.5px] text-slate-500 font-mono mt-3 flex items-center gap-1.5">
            <span>Overall Margins ratio: <strong className={report.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}>{(report.profitMargin * 100).toFixed(1)}%</strong></span>
          </div>
        </div>

        {/* Metric 4: Volume Transactions */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl relative shadow-[0_4px_22px_rgba(0,0,0,0.02)] hover:shadow-xl hover:shadow-indigo-500/5 hover:border-slate-300 transition-all duration-300 overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">Workload Volume</span>
            <span className="p-1 px-2.5 text-[10px] bg-indigo-50 text-indigo-700 font-mono rounded-lg border border-indigo-100 font-bold uppercase">Active</span>
          </div>
          <p className="text-3xl font-extrabold text-slate-950 tracking-tight font-sans mt-2">
            {report.totalSalesCount} <span className="text-xs text-slate-500 font-normal">transactions</span>
          </p>
          <div className="text-[10.5px] text-slate-500 font-mono mt-3 flex justify-between font-bold">
            <span className="text-indigo-600">Sales: {report.totalSalesCount - report.totalServiceCount} units</span>
            <span className="text-violet-600">Repairs/Jobs: {report.totalServiceCount} tasks</span>
          </div>
        </div>
      </div>

      {/* Control Quick Actions Header */}
      <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddSaleModal(true)}
            id="register-sale-trigger"
            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-xs text-white font-bold font-mono rounded-xl cursor-pointer transition-all shadow-md shadow-indigo-600/10"
          >
            <Smartphone className="w-4 h-4 text-white shrink-0" />
            <span>+ REGISTER PHONE / SERVICE SALE</span>
          </button>
          
          <button
            onClick={() => setShowAddExpenseModal(true)}
            id="register-expense-trigger"
            className="flex items-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 border border-slate-200 font-mono active:scale-95 text-xs text-slate-600 font-bold rounded-xl cursor-pointer transition-all"
          >
            <Wallet className="w-4 h-4 text-slate-500 shrink-0" />
            <span>+ LOG EXPENDITURE</span>
          </button>
        </div>

        {/* Global actions */}
        <div>
          <button
            onClick={handlePDFDownload}
            id="download-statement-trigger"
            className="flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-950 active:scale-95 text-xs text-white font-bold font-mono rounded-xl cursor-pointer transition-all shadow-lg"
          >
            <Download className="w-4 h-4 text-white shrink-0" />
            <span>DOWNLOAD AUDITED REPORT (PDF)</span>
          </button>
        </div>
      </div>

      {/* Vector curves and expenditures donut charts */}
      <CustomChart sales={sales} expenses={expenses} />

      {/* Main Ledger Sub-Tables and filters */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-[0_4px_22px_rgba(0,0,0,0.02)]">
        {/* Section Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-4 text-center text-xs font-mono font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-400 hover:text-slate-700 hover:bg-slate-50/50'
            }`}
          >
            Combined Audit List
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`flex-1 py-4 text-center text-xs font-mono font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
              activeTab === 'sales'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-400 hover:text-slate-700 hover:bg-slate-50/50'
            }`}
          >
            Phone Sales ({sales.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex-1 py-4 text-center text-xs font-mono font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
              activeTab === 'payments'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-400 hover:text-slate-700 hover:bg-slate-50/50'
            }`}
          >
            Expenditures ({expenses.length})
          </button>
        </div>

        {/* Interactive Filters Bar */}
        <div className="p-4 border-b border-slate-200/80 bg-slate-50/30 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search items, buyers or details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-sans font-medium text-slate-700 pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 placeholder-slate-400"
            />
          </div>

          {/* Conditional filter for categories if viewing expenditures */}
          {activeTab === 'payments' && (
            <div className="flex gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 font-mono text-[10px]">
              {['All', 'Stock Purchase', 'Utility Bills', 'Salaries', 'Rent', 'Repair Parts', 'Other'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg border font-bold cursor-pointer whitespace-nowrap transition-all ${
                    activeCategoryFilter === cat
                      ? 'bg-indigo-50 text-indigo-600 border-indigo-200/50'
                      : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content displays based on tab */}
        <div className="p-4 overflow-x-auto">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Combine both lists into chronologically interleaved items */}
              {(() => {
                const combined = [
                  ...sales.map((s) => ({ ...s, auditType: 'sale' as const })),
                  ...expenses.map((e) => ({ ...e, auditType: 'expense' as const })),
                ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

                if (combined.length === 0) {
                  return (
                    <div className="py-12 text-center text-slate-400 font-sans text-xs">
                      No transactional logs recorded. Click buttons above to start inputting income and expenditures.
                    </div>
                  );
                }

                return (
                  <div className="divide-y divide-slate-100">
                    {combined.map((item) => {
                      const isSale = item.auditType === 'sale';
                      return (
                        <div key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 first:pt-0 last:pb-0 hover:bg-slate-50/40 px-2 rounded-xl transition-all">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-xl mt-0.5 border ${
                              isSale 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                : 'bg-rose-50 text-rose-600 border-rose-100'
                            }`}>
                              {isSale ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900 font-sans">
                                {isSale ? (item as PhoneSale).productName : (item as GeneralExpense).name}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-mono">
                                <span>{new Date(item.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                <span>•</span>
                                <span className="uppercase text-slate-400 font-bold">
                                  {isSale ? 'PHONIFY SALES / INFLOW' : `EXPENSE / ${(item as GeneralExpense).category}`}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Price and delete option */}
                          <div className="flex items-center gap-4 self-end sm:self-auto font-mono">
                            <div className="text-right">
                              {isSale ? (
                                <>
                                  <p className="text-xs font-extrabold text-emerald-600">
                                    +{currencySymbol}{((item as PhoneSale).sellingPrice + (item as PhoneSale).serviceCost).toLocaleString()}
                                  </p>
                                  <p className="text-[9px] text-slate-400">Cost: {currencySymbol}{(item as PhoneSale).originalPrice.toLocaleString()}</p>
                                </>
                              ) : (
                                <>
                                  <p className="text-xs font-extrabold text-red-500">
                                    -{currencySymbol}{(item as GeneralExpense).amount.toLocaleString()}
                                  </p>
                                  <p className="text-[9px] text-slate-400">Expenditure Card</p>
                                </>
                              )}
                            </div>

                            <button
                              onClick={() => isSale ? onDeleteSale(item.id) : onDeleteExpense(item.id)}
                              className="p-1 px-2 hover:bg-rose-50 text-slate-400 hover:text-red-500 rounded-lg cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {activeTab === 'sales' && (
            <table className="w-full text-left font-sans text-xs">
              <thead>
                <tr className="border-b border-slate-150 text-slate-400 font-mono tracking-wider text-[11px] uppercase">
                  <th className="pb-3 pl-2">Product Name</th>
                  <th className="pb-3">Buyer Detail</th>
                  <th className="pb-3 text-right">Cost Price</th>
                  <th className="pb-3 text-right">Sold Amt</th>
                  <th className="pb-3 text-right">Repairs</th>
                  <th className="pb-3 text-right">Audit Net</th>
                  <th className="pb-3 text-center">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSales.map((sale) => {
                  const netSaleProfit = (sale.sellingPrice + sale.serviceCost) - sale.originalPrice;
                  return (
                    <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 pl-2 font-bold text-slate-900 max-w-[140px] truncate">{sale.productName}</td>
                      <td className="py-3 text-slate-500 font-mono">
                        <p className="font-semibold text-slate-800">{sale.customerName}</p>
                        <p className="text-[10px] text-slate-400">{sale.customerPhone}</p>
                      </td>
                      <td className="py-3 text-right font-mono text-slate-500">{currencySymbol}{sale.originalPrice.toLocaleString()}</td>
                      <td className="py-3 text-right font-mono text-slate-800 font-semibold">{currencySymbol}{sale.sellingPrice.toLocaleString()}</td>
                      <td className="py-3 text-right font-mono text-slate-500 font-semibold text-indigo-600">
                        {sale.serviceCost > 0 ? `${currencySymbol}${sale.serviceCost}` : '-'}
                      </td>
                      <td className={`py-3 text-right font-mono font-bold ${netSaleProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {netSaleProfit >= 0 ? '+' : ''}{currencySymbol}{netSaleProfit.toLocaleString()}
                      </td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => onDeleteSale(sale.id)}
                          className="p-1 px-2 hover:bg-rose-50 text-slate-400 hover:text-red-500 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredSales.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No sales matching search query found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'payments' && (
            <table className="w-full text-left font-sans text-xs">
              <thead>
                <tr className="border-b border-slate-150 text-slate-400 font-mono tracking-wider text-[11px] uppercase">
                  <th className="pb-3 pl-2">Expense Details</th>
                  <th className="pb-3">Expenditure Type</th>
                  <th className="pb-3">Notes</th>
                  <th className="pb-3 text-right">Spent Cost</th>
                  <th className="pb-3 text-center">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 pl-2 font-bold text-slate-900 max-w-[150px] truncate">{exp.name}</td>
                    <td className="py-3 text-slate-500 font-mono">
                      <span className="p-1 px-2 bg-slate-50 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400 max-w-[150px] truncate">{exp.notes || 'No description recorded'}</td>
                    <td className="py-3 text-right font-mono text-red-500 font-extrabold">{currencySymbol}{exp.amount.toLocaleString()}</td>
                    <td className="py-3 text-center">
                      <button
                        onClick={() => onDeleteExpense(exp.id)}
                        className="p-1 px-2 hover:bg-rose-50 text-slate-400 hover:text-red-500 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredExpenses.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No business expenditures registered yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* --- POPUP WINDOW: ADD SALE --- */}
      <AnimatePresence>
        {showAddSaleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-indigo-600">
                  <Smartphone className="w-5 h-5" />
                  <h3 className="text-md font-bold text-slate-900 font-sans">Register Phone / Service Inflow</h3>
                </div>
                <button
                  onClick={() => setShowAddSaleModal(false)}
                  className="text-slate-400 hover:text-slate-800 font-bold px-2 rounded-lg cursor-pointer text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddSaleSubmit} className="space-y-4 text-xs font-sans">
                {/* 1. Product Name */}
                <div>
                  <label className="block text-slate-600 font-mono uppercase tracking-wider mb-1.5 font-bold">Product Item Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. iPhone 15 Pro Max, Samsung Galaxy S24 Repair"
                    value={saleProduct}
                    onChange={(e) => setSaleProduct(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-850 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 font-medium text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* 2. Original Price */}
                  <div>
                    <label className="block text-slate-600 font-mono uppercase tracking-wider mb-1.5 font-bold">Original Amt / CP (₹) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="e.g. 85000"
                      value={saleOriginal}
                      onChange={(e) => setSaleOriginal(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-850 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 font-mono text-xs"
                    />
                  </div>

                  {/* 3. Selling Price */}
                  <div>
                    <label className="block text-slate-600 font-mono uppercase tracking-wider mb-1.5 font-bold">Selling Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="e.g. 110000"
                      value={saleSelling}
                      onChange={(e) => setSaleSelling(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-850 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 font-mono text-xs"
                    />
                  </div>
                </div>

                {/* 4. Service Cost */}
                <div>
                  <label className="block text-slate-600 font-mono uppercase tracking-wider mb-1.5 font-bold">Service Charges / Repair Fees (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Set to 0 if none. e.g. 1500"
                    value={saleServiceCost}
                    onChange={(e) => setSaleServiceCost(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-850 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 font-mono text-xs"
                  />
                  <p className="text-[10px] text-slate-400 font-mono mt-1">Added directly to inbound cashflow.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* 5. Customer Name */}
                  <div>
                    <label className="block text-slate-600 font-mono uppercase tracking-wider mb-1.5 font-bold">Customer Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Vasudev Sharma"
                      value={saleCustomerName}
                      onChange={(e) => setSaleCustomerName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-850 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 font-medium text-xs"
                    />
                  </div>

                  {/* 6. Customer Phone */}
                  <div>
                    <label className="block text-slate-600 font-mono uppercase tracking-wider mb-1.5 font-bold">Customer Phone</label>
                    <input
                      type="text"
                      placeholder="e.g. +91 9876543210"
                      value={saleCustomerPhone}
                      onChange={(e) => setSaleCustomerPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-850 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 font-mono text-xs"
                    />
                  </div>
                </div>

                {/* 7. Notes */}
                <div>
                  <label className="block text-slate-600 font-mono uppercase tracking-wider mb-1.5 font-bold">Notes / Extra specs</label>
                  <textarea
                    placeholder="Enter serial number, IMEI codes or service details"
                    value={saleNotes}
                    onChange={(e) => setSaleNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-850 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 text-xs font-sans h-16 resize-none"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddSaleModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-250 text-slate-600 font-mono uppercase tracking-wider rounded-xl cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold font-mono uppercase tracking-wider rounded-xl cursor-pointer transition-all shadow-md shadow-indigo-600/10"
                  >
                    Save Entry
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- POPUP WINDOW: ADD EXPENDITURE --- */}
      <AnimatePresence>
        {showAddExpenseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative"
            >
              <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-rose-600">
                  <Wallet className="w-5 h-5" />
                  <h3 className="text-md font-bold text-slate-900 font-sans">Log Business Expenditure</h3>
                </div>
                <button
                  onClick={() => setShowAddExpenseModal(false)}
                  className="text-slate-400 hover:text-slate-800 font-bold px-2 rounded-lg cursor-pointer text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddExpenseSubmit} className="space-y-4 text-xs font-sans">
                {/* 1. Expense Name */}
                <div>
                  <label className="block text-slate-600 font-mono uppercase tracking-wider mb-1.5 font-bold">Expenditure Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Workshop Desk Rent, Office AC power bill"
                    value={expName}
                    onChange={(e) => setExpName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-850 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 font-medium text-xs"
                  />
                </div>

                {/* 2. Amount */}
                <div>
                  <label className="block text-slate-600 font-mono uppercase tracking-wider mb-1.5 font-bold">Spent Cost / Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 4500"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-850 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 font-mono text-xs"
                  />
                </div>

                {/* 3. Category */}
                <div>
                  <label className="block text-slate-600 font-mono uppercase tracking-wider mb-1.5 font-bold">Expenditure Category</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-850 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 font-medium text-xs"
                  >
                    <option value="Stock Purchase">Stock Purchase (Inventory)</option>
                    <option value="Utility Bills">Utility Bills</option>
                    <option value="Salaries">Worker Salaries</option>
                    <option value="Rent">Shop/Storage Rent</option>
                    <option value="Repair Parts">Repair Parts / Tools</option>
                    <option value="Other">Other Expenses</option>
                  </select>
                </div>

                {/* 4. Notes */}
                <div>
                  <label className="block text-slate-600 font-mono uppercase tracking-wider mb-1.5 font-bold">Notes</label>
                  <textarea
                    placeholder="Extra notes or receiver card data..."
                    value={expNotes}
                    onChange={(e) => setExpNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-850 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 text-xs font-sans h-16 resize-none"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddExpenseModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-250 text-slate-600 font-mono uppercase tracking-wider rounded-xl cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold font-mono uppercase tracking-wider rounded-xl cursor-pointer transition-all shadow-md shadow-rose-600/10"
                  >
                    Save Expense
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
