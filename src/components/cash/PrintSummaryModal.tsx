import React from 'react';
import { X, Printer, ShieldCheck, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { CashShift, CashLine, MasterCashBox } from '../../types';

interface PrintSummaryModalProps {
  shift: CashShift;
  lines: CashLine[];
  masterBoxes: MasterCashBox[];
  onClose: () => void;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n);

export const PrintSummaryModal: React.FC<PrintSummaryModalProps> = ({
  shift,
  lines,
  masterBoxes,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const totalInitial = lines.reduce((acc, l) => acc + l.initialAmount, 0);
  const totalTickets = lines.reduce((acc, l) => acc + l.ticketsTotal, 0);
  const totalExpenses = lines.reduce((acc, l) => acc + l.expensesTotal, 0);
  const totalWithdrawals = lines.reduce((acc, l) => acc + l.withdrawalsTotal, 0);
  const totalTheoretical = lines.reduce((acc, l) => acc + l.theoreticalAmount, 0);
  const totalReal = lines.reduce((acc, l) => acc + (l.realAmount || 0), 0);
  const totalDiff = lines.reduce((acc, l) => acc + (l.difference || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl space-y-0 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Imprimir Resumen de Caja</h3>
              <p className="text-xs text-slate-400">Informe de arqueo, conciliación y transferencia de turno</p>
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

        {/* Printable Document Body */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1 text-slate-800 font-sans print:p-0 print:overflow-visible">
          {/* Company Branding */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">PLEGMA RESTO BAR</h1>
              <p className="text-xs text-slate-500 font-medium">Informe Oficial de Arqueo y Cierre de Caja</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-700">
                {shift.name}
              </span>
              <p className="text-[10px] text-slate-400 mt-1 font-mono">{shift.createdAt}</p>
            </div>
          </div>

          {/* Shift Details Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Turno</p>
              <p className="font-black text-slate-800">{shift.shift}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Usuario Apertura</p>
              <p className="font-semibold text-slate-800">{shift.openedByUserName}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Estado del Turno</p>
              <span className="font-bold text-emerald-700">{shift.status}</span>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Diferencia Total</p>
              <p className={`font-black ${totalDiff === 0 ? 'text-emerald-600' : totalDiff > 0 ? 'text-amber-600' : 'text-rose-600'}`}>
                {totalDiff >= 0 ? `+${fmt(totalDiff)}` : fmt(totalDiff)}
              </p>
            </div>
          </div>

          {/* Lines Breakdown Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Desglose por Línea de Caja / Medio de Pago
            </h4>
            <table className="w-full text-xs border-collapse border border-slate-200 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
                  <th className="p-2.5 text-left">Medio</th>
                  <th className="p-2.5 text-right">Inicio</th>
                  <th className="p-2.5 text-right">+ Tickets</th>
                  <th className="p-2.5 text-right">- Gastos</th>
                  <th className="p-2.5 text-right">- Retiros</th>
                  <th className="p-2.5 text-right">Teórico</th>
                  <th className="p-2.5 text-right">Real</th>
                  <th className="p-2.5 text-right">Dif.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lines.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-800">{l.boxType}</td>
                    <td className="p-2.5 text-right font-medium">{fmt(l.initialAmount)}</td>
                    <td className="p-2.5 text-right font-medium text-emerald-700">+{fmt(l.ticketsTotal)}</td>
                    <td className="p-2.5 text-right font-medium text-rose-600">-{fmt(l.expensesTotal)}</td>
                    <td className="p-2.5 text-right font-medium text-amber-600">-{fmt(l.withdrawalsTotal)}</td>
                    <td className="p-2.5 text-right font-bold">{fmt(l.theoreticalAmount)}</td>
                    <td className="p-2.5 text-right font-bold text-slate-900">
                      {l.realAmount !== undefined ? fmt(l.realAmount) : '-'}
                    </td>
                    <td className={`p-2.5 text-right font-black ${
                      (l.difference || 0) === 0
                        ? 'text-slate-500'
                        : (l.difference || 0) > 0
                        ? 'text-amber-600'
                        : 'text-rose-600'
                    }`}>
                      {l.difference !== undefined ? (l.difference >= 0 ? `+${fmt(l.difference)}` : fmt(l.difference)) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-900 text-white font-bold text-xs">
                  <td className="p-2.5">TOTALES CONSOLIDADOS</td>
                  <td className="p-2.5 text-right">{fmt(totalInitial)}</td>
                  <td className="p-2.5 text-right text-emerald-400">+{fmt(totalTickets)}</td>
                  <td className="p-2.5 text-right text-rose-300">-{fmt(totalExpenses)}</td>
                  <td className="p-2.5 text-right text-amber-300">-{fmt(totalWithdrawals)}</td>
                  <td className="p-2.5 text-right">{fmt(totalTheoretical)}</td>
                  <td className="p-2.5 text-right font-black text-amber-400">{fmt(totalReal)}</td>
                  <td className="p-2.5 text-right font-black">
                    {totalDiff >= 0 ? `+${fmt(totalDiff)}` : fmt(totalDiff)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Master Box Balances */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Estado Acumulado en Cajas Maestras
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {masterBoxes.map((mb) => (
                <div key={mb.id} className="p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-0.5">
                  <p className="text-[10px] text-slate-400 font-semibold">{mb.name}</p>
                  <p className="font-black text-slate-900 text-sm">{fmt(mb.currentBalance)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Signature fields for paper printing */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs print:pt-12">
            <div className="border-t border-slate-400 pt-2">
              <p className="font-bold text-slate-700">Firma Cajero / Operador</p>
              <p className="text-[10px] text-slate-400">Aclaración y DNI</p>
            </div>
            <div className="border-t border-slate-400 pt-2">
              <p className="font-bold text-slate-700">Firma Encargado / Auditor</p>
              <p className="text-[10px] text-slate-400">Aclaración y DNI</p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 print:hidden">
          <Button type="button" variant="outline" onClick={onClose}>
            Cerrar Ventana
          </Button>
          <Button type="button" variant="primary" leftIcon={<Printer className="w-4 h-4" />} onClick={handlePrint}>
            Imprimir Informe Resumen
          </Button>
        </div>
      </div>
    </div>
  );
};
