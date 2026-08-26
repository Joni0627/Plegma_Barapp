import React, { useState } from 'react';
import {
  X,
  Calendar,
  Users,
  MapPin,
  Clock,
  UserCheck,
  AlertCircle,
  ShieldCheck,
  Printer,
  History,
  FileText,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Reservation } from '../../types';
import { ReservationReceiptModal } from './ReservationReceiptModal';

interface ReservationDetailModalProps {
  reservation: Reservation;
  onClose: () => void;
  onMarkFulfilled?: (res: Reservation) => void;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const cfg: Record<string, string> = {
    Confirmada: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    Cumplida: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    Cancelada: 'bg-rose-100 text-rose-800 border-rose-300',
    Histórica: 'bg-slate-100 text-slate-800 border-slate-300',
  };
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black border ${
        cfg[status] || 'bg-slate-100 text-slate-700'
      }`}
    >
      {status}
    </span>
  );
};

export const ReservationDetailModal: React.FC<ReservationDetailModalProps> = ({
  reservation,
  onClose,
  onMarkFulfilled,
}) => {
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl space-y-0 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Detalle de Reserva</h3>
              <p className="text-xs text-slate-400">Información completa, auditoría e historial de cambios</p>
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

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Client & Status Header Pill */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide font-bold">Cliente Reserva</p>
              <p className="text-sm font-black text-slate-900">{reservation.clientName}</p>
              {reservation.clientPhone && (
                <p className="text-xs text-slate-500 font-medium">{reservation.clientPhone}</p>
              )}
            </div>
            <StatusBadge status={reservation.status} />
          </div>

          {/* Action buttons bar inside modal */}
          <div className="flex items-center gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<Printer className="w-4 h-4 text-indigo-600" />}
              onClick={() => setIsReceiptOpen(true)}
              className="flex-1"
            >
              Comprobante PDF / Imprimir
            </Button>

            {reservation.status === 'Confirmada' && onMarkFulfilled && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                leftIcon={<UserCheck className="w-4 h-4" />}
                onClick={() => onMarkFulfilled(reservation)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500"
              >
                Marcar Cumplida
              </Button>
            )}
          </div>

          {/* Core Info Cards */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
              <p className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                <Calendar className="w-3 h-3 text-indigo-500" /> Fecha y Hora
              </p>
              <p className="font-extrabold text-slate-900 text-xs">{reservation.dateTime}</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
              <p className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                <Users className="w-3 h-3 text-emerald-500" /> Comensales
              </p>
              <p className="font-black text-slate-900 text-sm">{reservation.guestsCount} personas</p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <p className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-500" /> Mesa Asignada
            </p>
            <p className="font-black text-slate-900 text-xs">{reservation.tableName}</p>
          </div>

          {/* Audit Info */}
          <div className="p-3 bg-slate-100/70 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
            <p className="flex items-center gap-1 font-semibold text-slate-700">
              <UserCheck className="w-3.5 h-3.5 text-indigo-500" /> Creado por: {reservation.createdByUserName} ({reservation.createdAt})
            </p>
            {reservation.updatedByUserName && (
              <p className="text-[10px] text-slate-500 font-medium">
                Última modificación por: <span className="font-bold text-slate-700">{reservation.updatedByUserName}</span> ({reservation.updatedAt})
              </p>
            )}
          </div>

          {/* Observación 4: Trazabilidad de Cumplimiento OK */}
          {reservation.status === 'Cumplida' && (
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs space-y-1 text-indigo-950">
              <p className="font-extrabold uppercase text-[10px] flex items-center gap-1.5 text-indigo-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> OK de Cumplimiento / Asistencia Registrado
              </p>
              <p className="text-[11px]">
                Otorgado por: <span className="font-bold text-slate-900">{reservation.fulfilledByUserName || reservation.createdByUserName}</span>
                {reservation.fulfilledAt && <span className="text-slate-500 font-mono"> &bull; {reservation.fulfilledAt}</span>}
              </p>
              {reservation.fulfilledOkNotes && (
                <p className="text-[10px] text-indigo-800 italic">Nota OK: "{reservation.fulfilledOkNotes}"</p>
              )}
            </div>
          )}

          {/* Notes */}
          {reservation.notes && (
            <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs space-y-1">
              <p className="font-bold text-indigo-900 uppercase text-[10px]">Observaciones</p>
              <p className="text-slate-700">{reservation.notes}</p>
            </div>
          )}

          {/* Cancellation Reason */}
          {reservation.status === 'Cancelada' && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1 text-rose-900">
              <p className="font-bold uppercase text-[10px] flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Motivo de Cancelación
              </p>
              <p>{reservation.cancelReason || 'Sin motivo de cancelación especificado.'}</p>
            </div>
          )}

          {/* Observacion 3: LOG DE MODIFICACIONES EN RESERVA */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase">
              <History className="w-4 h-4 text-indigo-600" />
              Log de Modificaciones de la Reserva
            </h4>

            {!reservation.logs || reservation.logs.length === 0 ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-400 italic">
                Sin modificaciones registradas en esta reserva (reserva original sin editar).
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                {reservation.logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                      <span className="text-indigo-600 font-bold">{log.action}</span>
                      <span>{log.timestamp}</span>
                    </div>
                    <p className="font-semibold text-slate-800 text-[11px]">{log.details}</p>
                    <p className="text-[10px] text-slate-400">Por: {log.userName}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <Button type="button" variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>

      {/* Render Printable Receipt Modal */}
      {isReceiptOpen && (
        <ReservationReceiptModal
          reservation={reservation}
          onClose={() => setIsReceiptOpen(false)}
        />
      )}
    </div>
  );
};
