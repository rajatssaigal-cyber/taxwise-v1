import React from 'react';
import { Navbar } from './components/Navbar';
import { FileUpload } from './components/FileUpload';
import { TaxReport } from './components/TaxReport';
import { TaxLiabilityChart } from './components/TaxLiabilityChart';
import { ChatBot } from './components/ChatBot';
import { analyzeTaxDocuments } from './lib/gemini';
import { useTaxStore } from './store/useTaxStore';
import { 
  ArrowRight, 
  Loader2, 
  RefreshCw, 
  AlertTriangle, 
  BarChart3, 
  ShieldCheck, 
  Lock, 
  EyeOff, 
  UserCheck,
  ChevronRight,
  FileText,
  Calculator as CalcIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const { 
    summary, 
    isLoading, 
    error, 
    setSummary, 
    setAdvanceTaxSchedule, 
    setLoading, 
    setError, 
    reset,
    itrGuidance,
    setItrGuidance,
    detailedBreakdown,
    setDetailedBreakdown,
    recommendations,
    setRecommendations,
    financialYear,
    foreignAssetsSchedule,
    setForeignAssetsSchedule,
    filingGuide,
    setFilingGuide
  } = useTaxStore();
  
  const [files, setFiles] = React.useState<File[]>([]);
  const [activeTab, setActiveTab] = React.useState<'itr' | 'advance'>('itr');
  const [user, setUser] = React.useState<{ name: string; email: string } | null>(null);

  // Simple mock login check
  React.useEffect(() => {
    const savedUser = localStorage.getItem('taxwise_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = () => {
    const mockUser = { name: 'Rajat Saigal', email: 'rajatsaigal@google.com' };
    localStorage.setItem('taxwise_user', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('taxwise_user');
    setUser(null);
    reset();
  };

  // Re-calculate when financial year changes
  React.useEffect(() => {
    if (files.length > 0 && summary) {
      processDocuments();
    }
  }, [financialYear]);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles]);
    setError(null);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processDocuments = async () => {
    if (files.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const filePromises = files.map(file => {
        return new Promise<{ name: string; data: string; mimeType: string }>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve({
            name: file.name,
            data: reader.result as string,
            mimeType: file.type
          });
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      const processedFiles = await Promise.all(filePromises);
      const analysis = await analyzeTaxDocuments(processedFiles, financialYear);
      
      setSummary({
        totalIncome: analysis.summary.totalIncome,
        stcg: analysis.summary.shortTermCapitalGains,
        ltcg: analysis.summary.longTermCapitalGains,
        dividendIncome: analysis.summary.dividendIncome,
        otherIncome: analysis.summary.otherIncome,
        totalTaxLiability: analysis.summary.totalTaxLiability,
        oldRegimeTax: analysis.summary.oldRegimeTax,
        newRegimeTax: analysis.summary.newRegimeTax,
        advanceTaxPaid: analysis.summary.taxPaid,
        balanceTax: analysis.summary.balanceTax,
        salaryIncome: analysis.summary.salaryIncome,
        deductions80C: analysis.summary.deductions80C,
        deductionsOther: analysis.summary.deductionsOther
      } as any);

      setAdvanceTaxSchedule(analysis.advanceTaxSchedule.map(item => ({
        dueDate: item.dueDate,
        percentage: item.percentage,
        cumulativeAmount: item.cumulativeAmount,
        installmentAmount: item.installmentAmount,
        status: 'PENDING'
      })));

      setItrGuidance(analysis.itrGuidance);
      setDetailedBreakdown(analysis.detailedBreakdown);
      setRecommendations(analysis.recommendations);
      setForeignAssetsSchedule(analysis.foreignAssetsSchedule || []);
      setFilingGuide(analysis.filingGuide);

    } catch (err) {
      console.error(err);
      setError("We encountered an issue analyzing your documents. Please ensure they are valid financial statements.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    reset();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-[3rem] p-12 shadow-2xl shadow-indigo-100 border border-gray-100 text-center space-y-12"
        >
          <div className="space-y-6">
            <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-indigo-200">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter">Welcome to TaxWise</h1>
            <p className="text-gray-500 font-medium">The premium tax engine for Indian investors. Please sign in to continue.</p>
          </div>
          
          <button 
            onClick={handleLogin}
            className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-lg hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 flex items-center justify-center space-x-4"
          >
            <UserCheck className="w-6 h-6" />
            <span>Sign in with Google</span>
          </button>
          
          <div className="pt-6 border-t border-gray-50 flex items-center justify-center space-x-6 text-gray-400">
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Secure</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">DPDP Compliant</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper font-sans text-ink selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar onLogout={handleLogout} user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <AnimatePresence mode="wait">
          {!summary ? (
            <motion.div 
              key="upload-section"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="max-w-5xl mx-auto"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                <div className="space-y-12">
                  <div className="space-y-6">
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-100 shadow-sm"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                      <span>DPDP Act Compliant</span>
                    </motion.div>
                    <h1 className="text-7xl sm:text-8xl font-black leading-[0.85] tracking-tighter">
                      Tax Filing <br />
                      <span className="editorial-title text-indigo-600">Simplified.</span>
                    </h1>
                    <p className="text-xl text-gray-500 font-medium leading-relaxed max-w-md">
                      The editorial-grade tax engine for Indian investors. Ingest Form 16, Salary Slips, and Broker Statements in seconds.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <FeatureItem 
                      icon={<Lock className="w-5 h-5" />}
                      title="Encrypted"
                      desc="Bank-grade AES-256 security."
                    />
                    <FeatureItem 
                      icon={<EyeOff className="w-5 h-5" />}
                      title="Private"
                      desc="Zero-knowledge processing."
                    />
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -inset-4 bg-indigo-500/5 blur-3xl rounded-full" />
                  <div className="relative bg-white rounded-[3rem] p-12 shadow-2xl shadow-indigo-100/50 border border-gray-100">
                    <FileUpload 
                      onFilesSelected={handleFilesSelected}
                      files={files}
                      onRemoveFile={handleRemoveFile}
                      isLoading={isLoading}
                    />

                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mt-8 p-6 bg-red-50 border border-red-100 rounded-3xl flex items-start space-x-4"
                      >
                        <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700 font-bold leading-relaxed">{error}</p>
                      </motion.div>
                    )}

                    <div className="mt-12">
                      <motion.button
                        onClick={processDocuments}
                        disabled={files.length === 0 || isLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={
                          `w-full py-6 rounded-[2rem] font-black text-xl flex items-center justify-center space-x-3 transition-all shadow-2xl
                          ${files.length > 0 && !isLoading 
                            ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200" 
                            : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"}`
                        }
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span>Analyzing...</span>
                          </>
                        ) : (
                          <>
                            <span>Generate Report</span>
                            <ArrowRight className="w-6 h-6" />
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="report-section"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-16"
            >
              {/* Header */}
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-indigo-600 font-black text-xs uppercase tracking-[0.2em]">
                    <span className="w-8 h-px bg-indigo-600" />
                    <span>Analysis Complete</span>
                  </div>
                  <h2 className="text-7xl font-black tracking-tighter leading-none">
                    Tax <span className="editorial-title">Summary.</span>
                  </h2>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
                    <button 
                      onClick={() => setActiveTab('itr')}
                      className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center space-x-2 ${
                        activeTab === 'itr' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      <span>ITR Filing</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab('advance')}
                      className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center space-x-2 ${
                        activeTab === 'advance' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <CalcIcon className="w-4 h-4" />
                      <span>Advance Tax</span>
                    </button>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReset}
                    className="p-4 bg-white border border-gray-200 rounded-2xl text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                <div className="lg:col-span-8">
                  <TaxReport 
                    activeSection={activeTab}
                    data={{
                      summary: summary as any,
                      advanceTaxSchedule: useTaxStore.getState().advanceTaxSchedule,
                      detailedBreakdown,
                      recommendations,
                      itrGuidance,
                      foreignAssetsSchedule,
                      filingGuide
                    }} 
                  />
                </div>
                <div className="lg:col-span-4 space-y-12">
                  <div className="bg-white rounded-[3rem] border border-gray-100 p-10 shadow-sm sticky top-24">
                    <div className="flex items-center space-x-4 mb-10">
                      <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-indigo-600" />
                      </div>
                      <h3 className="text-2xl font-black tracking-tight">Income Mix</h3>
                    </div>
                    <TaxLiabilityChart summary={summary as any} />
                    
                    <div className="mt-12 pt-12 border-t border-gray-50 space-y-6">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Quick Actions</h4>
                      <button className="w-full py-5 bg-gray-50 rounded-2xl text-sm font-black text-gray-600 hover:bg-gray-100 transition-colors text-left px-8 flex items-center justify-between group">
                        <span>View Tax Slabs</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                      <button className="w-full py-5 bg-gray-50 rounded-2xl text-sm font-black text-gray-600 hover:bg-gray-100 transition-colors text-left px-8 flex items-center justify-between group">
                        <span>Compare Regimes</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <ChatBot />
    </div>
  );
}

const FeatureItem = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="space-y-3">
    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100">
      {icon}
    </div>
    <div className="space-y-1">
      <h4 className="font-black text-lg tracking-tight">{title}</h4>
      <p className="text-sm text-gray-500 font-medium leading-relaxed">{desc}</p>
    </div>
  </div>
);
