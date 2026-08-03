import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast, hideToast } = useApp();

  if (!toast) return null;

  const typeStyles = {
    success: 'bg-slate-900 border-emerald-500 text-white shadow-emerald-950/20',
    error: 'bg-slate-900 border-rose-500 text-white shadow-rose-950/20',
    info: 'bg-slate-900 border-sky-500 text-white shadow-sky-950/20',
    warning: 'bg-slate-900 border-amber-500 text-white shadow-amber-950/20',
  };

  const iconStyles = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
  };

  return (
    <div className="fixed top-5 right-5 z-[9999] max-w-md w-full animate-fadeIn transition-all duration-300">
      <div
        className={`flex items-center justify-between p-4 rounded-2xl border-2 shadow-2xl backdrop-blur-md ${
          typeStyles[toast.type] || typeStyles.info
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="p-1 rounded-xl bg-white/10">{iconStyles[toast.type]}</div>
          <span className="text-xs font-extrabold tracking-tight leading-snug">{toast.message}</span>
        </div>

        <button
          type="button"
          onClick={hideToast}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition ml-3"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
