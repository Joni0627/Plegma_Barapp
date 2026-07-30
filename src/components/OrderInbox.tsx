import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Order, ProcessState, Provider } from '../types';
import {
  FileText,
  Truck,
  DollarSign,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Eye,
  CreditCard,
  Building2,
  Calendar,
  X,
} from 'lucide-react';

interface OrderInboxProps {
  onViewOrderDocument: (orderId: string) => void;
  onReceiveGoods: (provider: Provider, order: Order) => void;
  onRecordPayment: (order: Order) => void;
}

export const OrderInbox: React.FC<OrderInboxProps> = ({
  onViewOrderDocument,
  onReceiveGoods,
  onRecordPayment,
}) => {
  const { orders, providers, recordPayment, userRole } = useApp();

  const [activeTab, setActiveTab] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProviderId, setSelectedProviderId] = useState<string>('todos');

  // Payment modal quick state
  const [payingOrder, setPayingOrder] = useState<Order | null>(null);
  const [payAmountInput, setPayAmountInput] = useState<string>('');
  const [payMethodInput, setPayMethodInput] = useState<NonNullable<Order['paymentMethod']>>('Transferencia');
  const [payAccountInput, setPayAccountInput] = useState<string>('Banco Galicia');

  // Calculate Financial Summary Indicators ($ ARS)
  const totalEstimatedWeekly = orders.reduce((sum, o) => sum + o.estimatedTotal, 0);

  const totalPendingDelivery = orders
    .filter((o) => o.status === 'Pendiente de entrega' || o.status === 'Pedido confirmado')
    .reduce((sum, o) => sum + o.estimatedTotal, 0);

  const totalReceived = orders
    .filter((o) => o.status === 'Entregado / Ingresado' || o.status === 'Pendiente de pago' || o.status === 'Pagado')
    .reduce((sum, o) => sum + (o.finalReceivedTotal || o.estimatedTotal), 0);

  const totalPaid = orders.reduce((sum, o) => sum + (o.paidAmount || 0), 0);

  const totalPendingPaymentDebt = orders.reduce((sum, o) => sum + (o.remainingDebt || 0), 0);

  // Filter orders logic
  const filteredOrders = orders.filter((o) => {
    // Tab filter
    if (activeTab === 'pendientes_entrega') {
      if (o.status !== 'Pendiente de entrega' && o.status !== 'Pedido confirmado') return false;
    } else if (activeTab === 'pendientes_pago') {
      if (o.paymentStatus !== 'Pendiente de pago' && o.paymentStatus !== 'Pago parcial') return false;
    } else if (activeTab === 'pagados') {
      if (o.paymentStatus !== 'Pagado') return false;
    } else if (activeTab === 'recibidos') {
      if (o.status !== 'Entregado / Ingresado' && o.status !== 'Pagado') return false;
    }

    // Provider filter
    if (selectedProviderId !== 'todos' && o.providerId !== selectedProviderId) return false;

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const prov = providers.find((p) => p.id === o.providerId);
      const matchNum = o.orderNumber.toLowerCase().includes(q);
      const matchProv = prov?.name.toLowerCase().includes(q);
      const matchInv = o.invoiceOrReceiptNumber?.toLowerCase().includes(q);
      if (!matchNum && !matchProv && !matchInv) return false;
    }

    return true;
  });

  const handleExecutePayment = () => {
    if (!payingOrder) return;
    const amountNum = Number(payAmountInput);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Ingrese un monto de pago válido.');
      return;
    }

    recordPayment(payingOrder.id, amountNum, payMethodInput, payAccountInput);
    alert('Pago registrado correctamente.');
    setPayingOrder(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-orange-500" />
            <span>Bandeja General de Pedidos, Recepciones y Pagos</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestión completa del ciclo de compras, seguimiento de remitos e historial de deuda a proveedores.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar Nº pedido, proveedor, remito..."
              className="w-full sm:w-60 pl-3 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <select
            value={selectedProviderId}
            onChange={(e) => setSelectedProviderId(e.target.value)}
            className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="todos">Todos los proveedores</option>
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Financial Summary Bar ($ ARS Formatted) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Pendiente de Entrega
          </span>
          <div className="text-lg font-black text-slate-900 mt-0.5">
            $ {totalPendingDelivery.toLocaleString('es-AR')}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Mercadería Recibida
          </span>
          <div className="text-lg font-black text-indigo-600 mt-0.5">
            $ {totalReceived.toLocaleString('es-AR')}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Pagado Efectivo / Trf
          </span>
          <div className="text-lg font-black text-emerald-600 mt-0.5">
            $ {totalPaid.toLocaleString('es-AR')}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/30 shadow-2xs">
          <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">
            Deuda Pendiente Pago
          </span>
          <div className="text-lg font-black text-rose-700 mt-0.5">
            $ {totalPendingPaymentDebt.toLocaleString('es-AR')}
          </div>
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex overflow-x-auto bg-slate-200/80 p-1.5 rounded-2xl gap-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('todos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'todos'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Todos los Pedidos ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('pendientes_entrega')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'pendientes_entrega'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Pendientes de Entrega
        </button>

        <button
          onClick={() => setActiveTab('pendientes_pago')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'pendientes_pago'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Deuda Pendiente de Pago
        </button>

        <button
          onClick={() => setActiveTab('pagados')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'pagados'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Pagados / Finalizados
        </button>
      </div>

      {/* Orders List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                <th className="p-3">Nº Pedido</th>
                <th className="p-3">Proveedor</th>
                <th className="p-3">Emisión & Entrega</th>
                <th className="p-3 text-center">Estado Operativo</th>
                <th className="p-3 text-right">Monto Total</th>
                <th className="p-3 text-right">Saldo Deuda</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No se encontraron pedidos con los criterios seleccionados.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const prov = providers.find((p) => p.id === ord.providerId);
                  const isPaid = ord.paymentStatus === 'Pagado';

                  return (
                    <tr key={ord.id} className="hover:bg-slate-50 transition">
                      <td className="p-3">
                        <span className="font-mono font-black text-slate-900 block">
                          #{ord.orderNumber}
                        </span>
                        {ord.invoiceOrReceiptNumber && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            Comp: {ord.invoiceOrReceiptNumber}
                          </span>
                        )}
                      </td>

                      <td className="p-3">
                        <span className="font-bold text-slate-900 block">{prov?.name || 'Proveedor'}</span>
                        <span className="text-[10px] text-slate-400">{prov?.rubro}</span>
                      </td>

                      <td className="p-3 text-slate-600">
                        <div>
                          Emisión: <strong>{new Date(ord.date).toLocaleDateString('es-AR')}</strong>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Entrega: {new Date(ord.expectedDeliveryDate).toLocaleDateString('es-AR')}
                        </div>
                      </td>

                      <td className="p-3 text-center">
                        <span className="font-bold px-2.5 py-1 rounded-md text-[10px] bg-slate-100 text-slate-800 border border-slate-200 inline-block">
                          {ord.status}
                        </span>
                      </td>

                      <td className="p-3 text-right font-black text-slate-900 text-sm">
                        $ {(ord.finalReceivedTotal || ord.estimatedTotal).toLocaleString('es-AR')}
                      </td>

                      <td className="p-3 text-right">
                        {ord.remainingDebt && ord.remainingDebt > 0 ? (
                          <span className="font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            $ {ord.remainingDebt.toLocaleString('es-AR')}
                          </span>
                        ) : (
                          <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                            Saldado $0
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View PDF */}
                          <button
                            onClick={() => onViewOrderDocument(ord.id)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
                            title="Ver Documento / Imprimir PDF"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Receive Goods */}
                          {(ord.status === 'Pendiente de entrega' || ord.status === 'Pedido confirmado') && (
                            <button
                              onClick={() => {
                                if (prov) onReceiveGoods(prov, ord);
                              }}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold transition flex items-center gap-1"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Ingresar</span>
                            </button>
                          )}

                          {/* Record Payment */}
                          {ord.remainingDebt && ord.remainingDebt > 0 ? (
                            <button
                              onClick={() => {
                                setPayingOrder(ord);
                                setPayAmountInput(ord.remainingDebt?.toString() || '');
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition flex items-center gap-1"
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                              <span>Pagar</span>
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK PAYMENT MODAL */}
      {payingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-md space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <span>Registrar Pago a Proveedor</span>
              </h3>
              <button onClick={() => setPayingOrder(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1">
              <p className="font-bold text-slate-900">Pedido #{payingOrder.orderNumber}</p>
              <p className="text-slate-600">
                Deuda pendiente actual:{' '}
                <strong className="text-rose-600">
                  $ {(payingOrder.remainingDebt || 0).toLocaleString('es-AR')}
                </strong>
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Monto a Pagar ($ ARS):</label>
              <input
                type="number"
                value={payAmountInput}
                onChange={(e) => setPayAmountInput(e.target.value)}
                className="w-full p-2.5 text-sm font-black bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Caja / Cuenta Origen:</label>
              <select
                value={payAccountInput}
                onChange={(e) => setPayAccountInput(e.target.value)}
                className="w-full p-2.5 text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="Banco Galicia">Banco Galicia CTA CTE</option>
                <option value="Caja Principal Efectivo">Caja Principal Efectivo</option>
                <option value="Mercado Pago">Mercado Pago</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Medio de Pago:</label>
              <select
                value={payMethodInput}
                onChange={(e) => setPayMethodInput(e.target.value as NonNullable<Order['paymentMethod']>)}
                className="w-full p-2.5 text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="Transferencia">Transferencia Bancaria</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setPayingOrder(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleExecutePayment}
                className="px-5 py-2 bg-emerald-600 text-white font-extrabold text-xs rounded-xl hover:bg-emerald-700 shadow-md"
              >
                Confirmar Pago
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
