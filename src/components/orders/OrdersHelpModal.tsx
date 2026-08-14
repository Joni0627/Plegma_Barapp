import React from 'react';
import { X, Info, Utensils, Printer, DollarSign, Clock, LayoutGrid, CheckCircle2 } from 'lucide-react';

interface OrdersHelpModalProps {
  onClose: () => void;
}

export const OrdersHelpModal: React.FC<OrdersHelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Guía de Uso: Pedidos y Facturación</h3>
              <p className="text-xs text-slate-400">Instrucciones operativas del módulo</p>
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
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-slate-700">
          
          <div className="space-y-2">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-indigo-600" />
              1. Vistas del Módulo
            </h4>
            <p className="text-sm">El módulo te permite trabajar en 3 vistas diferentes según tu rol:</p>
            <ul className="text-xs space-y-2 ml-6 list-disc text-slate-600">
              <li><strong>Administrador:</strong> Muestra una tabla global con absolutamente todos los pedidos para poder editarlos, anularlos o auditarlos.</li>
              <li><strong>Mozo / Salón:</strong> Muestra un mapa de mesas cuadrado. Podés tocar sobre una mesa "Libre" para abrir un pedido rápido, o sobre una mesa "Ocupada" para cobrarla o enviarle más ítems a cocina.</li>
              <li><strong>Delivery / Takeaway:</strong> Muestra columnas estilo "Kanban" para gestionar envíos (Pendientes, En Cocina, Listos).</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-indigo-600" />
              2. Creación de un Pedido (T1)
            </h4>
            <p className="text-sm">Para abrir una mesa o crear un pedido de delivery, haz clic en "Crear Pedido". Se abrirá un panel donde podrás seleccionar el cliente, el canal de venta (Salón, Barra, Delivery) y agregar los productos.</p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Printer className="w-4 h-4 text-indigo-600" />
              3. Comanda a Cocina (T2)
            </h4>
            <p className="text-sm">Una vez creado el pedido, queda en estado "Pendiente". Utiliza el botón de "Comanda" (el ícono de la impresora) para enviar el pedido a producción. Esto imprimirá el ticket de preparación para la cocina o barra y cambiará el estado a "Comandado" (o "En Cocina").</p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              4. Despacho (T3)
            </h4>
            <p className="text-sm">Cuando la cocina termina el pedido, se marca como "Listo". Si es un pedido de salón, este paso indica que ya está servido en la mesa. Si es delivery, indica que está listo para ser enviado.</p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-indigo-600" />
              5. Cobro y Facturación (T4)
            </h4>
            <p className="text-sm">Para cerrar el ciclo del pedido, utiliza el botón "Cobrar".</p>
            <ul className="text-xs space-y-2 ml-6 list-disc text-slate-600">
              <li>Debes tener una <strong>Caja de Turno abierta</strong> para cobrar en Efectivo, Tarjeta o QR.</li>
              <li>Si seleccionas "Cuenta Corriente", el monto pasará a la deuda del cliente (no afecta la caja).</li>
              <li>Al facturar, se imprimirá automáticamente el ticket de venta final.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              6. Trazabilidad
            </h4>
            <p className="text-sm">Desde la vista Administrador, puedes hacer clic en el ícono del reloj en cualquier pedido para auditar exactamente a qué hora se tomó (T1), se comandó (T2), se despachó (T3) y se cobró (T4).</p>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};
