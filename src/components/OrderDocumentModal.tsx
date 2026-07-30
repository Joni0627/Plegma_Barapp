import React from 'react';
import { useApp } from '../context/AppContext';
import { Order } from '../types';
import {
  X,
  Printer,
  MessageSquare,
  Mail,
  Clock,
  Building2,
  CheckCircle2,
  FileText,
  Store,
} from 'lucide-react';

interface OrderDocumentModalProps {
  order: Order;
  onClose: () => void;
}

export const OrderDocumentModal: React.FC<OrderDocumentModalProps> = ({ order, onClose }) => {
  const { providers } = useApp();
  const provider = providers.find((p) => p.id === order.providerId);

  const handlePrint = () => {
    window.print();
  };

  // WhatsApp share text
  const whatsappText = encodeURIComponent(
    `*NUEVO PEDIDO DE MERCADERÍA - ${order.orderNumber}*\n` +
      `*Proveedor:* ${provider?.name}\n` +
      `*Fecha de Entrega Estimada:* ${new Date(order.expectedDeliveryDate).toLocaleDateString('es-AR')}\n\n` +
      `*Detalle de Ítems Solicidados:*\n` +
      order.items.map((it) => `• ${it.finalQty} ${it.unit} - ${it.itemName}`).join('\n') +
      `\n\n*Horarios de Recepción:*\n` +
      `• Mañana: ${order.receptionHoursSnapshot.morningStart} a ${order.receptionHoursSnapshot.morningEnd} hs\n` +
      `• Tarde: ${order.receptionHoursSnapshot.afternoonStart} a ${order.receptionHoursSnapshot.afternoonEnd} hs\n\n` +
      `*Observaciones:* ${order.generalNotes || 'Sin observaciones'}\n` +
      `Muchas gracias.`
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200">
        {/* Top Actions Bar (Non-printable) */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-500" />
            <h3 className="font-extrabold text-sm tracking-tight">
              Documento Oficial de Pedido #{order.orderNumber}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/${provider?.whatsapp}?text=${whatsappText}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Enviar WhatsApp</span>
            </a>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl transition"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE DOCUMENT BODY */}
        <div className="flex-1 overflow-y-auto p-8 bg-white text-slate-900 space-y-6 print:p-0">
          {/* Company Membered Header */}
          <div className="border-b-2 border-slate-900 pb-6 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl shadow-md">
                <Store className="w-8 h-8 text-orange-500" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-900">
                  RESTAURANTE SANTA FÉ
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  Gastronomía & Abastecimiento Central
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Av. Corrientes 1450, CABA • Tel: (011) 4300-9988 • CUIT: 30-71998877-4
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="bg-slate-900 text-white text-xs font-black px-3 py-1 rounded-lg uppercase tracking-wider inline-block">
                ORDEN DE COMPRA
              </span>
              <h2 className="text-lg font-black text-orange-600 font-mono mt-1">
                #{order.orderNumber}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Fecha Emisión: {new Date(order.date).toLocaleDateString('es-AR')}
              </p>
            </div>
          </div>

          {/* Provider & Delivery Info */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 font-extrabold uppercase tracking-wider block mb-1">
                PROVEEDOR:
              </span>
              <p className="font-extrabold text-slate-900 text-sm">{provider?.name}</p>
              <p className="text-slate-600">{provider?.commercialName}</p>
              <p className="text-slate-600">Contacto: {provider?.contactName}</p>
              <p className="text-slate-600">Tel / WA: {provider?.phone}</p>
              <p className="text-slate-600">CUIT: {provider?.cuit}</p>
            </div>

            <div>
              <span className="text-slate-400 font-extrabold uppercase tracking-wider block mb-1">
                DETALLES DE ENTREGA:
              </span>
              <p className="font-bold text-slate-900 text-sm">
                Fecha Esperada:{' '}
                <span className="text-orange-600">
                  {new Date(order.expectedDeliveryDate).toLocaleDateString('es-AR')}
                </span>
              </p>
              <p className="text-slate-600">Condición de Pago: {provider?.paymentCondition}</p>
              <p className="text-slate-600">Emitido por: {order.userName}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-300 rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-white font-bold">
                  <th className="p-3 w-12 text-center">#</th>
                  <th className="p-3">Descripción de Insumo / Producto</th>
                  <th className="p-3 text-center">Unidad de Presentación</th>
                  <th className="p-3 text-center font-extrabold">Cantidad Solicitada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {order.items.map((it, idx) => (
                  <tr key={it.itemId} className="even:bg-slate-50">
                    <td className="p-3 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="p-3 font-bold text-slate-900">{it.itemName}</td>
                    <td className="p-3 text-center font-semibold text-slate-700">{it.unit}</td>
                    <td className="p-3 text-center font-black text-base text-slate-900">
                      {it.finalQty}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* RECEPTION HOURS BOX (COMPLIANCE RULE 24) */}
          <div className="bg-amber-50/80 border-2 border-amber-300 p-4 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-black text-xs uppercase tracking-wider">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>HORARIOS DE RECEPCIÓN DE MERCADERÍA EN DEPÓSITO</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-bold text-amber-950 pt-1">
              {order.receptionHoursSnapshot.morningActive && (
                <div className="bg-white p-2.5 rounded-xl border border-amber-200">
                  <span className="text-amber-700 block text-[10px] uppercase font-bold">
                    Turno Mañana:
                  </span>
                  <p className="text-sm font-extrabold mt-0.5">
                    {order.receptionHoursSnapshot.morningStart} a{' '}
                    {order.receptionHoursSnapshot.morningEnd} hs
                  </p>
                </div>
              )}

              {order.receptionHoursSnapshot.afternoonActive && (
                <div className="bg-white p-2.5 rounded-xl border border-amber-200">
                  <span className="text-amber-700 block text-[10px] uppercase font-bold">
                    Turno Tarde:
                  </span>
                  <p className="text-sm font-extrabold mt-0.5">
                    {order.receptionHoursSnapshot.afternoonStart} a{' '}
                    {order.receptionHoursSnapshot.afternoonEnd} hs
                  </p>
                </div>
              )}
            </div>

            {order.receptionHoursSnapshot.additionalNotes && (
              <p className="text-[11px] text-amber-800 font-medium italic pt-1">
                {order.receptionHoursSnapshot.additionalNotes}
              </p>
            )}
          </div>

          {/* General Notes */}
          {order.generalNotes && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <span className="font-extrabold text-slate-700 block mb-1">
                Observaciones Adicionales:
              </span>
              <p className="text-slate-800 italic">{order.generalNotes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
