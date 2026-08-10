import React, { useState } from 'react';
import { X, DollarSign, CreditCard, Receipt, Percent, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { FormField, SelectInput, TextInput } from '../ui/Form';
import { SaleOrder, CashShift, CashLine, Client, Employee } from '../../types';

interface OrderBillingModalProps {
  order: SaleOrder;
  clients: Client[];
  employees: Employee[];
  activeCashShift?: CashShift | null;
  activeCashLines: CashLine[];
  onClose: () => void;
  onConfirmBilling: (billing: any) => { success: boolean; message: string; ticketNumber?: string };
}

const fmt = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n);

const PAYMENT_METHODS = [
  { value: 'Efectivo', label: 'Efectivo (Caja Chica)' },
  { value: 'Mercado Pago QR', label: 'Mercado Pago QR' },
  { value: 'Tarjeta Posnet / Débito', label: 'Tarjeta Posnet / Débito' },
  { value: 'Tarjeta Posnet / Crédito', label: 'Tarjeta Posnet / Crédito' },
  { value: 'Transferencia Bancaria', label: 'Transferencia Bancaria Directa' },
];

export const OrderBillingModal: React.FC<OrderBillingModalProps> = ({
  order,
  clients,
  employees,
  activeCashShift,
  activeCashLines,
  onClose,
  onConfirmBilling,
}) => {
  const [paymentCondition, setPaymentCondition] = useState<'Contado' | 'Cuenta Corriente' | 'Consumo Empleado'>('Contado');
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [discountPercentStr, setDiscountPercentStr] = useState('0');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const selectedClient = clients.find((c) => c.id === order.clientId);
  const subtotal = order.totalAmount;
  const discountPercent = parseFloat(discountPercentStr) || 0;
  const discountAmount = (subtotal * discountPercent) / 100;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // R07: Prohibición de facturar sin caja abierta (salvo Cta Cte)
    if (!activeCashShift && paymentCondition !== 'Cuenta Corriente') {
      setError('Queda estrictamente prohibido procesar facturaciones contra una caja cerrada o sin turno activo (R07).');
      return;
    }

    // R05: Restricción Cta Cte
    if (paymentCondition === 'Cuenta Corriente') {
      if (!selectedClient || !selectedClient.hasCurrentAccount) {
        setError(`El cliente "${order.clientName}" no posee habilitada la opción de Cuenta Corriente (R05).`);
        return;
      }
    }

    // R06: Restricción Consumo Empleado
    if (paymentCondition === 'Consumo Empleado') {
      const isEmployee = employees.some((emp) => emp.name.toLowerCase() === order.clientName.toLowerCase() || emp.id === order.clientId);
      if (!isEmployee) {
        setError(`El titular "${order.clientName}" no figura como empleado registrado en la plantilla de personal (R06).`);
        return;
      }
    }

    const payload = {
      clientId: order.clientId,
      clientName: order.clientName,
      paymentCondition,
      paymentMethod: paymentCondition === 'Contado' ? paymentMethod : paymentCondition,
      cashRegisterId: activeCashShift?.id,
      discountPercentage: discountPercent,
      discountAmount,
      subtotalAmount: subtotal,
      finalTotal,
      notes: notes.trim() || undefined,
    };

    const res = onConfirmBilling(payload);
    if (!res.success) {
      setError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl space-y-0">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Facturar Pedido #{order.orderNumber}</h3>
              <p className="text-xs text-slate-400">Procesamiento de cobro, imputación en caja y ticket (A07)</p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Active Cash Shift Status */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Caja de Turno Imputada</span>
              <p className="font-extrabold text-slate-900">{activeCashShift ? activeCashShift.name : 'Sin Caja Abierta (Solo CC)'}</p>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeCashShift ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
              {activeCashShift ? 'Caja Operativa Abierta' : 'Caja Cerrada (R07)'}
            </span>
          </div>

          <FormField label="Condición de Pago" required hint="Seleccione modalidad (Contado / CC / Consumo)">
            <SelectInput
              options={[
                { value: 'Contado', label: 'Contado (Caja Operativa)' },
                { value: 'Cuenta Corriente', label: `Cuenta Corriente ${selectedClient?.hasCurrentAccount ? '[Habilitado]' : '[No Habilitado R05]'}` },
                { value: 'Consumo Empleado', label: 'Consumo Empleado (Descuento Haberes R06)' },
              ]}
              value={paymentCondition}
              onChange={(e) => {
                setPaymentCondition(e.target.value as any);
                setError('');
              }}
            />
          </FormField>

          {paymentCondition === 'Contado' && (
            <FormField label="Medio de Pago" required hint="Medio de cobranza cobrado">
              <SelectInput
                options={PAYMENT_METHODS}
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
            </FormField>
          )}

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Descuento Comercial (%)" hint="Porcentaje de descuento opcional">
              <TextInput
                type="number"
                min="0"
                max="100"
                value={discountPercentStr}
                onChange={(e) => setDiscountPercentStr(e.target.value)}
              />
            </FormField>

            <FormField label="Monto Descuento ($)">
              <TextInput
                value={fmt(discountAmount)}
                readOnly
                disabled
                className="bg-slate-100 font-mono text-slate-700 cursor-not-allowed"
              />
            </FormField>
          </div>

          {/* Amount Breakdown Summary */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-1.5 font-mono text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal del Pedido:</span>
              <span>{fmt(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-rose-400">
                <span>Descuento ({discountPercent}%):</span>
                <span>-{fmt(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black text-amber-400 pt-1 border-t border-slate-800">
              <span>TOTAL FINAL A COBRAR:</span>
              <span className="text-base">{fmt(finalTotal)}</span>
            </div>
          </div>

          <FormField label="Observaciones de Facturación" hint="Notas de cobro o referencia de comprobante">
            <TextInput
              placeholder="Ej. Cobrado con QR Mercado Pago transacción #8841..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </FormField>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" leftIcon={<DollarSign className="w-4 h-4" />}>
              Procesar Cobro & Emitir Ticket (A07)
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
