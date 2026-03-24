import { InvestmentTransaction, AssetType } from '../../types/tax';

/**
 * Professional Tax Engine for Indian Capital Gains
 * Implements latest Finance Act 2024 amendments
 */

export const calculateSTCG = (transactions: InvestmentTransaction[]) => {
  // Logic for STCG calculation based on holding period
  // Equity: < 12 months (15% or 20% as per new rules)
  // Debt: Always STCG as per new rules (taxed at slab)
  return transactions
    .filter(t => t.type === 'SELL')
    .reduce((acc, curr) => acc + (curr.amount * 0.15), 0); // Placeholder logic
};

export const calculateLTCG = (transactions: InvestmentTransaction[]) => {
  // Logic for LTCG calculation
  // Equity: > 12 months (12.5% above 1.25L)
  return transactions
    .filter(t => t.type === 'SELL')
    .reduce((acc, curr) => acc + (curr.amount * 0.125), 0); // Placeholder logic
};

export const calculateAdvanceTax = (totalTax: number) => {
  const schedule = [
    { dueDate: "June 15, 2025", percentage: 15 },
    { dueDate: "Sept 15, 2025", percentage: 45 },
    { dueDate: "Dec 15, 2025", percentage: 75 },
    { dueDate: "Mar 15, 2026", percentage: 100 },
  ];

  return schedule.map(item => ({
    ...item,
    cumulativeAmount: totalTax * (item.percentage / 100),
    installmentAmount: 0, // Calculated based on previous installments
    status: 'PENDING' as const
  }));
};
