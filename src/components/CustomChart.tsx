/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PhoneSale, GeneralExpense } from '../types';

interface ChartProps {
  sales: PhoneSale[];
  expenses: GeneralExpense[];
}

export default function CustomChart({ sales, expenses }: ChartProps) {
  // Let's group sales and services by the last 7 entries (or dates) to construct a timeline.
  // Sort sales chronologically
  const cronSales = [...sales].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const displaySales = cronSales.slice(-7); // Keep last 7 items

  // Get maximum transaction value for scaling the SVG height
  const maxVal = Math.max(
    ...displaySales.map((s) => s.sellingPrice + s.serviceCost),
    5000 // default floor scale
  );

  // SVG grid settings
  const width = 500;
  const height = 180;
  const paddingLeft = 40;
  const paddingRight = 15;
  const paddingTop = 15;
  const paddingBottom = 25;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Let's generate points for revenue (selling price + service cost) and margins (profit)
  const ptsRevenue: string[] = [];
  const ptsMargin: string[] = [];

  displaySales.forEach((sale, i) => {
    const x = paddingLeft + (chartWidth / (Math.max(displaySales.length - 1, 1))) * i;
    const rev = sale.sellingPrice + sale.serviceCost;
    const margin = rev - sale.originalPrice;

    // normalise relative heights
    const ry = height - paddingBottom - (rev / maxVal) * chartHeight;
    const my = height - paddingBottom - (Math.max(margin, 0) / maxVal) * chartHeight;

    ptsRevenue.push(`${x},${ry}`);
    ptsMargin.push(`${x},${my}`);
  });

  // Calculate expense categories percentages
  const categories = {
    'Stock Purchase': 0,
    'Utility Bills': 0,
    'Salaries': 0,
    'Rent': 0,
    'Repair Parts': 0,
    'Other': 0,
  };

  let totalExpenses = 0;
  expenses.forEach((e) => {
    if (categories[e.category] !== undefined) {
      categories[e.category] += e.amount;
      totalExpenses += e.amount;
    }
  });

  const categoriesColors: Record<keyof typeof categories, string> = {
    'Stock Purchase': '#f59e0b', // Amber 500
    'Utility Bills': '#3b82f6', // Blue 500
    'Salaries': '#ec4899', // Pink 500
    'Rent': '#8b5cf6', // Violet 500
    'Repair Parts': '#06b6d4', // Cyan 500
    'Other': '#64748b', // Slate 500
  };

  // Build high-end doughnut vector sectors
  let currentAngle = 0;
  const radius = 40;
  const cx = 55;
  const cy = 55;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
      {/* Chart A: Earnings Line Plot */}
      <div id="revenue-trend-chart" className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-3xl shadow-[0_4px_22px_rgba(0,0,0,0.02)] text-slate-800">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Ledger Activity Curve</h4>
            <p className="text-[10px] text-slate-400 font-sans">Visualizing total earnings vs. direct net profit of last 7 entries</p>
          </div>
          {/* Chart Legends */}
          <div className="flex gap-4 text-[10px]">
            <div className="flex items-center gap-1.5 font-sans">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
              <span className="text-slate-600 font-bold">Revenue</span>
            </div>
            <div className="flex items-center gap-1.5 font-sans">
              <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block" />
              <span className="text-slate-600 font-bold">Profit Margin</span>
            </div>
          </div>
        </div>

        {displaySales.length < 2 ? (
          <div className="h-44 flex items-center justify-center text-slate-400 font-sans text-center">
            Add at least 2 sales/services entries to populate the analytics trendline
          </div>
        ) : (
          <div className="relative w-full overflow-x-auto">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[450px]">
              {/* Horizontal gridlines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = height - paddingBottom - ratio * chartHeight;
                const gridVal = Math.round(ratio * maxVal);
                return (
                  <g key={ratio} className="opacity-70">
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={width - paddingRight}
                      y2={y}
                      stroke="#f1f5f9"
                      strokeWidth="1.5"
                    />
                    <text
                      x={paddingLeft - 8}
                      y={y + 3}
                      fill="#94a3b8"
                      className="text-[9px] font-mono text-right font-bold"
                      textAnchor="end"
                    >
                      {gridVal >= 1000 ? `${(gridVal / 1000).toFixed(0)}k` : gridVal}
                    </text>
                  </g>
                );
              })}

              {/* X Axis Labels for product items */}
              {displaySales.map((sale, i) => {
                const x = paddingLeft + (chartWidth / (displaySales.length - 1)) * i;
                const truncName = sale.productName.length > 8 ? sale.productName.substring(0, 7) + '..' : sale.productName;
                return (
                  <text
                    key={sale.id}
                    x={x}
                    y={height - 8}
                    fill="#94a3b8"
                    className="text-[8px] font-mono text-center font-bold"
                    textAnchor="middle"
                  >
                    {truncName}
                  </text>
                );
              })}

              {/* Area Under Curves */}
              {/* Revenue Area */}
              <path
                d={`M ${paddingLeft},${height - paddingBottom} L ${ptsRevenue.join(' L ')} L ${
                  paddingLeft + chartWidth
                },${height - paddingBottom} Z`}
                fill="url(#revGrad)"
                className="opacity-5"
              />

              {/* Profit Area */}
              <path
                d={`M ${paddingLeft},${height - paddingBottom} L ${ptsMargin.join(' L ')} L ${
                  paddingLeft + chartWidth
                },${height - paddingBottom} Z`}
                fill="url(#marginGrad)"
                className="opacity-5"
              />

              {/* Line curves */}
              <path
                d={`M ${ptsRevenue.join(' L ')}`}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={`M ${ptsMargin.join(' L ')}`}
                fill="none"
                stroke="#6366f1"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Highlight scatter points */}
              {displaySales.map((sale, i) => {
                const x = paddingLeft + (chartWidth / (displaySales.length - 1)) * i;
                const revY = height - paddingBottom - ((sale.sellingPrice + sale.serviceCost) / maxVal) * chartHeight;
                const profY = height - paddingBottom - (Math.max(sale.sellingPrice + sale.serviceCost - sale.originalPrice, 0) / maxVal) * chartHeight;
                return (
                  <g key={sale.id}>
                    <circle cx={x} cy={revY} r="3.5" fill="#10b981" />
                    <circle cx={x} cy={profY} r="3.5" fill="#6366f1" />
                  </g>
                );
              })}

              {/* Gradients */}
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="marginGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        )}
      </div>

      {/* Chart B: General Expenditures Breakdown */}
      <div id="expenses-category-chart" className="bg-white border border-slate-200 p-5 rounded-3xl shadow-[0_4px_22px_rgba(0,0,0,0.02)] text-slate-800">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">Expenditure Split</h4>
          <p className="text-[10px] text-slate-400 font-sans mb-4">Allocation by category shares</p>
        </div>

        {totalExpenses === 0 ? (
          <div className="h-32 flex items-center justify-center text-slate-400 font-sans text-center">
            Add general business expenditures to display categories breakdown donut.
          </div>
        ) : (
          <div className="flex gap-4 items-center h-32">
            {/* Left donut graphic */}
            <div className="relative w-28 h-28 flex-shrink-0">
              <svg width="110" height="110" viewBox="0 0 110 110">
                {/* Background base circle */}
                <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#f1f5f9" strokeWidth="12" />

                {/* Sub sectors */}
                {Object.entries(categories).map(([category, amount]) => {
                  if (amount === 0) return null;
                  const ratio = amount / totalExpenses;
                  const strokeDashoffset = circumference - circumference * ratio;
                  const rotation = (currentAngle / totalExpenses) * 360;
                  currentAngle += amount;

                  return (
                    <circle
                      key={category}
                      cx={cx}
                      cy={cy}
                      r={radius}
                      fill="none"
                      stroke={categoriesColors[category as keyof typeof categories]}
                      strokeWidth="12"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      transform={`rotate(${rotation - 90} ${cx} ${cy})`}
                      strokeLinecap="round"
                      className="transition-all duration-300"
                    />
                  );
                })}
              </svg>
              {/* Centered Total */}
              <div className="absolute inset-0 flex flex-col items-center justify-center font-sans">
                <span className="text-[8px] uppercase tracking-wider text-slate-400 font-mono font-bold">Wastage</span>
                <span className="text-[11px] font-extrabold text-slate-900 tracking-tight">
                  ₹{totalExpenses >= 1000 ? `${(totalExpenses / 1000).toFixed(1)}k` : totalExpenses}
                </span>
              </div>
            </div>

            {/* Right side colored chips */}
            <div className="flex-1 space-y-1.5 overflow-y-auto max-h-28 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {Object.entries(categories).map(([category, amount]) => {
                if (amount === 0) return null;
                const percentage = ((amount / totalExpenses) * 100).toFixed(0);
                return (
                  <div key={category} className="flex justify-between items-center text-[10px]">
                    <div className="flex items-center gap-1.5 truncate max-w-[85px]">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: categoriesColors[category as keyof typeof categories] }}
                      />
                      <span className="truncate text-slate-600 font-sans font-medium">{category}</span>
                    </div>
                    <span className="font-bold text-slate-800 font-mono">{percentage}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
