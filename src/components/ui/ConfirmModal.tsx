import React from 'react';
import { AlertTriangle, X, Info } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: (inputValue?: string) => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info' | 'success';
  requiresInput?: boolean;
  inputPlaceholder?: string;
  inputLabel?: string;
  showCancel?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  type = 'danger',
  requiresInput = false,
  inputPlaceholder = 'Escriba aquí...',
  inputLabel = 'Justificación',
  showCancel = true,
}) => {
  const [inputValue, setInputValue] = React.useState('');

  // Reset input when modal opens/closes
  React.useEffect(() => {
    if (isOpen) setInputValue('');
  }, [isOpen]);

  if (!isOpen) return null;

  const typeConfig = {
    danger: {
      icon: <AlertTriangle className="w-6 h-6 text-rose-600" />,
      bg: 'bg-rose-100',
      btn: 'bg-rose-600 hover:bg-rose-700 text-white'
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
      bg: 'bg-amber-100',
      btn: 'bg-amber-600 hover:bg-amber-700 text-white'
    },
    info: {
      icon: <Info className="w-6 h-6 text-indigo-600" />,
      bg: 'bg-indigo-100',
      btn: 'bg-indigo-600 hover:bg-indigo-700 text-white'
    },
    success: {
      icon: <Info className="w-6 h-6 text-emerald-600" />,
      bg: 'bg-emerald-100',
      btn: 'bg-emerald-600 hover:bg-emerald-700 text-white'
    }
  };

  const config = typeConfig[type];

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-sm border border-slate-200 animate-in fade-in zoom-in duration-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${config.bg}`}>
              {config.icon}
            </div>
            <h3 className="font-extrabold text-lg text-slate-900">{title}</h3>
          </div>
          <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-600 mt-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          {message}
        </p>

        {requiresInput && (
          <div className="mb-6 text-left">
            <label className="block text-xs font-bold text-slate-700 mb-1">{inputLabel}</label>
            <input
              type="text"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              placeholder={inputPlaceholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              autoFocus
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          {showCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 font-bold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            disabled={requiresInput && !inputValue.trim()}
            onClick={() => onConfirm(inputValue)}
            className={`px-4 py-2 font-bold text-xs rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed ${config.btn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

