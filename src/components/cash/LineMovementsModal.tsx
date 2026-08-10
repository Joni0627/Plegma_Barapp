import React, { useState } from 'react';
import { X, Eye, Plus, ArrowUpRight, ArrowDownRight, RefreshCw, FileText } from 'lucide-react';
import { Button } from '../ui/Button';
import { StandardDataTable } from '../ui/DataTable';
import { FormField, SelectInput, TextInput } from '../ui/Form';
import { CashLine, CashMovement, CashMovementType } from '../../types';

interface LineMovementsModalProps {
  line: CashLine;
  movements: CashMovement[];
  onClose: () => void;
  onAddMovement: (mov: Omit<CashMovement, 'id' | 'dateTime' | 'userId' | 'userName'>) => void;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n);

const MOVEMENT_TYPES = [
  { value: 'Ticket', label: 'Ticket Cobrado (+)' },
  { value: 'Gasto', label: 'Gasto (-)' },
  { value: 'Consumo', label: 'Consumo Interno (-)' },
  { value: 'Ajuste', label: 'Ajuste Manual (+/-)' },
];

export const LineMovementsModal: React.FC<LineMovementsModalProps> = ({
  line,
  movements,
  onClose,
  onAddMovement,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [movType, setMovType] = useState<CashMovementType>('Ticket');
  const [origin, setOrigin] = useState('');
  const [voucherNumber, setVoucherNumber] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const lineMovements = movements.filter((m) => m.lineId === line.id);

  const handleCreateMovement = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(amountStr);
    if (isNaN(amountVal) || amountVal === 0) {
      setError('Ingrese un monto válido diferente de cero.');
      return;
    }
    if (!origin.trim()) {
      setError('Ingrese la referencia u origen del movimiento.');
      return;
    }

    let finalAmount = Math.abs(amountVal);
    if (movType === 'Gasto' || movType === 'Consumo' || (movType === 'Ajuste' && amountVal < 0)) {
      finalAmount = -Math.abs(amountVal);
    }

    onAddMovement({
      lineId: line.id,
      shiftId: line.shiftId,
      type: movType,
      origin: origin.trim(),
      voucherNumber: voucherNumber.trim() || undefined,
      amount: finalAmount,
      notes: notes.trim() || undefined,
    });

    setIsAdding(false);
    setOrigin('');
    setVoucherNumber('');
    setAmountStr('');
    setNotes('');
    setError('');
  };

  const columns = [
    {
      key: 'dateTime',
      header: 'Fecha y Hora',
      sortable: true,
      render: (m: CashMovement) => <span className="font-mono text-slate-600 text-xs">{m.dateTime}</span>,
    },
    {
      key: 'type',
      header: 'Tipo',
      sortable: true,
      render: (m: CashMovement) => {
        const isPos = m.amount > 0;
        return (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              isPos
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            {isPos ? <ArrowUpRight className="w-3 h-3 text-emerald-500" /> : <ArrowDownRight className="w-3 h-3 text-rose-500" />}
            {m.type}
          </span>
        );
      },
    },
    {
      key: 'origin',
      header: 'Origen / Referencia',
      sortable: true,
      render: (m: CashMovement) => (
        <div>
          <p className="font-semibold text-slate-800 text-xs">{m.origin}</p>
          {m.voucherNumber && <p className="text-[10px] text-slate-400 font-mono">N° {m.voucherNumber}</p>}
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Importe',
      sortable: true,
      align: 'right' as const,
      render: (m: CashMovement) => (
        <span className={`font-black text-xs ${m.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
          {m.amount >= 0 ? `+${fmt(m.amount)}` : fmt(m.amount)}
        </span>
      ),
    },
    {
      key: 'userName',
      header: 'Usuario',
      render: (m: CashMovement) => <span className="text-slate-600 text-xs">{m.userName}</span>,
    },
    {
      key: 'notes',
      header: 'Observación',
      render: (m: CashMovement) => <span className="text-slate-500 text-xs max-w-xs truncate">{m.notes || '-'}</span>,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl space-y-0 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base flex items-center gap-2">
                Movimientos de Línea: <span className="text-amber-400">{line.boxType}</span>
              </h3>
              <p className="text-xs text-slate-400">Historial completo y trazabilidad de transacciones</p>
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
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Summary Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Inicio</p>
              <p className="text-sm font-black text-slate-900">{fmt(line.initialAmount)}</p>
            </div>
            <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-2xl">
              <p className="text-[10px] text-emerald-600 uppercase font-bold">+ Tickets Facturados</p>
              <p className="text-sm font-black text-emerald-700">+{fmt(line.ticketsTotal)}</p>
            </div>
            <div className="p-3 bg-rose-50/50 border border-rose-200 rounded-2xl">
              <p className="text-[10px] text-rose-600 uppercase font-bold">- Gastos / Retiros</p>
              <p className="text-sm font-black text-rose-700">-{fmt(line.expensesTotal + line.withdrawalsTotal)}</p>
            </div>
            <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-2xl">
              <p className="text-[10px] text-amber-600 uppercase font-bold">Monto Teórico Actual</p>
              <p className="text-sm font-black text-amber-700">{fmt(line.theoreticalAmount)}</p>
            </div>
          </div>

          {/* Inline Add Movement Form if Line is open */}
          {line.status === 'Abierta' && (
            <div>
              {!isAdding ? (
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="primary"
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                    onClick={() => setIsAdding(true)}
                  >
                    Registrar Movimiento Operativo
                  </Button>
                </div>
              ) : (
                <form
                  onSubmit={handleCreateMovement}
                  className="p-4 bg-slate-50 border border-amber-200 rounded-2xl space-y-3 animate-fadeIn"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-amber-500" /> Nuevo Movimiento Manual en {line.boxType}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="text-slate-400 hover:text-slate-700 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {error && (
                    <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-2 rounded-xl border border-rose-200">
                      {error}
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <FormField label="Tipo de Movimiento">
                      <SelectInput
                        options={MOVEMENT_TYPES}
                        value={movType}
                        onChange={(e) => setMovType(e.target.value as CashMovementType)}
                      />
                    </FormField>
                    <FormField label="Origen / Referencia" required>
                      <TextInput
                        placeholder="Ej. Cobro Mesa 10 / Pago Prov"
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                      />
                    </FormField>
                    <FormField label="Monto ($)" required>
                      <TextInput
                        type="number"
                        step="any"
                        placeholder="0"
                        value={amountStr}
                        onChange={(e) => setAmountStr(e.target.value)}
                      />
                    </FormField>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField label="N° Comprobante (opcional)">
                      <TextInput
                        placeholder="Ej. TKT-00109 / FAC-441"
                        value={voucherNumber}
                        onChange={(e) => setVoucherNumber(e.target.value)}
                      />
                    </FormField>
                    <FormField label="Observaciones (opcional)">
                      <TextInput
                        placeholder="Detalle adicional del movimiento"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </FormField>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsAdding(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" variant="primary" size="sm">
                      Guardar Movimiento
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Table */}
          <StandardDataTable
            data={lineMovements}
            columns={columns}
            keyExtractor={(m) => m.id}
            title="Trazabilidad de Movimientos"
            searchFilterKey={(m) => `${m.origin} ${m.type} ${m.userName} ${m.voucherNumber || ''}`}
            searchPlaceholder="Buscar por origen, comprobante o usuario..."
            emptyMessage="No se han registrado movimientos en esta línea."
            emptyIcon={<FileText className="w-8 h-8 text-slate-300" />}
          />
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <Button type="button" variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};
