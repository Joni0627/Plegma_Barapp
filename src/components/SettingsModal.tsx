import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ReceptionHoursConfig } from '../types';
import { X, Clock, Save, CheckCircle2 } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { receptionHours, updateReceptionHours } = useApp();

  const [morningStart, setMorningStart] = useState(receptionHours.morningStart);
  const [morningEnd, setMorningEnd] = useState(receptionHours.morningEnd);
  const [morningActive, setMorningActive] = useState(receptionHours.morningActive);

  const [afternoonStart, setAfternoonStart] = useState(receptionHours.afternoonStart);
  const [afternoonEnd, setAfternoonEnd] = useState(receptionHours.afternoonEnd);
  const [afternoonActive, setAfternoonActive] = useState(receptionHours.afternoonActive);

  const [additionalNotes, setAdditionalNotes] = useState(
    receptionHours.additionalNotes || ''
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ReceptionHoursConfig = {
      morningStart,
      morningEnd,
      morningActive,
      afternoonStart,
      afternoonEnd,
      afternoonActive,
      additionalNotes,
    };
    updateReceptionHours(updated);
    alert('Horarios de recepción guardados exitosamente.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <form
        onSubmit={handleSave}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto no-scrollbar border border-slate-200"
      >
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-base tracking-tight">
              Configuración de Horarios de Recepción
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          <p className="text-slate-500">
            Los horarios configurados se imprimirán automáticamente en todos los documentos y PDF
            de órdenes de compra emitidos a proveedores.
          </p>

          {/* Turno Mañana */}
          <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-amber-950 uppercase tracking-wider">
                Turno Mañana:
              </span>
              <input
                type="checkbox"
                checked={morningActive}
                onChange={(e) => setMorningActive(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Hora Inicio:</label>
                <input
                  type="time"
                  value={morningStart}
                  onChange={(e) => setMorningStart(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Hora Fin:</label>
                <input
                  type="time"
                  value={morningEnd}
                  onChange={(e) => setMorningEnd(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold"
                />
              </div>
            </div>
          </div>

          {/* Turno Tarde */}
          <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-amber-950 uppercase tracking-wider">
                Turno Tarde:
              </span>
              <input
                type="checkbox"
                checked={afternoonActive}
                onChange={(e) => setAfternoonActive(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Hora Inicio:</label>
                <input
                  type="time"
                  value={afternoonStart}
                  onChange={(e) => setAfternoonStart(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Hora Fin:</label>
                <input
                  type="time"
                  value={afternoonEnd}
                  onChange={(e) => setAfternoonEnd(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold"
                />
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Instrucciones adicionales impresas en remito:
            </label>
            <textarea
              rows={2}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>
        </div>

        <div className="bg-slate-900 p-4 border-t border-slate-800 flex justify-end gap-2 text-white">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 font-bold text-xs rounded-xl"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-orange-600 hover:bg-orange-500 font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Horarios</span>
          </button>
        </div>
      </form>
    </div>
  );
};
