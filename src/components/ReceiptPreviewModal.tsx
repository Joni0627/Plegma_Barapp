import React from 'react';
import { useApp } from '../context/AppContext';
import { Payrun, PayrunEmployeeDetail } from '../types';
import { X, Download, Printer, FileText, CheckCircle2, ShieldCheck, Building2, Calendar, User } from 'lucide-react';

interface ReceiptPreviewModalProps {
  payrun: Payrun;
  employeeDetail: PayrunEmployeeDetail;
  onClose: () => void;
}

export const ReceiptPreviewModal: React.FC<ReceiptPreviewModalProps> = ({
  payrun,
  employeeDetail,
  onClose,
}) => {
  const { showToast, branding } = useApp();

  const companyName = branding.companyName || 'PLEGMA BARAPP S.A.';
  const companySubtitle = branding.companySubtitle || 'Gastronomía & Servicios de Restaurante';
  const cuit = branding.cuit || '30-71289341-9';
  const address = branding.address || 'Av. Libertador 1420, CABA';

  const handleDownload = () => {
    showToast(`Recibo de sueldo de ${employeeDetail.employeeName} generado y descargado en PDF.`, 'success');
  };

  const handlePrint = () => {
    showToast('Enviando recibo a la impresora...', 'info');
    setTimeout(() => {
      window.print();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">Vista Previa — Recibo de Sueldo</h3>
              <p className="text-xs text-slate-400">
                Documento de comprobante oficial • {payrun.periodName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold rounded-xl transition shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Descargar PDF</span>
            </button>

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

        {/* Modal Body: Styled A4 Payslip Document (No visible scrollbar) */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 sm:p-8 bg-slate-100/70 space-y-6 text-xs font-sans">
          {/* Printable Payslip Card Sheet */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-300 shadow-md space-y-6 text-slate-900">
            {/* Header: Company Info & Receipt Metadata */}
            <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-900 pb-4 gap-4">
              <div>
                <h2 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                  {companyName}
                </h2>
                <p className="text-[11px] font-semibold text-slate-600">
                  {companySubtitle}
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  CUIT: {cuit} • {address}
                </p>
              </div>

              <div className="text-left sm:text-right border-l-2 sm:border-l-0 sm:border-r-2 border-rose-600 pl-3 sm:pl-0 sm:pr-3">
                <span className="text-[10px] font-black text-rose-700 uppercase block tracking-wider">
                  RECIBO DE SUELDO OFICIAL
                </span>
                <span className="font-mono text-xs font-bold block">{payrun.periodName}</span>
                <span className="text-[10px] text-slate-500 font-mono block">
                  Período: {payrun.startDate} al {payrun.endDate}
                </span>
              </div>
            </div>

            {/* Employee Data Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Empleado</span>
                <span className="font-extrabold text-slate-900 text-xs block">{employeeDetail.employeeName}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">DNI / CUIL</span>
                <span className="font-mono font-bold text-slate-800 text-xs block">{employeeDetail.dni}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Puesto / Cargo</span>
                <span className="font-bold text-slate-800 text-xs block">{employeeDetail.position}</span>
              </div>
            </div>

            {/* Computation & Breakdown Table */}
            <div className="space-y-3">
              <h4 className="font-black text-xs uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                Detalle de Haberes & Descuentos
              </h4>

              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-y border-slate-300">
                    <th className="p-2">Concepto</th>
                    <th className="p-2 text-center">Unidades / Hs</th>
                    <th className="p-2 text-right">Valor Hora</th>
                    <th className="p-2 text-right">Haberes ($)</th>
                    <th className="p-2 text-right">Descuentos ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {/* Gross Hours Row */}
                  <tr>
                    <td className="p-2 font-bold text-slate-900">Horas Trabajadas Nómina</td>
                    <td className="p-2 text-center font-mono font-bold text-slate-800">
                      {employeeDetail.hoursWorkedStr} ({employeeDetail.hoursWorkedDecimal} hs)
                    </td>
                    <td className="p-2 text-right font-mono text-slate-800">
                      $ {employeeDetail.hourlyRate.toLocaleString('es-AR')}
                    </td>
                    <td className="p-2 text-right font-mono font-black text-slate-900">
                      $ {employeeDetail.grossAmount.toLocaleString('es-AR')}
                    </td>
                    <td className="p-2 text-right font-mono text-slate-400">-</td>
                  </tr>

                  {/* Deductions Rows */}
                  {employeeDetail.deductions.map((ded) => (
                    <tr key={ded.id}>
                      <td className="p-2 font-bold text-rose-900">
                        {ded.concept} ({ded.detail})
                      </td>
                      <td className="p-2 text-center text-slate-400 font-mono">-</td>
                      <td className="p-2 text-right text-slate-400 font-mono">-</td>
                      <td className="p-2 text-right text-slate-400 font-mono">-</td>
                      <td className="p-2 text-right font-mono font-bold text-rose-900">
                        $ {ded.amount.toLocaleString('es-AR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 font-black border-t-2 border-slate-900">
                    <td colSpan={3} className="p-2.5 uppercase text-slate-900">TOTALES COMPENSADOS</td>
                    <td className="p-2.5 text-right font-mono text-slate-900">
                      $ {employeeDetail.grossAmount.toLocaleString('es-AR')}
                    </td>
                    <td className="p-2.5 text-right font-mono text-rose-900">
                      $ {employeeDetail.totalDeductions.toLocaleString('es-AR')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Net Amount Highlight Bar */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  NETO A COBRAR EN CONCEPTO DE HABERES
                </span>
                <span className="text-xs font-semibold text-slate-300">
                  Forma de Pago: {employeeDetail.paymentMethod || 'Mercado Pago'} ({employeeDetail.cashRegister || 'MP FRANCO'})
                </span>
              </div>

              <div className="text-right font-mono font-black text-2xl text-emerald-400">
                $ {employeeDetail.netAmount.toLocaleString('es-AR')}
              </div>
            </div>

            {/* Signatures & Approval Footer */}
            <div className="pt-8 grid grid-cols-2 gap-8 text-center border-t border-slate-200">
              <div className="space-y-1">
                <div className="border-b border-slate-400 w-3/4 mx-auto pb-8"></div>
                <span className="font-bold text-[11px] text-slate-800 block">Firma Empleador / Apoderado</span>
                <span className="text-[10px] text-slate-500 font-mono block">PLEGMA BARAPP S.A.</span>
              </div>

              <div className="space-y-1">
                <div className="border-b border-slate-400 w-3/4 mx-auto pb-8"></div>
                <span className="font-bold text-[11px] text-slate-800 block">Firma Conforme Empleado</span>
                <span className="text-[10px] text-slate-500 font-mono block">DNI: {employeeDetail.dni}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="bg-slate-900 p-4 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            Comprobante emitido electrónicamente por Plegma Barapp.
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-md transition"
            >
              <Download className="w-4 h-4" />
              <span>Descargar PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
