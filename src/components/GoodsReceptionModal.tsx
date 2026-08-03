import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Order, ProcessState } from '../types';
import {
  X,
  Truck,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  Receipt,
  CreditCard,
  Building,
} from 'lucide-react';

interface GoodsReceptionModalProps {
  order: Order;
  onClose: () => void;
}

export const GoodsReceptionModal: React.FC<GoodsReceptionModalProps> = ({ order, onClose }) => {
  const { receiveGoods, providers, items } = useApp();
  const provider = providers.find((p) => p.id === order.providerId);

  // State per item for received quantity and current price
  const [receivedMap, setReceivedMap] = useState<{
    [itemId: string]: { receivedQty: number; price: number };
  }>(() => {
    const initial: { [itemId: string]: { receivedQty: number; price: number } } = {};
    order.items.forEach((it) => {
      const itemObj = items.find((i) => i.id === it.itemId);
      initial[it.itemId] = {
        receivedQty: it.finalQty,
        price: itemObj ? itemObj.currentPrice : it.referencePrice,
      };
    });
    return initial;
  });

  const [deliveryType, setDeliveryType] = useState<'completa' | 'parcial'>('completa');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [receptionNotes, setReceptionNotes] = useState<string>('');

  // Payment section state
  const [paymentOption, setPaymentOption] = useState<
    'Pendiente de pago' | 'Pagado' | 'Pago parcial'
  >('Pendiente de pago');

  const [paymentAccount, setPaymentAccount] = useState<string>('Caja Principal');
  const [paymentMethod, setPaymentMethod] = useState<Order['paymentMethod']>('Efectivo');
  const [paidAmountInput, setPaidAmountInput] = useState<string>('');

  const handleQtyChange = (itemId: string, val: number) => {
    setReceivedMap((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        receivedQty: Math.max(0, val),
      },
    }));
  };

  const handlePriceChange = (itemId: string, val: number) => {
    setReceivedMap((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        price: Math.max(0, val),
      },
    }));
  };

  // Calculate received sum
  const calculatedTotalSum = order.items.reduce((sum, it) => {
    const entry = receivedMap[it.itemId];
    return sum + (entry ? entry.receivedQty * entry.price : 0);
  }, 0);

  const handleConfirmReception = () => {
    if (!invoiceNumber.trim()) {
      if (!window.confirm('¿Desea confirmar el ingreso sin número de remito / factura?')) {
        return;
      }
    }

    const recItems = order.items.map((it) => ({
      itemId: it.itemId,
      receivedQty: receivedMap[it.itemId]?.receivedQty ?? 0,
      price: receivedMap[it.itemId]?.price ?? it.referencePrice,
    }));

    const finalPaymentStatus =
      paymentOption === 'Pagado'
        ? 'Pagado'
        : paymentOption === 'Pago parcial'
        ? 'Pago parcial'
        : 'Pendiente de pago';

    const pAmount =
      paymentOption === 'Pagado'
        ? calculatedTotalSum
        : paymentOption === 'Pago parcial'
        ? Number(paidAmountInput || 0)
        : 0;

    receiveGoods(
      order.id,
      recItems,
      receptionNotes,
      invoiceNumber || 'REM-PEND',
      deliveryType,
      finalPaymentStatus,
      {
        amount: pAmount,
        method: paymentMethod,
        account: paymentAccount,
        receiptNumber: invoiceNumber,
      }
    );

    alert('Mercadería ingresada en stock exitosamente.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200">
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">
                Ingreso de Mercadería & Recepción de Stock
              </h3>
              <p className="text-xs text-indigo-300 font-medium">
                Pedido #{order.orderNumber} • Proveedor: {provider?.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50">
          {/* Invoice & Delivery Type Controls */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Nº de Remito o Factura:
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="Ej.: REM-0001-88912"
                className="w-full py-1.5 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Tipo de Recepción:
              </label>
              <select
                value={deliveryType}
                onChange={(e) => setDeliveryType(e.target.value as 'completa' | 'parcial')}
                className="w-full py-1.5 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="completa">Entrega Completa</option>
                <option value="parcial">Entrega Parcial / Con Faltantes</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Total Recibido ($ ARS):
              </label>
              <div className="py-1.5 px-3 bg-indigo-50 rounded-xl text-sm font-black text-indigo-700 border border-indigo-200">
                $ {calculatedTotalSum.toLocaleString('es-AR')}
              </div>
            </div>
          </div>

          {/* Items Table for Receiving & Price Update */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-3 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-700">
              Verifique cantidades realmente recibidas y ajuste precio si hubo aumentos
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <th className="p-3">Insumo</th>
                    <th className="p-3 text-center">Unidad</th>
                    <th className="p-3 text-center">Pedi.</th>
                    <th className="p-3 text-center w-28">Cant. Recibida</th>
                    <th className="p-3 text-right w-32">Precio Unit. ($)</th>
                    <th className="p-3 text-right">Subtotal Recibido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((it) => {
                    const entry = receivedMap[it.itemId];
                    if (!entry) return null;

                    const itemObj = items.find((i) => i.id === it.itemId);
                    const oldPrice = itemObj?.currentPrice || it.referencePrice;
                    const priceChanged = entry.price !== oldPrice;
                    const subtotal = entry.receivedQty * entry.price;

                    return (
                      <tr key={it.itemId} className="hover:bg-slate-50">
                        <td className="p-3">
                          <span className="font-bold text-slate-900 block">{it.itemName}</span>
                          {priceChanged && (
                            <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 inline-block mt-0.5">
                              ⚠️ Modificación de precio
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center text-slate-600 font-medium">{it.unit}</td>
                        <td className="p-3 text-center font-bold text-slate-500">{it.finalQty}</td>
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            min="0"
                            value={entry.receivedQty}
                            onChange={(e) => handleQtyChange(it.itemId, Number(e.target.value))}
                            className="w-20 py-1 px-2 text-center text-xs font-black bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="p-3 text-right">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={entry.price}
                            onChange={(e) => handlePriceChange(it.itemId, Number(e.target.value))}
                            className={`w-24 py-1 px-2 text-right text-xs font-black bg-white border rounded-lg focus:outline-none focus:ring-2 ${
                              priceChanged
                                ? 'border-rose-400 bg-rose-50/50 text-rose-900'
                                : 'border-slate-300 text-slate-900'
                            }`}
                          />
                        </td>
                        <td className="p-3 text-right font-black text-slate-900">
                          $ {subtotal.toLocaleString('es-AR')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Prompt & Debt Section */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Situación Financiera y Pago de la Compra</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentOption('Pendiente de pago')}
                className={`p-3 rounded-xl text-xs font-bold border transition text-left ${
                  paymentOption === 'Pendiente de pago'
                    ? 'bg-rose-50 text-rose-900 border-rose-300 ring-2 ring-rose-300'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <p className="font-black text-sm">Pendiente (A Deuda)</p>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Registrar como deuda corriente
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentOption('Pagado')}
                className={`p-3 rounded-xl text-xs font-bold border transition text-left ${
                  paymentOption === 'Pagado'
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300 ring-2 ring-emerald-300'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <p className="font-black text-sm">Pagado Total</p>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Saldar total de $ {calculatedTotalSum.toLocaleString('es-AR')}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentOption('Pago parcial')}
                className={`p-3 rounded-xl text-xs font-bold border transition text-left ${
                  paymentOption === 'Pago parcial'
                    ? 'bg-blue-50 text-blue-900 border-blue-300 ring-2 ring-blue-300'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <p className="font-black text-sm">Pago Parcial</p>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Pagar una parte hoy y saldar resto luego
                </span>
              </button>
            </div>

            {paymentOption !== 'Pendiente de pago' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                {paymentOption === 'Pago parcial' && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Monto Pagado Hoy ($):
                    </label>
                    <input
                      type="number"
                      value={paidAmountInput}
                      onChange={(e) => setPaidAmountInput(e.target.value)}
                      placeholder="0"
                      className="w-full p-2 text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Caja / Cuenta Origen:
                  </label>
                  <select
                    value={paymentAccount}
                    onChange={(e) => setPaymentAccount(e.target.value)}
                    className="w-full p-2 text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="Caja Principal">Caja Principal Efectivo</option>
                    <option value="Caja Chica Depósito">Caja Chica Depósito</option>
                    <option value="Banco Galicia CTA CTE">Banco Galicia CTA CTE</option>
                    <option value="Mercado Pago">Mercado Pago</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Medio de Pago:
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as Order['paymentMethod'])}
                    className="w-full p-2 text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia Bancaria</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Tarjeta">Tarjeta de Débito/Crédito</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-900 p-4 border-t border-slate-800 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0 text-white">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition text-center"
          >
            Cancelar
          </button>

          <button
            onClick={handleConfirmReception}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirmar Ingreso a Stock y Finalizar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
