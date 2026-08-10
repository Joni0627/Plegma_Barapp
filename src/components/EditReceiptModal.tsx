import React, { useState, useMemo } from 'react';
import { X, Receipt as ReceiptIcon, Save, CheckSquare, Plus, Trash2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Receipt, CurrentAccountMovement, Client } from '../types';

interface EditReceiptModalProps {
  receipt: Receipt;
  client: Client;
  movements: CurrentAccountMovement[];
  onClose: () => void;
  onSave: (updatedReceipt: Receipt, updatedMovements: CurrentAccountMovement[]) => void;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n);

export const EditReceiptModal: React.FC<EditReceiptModalProps> = ({
  receipt,
  client,
  movements,
  onClose,
  onSave,
}) => {
  const [selectedMovIds, setSelectedMovIds] = useState<string[]>([...receipt.movementIds]);

  // Client movements
  const clientMovements = useMemo(
    () => movements.filter((m) => m.clientId === client.id),
    [movements, client.id]
  );

  // Available movements for this receipt: either already in this receipt, OR lineState !== 'Pagada'
  const selectableMovements = useMemo(() => {
    return clientMovements.filter(
      (m) => receipt.movementIds.includes(m.id) || m.lineState === 'Pendiente'
    );
  }, [clientMovements, receipt.movementIds]);

  const newTotalAmount = useMemo(() => {
    return clientMovements
      .filter((m) => selectedMovIds.includes(m.id))
      .reduce((acc, m) => acc + m.total, 0);
  }, [clientMovements, selectedMovIds]);

  const toggleMovement = (id: string) => {
    setSelectedMovIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    if (selectedMovIds.length === 0) return;

    const updatedReceipt: Receipt = {
      ...receipt,
      totalAmount: newTotalAmount,
      movementIds: [...selectedMovIds],
    };

    // Update lineState on movements
    const updatedMovements = movements.map((m) => {
      if (m.clientId !== client.id) return m;
      // If movement is in selectedMovIds, keep it associated with receipt
      if (selectedMovIds.includes(m.id)) {
        return m;
      }
      // If it was in receipt before but now unselected, revert lineState to Pendiente
      if (receipt.movementIds.includes(m.id)) {
        return { ...m, lineState: 'Pendiente' as const };
      }
      return m;
    });

    onSave(updatedReceipt, updatedMovements);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl space-y-0 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <ReceiptIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base flex items-center gap-2">
                Editar Recibo <span className="font-mono text-amber-400">{receipt.receiptNumber}</span>
              </h3>
              <p className="text-xs text-slate-400">Agregue o remueva tickets asociados al recibo pendiente</p>
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
          {/* Summary pill */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">Cliente</p>
              <p className="text-sm font-black text-slate-900">{client.name}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">Nuevo Monto Total</p>
              <p className="text-lg font-black text-amber-600">{fmt(newTotalAmount)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Tickets Disponibles del Cliente ({selectableMovements.length})
              </p>
              <span className="text-[11px] text-slate-500">
                <strong>{selectedMovIds.length}</strong> seleccionados
              </span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-2.5 px-3.5 w-8"></th>
                    <th className="py-2.5 px-3.5 text-left">N° Ticket</th>
                    <th className="py-2.5 px-3.5 text-left">Fecha y Hora</th>
                    <th className="py-2.5 px-3.5 text-right">Monto</th>
                    <th className="py-2.5 px-3.5 text-left">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {selectableMovements.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No hay tickets disponibles para modificar este recibo.
                      </td>
                    </tr>
                  ) : (
                    selectableMovements.map((mov) => {
                      const isSelected = selectedMovIds.includes(mov.id);
                      return (
                        <tr
                          key={mov.id}
                          onClick={() => toggleMovement(mov.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-amber-50/70 border-l-2 border-amber-500' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-3 px-3.5">
                            <div
                              className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                                isSelected ? 'bg-amber-500 border-amber-500 text-slate-950' : 'border-slate-300'
                              }`}
                            >
                              {isSelected && <div className="w-2 h-2 bg-slate-950 rounded-sm" />}
                            </div>
                          </td>
                          <td className="py-3 px-3.5 font-mono font-bold text-indigo-700">
                            {mov.ticketNumber || mov.id}
                          </td>
                          <td className="py-3 px-3.5 font-medium whitespace-nowrap">{mov.dateTime}</td>
                          <td className="py-3 px-3.5 text-right font-bold text-slate-900">{fmt(mov.total)}</td>
                          <td className="py-3 px-3.5 text-slate-600 max-w-xs truncate">{mov.ticketDetail || '-'}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-500">
            {selectedMovIds.length === 0 ? (
              <span className="text-rose-600 font-semibold">Debe seleccionar al menos un ticket</span>
            ) : (
              <span>Se guardará con {selectedMovIds.length} ticket(s) incluidos</span>
            )}
          </p>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={selectedMovIds.length === 0}
              leftIcon={<Save className="w-4 h-4" />}
              onClick={handleSave}
            >
              Guardar Cambios
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
