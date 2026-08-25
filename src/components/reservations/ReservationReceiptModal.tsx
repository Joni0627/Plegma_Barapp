import React from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, Calendar, Users, MapPin, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Reservation } from '../../types';

interface ReservationReceiptModalProps {
  reservation: Reservation;
  onClose: () => void;
}

export const ReservationReceiptModal: React.FC<ReservationReceiptModalProps> = ({
  reservation,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:static print:bg-transparent print:p-0 print:block">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl flex flex-col overflow-hidden border border-slate-200 print:shadow-none print:border-none print:max-h-none print:max-w-none print:w-full print:block print:rounded-none">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Comprobante de Reserva</h3>
              <p className="text-xs text-slate-400">PDF / Documento de Reserva Confirmada</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold rounded-xl transition shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir PDF</span>
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

        {/* Printable Ticket Area */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-800 font-sans text-xs bg-white print:p-4">
          {/* Header Branding */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-black text-sm">
                  P
                </div>
                <div>
                  <h1 className="font-black text-base tracking-tight text-slate-900">PLEGMA GASTRONOMÍA</h1>
                  <p className="text-[10px] text-slate-500 font-medium">Sistema de Gestión & Reservas de Mesas</p>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" /> RESERVA CONFIRMADA
              </span>
              <p className="text-[10px] text-slate-400 font-mono mt-1">ID: #{reservation.id.slice(-6).toUpperCase()}</p>
            </div>
          </div>

          {/* Client & Date Main Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Titular de la Reserva</span>
              <span className="font-mono text-[10px] text-slate-500">Emitido: {reservation.createdAt}</span>
            </div>
            <div>
              <p className="text-base font-black text-slate-900">{reservation.clientName}</p>
              {reservation.clientPhone && (
                <p className="text-xs text-slate-600 font-semibold mt-0.5">Teléfono: {reservation.clientPhone}</p>
              )}
            </div>
          </div>

          {/* Reservation Core Specs Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-1">
              <Clock className="w-5 h-5 text-indigo-600 mx-auto" />
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Fecha y Hora</span>
              <span className="font-black text-slate-900 text-xs block font-mono">{reservation.dateTime}</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-1">
              <Users className="w-5 h-5 text-emerald-600 mx-auto" />
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Comensales</span>
              <span className="font-black text-slate-900 text-xs block">{reservation.guestsCount} personas</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-1">
              <MapPin className="w-5 h-5 text-amber-600 mx-auto" />
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Mesa Asignada</span>
              <span className="font-black text-slate-900 text-xs block">{reservation.tableName}</span>
            </div>
          </div>

          {/* Special Notes if present */}
          {reservation.notes && (
            <div className="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-1">
              <span className="text-[10px] text-indigo-900 font-extrabold uppercase block">
                Observaciones & Requerimientos Especiales:
              </span>
              <p className="text-xs text-slate-700 italic">{reservation.notes}</p>
            </div>
          )}

          {/* Footer Validation Notice & QR Code Placeholder */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Comprobante Válido de Reserva Confirmada
              </p>
              <p className="text-[9px] text-slate-400">
                Atendido por: {reservation.createdByUserName} &bull; Plegma POS Software
              </p>
            </div>

            {/* QR Placeholder */}
            <div className="w-14 h-14 bg-slate-100 border border-slate-300 rounded-xl flex items-center justify-center text-[9px] font-mono text-slate-400 font-bold text-center leading-none p-1">
              [QR VERIFICACIÓN]
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between shrink-0 print:hidden">
          <span className="text-xs text-slate-400">
            Documentación de reserva confirmada
          </span>

          <div className="flex items-center gap-2">
            <Button type="button" variant="primary" onClick={handlePrint} leftIcon={<Printer className="w-4 h-4" />}>
              Imprimir / Guardar PDF
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
