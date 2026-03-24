import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Lock, EyeOff, UserCheck, X, FileCheck, Server } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityModal: React.FC<Props> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl z-[101] overflow-hidden"
          >
            <div className="relative p-10">
              <button 
                onClick={onClose}
                className="absolute top-8 right-8 p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>

              <div className="flex items-center space-x-4 mb-10">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">Security & Privacy</h2>
                  <p className="text-gray-500 font-medium">How we protect your financial data</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <SecurityFeature 
                  icon={<Lock className="w-5 h-5 text-indigo-600" />}
                  title="AES-256 Encryption"
                  desc="All data is encrypted using bank-grade standards before being processed."
                />
                <SecurityFeature 
                  icon={<EyeOff className="w-5 h-5 text-indigo-600" />}
                  title="Zero-Knowledge Processing"
                  desc="Our AI processes your files in a sandboxed environment. No human sees your data."
                />
                <SecurityFeature 
                  icon={<FileCheck className="w-5 h-5 text-indigo-600" />}
                  title="DPDP Act Compliant"
                  desc="We strictly adhere to India's Digital Personal Data Protection Act 2023."
                />
                <SecurityFeature 
                  icon={<Server className="w-5 h-5 text-indigo-600" />}
                  title="No Permanent Storage"
                  desc="Files are deleted immediately after analysis unless you explicitly choose to save."
                />
              </div>

              <div className="mt-12 p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
                <div className="flex items-start space-x-4">
                  <UserCheck className="w-6 h-6 text-indigo-600 shrink-0 mt-1" />
                  <div className="space-y-2">
                    <h4 className="font-black text-indigo-900">Your Data, Your Control</h4>
                    <p className="text-sm text-indigo-700 leading-relaxed font-medium">
                      We do not sell your data to third parties. Your financial information is used solely to provide you with accurate tax calculations and filing guidance.
                    </p>
                  </div>
                </div>
              </div>

              <button 
                onClick={onClose}
                className="w-full mt-10 py-5 bg-gray-900 text-white rounded-2xl font-black text-lg hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
              >
                I Understand
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const SecurityFeature = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="space-y-3">
    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
      {icon}
    </div>
    <h4 className="font-black text-gray-900 tracking-tight">{title}</h4>
    <p className="text-sm text-gray-500 font-medium leading-relaxed">{desc}</p>
  </div>
);
