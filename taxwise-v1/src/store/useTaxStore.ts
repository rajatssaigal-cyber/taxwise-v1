import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TaxState, InvestmentTransaction, TaxSummary, AdvanceTaxInstallment } from '../types/tax';

interface TaxStore extends TaxState {
  itrGuidance: any | null;
  detailedBreakdown: string;
  recommendations: string[];
  foreignAssetsSchedule: any[] | null;
  filingGuide: any | null;
  financialYear: string;
  selectedItrType: string;
  setTransactions: (transactions: InvestmentTransaction[]) => void;
  setSummary: (summary: TaxSummary) => void;
  setAdvanceTaxSchedule: (schedule: AdvanceTaxInstallment[]) => void;
  setItrGuidance: (guidance: any) => void;
  setDetailedBreakdown: (breakdown: string) => void;
  setRecommendations: (recommendations: string[]) => void;
  setForeignAssetsSchedule: (schedule: any[]) => void;
  setFilingGuide: (guide: any) => void;
  setFinancialYear: (year: string) => void;
  setSelectedItrType: (itrType: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  clearData: () => void;
}

export const useTaxStore = create<TaxStore>()(
  persist(
    (set) => ({
      transactions: [],
      summary: null,
      advanceTaxSchedule: [],
      itrGuidance: null,
      detailedBreakdown: "",
      recommendations: [],
      foreignAssetsSchedule: null,
      filingGuide: null,
      financialYear: '2025-26',
      selectedItrType: 'ITR-1',
      isLoading: false,
      error: null,
      setTransactions: (transactions) => set({ transactions }),
      setSummary: (summary) => set({ summary }),
      setAdvanceTaxSchedule: (schedule) => set({ advanceTaxSchedule: schedule }),
      setItrGuidance: (itrGuidance) => set({ itrGuidance }),
      setDetailedBreakdown: (detailedBreakdown) => set({ detailedBreakdown }),
      setRecommendations: (recommendations) => set({ recommendations }),
      setForeignAssetsSchedule: (foreignAssetsSchedule) => set({ foreignAssetsSchedule }),
      setFilingGuide: (filingGuide) => set({ filingGuide }),
      setFinancialYear: (financialYear) => set({ financialYear }),
      setSelectedItrType: (selectedItrType) => set({ selectedItrType }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      reset: () => set({ 
        transactions: [], 
        summary: null, 
        advanceTaxSchedule: [], 
        itrGuidance: null, 
        detailedBreakdown: "", 
        recommendations: [],
        foreignAssetsSchedule: null,
        filingGuide: null,
        selectedItrType: 'ITR-1',
        isLoading: false, 
        error: null 
      }),
      clearData: () => set({ 
        summary: null, 
        advanceTaxSchedule: [], 
        itrGuidance: null, 
        detailedBreakdown: "", 
        recommendations: [],
        foreignAssetsSchedule: null,
        filingGuide: null,
      }),
    }),
    {
      name: 'taxwise-india-storage-v2',
    }
  )
);
