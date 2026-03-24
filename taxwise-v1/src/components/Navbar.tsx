import React from 'react';
import { Calculator, ShieldCheck, Menu, Lock, LogOut, User, ChevronDown } from 'lucide-react';
import { SecurityModal } from './SecurityModal';
import { useTaxStore } from '../store/useTaxStore';

interface NavbarProps {
  user?: { name: string; email: string } | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const [isSecurityModalOpen, setIsSecurityModalOpen] = React.useState(false);
  const { financialYear, setFinancialYear } = useTaxStore();
  const financialYears = ['2023-24', '2024-25', '2025-26'];

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-gray-900">TaxWise <span className="text-indigo-600">India</span></span>
          </div>
          
          <div className="hidden md:flex items-center space-x-10">
            <div className="relative group">
              <select 
                value={financialYear}
                onChange={(e) => setFinancialYear(e.target.value)}
                className="appearance-none bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 pr-10 text-xs font-black text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer uppercase tracking-widest"
              >
                {financialYears.map(year => (
                  <option key={year} value={year}>FY {year}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
            </div>
            <a href="#" className="text-sm font-black text-gray-600 hover:text-indigo-600 transition-colors uppercase tracking-widest">Dashboard</a>
            <a href="#" className="text-sm font-black text-gray-600 hover:text-indigo-600 transition-colors uppercase tracking-widest">Tax Guides</a>
            <button 
              onClick={() => setIsSecurityModalOpen(true)}
              className="text-sm font-black text-gray-600 hover:text-indigo-600 transition-colors uppercase tracking-widest flex items-center space-x-2"
            >
              <Lock className="w-4 h-4" />
              <span>Security</span>
            </button>
          </div>

          <div className="flex items-center space-x-6">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-black text-gray-900">{user.name}</span>
                  <span className="text-[10px] font-medium text-gray-400">{user.email}</span>
                </div>
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                  <User className="w-5 h-5" />
                </div>
                <button 
                  onClick={onLogout}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2 text-[10px] font-black text-gray-500 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 uppercase tracking-widest">
                <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                <span>Bank-Grade Security</span>
              </div>
            )}
            <button className="md:hidden p-2 text-gray-400 hover:text-gray-600">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>
      <SecurityModal isOpen={isSecurityModalOpen} onClose={() => setIsSecurityModalOpen(false)} />
    </>
  );
};
