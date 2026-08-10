import React, { useState } from 'react';
import { X, CreditCard, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { FormField, SelectInput, TextInput } from '../ui/Form';

interface AddLineModalProps {
  onClose: () => void;
  onConfirm: (boxType: string, initialAmount: number) => void;
}

const BOX_TYPE_OPTIONS = [
  { value: 'Efectivo', label: 'Efectivo (Caja Chica)' },
  { value: 'Mercado Pago 1', label: 'Mercado Pago 1 (QR Salón)' },
  { value: 'Mercado Pago 2', label: 'Mercado Pago 2 (QR Barra)' },
  { value: 'Mercado Pago 3', label: 'Mercado Pago 3 (Delivery)' },
  { value: 'Cuenta Corriente', label: 'Cuenta Corriente (Clientes)' },
  { value: 'Cortesía / Consumo Interno', label: 'Cortesía / Consumo Interno' },
  { value: 'Tarjeta Posnet', label: 'Tarjeta Posnet / Débito / Crédito' },
];

export const AddLineModal: React.FC<AddLineModalProps> = ({ onClose, onConfirm }) => {
  const [boxType, setBoxType] = useState('Efectivo');
  const [initialAmountStr, setInitialAmountStr] = useState('0');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(initialAmountStr) || 0;
    onConfirm(boxType, amount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl space-y-0">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Agregar Línea de Caja</h3>
              <p className="text-xs text-slate-400">Seleccione el medio de pago e importe inicial</p>
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
          <FormField label="Tipo de Caja / Medio de Pago" required hint="Defina el medio operativo a controlar">
            <SelectInput
              options={BOX_TYPE_OPTIONS}
              value={boxType}
              onChange={(e) => setBoxType(e.target.value)}
            />
          </FormField>

          <FormField label="Monto Inicio Caja ($)" required hint="Ingrese el saldo inicial/cambio de esta línea">
            <TextInput
              type="number"
              min="0"
              step="any"
              placeholder="0"
              value={initialAmountStr}
              onChange={(e) => setInitialAmountStr(e.target.value)}
            />
          </FormField>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              Agregar Línea
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
