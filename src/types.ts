/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PhoneSale {
  id: string;
  timestamp: string;
  productName: string;
  originalPrice: number; // Cost Price
  sellingPrice: number;  // Selling Price
  serviceCost: number;   // Extra repair or service cost
  customerName: string;
  customerPhone: string;
  notes?: string;
}

export interface GeneralExpense {
  id: string;
  timestamp: string;
  name: string;
  amount: number; // Expense Cost
  category: 'Stock Purchase' | 'Utility Bills' | 'Salaries' | 'Rent' | 'Repair Parts' | 'Other';
  notes?: string;
}

export interface AppSettings {
  pinLockEnabled: boolean;
  pinCode: string; // 4-digit pin
  serverIsOnline: boolean; // Virtual Server Toggle
}

export interface BusinessReport {
  totalSalesCount: number;
  totalServiceCount: number;
  totalRevenue: number;     // Selling prices + service costs
  totalCostOfSales: number; // Original amount of sold items
  generalExpenses: number;  // General expenditures
  totalExpenditure: number; // Cost of sold items + general expenditures
  netProfit: number;        // Total Revenue - Total Expenditure
  profitMargin: number;     // Net Profit / Total Revenue
}
