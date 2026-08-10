import React, { useState } from 'react';
import { X, Plus, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { FormField, SelectInput, TextInput } from '../ui/Form';
import { TurnoType } from '../../types';

interface NewShiftModalProps {
  onClose: () => void;
  onConfirm: (shift: TurnoType, notes?: string) => void;
}

const SHIFT_OPTIONS = [
  { value: 'Mañana', label: 'Mañana' },
  { value: 'Tarde', label: 'Tarde' },
];

export const NewShiftModal: React.FC<NewShiftModalProps> = ({ onClose, onConfirm }) => {
  const [shift, setShift] = useState<TurnoType>('Mañana');
  const [notes, setNotes] = useState('');

  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const dateStr = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  const generatedName = `${shift.toUpperCase()} ${dateStr}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(shift, notes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl space-y-0">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Abrir Caja de Turno</h3>
              <p className="text-xs text-slate-400">Seleccione el turno e inicie la jornada</p>
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
          <FormField label="Turno de Caja" required hint="Seleccione el turno a operar">
            <SelectInput
              options={SHIFT_OPTIONS}
              value={shift}
              onChange={(e) => setShift(e.target.value as TurnoType)}
            />
          </FormField>

          <FormField label="Nombre Autogenerado de Caja">
            <TextInput
              value={generatedName}
              readOnly
              disabled
              className="bg-slate-100 font-mono font-bold text-slate-700 cursor-not-allowed"
            />
          </FormField>

          <FormField label="Observaciones de Apertura" hint="Notas operativas adicionales para el turno (opcional)">
            <TextInput
              placeholder="Ej. Apertura con cambio preparado para salón y barra..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </FormField>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              Abrir Caja de Turno
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
