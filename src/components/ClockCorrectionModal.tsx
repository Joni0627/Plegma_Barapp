import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ClockRecord, ClockState } from '../types';
import { X, Clock, Edit3, AlertCircle, Save, Ban } from 'lucide-react';

interface ClockCorrectionModalProps {
  record: ClockRecord;
  onClose: () => void;
}

export const ClockCorrectionModal: React.FC<ClockCorrectionModalProps> = ({ record, onClose }) => {
  const { correctClockRecord, voidClockRecord } = useApp();

  const formatForInput = (str?: string) => {
    if (!str) return '';
    return str.replace(' ', 'T');
  };

  const formatForStorage = (str: string) => {
    return str.replace('T', ' ');
  };

  const [checkIn, setCheckIn] = useState(formatForInput(record.checkIn));
  const [checkOut, setCheckOut] = useState(formatForInput(record.checkOut));
  const [reason, setReason] = useState('');
  const [isVoiding, setIsVoiding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      alert('Debe ingresar obligatoriamente el motivo de la modificación por auditoría.');
      return;
    }

    if (isVoiding) {
      if (confirm(`¿Está seguro de ANULAR la marcación de ${record.employeeName}?`)) {
        voidClockRecord(record.id, reason.trim());
        alert('Marcación anulada exitosamente.');
        onClose();
      }
      return;
    }

    if (!checkIn) {
      alert('La fecha y hora de entrada es obligatoria.');
      return;
    }

    correctClockRecord(
      record.id,
      formatForStorage(checkIn),
      checkOut ? formatForStorage(checkOut) : '',
      reason.trim()
    );
    alert('Marcación corregida correctamente.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-900 flex items-center justify-center font-black shadow-md">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">Corregir / Auditar Marcación</h3>
              <p className="text-xs text-slate-400">
                Ajuste manual de horas trabajadas para {record.employeeName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
          {/* Employee Readonly Card */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div>
              <span className="font-extrabold text-slate-900 text-sm block">{record.employeeName}</span>
              <span className="font-mono text-slate-500 text-xs">DNI: {record.dni}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Valor Hora Congelado</span>
              <span className="font-mono font-black text-slate-900 text-xs">
                $ {record.hourlyRate.toLocaleString('es-AR')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Fecha & Hora Entrada (*):</label>
              <input
                type="datetime-local"
                required
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Fecha & Hora Salida:</label>
              <input
                type="datetime-local"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
              />
            </div>
          </div>

          {/* Reason text field */}
          <div>
            <label className="font-bold text-slate-800 block mb-1">
              Motivo de Corrección / Auditoría <span className="text-rose-600">*</span>:
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej.: Empleado olvidó marcar la salida al finalizar la jornada. Se ajusta según planilla física."
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Action options */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsVoiding(!isVoiding)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition text-xs ${
                isVoiding
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              <Ban className="w-3.5 h-3.5" />
              <span>{isVoiding ? 'Modo Anulación Activo' : 'Anular Marcación'}</span>
            </button>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition text-center"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className={`flex items-center justify-center gap-2 px-6 py-2.5 font-extrabold text-xs rounded-xl shadow-lg transition text-white ${
                isVoiding ? 'bg-rose-600 hover:bg-rose-500' : 'bg-amber-500 hover:bg-amber-400 text-slate-900'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{isVoiding ? 'Confirmar Anulación' : 'Guardar Corrección'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
