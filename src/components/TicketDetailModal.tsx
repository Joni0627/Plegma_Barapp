import React from 'react';
import { X, FileText, Calendar, DollarSign, UserCheck, ShieldCheck } from 'lucide-react';
import { Button } from './ui/Button';
import { CurrentAccountMovement, Client } from '../types';

interface TicketDetailModalProps {
  movement: CurrentAccountMovement;
  client: Client;
  receiptNumber?: string;
  onClose: () => void;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n);

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  movement,
  client,
  receiptNumber,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl space-y-0">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base flex items-center gap-2">
                Detalle de Ticket <span className="font-mono text-indigo-300">{movement.ticketNumber || movement.id}</span>
              </h3>
              <p className="text-xs text-slate-400">Detalle de líneas de consumo</p>
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

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Client Card */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide font-bold">Cliente</p>
              <p className="text-xs font-black text-slate-800">{client.name}</p>
              <p className="text-[11px] text-slate-500">{client.code} &bull; {client.phone}</p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                movement.lineState === 'Pagada'
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                  : 'bg-amber-100 text-amber-700 border-amber-200'
              }`}
            >
              {receiptNumber ? `Con recibo (${receiptNumber})` : movement.lineState === 'Pagada' ? 'Con recibo' : 'Sin recibo'}
            </span>
          </div>

          {/* Details Table Card */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                <p className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-indigo-500" /> Fecha y Hora
                </p>
                <p className="font-bold text-slate-800">{movement.dateTime}</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                <p className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-emerald-500" /> Monto Total
                </p>
                <p className="font-black text-slate-900 text-sm">{fmt(movement.total)}</p>
              </div>
            </div>

            <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-1.5">
              <p className="text-xs font-bold text-indigo-900 uppercase tracking-wide">Líneas de Consumo</p>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {movement.ticketDetail || 'Sin descripción de consumo especificada.'}
              </p>
            </div>
          </div>

          {/* Footer close button */}
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
