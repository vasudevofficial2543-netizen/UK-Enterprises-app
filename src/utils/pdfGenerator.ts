/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import { PhoneSale, GeneralExpense, BusinessReport } from '../types';

export function downloadBusinessReport(
  sales: PhoneSale[],
  expenses: GeneralExpense[],
  report: BusinessReport,
  currency: string = '₹'
) {
  // Create instance (A4 size, portrait)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Helper functions for layouts
  const centerText = (text: string, y: number) => {
    const textWidth = doc.getTextWidth(text);
    doc.text(text, (pageWidth - textWidth) / 2, y);
  };

  const rightAlignText = (text: string, x: number, y: number) => {
    const textWidth = doc.getTextWidth(text);
    doc.text(text, x - textWidth, y);
  };

  // --- BRAND COLOR PALETTE ---
  const primaryColor = { r: 15, g: 23, b: 42 }; // Slate 900
  const secondaryColor = { r: 16, g: 185, b: 129 }; // Emerald 500 (Profit)
  const accentColor = { r: 239, g: 68, b: 68 }; // Red 500 (Loss)
  const lightBgColor = { r: 248, g: 250, b: 252 }; // Slate 50

  // --- HEADER SECTION ---
  // Background Header block
  doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.rect(0, 0, pageWidth, 40, 'F');

  // UK Enterprises Logo text & subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('UK ENTERPRISES', 15, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(203, 213, 225); // Slate 300
  doc.text('PHONIFYMOBILES DIVISION - FINANCIAL STATEMENT', 15, 25);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 15, 31);

  // Statement badge
  doc.setFillColor(secondaryColor.r, secondaryColor.g, secondaryColor.b);
  // If net profit is negative, color it red
  if (report.netProfit < 0) {
    doc.setFillColor(accentColor.r, accentColor.g, accentColor.b);
  }
  doc.rect(pageWidth - 65, 12, 50, 16, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('AUDIT STATUS', pageWidth - 60, 18);
  doc.setFontSize(13);
  doc.text(report.netProfit >= 0 ? 'PROFITABLE' : 'NET LOSS', pageWidth - 60, 24);

  // --- OVERVIEW CARDS ---
  let currentY = 52;
  doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('FINANCIAL SUMMARY OVERVIEW', 15, currentY);

  currentY += 6;
  // Draw summary container box
  doc.setFillColor(lightBgColor.r, lightBgColor.g, lightBgColor.b);
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.roundedRect(15, currentY, pageWidth - 30, 32, 2, 2, 'FD');

  // Content of summary box
  const colWidth = (pageWidth - 30) / 4;
  const colY = currentY + 10;

  // Revenue Card
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL REVENUE', 20, colY);
  doc.setFontSize(12);
  doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.text(`${currency} ${report.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 1 })}`, 20, colY + 10);

  // Cost of Sales Card
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('COST OF GOODS', 20 + colWidth, colY);
  doc.setFontSize(12);
  doc.text(`${currency} ${report.totalCostOfSales.toLocaleString(undefined, { minimumFractionDigits: 1 })}`, 20 + colWidth, colY + 10);

  // Expenses Card
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('EXPENDITURES', 20 + colWidth * 2, colY);
  doc.setFontSize(12);
  doc.text(`${currency} ${report.generalExpenses.toLocaleString(undefined, { minimumFractionDigits: 1 })}`, 20 + colWidth * 2, colY + 10);

  // Profit Card
  doc.setFontSize(8);
  doc.setTextColor(report.netProfit >= 0 ? secondaryColor.r : accentColor.r, report.netProfit >= 0 ? secondaryColor.g : accentColor.g, report.netProfit >= 0 ? secondaryColor.b : accentColor.b);
  doc.text('NET PROFIT/LOSS', 20 + colWidth * 3, colY);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(`${currency} ${report.netProfit.toLocaleString(undefined, { minimumFractionDigits: 1 })}`, 20 + colWidth * 3, colY + 10);

  // Mini summary metadata row inside the box
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Total Sales: ${report.totalSalesCount} units | Services Rendered: ${report.totalServiceCount} jobs | Est Profit Margin: ${(report.profitMargin * 100).toFixed(1)}%`, 20, currentY + 27);

  // --- RECENT SALES LEDGER ---
  currentY += 44;
  doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`PHONIFYMOBILES SALES & SERVICES (${sales.length} entries)`, 15, currentY);

  currentY += 5;
  // Table headers
  doc.setFillColor(15, 23, 42); // Black slate
  doc.rect(15, currentY, pageWidth - 30, 7.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('Date', 18, currentY + 5);
  doc.text('Product Name / Customer', 40, currentY + 5);
  rightAlignText('Cost Price', 115, currentY + 5);
  rightAlignText('Selling Price', 140, currentY + 5);
  rightAlignText('Service Cost', 165, currentY + 5);
  rightAlignText('Net Margin', 195, currentY + 5);

  let tempY = currentY + 7.5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85); // Slate 700

  // Print first 10 sales (or limit to page size safely)
  const len = Math.min(sales.length, 12);
  for (let i = 0; i < len; i++) {
    const sale = sales[i];
    const isEven = i % 2 === 0;

    if (isEven) {
      doc.setFillColor(248, 250, 252); // Alternating light gray
      doc.rect(15, tempY, pageWidth - 30, 8, 'F');
    }

    const saleDate = new Date(sale.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const shortProduct = sale.productName.length > 32 ? sale.productName.substring(0, 29) + '...' : sale.productName;
    const customerInfo = sale.customerName ? ` (${sale.customerName})` : '';

    doc.setTextColor(71, 85, 105);
    doc.text(saleDate, 18, tempY + 5.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${shortProduct}${customerInfo}`, 40, tempY + 5.5);

    doc.setTextColor(71, 85, 105);
    rightAlignText(`${currency}${sale.originalPrice}`, 115, tempY + 5.5);
    rightAlignText(`${currency}${sale.sellingPrice}`, 140, tempY + 5.5);
    rightAlignText(`${currency}${sale.serviceCost}`, 165, tempY + 5.5);

    const saleMargin = (sale.sellingPrice + sale.serviceCost) - sale.originalPrice;
    if (saleMargin >= 0) {
      doc.setTextColor(5, 150, 105); // Green
      rightAlignText(`+${currency}${saleMargin}`, 195, tempY + 5.5);
    } else {
      doc.setTextColor(220, 38, 38); // Red
      rightAlignText(`-${currency}${Math.abs(saleMargin)}`, 195, tempY + 5.5);
    }

    tempY += 8;
  }

  if (sales.length === 0) {
    doc.setFillColor(248, 250, 252);
    doc.rect(15, tempY, pageWidth - 30, 12, 'F');
    doc.setTextColor(148, 163, 184);
    centerText('(No phone sales or services recorded in this range)', tempY + 8);
    tempY += 12;
  } else if (sales.length > 12) {
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`* Showing first 12 entries out of ${sales.length} total. View dashboard for full records.`, 15, tempY + 4);
    tempY += 6;
  }

  // --- GENERAL EXPENDITURES LEDGER ---
  currentY = tempY + 6;
  if (currentY + 60 > pageHeight) {
    // Page break if too long
    doc.addPage();
    currentY = 20;
    // Repeat mini header on second page
    doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.rect(0, 0, pageWidth, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('UK Enterprises - Phonifymobiles Business Audit (Page 2)', 15, 9.5);
    currentY = 25;
  }

  doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`GENERAL BUSINESS EXPENDITURES (${expenses.length} entries)`, 15, currentY);

  currentY += 5;
  // Expense table headers
  doc.setFillColor(15, 23, 42); // Black slate
  doc.rect(15, currentY, pageWidth - 30, 7.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('Date', 18, currentY + 5);
  doc.text('Expense Details', 40, currentY + 5);
  doc.text('Expense Category', 130, currentY + 5);
  rightAlignText('Spent Cost', 195, currentY + 5);

  tempY = currentY + 7.5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

  const expLen = Math.min(expenses.length, 12);
  for (let i = 0; i < expLen; i++) {
    const expense = expenses[i];
    const isEven = i % 2 === 0;

    if (isEven) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, tempY, pageWidth - 30, 8, 'F');
    }

    const expDate = new Date(expense.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const shortName = expense.name.length > 40 ? expense.name.substring(0, 37) + '...' : expense.name;

    doc.setTextColor(71, 85, 105);
    doc.text(expDate, 18, tempY + 5.5);
    doc.setTextColor(15, 23, 42);
    doc.text(shortName, 40, tempY + 5.5);
    doc.setTextColor(71, 85, 105);
    doc.text(expense.category, 130, tempY + 5.5);
    doc.setTextColor(220, 38, 38); // Red
    rightAlignText(`${currency}${expense.amount}`, 195, tempY + 5.5);

    tempY += 8;
  }

  if (expenses.length === 0) {
    doc.setFillColor(248, 250, 252);
    doc.rect(15, tempY, pageWidth - 30, 12, 'F');
    doc.setTextColor(148, 163, 184);
    centerText('(No general business expenditures recorded in this range)', tempY + 8);
    tempY += 12;
  } else if (expenses.length > 12) {
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`* Showing first 12 entries out of ${expenses.length} total. View dashboard for full records.`, 15, tempY + 4);
    tempY += 6;
  }

  // --- FOOTER & COMPLIANCE SIGNS ---
  currentY = tempY + 12;
  if (currentY + 30 > pageHeight) {
    doc.addPage();
    currentY = 20;
  }

  // Dotted lines for signature
  doc.setDrawColor(203, 213, 225); // Slate 300
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.line(15, currentY + 10, 65, currentY + 10);
  doc.line(pageWidth - 65, currentY + 10, pageWidth - 15, currentY + 10);

  doc.setLineDashPattern([], 0); // Reset
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Prepared by Account Specialist', 15, currentY + 14);
  rightAlignText('Authorised Owner Signature', pageWidth - 15, currentY + 14);

  // Footer seal / copyright
  doc.setFillColor(15, 23, 42);
  doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  centerText('UK Enterprises Corporate Retail & Workshop Management Engine. CONFIDENTIAL AUDIT REPORT.', pageHeight - 5);

  // Save the PDF
  doc.save(`PhonifyMobiles_Report_${new Date().toISOString().substring(0, 10)}.pdf`);
}
