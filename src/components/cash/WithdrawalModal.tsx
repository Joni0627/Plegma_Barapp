import React, { useState } from 'react';
import { X, DollarSign, ArrowRightLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { FormField, SelectInput, TextInput } from '../ui/Form';
import { CashLine, MasterCashBox, CashWithdrawalPayload } from '../../types';

interface WithdrawalModalProps {
  line: CashLine;
  masterBoxes: MasterCashBox[];
  onClose: () => void;
  onConfirm: (payload: CashWithdrawalPayload) => void;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n);

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  line,
  masterBoxes,
  onClose,
  onConfirm,
}) => {
  const [amountStr, setAmountStr] = useState('');
  const [masterBoxId, setMasterBoxId] = useState(masterBoxes[0]?.id || '');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const masterBoxOptions = masterBoxes.map((mb) => ({
    value: mb.id,
    label: `${mb.name} (Saldo: ${fmt(mb.currentBalance)})`,
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountStr);
    if (!amount || amount <= 0) {
      setError('Ingrese un monto de retiro válido superior a cero.');
      return;
    }
    if (!masterBoxId) {
      setError('Seleccione una Caja Maestra de destino.');
      return;
    }
    if (amount > line.theoreticalAmount && line.boxType === 'Efectivo') {
      if (!confirm(`El monto a retirar (${fmt(amount)}) supera el saldo teórico en la línea (${fmt(line.theoreticalAmount)}). ¿Desea continuar de todos modos?`)) {
        return;
      }
    }

    onConfirm({
      lineId: line.id,
      amount,
      masterBoxId,
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl space-y-0">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Registrar Retiro de Caja</h3>
              <p className="text-xs text-slate-400">Transferir fondos desde {line.boxType} a Caja Maestra</p>
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

          {/* Line summary pill */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide font-bold">Línea Operativa</p>
              <p className="text-xs font-black text-slate-800">{line.boxType}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide font-bold">Monto Teórico Actual</p>
              <p className="text-sm font-black text-emerald-600">{fmt(line.theoreticalAmount)}</p>
            </div>
          </div>

          <FormField label="Monto a Retirar ($)" required hint="Importe que se descontará de la línea">
            <TextInput
              type="number"
              min="1"
              step="any"
              placeholder="Ej. 10000"
              value={amountStr}
              onChange={(e) => {
                setAmountStr(e.target.value);
                setError('');
              }}
            />
          </FormField>

          <FormField label="Caja Maestra Destino" required hint="Solo Cajas Maestras pueden recibir retiros (R05)">
            <SelectInput
              options={masterBoxOptions}
              value={masterBoxId}
              onChange={(e) => setMasterBoxId(e.target.value)}
            />
          </FormField>

          <FormField label="Observación / Justificación" hint="Motivo del retiro o referencia de transporte">
            <TextInput
              placeholder="Ej. Retiro parcial de seguridad por arqueo en caja chica..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </FormField>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" leftIcon={<DollarSign className="w-4 h-4" />}>
              Confirmar Retiro
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
