import React from 'react';
import { createPortal } from 'react-dom';
import { X, Clock, CheckCircle2, AlertTriangle, AlertCircle, Printer, FileText, Lock, Building2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { CashShift, CashLine, CashMovement } from '../../types';

interface ShiftHistoryModalProps {
  shift: CashShift;
  lines: CashLine[];
  movements: CashMovement[];
  onClose: () => void;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n);

export const ShiftHistoryModal: React.FC<ShiftHistoryModalProps> = ({
  shift,
  lines,
  movements,
  onClose,
}) => {
  const shiftLines = lines.filter((l) => l.shiftId === shift.id);
  const lineIds = shiftLines.map((l) => l.id);
  const shiftMovements = movements.filter((m) => lineIds.includes(m.lineId));

  const totalInitial = shiftLines.reduce((acc, l) => acc + l.initialAmount, 0);
  const totalTickets = shiftLines.reduce((acc, l) => acc + l.ticketsTotal, 0);
  const totalExpenses = shiftLines.reduce((acc, l) => acc + l.expensesTotal, 0);
  const totalWithdrawals = shiftLines.reduce((acc, l) => acc + l.withdrawalsTotal, 0);
  const totalTheoretical = shiftLines.reduce((acc, l) => acc + l.theoreticalAmount, 0);
  const totalReal = shiftLines.reduce((acc, l) => acc + (l.realAmount || 0), 0);
  const totalDifference = shiftLines.reduce((acc, l) => acc + (l.difference || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:static print:bg-transparent print:p-0 print:block">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 print:shadow-none print:border-none print:max-h-none print:max-w-none print:w-full print:block print:rounded-none">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base flex items-center gap-2">
                Detalle Auditado &bull; <span className="font-mono text-indigo-300">{shift.name}</span>
              </h3>
              <p className="text-xs text-slate-400">
                Historial completo de caja de turno &bull; Estado: {shift.status}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-extrabold rounded-xl transition"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6 text-xs text-slate-700 font-sans">
          {/* Metadata Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Nombre de Turno</span>
              <span className="font-black text-slate-900 text-xs block">{shift.name}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Fecha Apertura</span>
              <span className="font-medium text-slate-800 text-xs block">{shift.createdAt}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Usuario Apertura</span>
              <span className="font-bold text-slate-800 text-xs block">{shift.openedByUserName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Estado del Turno</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-200 mt-0.5">
                {shift.status}
              </span>
            </div>
          </div>

          {/* Consolidation Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Monto Inicio</span>
              <p className="font-black text-slate-900 text-sm">{fmt(totalInitial)}</p>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-0.5">
              <span className="text-[10px] text-emerald-600 font-bold uppercase">+ Tickets</span>
              <p className="font-black text-emerald-700 text-sm">+{fmt(totalTickets)}</p>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-0.5">
              <span className="text-[10px] text-rose-600 font-bold uppercase">- Gastos/Retiros</span>
              <p className="font-black text-rose-700 text-sm">-{fmt(totalExpenses + totalWithdrawals)}</p>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-0.5">
              <span className="text-[10px] text-indigo-600 font-bold uppercase">Monto Teórico</span>
              <p className="font-black text-indigo-900 text-sm">{fmt(totalTheoretical)}</p>
            </div>
            <div
              className={`p-3 border rounded-xl space-y-0.5 ${
                totalDifference === 0
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : totalDifference > 0
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              <span className="text-[10px] font-black uppercase">Diferencia Total</span>
              <p className="font-black text-sm font-mono">
                {totalDifference >= 0 ? `+${fmt(totalDifference)}` : fmt(totalDifference)}
              </p>
            </div>
          </div>

          {/* Shift Lines Breakdown */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Desglose de Líneas de Caja del Turno ({shiftLines.length})
            </h4>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    <th className="p-3">Medio de Pago / Caja</th>
                    <th className="p-3 text-right">Inicio</th>
                    <th className="p-3 text-right">+ Tickets</th>
                    <th className="p-3 text-right">- Gastos</th>
                    <th className="p-3 text-right">- Retiros</th>
                    <th className="p-3 text-right">Teórico</th>
                    <th className="p-3 text-right">Real Cierre</th>
                    <th className="p-3 text-right">Diferencia</th>
                    <th className="p-3 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {shiftLines.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-6 text-center text-slate-400">
                        No hay líneas registradas en este turno.
                      </td>
                    </tr>
                  ) : (
                    shiftLines.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50">
                        <td className="p-3 font-extrabold text-slate-900">{l.boxType}</td>
                        <td className="p-3 text-right font-mono">{fmt(l.initialAmount)}</td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-600">+{fmt(l.ticketsTotal)}</td>
                        <td className="p-3 text-right font-mono font-bold text-rose-600">-{fmt(l.expensesTotal)}</td>
                        <td className="p-3 text-right font-mono font-bold text-amber-600">-{fmt(l.withdrawalsTotal)}</td>
                        <td className="p-3 text-right font-mono font-black text-slate-900">{fmt(l.theoreticalAmount)}</td>
                        <td className="p-3 text-right font-mono font-bold text-slate-800">
                          {l.realAmount !== undefined ? fmt(l.realAmount) : '-'}
                        </td>
                        <td className="p-3 text-right font-mono font-black">
                          {l.difference !== undefined ? (
                            <span
                              className={
                                l.difference === 0
                                  ? 'text-slate-500'
                                  : l.difference > 0
                                  ? 'text-amber-600'
                                  : 'text-rose-600'
                              }
                            >
                              {l.difference >= 0 ? `+${fmt(l.difference)}` : fmt(l.difference)}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {l.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Difference notes if any */}
          {shiftLines.some((l) => l.differenceNotes) && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
              <h5 className="font-bold text-amber-900 text-xs flex items-center gap-1.5 uppercase">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Justificaciones de Diferencia de Caja Registradas
              </h5>
              <div className="space-y-1.5 text-xs text-amber-800 font-medium">
                {shiftLines
                  .filter((l) => l.differenceNotes)
                  .map((l) => (
                    <p key={l.id} className="bg-white/80 p-2.5 rounded-xl border border-amber-200">
                      <strong>Línea {l.boxType}:</strong> "{l.differenceNotes}" (Diferencia:{' '}
                      {l.difference !== undefined && l.difference >= 0 ? `+${fmt(l.difference)}` : fmt(l.difference || 0)})
                    </p>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between shrink-0 print:hidden">
          <span className="text-xs text-slate-400">
            Registro auditado de Control de Caja &bull; Plegma Barapp
          </span>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={handlePrint} leftIcon={<Printer className="w-4 h-4" />}>
              Imprimir
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
