import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Payrun, PayrunEmployeeDetail } from '../types';
import { ReceiptPreviewModal } from './ReceiptPreviewModal';
import {
  X,
  FileText,
  CheckCircle2,
  DollarSign,
  CreditCard,
  Printer,
  Edit,
  Clock,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface PayrunReceiptModalProps {
  payrun: Payrun;
  employeeDetail: PayrunEmployeeDetail;
  onClose: () => void;
}

export const PayrunReceiptModal: React.FC<PayrunReceiptModalProps> = ({
  payrun,
  employeeDetail,
  onClose,
}) => {
  const { markEmployeePaid, unmarkEmployeePaid, showToast } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<string>(
    employeeDetail.paymentMethod || 'Mercado Pago'
  );
  const [cashRegister, setCashRegister] = useState<string>(
    employeeDetail.cashRegister || 'MP FRANCO'
  );

  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const isPaid = employeeDetail.status === 'Pagado';

  const handleTogglePaymentStatus = () => {
    if (isPaid) {
      if (confirm(`¿Desea desmarcar el pago de sueldo de ${employeeDetail.employeeName}?`)) {
        unmarkEmployeePaid(payrun.id, employeeDetail.employeeId);
        showToast(`Pago desmarcado para ${employeeDetail.employeeName}.`, 'info');
        onClose();
      }
    } else {
      markEmployeePaid(payrun.id, employeeDetail.employeeId, paymentMethod, cashRegister);
      showToast(`Pago de $${employeeDetail.netAmount.toLocaleString('es-AR')} registrado como PAGADO.`, 'success');
      onClose();
    }
  };

  const handleOpenPDFPreview = () => {
    setIsPreviewOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header Bar */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">
                Detalle de Empleado (Recibo de Sueldo)
              </h3>
              <p className="text-xs text-slate-400">
                {payrun.periodName} • {employeeDetail.employeeName} (DNI: {employeeDetail.dni})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body Container (No visible scrollbar) */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 sm:p-6 space-y-6 text-xs bg-slate-50/50">
          {/* Main Grid: Header Data, Deductions, Payment Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Box 1: Datos de Horas & Bruto */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="border-b border-slate-100 pb-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Liquidación</span>
                <span className="font-mono font-black text-slate-900 text-xs block">{payrun.startDate}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Empleado</span>
                <span className="font-extrabold text-slate-900 text-xs block">{employeeDetail.employeeName}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Hs Trabajadas</span>
                  <span className="font-mono font-black text-slate-900 text-xs">{employeeDetail.hoursWorkedStr}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Valor Hora</span>
                  <span className="font-mono font-black text-slate-900 text-xs">
                    $ {employeeDetail.hourlyRate.toLocaleString('es-AR')}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Horas (Bruto)</span>
                <span className="font-mono font-black text-slate-900 text-sm">
                  $ {employeeDetail.grossAmount.toLocaleString('es-AR')}
                </span>
              </div>
            </div>

            {/* Box 2: Descuentos */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-black text-rose-700 tracking-wider block mb-2">
                  Descuentos
                </span>

                {employeeDetail.deductions.length === 0 ? (
                  <p className="text-slate-400 italic text-[11px] py-4 text-center">
                    Sin descuentos aplicados en este período.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="border-b border-slate-200 font-bold text-slate-500">
                          <th className="pb-1.5">Concepto</th>
                          <th className="pb-1.5">Detalle</th>
                          <th className="pb-1.5 text-right">Importe</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {employeeDetail.deductions.map((ded) => (
                          <tr key={ded.id}>
                            <td className="py-1.5 font-bold text-slate-800">{ded.concept}</td>
                            <td className="py-1.5 text-slate-600">{ded.detail}</td>
                            <td className="py-1.5 text-right font-mono font-extrabold text-slate-900">
                              $ {ded.amount.toLocaleString('es-AR')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="font-extrabold text-rose-700 text-xs uppercase">Total Descuentos:</span>
                <span className="font-mono font-black text-rose-900 text-xs">
                  $ {employeeDetail.totalDeductions.toLocaleString('es-AR')}
                </span>
              </div>
            </div>

            {/* Box 3: Sección de Pago */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-black text-sky-700 tracking-wider block">
                  Sección de Pago
                </span>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Medio de Pago:</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    disabled={isPaid && !isEditingPayment}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold cursor-pointer disabled:opacity-70"
                  >
                    <option value="Mercado Pago">Mercado Pago</option>
                    <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Caja:</label>
                  <select
                    value={cashRegister}
                    onChange={(e) => setCashRegister(e.target.value)}
                    disabled={isPaid && !isEditingPayment}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold cursor-pointer disabled:opacity-70"
                  >
                    <option value="MP FRANCO">MP FRANCO</option>
                    <option value="MERCADO PAGO">MERCADO PAGO</option>
                    <option value="CAJA CENTRAL">CAJA CENTRAL</option>
                    <option value="CAJA CHICA">CAJA CHICA</option>
                  </select>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Estado de Pago:</span>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-black mt-1 border ${
                      isPaid
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}
                  >
                    {isPaid ? '🟢 Pagado' : '🟡 Pendiente'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Monto Neto a Pagar</span>
                <span className="font-mono font-black text-rose-900 text-base block">
                  $ {employeeDetail.netAmount.toLocaleString('es-AR')}
                </span>
              </div>
            </div>
          </div>

          {/* Prominent Totals Summary Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-rose-50/60 border border-rose-200 rounded-2xl text-center">
            <div>
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                Total a Pagar (Bruto)
              </span>
              <span className="text-base font-black font-mono text-rose-900 mt-0.5 block">
                $ {employeeDetail.grossAmount.toLocaleString('es-AR')}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                Total Descuentos
              </span>
              <span className="text-base font-black font-mono text-rose-900 mt-0.5 block">
                $ {employeeDetail.totalDeductions.toLocaleString('es-AR')}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                Neto a Pagar
              </span>
              <span className="text-base font-black font-mono text-rose-900 mt-0.5 block">
                $ {employeeDetail.netAmount.toLocaleString('es-AR')}
              </span>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button
              type="button"
              onClick={handleTogglePaymentStatus}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-extrabold text-xs shadow-md transition ${
                isPaid
                  ? 'bg-slate-800 hover:bg-slate-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isPaid ? 'Desmarcar como Pagado' : 'Marcar como Pagado'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsEditingPayment(!isEditingPayment)}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-extrabold text-xs rounded-2xl transition"
            >
              <Edit className="w-4 h-4 text-slate-600" />
              <span>{isEditingPayment ? 'Guardar Cambios Medio/Caja' : 'Editar Medio de Pago'}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenPDFPreview}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-2xl shadow-md transition"
            >
              <Printer className="w-4 h-4" />
              <span>{isPaid ? 'Reimprimir Recibo (PDF)' : 'Ver Recibo (PDF)'}</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-900 p-4 border-t border-slate-800 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition"
          >
            Cerrar
          </button>
        </div>
      </div>

      {isPreviewOpen && (
        <ReceiptPreviewModal
          payrun={payrun}
          employeeDetail={employeeDetail}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </div>
  );
};
