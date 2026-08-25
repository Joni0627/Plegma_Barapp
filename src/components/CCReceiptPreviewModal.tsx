import React from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { Receipt, Client, CurrentAccountMovement } from '../types';
import { X, Download, Printer, Receipt as ReceiptIcon, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';

interface CCReceiptPreviewModalProps {
  receipt: Receipt;
  client: Client;
  movements: CurrentAccountMovement[];
  onClose: () => void;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n);

export const CCReceiptPreviewModal: React.FC<CCReceiptPreviewModalProps> = ({
  receipt,
  client,
  movements,
  onClose,
}) => {
  const { showToast, branding } = useApp();

  const companyName = branding.companyName || 'PLEGMA BARAPP S.A.';
  const companySubtitle = branding.companySubtitle || 'Gastronomía & Servicios de Restaurante';
  const cuit = branding.cuit || '30-71289341-9';
  const address = branding.address || 'Av. Colon 1500, Córdoba';

  // Find movements included in this receipt
  const includedMovements = movements.filter((m) => receipt.movementIds.includes(m.id));

  const handleDownload = () => {
    showToast(`Recibo ${receipt.receiptNumber} descargado en formato PDF.`, 'success');
  };

  const handlePrint = () => {
    showToast('Enviando recibo a la impresora...', 'info');
    setTimeout(() => {
      window.print();
    }, 400);
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:static print:bg-transparent print:p-0 print:block">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 print:shadow-none print:border-none print:max-h-none print:max-w-none print:w-full print:block print:rounded-none">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shadow-md">
              <ReceiptIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight flex items-center gap-2">
                Comprobante de Recibo <span className="font-mono text-emerald-400">{receipt.receiptNumber}</span>
              </h3>
              <p className="text-xs text-slate-400">
                Recibo oficial de Cuenta Corriente &bull; {receipt.status}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl transition shadow-sm"
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

        {/* Modal Body: Styled A4 Sheet */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 sm:p-8 bg-slate-100/70 space-y-6 text-xs font-sans">
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
                  CUIT: {cuit} &bull; {address}
                </p>
              </div>

              <div className="text-left sm:text-right border-l-2 sm:border-l-0 sm:border-r-2 border-emerald-600 pl-3 sm:pl-0 sm:pr-3">
                <span className="text-[10px] font-black text-emerald-700 uppercase block tracking-wider">
                  RECIBO DE CUENTA CORRIENTE
                </span>
                <span className="font-mono text-sm font-bold block text-slate-900">{receipt.receiptNumber}</span>
                <span className="text-[10px] text-slate-500 font-mono block">
                  Fecha Emisión: {receipt.dateTime}
                </span>
                <span className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Estado: {receipt.status}
                </span>
              </div>
            </div>

            {/* Client Info Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Cliente</span>
                <span className="font-extrabold text-slate-900 text-xs block">{client.name}</span>
                <span className="text-[10px] text-slate-500 font-mono">Código: {client.code}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Teléfono / Dirección</span>
                <span className="font-medium text-slate-800 text-xs block">{client.phone || '-'}</span>
                <span className="text-[10px] text-slate-500">{client.address || '-'}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Operador / Usuario</span>
                <span className="font-bold text-slate-800 text-xs block">{receipt.userName}</span>
                {receipt.paymentMethod && (
                  <span className="text-[10px] text-emerald-700 font-bold block">
                    Cobrado en: {receipt.paymentMethod}
                  </span>
                )}
              </div>
            </div>

            {/* Tickets Breakdown Table */}
            <div className="space-y-3">
              <h4 className="font-black text-xs uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex justify-between items-center">
                <span>Tickets & Consumos Incluidos</span>
                <span className="text-[11px] text-slate-500 font-normal">
                  Total de consumos: {includedMovements.length}
                </span>
              </h4>

              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-y border-slate-300">
                    <th className="p-2.5">Fecha y Hora</th>
                    <th className="p-2.5">N° Ticket</th>
                    <th className="p-2.5">Detalle del Consumo</th>
                    <th className="p-2.5 text-right">Importe ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {includedMovements.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-slate-400">
                        No hay consumos especificados en este recibo.
                      </td>
                    </tr>
                  ) : (
                    includedMovements.map((mov) => (
                      <tr key={mov.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-medium whitespace-nowrap">{mov.dateTime}</td>
                        <td className="p-2.5 font-mono font-bold text-indigo-700">{mov.ticketNumber || mov.id}</td>
                        <td className="p-2.5 text-slate-600">{mov.ticketDetail || 'Consumo registrado'}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-slate-900">{fmt(mov.total)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 font-black border-t-2 border-slate-900">
                    <td colSpan={3} className="p-2.5 uppercase text-slate-900 text-right">
                      MONTO TOTAL DEL RECIBO:
                    </td>
                    <td className="p-2.5 text-right font-mono text-base text-emerald-700">
                      {fmt(receipt.totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Payment Details Pill if Facturado */}
            {receipt.status === 'Facturado' && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest block">
                    COMPROBANTE FACTURADO Y APLICADO A LA DEUDA
                  </span>
                  <span className="text-xs font-medium text-emerald-700">
                    Medio de Pago: <strong>{receipt.paymentMethod || 'Efectivo'}</strong> &bull; Caja:{' '}
                    <strong>{receipt.cashRegister || 'Caja Principal'}</strong>
                  </span>
                  {receipt.appliedToPayroll && (
                    <span className="text-[11px] font-bold text-violet-700 block mt-0.5">
                      ✓ Registrado para descuento en Liquidación de Sueldos (RR.HH.)
                    </span>
                  )}
                </div>

                <div className="text-right font-mono font-black text-xl text-emerald-800">
                  {fmt(receipt.totalAmount)}
                </div>
              </div>
            )}

            {/* Signatures Footer */}
            <div className="pt-8 grid grid-cols-2 gap-8 text-center border-t border-slate-200">
              <div className="space-y-1">
                <div className="border-b border-slate-400 w-3/4 mx-auto pb-8"></div>
                <span className="font-bold text-[11px] text-slate-800 block">Firma Cliente / Conforme</span>
                <span className="text-[10px] text-slate-500 block">{client.name}</span>
              </div>

              <div className="space-y-1">
                <div className="border-b border-slate-400 w-3/4 mx-auto pb-8"></div>
                <span className="font-bold text-[11px] text-slate-800 block">Operador / Autorizado</span>
                <span className="text-[10px] text-slate-500 font-mono block">{companyName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="bg-slate-900 p-4 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            Documento de Cuenta Corriente generado por Plegma Barapp.
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition"
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

  return createPortal(modalContent, document.body);
};
