import React from 'react';
import { TaxAnalysisResult } from '../lib/gemini';
import { formatCurrency, cn } from '../lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  AlertCircle, 
  CheckCircle2, 
  Briefcase, 
  PiggyBank, 
  FileText, 
  ArrowRightCircle,
  ShieldCheck,
  Globe,
  ListOrdered,
  ChevronDown,
  Download,
  Lightbulb,
  Plus,
  Minus
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { useTaxStore } from '../store/useTaxStore';

const Tooltip = ({ children, content }: { children: React.ReactNode, content: string }) => {
  const [show, setShow] = React.useState(false);
  return (
    <div className="relative inline-block" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-[10px] font-bold rounded-lg shadow-xl whitespace-nowrap pointer-events-none"
          >
            {content}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface TaxReportProps {
  data: TaxAnalysisResult;
  activeSection: 'itr' | 'advance';
}

export const TaxReport: React.FC<TaxReportProps> = ({ data, activeSection }) => {
  const { summary, advanceTaxSchedule, detailedBreakdown, recommendations, itrGuidance, foreignAssetsSchedule, filingGuide } = data;
  const { financialYear, setFinancialYear, selectedItrType, setSelectedItrType } = useTaxStore();

  const financialYears = ['2023-24', '2024-25', '2025-26'];
  const itrTypes = ['ITR-1', 'ITR-2', 'ITR-3', 'ITR-4'];

  const savings = Math.max(0, summary.oldRegimeTax - summary.newRegimeTax);
  const isNewRegimeBetter = summary.newRegimeTax <= summary.oldRegimeTax;

  const [investments, setInvestments] = React.useState({
    ppf: 0,
    elss: 0,
    nps: 0,
    insurance: 0,
    eduLoan: 0
  });

  const handleInvestmentChange = (key: keyof typeof investments, value: string) => {
    setInvestments(prev => ({ ...prev, [key]: Number(value) || 0 }));
  };

  const total80C = Math.min(150000, investments.ppf + investments.elss);
  const totalNPS = Math.min(50000, investments.nps);
  const total80D = Math.min(25000, investments.insurance);
  const total80E = investments.eduLoan;

  const potentialSavings = (total80C + totalNPS + total80D + total80E) * 0.3; // Rough 30% slab estimate

  const exportToCSV = () => {
    const rows = [
      ['TaxWise India - Tax Analysis Report', `FY ${financialYear}`],
      [''],
      ['SUMMARY'],
      ['Total Income', summary.totalIncome],
      ['Salary Income', summary.salaryIncome],
      ['Short Term Capital Gains', summary.shortTermCapitalGains],
      ['Long Term Capital Gains', summary.longTermCapitalGains],
      ['Dividend Income', summary.dividendIncome],
      ['Other Income', summary.otherIncome],
      ['Deductions (80C)', summary.deductions80C],
      ['Deductions (Other)', summary.deductionsOther],
      ['Total Tax Liability', summary.totalTaxLiability],
      ['Tax Paid / TDS', summary.taxPaid],
      ['Balance Tax', summary.balanceTax],
      [''],
      ['REGIME COMPARISON'],
      ['Old Regime Tax', summary.oldRegimeTax],
      ['New Regime Tax', summary.newRegimeTax],
      ['Recommended Regime', isNewRegimeBetter ? 'New' : 'Old'],
      ['Potential Savings', savings],
      [''],
      ['ITR GUIDANCE'],
      ['Recommended Form', itrGuidance.recommendedForm],
      ['Reasoning', itrGuidance.reasoning],
      [''],
      ['FOREIGN ASSETS'],
      ['Asset Type', 'Country', 'Cost (INR)', 'Peak Value', 'Income']
    ];

    if (foreignAssetsSchedule) {
      foreignAssetsSchedule.forEach(asset => {
        rows.push([asset.assetType, asset.country, asset.costOfAcquisition, asset.peakValueDuringYear, asset.incomeDerived]);
      });
    }

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TaxReport_${financialYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-16 pb-24">
      {/* FY Selector & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-5xl font-black tracking-tighter text-gray-900">Tax Analysis Report</h2>
          <p className="text-gray-500 font-medium mt-2">Comprehensive breakdown for FY {financialYear}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={exportToCSV}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-4 rounded-2xl text-sm font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>

          <div className="relative group">
            <select 
              value={selectedItrType}
              onChange={(e) => setSelectedItrType(e.target.value)}
              className="appearance-none bg-white border border-gray-100 rounded-2xl px-8 py-4 pr-14 text-sm font-black text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
            >
              {itrTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative group">
            <select 
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
              className="appearance-none bg-white border border-gray-100 rounded-2xl px-8 py-4 pr-14 text-sm font-black text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
            >
              {financialYears.map(year => (
                <option key={year} value={year}>FY {year}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Header Summary Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[3rem] border border-gray-100 p-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 blur-3xl -mr-32 -mt-32 rounded-full" />
        
        <div className="relative space-y-4">
          <div className="flex items-center space-x-2 text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">
            <ShieldCheck className="w-4 h-4" />
            <span>Verified Calculation</span>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Tax Liability</p>
            <h2 className="text-7xl font-black text-gray-900 tracking-tighter">
              {formatCurrency(summary.totalTaxLiability)}
            </h2>
          </div>
        </div>

        <div className="h-px w-full md:h-24 md:w-px bg-gray-100" />

        <div className="relative grid grid-cols-2 gap-x-16 gap-y-8 w-full md:w-auto">
          <SummaryStat label="Total Income" value={formatCurrency(summary.totalIncome)} />
          <SummaryStat 
            label={
              <Tooltip content="Tax Deducted at Source by your employer or bank">
                TDS / Tax Paid
              </Tooltip>
            } 
            value={formatCurrency(summary.taxPaid)} 
            color="text-green-600" 
          />
          <SummaryStat label="Balance Due" value={formatCurrency(summary.balanceTax)} color="text-red-600" />
          <SummaryStat label="Deductions" value={formatCurrency(summary.deductions80C + summary.deductionsOther)} color="text-indigo-600" />
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {activeSection === 'itr' ? (
          <motion.div 
            key="itr-section"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-12"
          >
            {/* Income Sources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <SourceCard 
                title="Salary Income" 
                value={formatCurrency(summary.salaryIncome)} 
                icon={<Briefcase className="w-5 h-5 text-indigo-600" />}
                color="indigo"
              />
              <SourceCard 
                title={
                  <Tooltip content="Short Term Capital Gains: Profits from selling assets held for less than 12-36 months">
                    STCG (20%)
                  </Tooltip>
                } 
                value={formatCurrency(summary.shortTermCapitalGains)} 
                icon={<TrendingUp className="w-5 h-5 text-orange-600" />}
                color="orange"
              />
              <SourceCard 
                title={
                  <Tooltip content="Long Term Capital Gains: Profits from selling assets held for more than 12-36 months">
                    LTCG (12.5%)
                  </Tooltip>
                } 
                value={formatCurrency(summary.longTermCapitalGains)} 
                icon={<TrendingDown className="w-5 h-5 text-green-600" />}
                color="green"
              />
              <SourceCard 
                title="Other Income" 
                value={formatCurrency(summary.dividendIncome + summary.otherIncome)} 
                icon={<PiggyBank className="w-5 h-5 text-blue-600" />}
                color="blue"
              />
            </div>

            {/* Regime Comparison Section */}
            <section className="bg-white rounded-[3rem] border border-gray-100 p-10 shadow-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 w-96 h-96 bg-green-50/50 blur-3xl -mr-48 -mt-48 rounded-full" />
              
              <div className="relative flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="space-y-4">
                  <h3 className="text-3xl font-black tracking-tight">Tax Regime Comparison</h3>
                  <p className="text-sm text-gray-500 font-medium max-w-md">
                    We've compared your tax liability under both regimes to find the most beneficial one for you.
                  </p>
                  {savings > 0 && (
                    <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-xs font-black">
                      <TrendingDown className="w-4 h-4" />
                      <span>You save {formatCurrency(savings)} with {isNewRegimeBetter ? 'New' : 'Old'} Regime</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-8 w-full md:w-auto">
                  <div className={cn(
                    "p-8 rounded-[2rem] border transition-all",
                    !isNewRegimeBetter ? "bg-indigo-50 border-indigo-200 scale-105 shadow-lg" : "bg-gray-50 border-gray-100 opacity-60"
                  )}>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Old Regime</p>
                    <p className="text-3xl font-black text-gray-900">{formatCurrency(summary.oldRegimeTax)}</p>
                    {!isNewRegimeBetter && <p className="text-[10px] font-bold text-indigo-600 mt-2">Recommended</p>}
                  </div>
                  <div className={cn(
                    "p-8 rounded-[2rem] border transition-all",
                    isNewRegimeBetter ? "bg-indigo-50 border-indigo-200 scale-105 shadow-lg" : "bg-gray-50 border-gray-100 opacity-60"
                  )}>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">New Regime</p>
                    <p className="text-3xl font-black text-gray-900">{formatCurrency(summary.newRegimeTax)}</p>
                    {isNewRegimeBetter && <p className="text-[10px] font-bold text-indigo-600 mt-2">Recommended</p>}
                  </div>
                </div>
              </div>
            </section>

            {/* Tax Saving Strategies Section */}
            <section className="bg-white rounded-[3rem] border border-gray-100 p-10 shadow-sm">
              <div className="flex items-center space-x-4 mb-10">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center">
                  <Lightbulb className="w-7 h-7 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-3xl font-black tracking-tight">Tax Saving Strategies</h3>
                  <p className="text-sm text-gray-500 font-medium">Actionable tips to reduce your tax liability</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Personalized Tips</h4>
                  <div className="space-y-4">
                    <StrategyCard 
                      title="Public Provident Fund (PPF)" 
                      desc="Invest up to ₹1.5L for EEE tax benefits (Exempt-Exempt-Exempt)." 
                      section="80C"
                    />
                    <StrategyCard 
                      title="Equity Linked Savings Scheme (ELSS)" 
                      desc="Tax-saving mutual funds with the shortest lock-in of 3 years." 
                      section="80C"
                    />
                    <StrategyCard 
                      title="National Pension System (NPS)" 
                      desc="Additional ₹50,000 deduction over and above the ₹1.5L limit." 
                      section="80CCD(1B)"
                    />
                    <StrategyCard 
                      title="Health Insurance Premiums" 
                      desc="Claim up to ₹25,000 (self/family) and ₹50,000 (senior parents)." 
                      section="80D"
                    />
                    <StrategyCard 
                      title="Education Loan Interest" 
                      desc="Full deduction on interest paid for higher education loans." 
                      section="80E"
                    />
                  </div>
                </div>

                <div className="bg-indigo-50 rounded-[2rem] p-8 border border-indigo-100">
                  <h4 className="text-xl font-black text-indigo-900 mb-6 tracking-tight">Savings Calculator</h4>
                  <div className="space-y-6">
                    <CalcInput label="PPF Investment" value={investments.ppf} onChange={(v) => handleInvestmentChange('ppf', v)} />
                    <CalcInput label="ELSS Investment" value={investments.elss} onChange={(v) => handleInvestmentChange('elss', v)} />
                    <CalcInput label="NPS Contribution" value={investments.nps} onChange={(v) => handleInvestmentChange('nps', v)} />
                    <CalcInput label="Health Insurance" value={investments.insurance} onChange={(v) => handleInvestmentChange('insurance', v)} />
                    <CalcInput label="Edu Loan Interest" value={investments.eduLoan} onChange={(v) => handleInvestmentChange('eduLoan', v)} />
                    
                    <div className="pt-6 border-t border-indigo-200">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-bold text-indigo-700">Estimated Potential Saving</p>
                        <p className="text-3xl font-black text-indigo-900 tracking-tighter">{formatCurrency(potentialSavings)}</p>
                      </div>
                      <p className="text-[10px] text-indigo-500 font-medium mt-2">
                        *Calculated based on an estimated 30% tax slab. Actual savings may vary.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-12">
                {/* ITR Guidance Section */}
                <section className="bg-white rounded-[3rem] border border-gray-100 p-10 shadow-sm">
                  <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center">
                        <FileText className="w-7 h-7 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-black tracking-tight">ITR Filing Roadmap</h3>
                        <p className="text-sm text-gray-500 font-medium">Personalized guidance for your tax return</p>
                      </div>
                    </div>
                    <div className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100">
                      {itrGuidance.recommendedForm} Recommended
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                    <div className="space-y-6">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center space-x-2">
                        <ArrowRightCircle className="w-4 h-4 text-indigo-600" />
                        <span>Reasoning</span>
                      </h4>
                      <p className="text-sm text-gray-600 font-medium leading-relaxed bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                        {itrGuidance.reasoning}
                      </p>
                    </div>
                    <div className="space-y-6">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center space-x-2">
                        <ArrowRightCircle className="w-4 h-4 text-indigo-600" />
                        <span>Key Schedules</span>
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {itrGuidance.keySchedules.map((s, i) => (
                          <span key={i} className="px-5 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-black text-gray-600 shadow-sm">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Filing Steps</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {itrGuidance.filingSteps.map((step, i) => (
                        <div key={i} className="flex items-start space-x-4 p-6 bg-white border border-gray-100 rounded-[2rem] hover:border-indigo-100 transition-all group">
                          <span className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-xs font-black group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                            {i + 1}
                          </span>
                          <span className="text-sm text-gray-600 font-bold leading-relaxed">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Foreign Assets Schedule */}
                {foreignAssetsSchedule && foreignAssetsSchedule.length > 0 && (
                  <section className="bg-white rounded-[3rem] border border-gray-100 p-10 shadow-sm">
                    <div className="flex items-center space-x-4 mb-10">
                      <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center">
                        <Globe className="w-7 h-7 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-black tracking-tight">Schedule FA (Foreign Assets)</h3>
                        <p className="text-sm text-gray-500 font-medium">Mandatory for ITR-2/3 if holding foreign assets</p>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Asset Type</th>
                            <th className="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Country</th>
                            <th className="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cost (INR)</th>
                            <th className="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Peak Value</th>
                            <th className="py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Income</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {foreignAssetsSchedule.map((asset, i) => (
                            <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                              <td className="py-6">
                                <p className="text-sm font-black text-gray-900">{asset.assetType}</p>
                                <p className="text-xs text-gray-500 font-medium">{asset.description}</p>
                              </td>
                              <td className="py-6 text-sm font-bold text-gray-600">{asset.country}</td>
                              <td className="py-6 text-sm font-black text-gray-900">{formatCurrency(asset.costOfAcquisition)}</td>
                              <td className="py-6 text-sm font-black text-gray-900">{formatCurrency(asset.peakValueDuringYear)}</td>
                              <td className="py-6 text-sm font-black text-indigo-600 text-right">{formatCurrency(asset.incomeDerived)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}

                {/* Filing Guide */}
                {filingGuide && (
                  <section className="bg-indigo-50 rounded-[3rem] border border-indigo-100 p-12 shadow-sm">
                    <div className="flex items-center space-x-4 mb-12">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                        <ListOrdered className="w-7 h-7 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-black tracking-tight text-indigo-900">{filingGuide.title}</h3>
                        <p className="text-sm text-indigo-700 font-medium">Follow these steps on the income tax portal</p>
                      </div>
                    </div>

                    <div className="space-y-8">
                      {filingGuide.steps.map((step, i) => (
                        <div key={i} className="flex gap-8 group">
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-lg font-black shadow-lg shadow-indigo-200 shrink-0">
                              {i + 1}
                            </div>
                            {i < filingGuide.steps.length - 1 && (
                              <div className="w-px h-full bg-indigo-200 my-2" />
                            )}
                          </div>
                          <div className="pb-8">
                            <h4 className="text-xl font-black text-indigo-900 mb-2 tracking-tight">{step.title}</h4>
                            <p className="text-sm text-indigo-700 font-medium leading-relaxed">{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Detailed Breakdown */}
                <section className="bg-white rounded-[3rem] border border-gray-100 p-10 shadow-sm">
                  <h3 className="text-3xl font-black tracking-tight mb-8">Tax Computation Details</h3>
                  <div className="prose prose-indigo max-w-none text-gray-600 prose-headings:font-black prose-headings:tracking-tight prose-p:leading-relaxed prose-p:font-medium">
                    <ReactMarkdown>{detailedBreakdown}</ReactMarkdown>
                  </div>
                </section>
              </div>

              <div className="space-y-12">
                {/* Recommendations */}
                <section className="bg-indigo-900 rounded-[3rem] p-10 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-2xl rounded-full -mr-16 -mt-16" />
                  <h3 className="text-2xl font-black mb-10 flex items-center space-x-3">
                    <AlertCircle className="w-6 h-6 text-indigo-300" />
                    <span>CA Recommendations</span>
                  </h3>
                  <ul className="space-y-8">
                    {recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start space-x-4">
                        <div className="w-7 h-7 bg-white/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 className="w-4 h-4 text-indigo-300" />
                        </div>
                        <span className="text-sm text-indigo-100 font-bold leading-relaxed">{rec}</span>
                      </li>
                    ))}
                  </ul>
                  <button className="w-full mt-12 py-5 bg-white text-indigo-900 rounded-[1.5rem] font-black text-sm hover:bg-indigo-50 transition-all shadow-xl shadow-black/10">
                    Book CA Consultation
                  </button>
                </section>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="advance-tax-section"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-12"
          >
            <div className="lg:col-span-2">
              <section className="bg-white rounded-[3rem] border border-gray-100 overflow-hidden shadow-sm">
                <div className="p-10 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-3xl font-black tracking-tight">Advance Tax Schedule</h3>
                    <p className="text-sm text-gray-500 font-medium mt-1">Avoid Section 234B/C interest penalties</p>
                  </div>
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="w-7 h-7 text-indigo-600" />
                  </div>
                </div>
                <div className="divide-y divide-gray-50">
                  {advanceTaxSchedule.map((item, idx) => (
                    <div key={idx} className="p-10 hover:bg-gray-50 transition-colors group">
                      <div className="flex justify-between items-start mb-8">
                        <div className="space-y-1">
                          <span className="text-2xl font-black text-gray-900">{item.dueDate}</span>
                          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Installment Deadline</p>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl">
                          {item.percentage}% Cumulative Due
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-12">
                        <div className="space-y-2">
                          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Installment Amount</p>
                          <p className="text-3xl font-black text-gray-900 tracking-tighter">{formatCurrency(item.installmentAmount)}</p>
                        </div>
                        <div className="space-y-2 text-right">
                          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Cumulative Total</p>
                          <p className="text-3xl font-black text-indigo-600 tracking-tighter">{formatCurrency(item.cumulativeAmount)}</p>
                        </div>
                      </div>
                      <button className="w-full mt-10 py-4 bg-white border border-gray-100 rounded-2xl text-xs font-black text-gray-500 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all uppercase tracking-widest">
                        Mark as Paid
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
            
            <div className="space-y-12">
              <section className="bg-white rounded-[3rem] border border-gray-100 p-10 shadow-sm">
                <h4 className="text-xl font-black mb-6 tracking-tight">Advance Tax Rules</h4>
                <div className="space-y-6">
                  <RuleItem 
                    title="Who must pay?" 
                    desc="If your total tax liability (after TDS) exceeds ₹10,000 in a financial year." 
                  />
                  <RuleItem 
                    title="Section 234B" 
                    desc="1% monthly interest if 90% of tax is not paid by March 31st." 
                  />
                  <RuleItem 
                    title="Section 234C" 
                    desc="1% monthly interest for deferment in installment payments." 
                  />
                </div>
              </section>

              <section className="bg-indigo-50 rounded-[3rem] p-10 border border-indigo-100">
                <h4 className="text-xl font-black text-indigo-900 mb-4 tracking-tight">Need help paying?</h4>
                <p className="text-sm text-indigo-700 font-medium leading-relaxed mb-8">
                  Our CAs can help you calculate the exact amount and generate the challan for you.
                </p>
                <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                  Consult an Expert
                </button>
              </section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SummaryStat = ({ label, value, color = "text-gray-900" }: { label: React.ReactNode, value: string, color?: string }) => (
  <div className="space-y-1">
    <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{label}</div>
    <p className={cn("text-2xl font-black tracking-tighter", color)}>{value}</p>
  </div>
);

const RuleItem = ({ title, desc }: { title: string, desc: string }) => (
  <div className="space-y-2">
    <h5 className="text-sm font-black text-gray-900">{title}</h5>
    <p className="text-xs text-gray-500 font-medium leading-relaxed">{desc}</p>
  </div>
);

const SourceCard = ({ title, value, icon, color }: { title: React.ReactNode, value: string, icon: React.ReactNode, color: string }) => {
  const colors: Record<string, string> = {
    indigo: "bg-indigo-50 border-indigo-100 text-indigo-600",
    orange: "bg-orange-50 border-orange-100 text-orange-600",
    green: "bg-green-50 border-green-100 text-green-600",
    blue: "bg-blue-50 border-blue-100 text-blue-600",
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("p-6 rounded-[2rem] border shadow-sm transition-all hover:shadow-md", colors[color])}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-[10px] font-black uppercase tracking-widest opacity-60">{title}</div>
        <p className="text-2xl font-black tracking-tighter text-gray-900">{value}</p>
      </div>
    </motion.div>
  );
};

const StrategyCard = ({ title, desc, section }: { title: string, desc: string, section: string }) => (
  <div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl hover:border-indigo-100 transition-all group">
    <div className="flex justify-between items-start mb-2">
      <h5 className="text-sm font-black text-gray-900">{title}</h5>
      <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg uppercase tracking-widest">{section}</span>
    </div>
    <p className="text-xs text-gray-500 font-medium leading-relaxed">{desc}</p>
  </div>
);

const CalcInput = ({ label, value, onChange }: { label: string, value: number, onChange: (v: string) => void }) => (
  <div className="flex items-center justify-between gap-4">
    <label className="text-xs font-bold text-indigo-700 uppercase tracking-widest shrink-0">{label}</label>
    <div className="relative flex-1 max-w-[120px]">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-indigo-400">₹</span>
      <input 
        type="number" 
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className="w-full bg-white border border-indigo-100 rounded-xl py-2 pl-7 pr-3 text-xs font-black text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
      />
    </div>
  </div>
);
