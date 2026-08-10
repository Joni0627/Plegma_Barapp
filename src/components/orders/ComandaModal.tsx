import React from 'react';
import { X, Printer, Clock, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { SaleOrder } from '../../types';

interface ComandaModalProps {
  order: SaleOrder;
  onClose: () => void;
  onConfirmSendComanda: () => void;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n);

export const ComandaModal: React.FC<ComandaModalProps> = ({ order, onClose, onConfirmSendComanda }) => {
  const handlePrint = () => {
    onConfirmSendComanda();
    window.print();
  };

  // Group items by Kitchen / Bar category
  const kitchenItems = order.items.filter((i) => i.category !== 'Bebidas');
  const barItems = order.items.filter((i) => i.category === 'Bebidas');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl space-y-0 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Comanda de Producción (Cocina / Barra)</h3>
              <p className="text-xs text-slate-400">Emisión de comprobante PDF y registro T2 (A05)</p>
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

        {/* Printable Comanda Document */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1 text-slate-900 font-sans print:p-0">
          {/* Top Banner */}
          <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">PLEGMA RESTO BAR</span>
              <h2 className="text-xl font-black text-slate-900">COMANDA DE PRODUCCIÓN</h2>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black font-mono text-slate-900">#{order.orderNumber}</span>
              <p className="text-[10px] text-slate-500 font-mono">{order.createdAt}</p>
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-100 p-3 rounded-xl text-xs font-bold">
            <div>
              <span className="text-slate-400 text-[10px] block uppercase">Canal:</span>
              <span className="text-slate-800">{order.saleTypeName}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block uppercase">Mesa:</span>
              <span className="text-amber-700">{order.tableName || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block uppercase">Mozo / Creador:</span>
              <span className="text-slate-800">{order.createdByUserName}</span>
            </div>
          </div>

          {/* Kitchen Items Section */}
          {kitchenItems.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase text-indigo-900 border-b border-indigo-200 pb-1">
                Estación: COCINA PRINCIPAL
              </h4>
              <div className="space-y-2">
                {kitchenItems.map((item) => (
                  <div key={item.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-start">
                    <div>
                      <p className="font-black text-slate-900 text-sm">
                        <span className="inline-block w-6 h-6 bg-slate-900 text-white rounded-lg text-center leading-6 font-mono text-xs mr-2">
                          {item.quantity}
                        </span>
                        {item.productName}
                      </p>
                      {item.sideOption && (
                        <p className="text-xs text-indigo-700 font-bold ml-8 mt-0.5">
                          + Acompañamiento: {item.sideOption}
                        </p>
                      )}
                      {item.lineComment && (
                        <p className="text-xs text-amber-700 font-bold ml-8 mt-0.5 italic">
                          Nota: "{item.lineComment}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bar Items Section */}
          {barItems.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase text-emerald-900 border-b border-emerald-200 pb-1">
                Estación: BARRA DE BEBIDAS
              </h4>
              <div className="space-y-2">
                {barItems.map((item) => (
                  <div key={item.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-start">
                    <div>
                      <p className="font-black text-slate-900 text-sm">
                        <span className="inline-block w-6 h-6 bg-emerald-700 text-white rounded-lg text-center leading-6 font-mono text-xs mr-2">
                          {item.quantity}
                        </span>
                        {item.productName}
                      </p>
                      {item.lineComment && (
                        <p className="text-xs text-amber-700 font-bold ml-8 mt-0.5 italic">
                          Nota: "{item.lineComment}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {order.generalNotes && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
              <span className="font-bold uppercase block text-[10px]">Observación General del Pedido:</span>
              <p>{order.generalNotes}</p>
            </div>
          )}

          {/* Timestamp Footer */}
          <div className="border-t border-slate-200 pt-3 text-[10px] text-slate-400 flex items-center justify-between font-mono">
            <span>T1 Inicio: {order.t1CreatedAt}</span>
            <span>T2 Comanda: {order.t2ComandaAt || 'Generando timestamp T2...'}</span>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 print:hidden">
          <Button type="button" variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button type="button" variant="primary" leftIcon={<Printer className="w-4 h-4" />} onClick={handlePrint}>
            Imprimir & Enviar Comanda (A05)
          </Button>
        </div>
      </div>
    </div>
  );
};
