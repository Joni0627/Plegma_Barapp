import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Calendar, Save, Info, AlertTriangle } from 'lucide-react';

interface PayrunModalProps {
  onClose: () => void;
}

export const PayrunModal: React.FC<PayrunModalProps> = ({ onClose }) => {
  const { createPayrun, showToast } = useApp();

  const [startDate, setStartDate] = useState<string>('2026-06-19T06:10');
  const [endDate, setEndDate] = useState<string>('2026-06-26T05:10');
  const [customPeriodName, setCustomPeriodName] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const startFormatted = startDate.replace('T', ' ');
    const endFormatted = endDate.replace('T', ' ');

    const res = createPayrun(startFormatted, endFormatted, customPeriodName || undefined);
    if (!res.success) {
      showToast(res.message, 'error');
      return;
    }

    showToast(res.message, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header Bar */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-md">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">Creación / Edición de Liquidación</h3>
              <p className="text-xs text-slate-400">
                Seleccione el rango de fechas para procesar horas, importes y descuentos.
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Scrollable Body Container (no visible scrollbar) */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-5 sm:p-6 space-y-5 text-xs">
            <div>
              <label className="font-extrabold text-slate-800 block mb-1">
                Nombre / Período (Opcional):
              </label>
              <input
                type="text"
                value={customPeriodName}
                onChange={(e) => setCustomPeriodName(e.target.value)}
                placeholder="Ej.: Semana 19/06 al 26/06/2026 o Quincena Junio 2"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-extrabold text-slate-800 block mb-1">
                  Inicio <span className="text-rose-600">*</span>:
                </label>
                <input
                  type="datetime-local"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold font-mono"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-800 block mb-1">
                  Fin <span className="text-rose-600">*</span>:
                </label>
                <input
                  type="datetime-local"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold font-mono"
                />
              </div>
            </div>

            {/* Rules Info Box */}
            <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl space-y-2 text-sky-900">
              <div className="flex items-center gap-2 font-black text-sky-800 text-xs">
                <Info className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Automatizaciones de Procesamiento:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] font-medium text-sky-900 pl-1">
                <li>Al guardar, se incluyen automáticamente todos los empleados activos de la nómina.</li>
                <li>Se calculan las horas trabajadas desde las marcaciones en ese rango de tiempo.</li>
                <li>Se cruzan los adelantos de sueldo y consumos pendientes para descontar automáticamente.</li>
                <li>El estado inicial de la liquidación se genera como <strong>Pendiente</strong>.</li>
              </ul>
            </div>
          </div>

          {/* Modal Footer Bar */}
          <div className="bg-slate-900 p-4 border-t border-slate-800 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0 text-white w-full">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition text-center"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Liquidación</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
