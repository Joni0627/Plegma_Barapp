import React, { useState } from 'react';
import { X, Lock, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { FormField, TextInput } from '../ui/Form';
import { CashLine } from '../../types';

interface CloseLineModalProps {
  line: CashLine;
  onClose: () => void;
  onConfirm: (realAmount: number) => void;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n);

export const CloseLineModal: React.FC<CloseLineModalProps> = ({ line, onClose, onConfirm }) => {
  const [realAmountStr, setRealAmountStr] = useState(
    line.realAmount !== undefined ? String(line.realAmount) : String(line.theoreticalAmount)
  );
  const [error, setError] = useState('');

  const theoretical = line.initialAmount + line.ticketsTotal - line.expensesTotal - line.withdrawalsTotal;
  const realAmount = parseFloat(realAmountStr);
  const isValidNumber = !isNaN(realAmount);
  const difference = isValidNumber ? realAmount - theoretical : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidNumber) {
      setError('Debe ingresar el Monto Real Cierre previamente (R03).');
      return;
    }
    onConfirm(realAmount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl space-y-0">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Cerrar Línea de Caja</h3>
              <p className="text-xs text-slate-400">Declarar conteo físico y conciliar línea</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Theoretical Summary pill */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Línea Operativa:</span>
              <span className="font-black text-slate-900">{line.boxType}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px] pt-1 border-t border-slate-200">
              <div>
                <span className="text-slate-400 font-semibold block">Inicio:</span>
                <span className="font-bold text-slate-700">{fmt(line.initialAmount)}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">+ Tickets:</span>
                <span className="font-bold text-emerald-600">+{fmt(line.ticketsTotal)}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">- Gastos/Retiros:</span>
                <span className="font-bold text-rose-600">-{fmt(line.expensesTotal + line.withdrawalsTotal)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
              <span className="font-black text-slate-800">Monto Teórico Sistema:</span>
              <span className="font-black text-sm text-slate-900">{fmt(theoretical)}</span>
            </div>
          </div>

          <FormField label="Monto Real Cierre ($)" required hint="Importe físico contado o verificado digitalmente">
            <TextInput
              type="number"
              step="any"
              placeholder="0"
              value={realAmountStr}
              onChange={(e) => {
                setRealAmountStr(e.target.value);
                setError('');
              }}
            />
          </FormField>

          {/* Difference evaluation banner */}
          {isValidNumber && (
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                difference === 0
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : difference > 0
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {difference === 0 ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : difference > 0 ? (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <div>
                  <p className="text-xs font-black">
                    {difference === 0
                      ? 'Caja Correcta (Sin diferencias)'
                      : difference > 0
                      ? 'Sobrante de Caja'
                      : 'Faltante de Caja'}
                  </p>
                  <p className="text-[11px] opacity-80">
                    {difference === 0
                      ? 'El dinero contado coincide exactamente con el teórico.'
                      : difference > 0
                      ? `Existen ${fmt(difference)} más de lo esperado.`
                      : `Faltan ${fmt(Math.abs(difference))} respecto al importe teórico.`}
                  </p>
                </div>
              </div>
              <span className="font-black text-sm font-mono shrink-0">
                {difference >= 0 ? `+${fmt(difference)}` : fmt(difference)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" leftIcon={<Lock className="w-4 h-4" />}>
              Cerrar Línea de Caja
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
