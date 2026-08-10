import React from 'react';
import { X, Calendar, Users, MapPin, Clock, UserCheck, AlertCircle, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { Reservation } from '../../types';

interface ReservationDetailModalProps {
  reservation: Reservation;
  onClose: () => void;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const cfg: Record<string, string> = {
    Confirmada: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    Cancelada: 'bg-rose-100 text-rose-800 border-rose-300',
    Histórica: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black border ${cfg[status] || 'bg-slate-100 text-slate-700'}`}>
      {status}
    </span>
  );
};

export const ReservationDetailModal: React.FC<ReservationDetailModalProps> = ({ reservation, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl space-y-0">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Detalle de Reserva</h3>
              <p className="text-xs text-slate-400">Información completa de asignación y comensales</p>
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
        <div className="p-6 space-y-4">
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
              <UserCheck className="w-3.5 h-3.5 text-indigo-500" /> Creado por: {reservation.createdByUserName}
            </p>
            <p className="text-[10px] text-slate-400">Timestamp Carga (SYS): {reservation.createdAt}</p>
          </div>

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

          {/* Footer */}
          <div className="flex justify-end pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
