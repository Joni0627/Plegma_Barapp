import React from 'react';
import { X, Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { SaleOrder } from '../../types';

interface OrderTimeAuditModalProps {
  order: SaleOrder;
  onClose: () => void;
}

export const OrderTimeAuditModal: React.FC<OrderTimeAuditModalProps> = ({ order, onClose }) => {
  // Compute duration between dates in minutes
  const calcDuration = (startStr?: string, endStr?: string) => {
    if (!startStr || !endStr) return '-';
    const d1 = new Date(startStr.replace(' ', 'T')).getTime();
    const d2 = new Date(endStr.replace(' ', 'T')).getTime();
    if (isNaN(d1) || isNaN(d2)) return '-';
    const diffMin = Math.round((d2 - d1) / (1000 * 60));
    return `${diffMin} min`;
  };

  const durComanda = calcDuration(order.t1CreatedAt, order.t2ComandaAt);
  const durKitchen = calcDuration(order.t2ComandaAt, order.t3KitchenOutputAt);
  const durDelivery = calcDuration(order.t3KitchenOutputAt, order.t4DeliveredAt);
  const durTotal = calcDuration(order.t1CreatedAt, order.t4DeliveredAt || order.t3KitchenOutputAt);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl space-y-0">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Trazabilidad Temporal del Pedido</h3>
              <p className="text-xs text-slate-400">Auditoría de las 4 marcas de tiempo T1 - T4</p>
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
        <div className="p-6 space-y-4 text-xs">
          {/* Header pill */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Pedido</span>
              <p className="font-black text-slate-900 text-sm">#{order.orderNumber} ({order.saleTypeName})</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Tiempo Total Servicio</span>
              <p className="font-black text-indigo-700 text-sm font-mono">{durTotal}</p>
            </div>
          </div>

          {/* Timestamps Stepper */}
          <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 before:z-0">
            {/* T1 */}
            <div className="relative z-10 flex items-start gap-3 bg-white p-3 rounded-xl border border-slate-200">
              <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                T1
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <p className="font-bold text-slate-900">1. Creación de Pedido (T1)</p>
                  <span className="text-[10px] font-mono text-slate-500">{order.t1CreatedAt}</span>
                </div>
                <p className="text-[10px] text-slate-400">Pedido instanciado por {order.createdByUserName}</p>
              </div>
            </div>

            {/* T2 */}
            <div className={`relative z-10 flex items-start gap-3 p-3 rounded-xl border ${
              order.t2ComandaAt ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200 opacity-60'
            }`}>
              <div className={`w-7 h-7 rounded-full text-white flex items-center justify-center font-bold text-xs shrink-0 ${
                order.t2ComandaAt ? 'bg-indigo-600' : 'bg-slate-300'
              }`}>
                T2
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <p className="font-bold text-slate-900">2. Envío de Comanda (T2)</p>
                  <span className="text-[10px] font-mono text-slate-500">{order.t2ComandaAt || 'Pendiente'}</span>
                </div>
                <p className="text-[10px] text-slate-400">Demora emisión comanda: <strong className="text-indigo-600 font-mono">{durComanda}</strong></p>
              </div>
            </div>

            {/* T3 */}
            <div className={`relative z-10 flex items-start gap-3 p-3 rounded-xl border ${
              order.t3KitchenOutputAt ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200 opacity-60'
            }`}>
              <div className={`w-7 h-7 rounded-full text-white flex items-center justify-center font-bold text-xs shrink-0 ${
                order.t3KitchenOutputAt ? 'bg-amber-500' : 'bg-slate-300'
              }`}>
                T3
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <p className="font-bold text-slate-900">3. Salida de Cocina / Listo (T3)</p>
                  <span className="text-[10px] font-mono text-slate-500">{order.t3KitchenOutputAt || 'En preparación'}</span>
                </div>
                <p className="text-[10px] text-slate-400">Tiempo de elaboración: <strong className="text-amber-600 font-mono">{durKitchen}</strong></p>
              </div>
            </div>

            {/* T4 */}
            <div className={`relative z-10 flex items-start gap-3 p-3 rounded-xl border ${
              order.t4DeliveredAt ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200 opacity-60'
            }`}>
              <div className={`w-7 h-7 rounded-full text-white flex items-center justify-center font-bold text-xs shrink-0 ${
                order.t4DeliveredAt ? 'bg-emerald-600' : 'bg-slate-300'
              }`}>
                T4
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <p className="font-bold text-slate-900">4. Entrega a Mesa / Cliente (T4)</p>
                  <span className="text-[10px] font-mono text-slate-500">{order.t4DeliveredAt || 'Aguardando entrega'}</span>
                </div>
                <p className="text-[10px] text-slate-400">Demora de despacho: <strong className="text-emerald-600 font-mono">{durDelivery}</strong></p>
              </div>
            </div>
          </div>

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
