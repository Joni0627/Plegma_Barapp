import React, { useState } from 'react';
import { X, FileBadge, Check, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { FormField, TextInput, SelectInput } from './ui/Form';
import { Receipt, Client } from '../types';

interface BillReceiptModalProps {
  receipt: Receipt;
  client: Client;
  isEmployee: boolean;
  onClose: () => void;
  onConfirm: (data: {
    paymentMethod: string;
    cashRegister: string;
    applyToPayroll: boolean;
  }) => void;
}

const PAYMENT_METHODS = [
  { value: 'Efectivo', label: 'Efectivo' },
  { value: 'Transferencia Bancaria', label: 'Transferencia Bancaria' },
  { value: 'Tarjeta de Débito', label: 'Tarjeta de Débito' },
  { value: 'Tarjeta de Crédito', label: 'Tarjeta de Crédito' },
  { value: 'Mercado Pago', label: 'Mercado Pago' },
  { value: 'Cheque', label: 'Cheque' },
];

const CASH_REGISTERS = [
  { value: 'Caja Principal', label: 'Caja Principal' },
  { value: 'Caja Barra / Salón', label: 'Caja Barra / Salón' },
  { value: 'Caja Eventos', label: 'Caja Eventos' },
  { value: 'Cuenta Bancaria Galicia', label: 'Cuenta Bancaria Galicia' },
];

const fmt = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n);

export const BillReceiptModal: React.FC<BillReceiptModalProps> = ({
  receipt,
  client,
  isEmployee,
  onClose,
  onConfirm,
}) => {
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [cashRegister, setCashRegister] = useState('Caja Principal');
  const [applyToPayroll, setApplyToPayroll] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentMethod) {
      setError('Seleccione un medio de pago válido');
      return;
    }
    if (!cashRegister) {
      setError('Seleccione una caja de destino');
      return;
    }
    onConfirm({
      paymentMethod,
      cashRegister,
      applyToPayroll: isEmployee ? applyToPayroll : false,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl space-y-0">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <FileBadge className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Facturar Recibo</h3>
              <p className="text-xs text-slate-400">Complete los datos de cobro y caja</p>
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

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Client summary pill */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide font-bold">Cliente</p>
              <p className="text-xs font-black text-slate-800">{client.name}</p>
            </div>
            {isEmployee && (
              <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold border border-violet-200">
                Empleado
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="N° de Recibo">
              <TextInput
                value={receipt.receiptNumber}
                readOnly
                disabled
                className="bg-slate-100 font-mono font-bold text-slate-700 cursor-not-allowed"
              />
            </FormField>

            <FormField label="Monto Total">
              <TextInput
                value={fmt(receipt.totalAmount)}
                readOnly
                disabled
                className="bg-emerald-50 border-emerald-200 font-black text-emerald-700 cursor-not-allowed"
              />
            </FormField>
          </div>

          <FormField label="Medio de Pago" required hint="Seleccione la forma de cobro">
            <SelectInput
              options={PAYMENT_METHODS}
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
          </FormField>

          <FormField label="Caja de Destino" required hint="Seleccione la caja o cuenta destino">
            <SelectInput
              options={CASH_REGISTERS}
              value={cashRegister}
              onChange={(e) => setCashRegister(e.target.value)}
            />
          </FormField>

          {/* Conditional Checkbox SOLO if Empleado */}
          {isEmployee && (
            <div className="p-3.5 bg-violet-50/80 border border-violet-200 rounded-2xl space-y-2">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={applyToPayroll}
                  onChange={(e) => setApplyToPayroll(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-violet-600 focus:ring-violet-500 border-slate-300 transition"
                />
                <div>
                  <p className="text-xs font-bold text-violet-900 leading-tight">
                    Aplicar como descuento en Liquidación de Sueldos
                  </p>
                  <p className="text-[11px] text-violet-600 mt-0.5">
                    Al confirmar, este recibo se registrará en RR.HH. para ser descontado en el próximo recibo de sueldo.
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              leftIcon={<Check className="w-4 h-4" />}
            >
              Confirmar Facturación
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
