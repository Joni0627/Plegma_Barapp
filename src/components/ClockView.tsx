import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ClockRecord, ClockState } from '../types';
import { ClockCorrectionModal } from './ClockCorrectionModal';
import { StandardDataTable, Column } from './ui/DataTable';
import {
  Clock,
  LogIn,
  LogOut,
  Search,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Edit3,
  Ban,
  Info,
  DollarSign,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const ClockView: React.FC = () => {
  const { clockRecords, employees, clockIn, clockOut, branding } = useApp();

  // Mode: 'empleado' (Terminal Operativa) vs 'admin' (Control)
  const [viewMode, setViewMode] = useState<'empleado' | 'admin'>('empleado');

  // Form State - Vista Empleado
  const [dniInput, setDniInput] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Filters State - Vista Admin
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>('todas');

  // Modal State
  const [editingRecord, setEditingRecord] = useState<ClockRecord | null>(null);

  // Auto-find employee when typing DNI
  const cleanDni = dniInput.trim();
  const matchedEmployee = employees.find((e) => e.dni === cleanDni);
  const openRecordForEmployee = cleanDni
    ? clockRecords.find((r) => r.dni === cleanDni && r.state === 'Abierta')
    : undefined;

  const handleClockIn = () => {
    if (!cleanDni) {
      setFeedbackMessage({ type: 'error', text: 'Por favor ingrese su número de DNI.' });
      return;
    }

    const result = clockIn(cleanDni);
    if (result.success) {
      setFeedbackMessage({ type: 'success', text: result.message });
    } else {
      setFeedbackMessage({ type: 'error', text: result.message });
    }
  };

  const handleClockOut = () => {
    if (!cleanDni) {
      setFeedbackMessage({ type: 'error', text: 'Por favor ingrese su número de DNI.' });
      return;
    }

    const result = clockOut(cleanDni);
    if (result.success) {
      setFeedbackMessage({ type: 'success', text: result.message });
    } else {
      setFeedbackMessage({ type: 'error', text: result.message });
    }
  };

  // Export records to CSV
  const handleExportCSV = () => {
    if (clockRecords.length === 0) {
      alert('No existen registros para exportar.');
      return;
    }

    const headers = [
      'ID',
      'DNI',
      'Empleado',
      'Entrada',
      'Salida',
      'Horas Trabajadas',
      'Valor Hora',
      'Costo Total',
      'Estado',
      'Motivo Correccion',
    ];

    const rows = clockRecords.map((r) => [
      r.id,
      r.dni,
      `"${r.employeeName}"`,
      r.checkIn,
      r.checkOut || '',
      r.hoursWorked || 0,
      r.hourlyRate,
      r.totalCost || 0,
      r.state,
      `"${r.modificationReason || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `marcaciones_rrhh_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered records for admin view
  const filteredRecords = clockRecords.filter((r) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDni = r.dni.toLowerCase().includes(q);
      const matchName = r.employeeName.toLowerCase().includes(q);
      if (!matchDni && !matchName) return false;
    }

    if (selectedState !== 'todas' && r.state !== selectedState) {
      return false;
    }

    return true;
  });

  // Admin KPI calculations
  const openCount = clockRecords.filter((r) => r.state === 'Abierta').length;
  const closedCount = clockRecords.filter((r) => r.state === 'Cerrada' || r.state === 'Corregida').length;
  const totalHours = clockRecords
    .filter((r) => r.state !== 'Anulada')
    .reduce((sum, r) => sum + (r.hoursWorked || 0), 0);
  const totalCostSum = clockRecords
    .filter((r) => r.state !== 'Anulada')
    .reduce((sum, r) => sum + (r.totalCost || 0), 0);

  // Table Columns
  const columns: Column<ClockRecord>[] = [
    {
      key: 'employeeName',
      header: 'Empleado',
      sortable: true,
      render: (r) => (
        <div>
          <span className="font-extrabold text-slate-900 text-xs block">{r.employeeName}</span>
          <span className="font-mono text-[10px] text-slate-500">DNI: {r.dni}</span>
        </div>
      ),
    },
    {
      key: 'checkIn',
      header: 'Entrada',
      sortable: true,
      render: (r) => (
        <span className="font-mono text-xs font-bold text-slate-800">{r.checkIn}</span>
      ),
    },
    {
      key: 'checkOut',
      header: 'Salida',
      render: (r) => (
        <span className="font-mono text-xs font-bold text-slate-800">
          {r.checkOut ? r.checkOut : <span className="text-amber-600 font-normal italic">Pendiente</span>}
        </span>
      ),
    },
    {
      key: 'hoursWorked',
      header: 'Horas',
      align: 'center',
      render: (r) => (
        <div className="text-center font-mono font-bold text-xs text-slate-900">
          {r.hoursWorked !== undefined ? `${r.hoursWorked} hs` : '-'}
        </div>
      ),
    },
    {
      key: 'hourlyRate',
      header: 'Valor Hora',
      align: 'right',
      render: (r) => (
        <div className="text-right font-mono font-bold text-xs text-slate-700">
          $ {r.hourlyRate.toLocaleString('es-AR')}
        </div>
      ),
    },
    {
      key: 'totalCost',
      header: 'Costo Total',
      align: 'right',
      render: (r) => (
        <div className="text-right font-mono font-black text-xs text-slate-900">
          {r.totalCost !== undefined ? `$ ${r.totalCost.toLocaleString('es-AR')}` : '-'}
        </div>
      ),
    },
    {
      key: 'state',
      header: 'Estado',
      align: 'center',
      render: (r) => {
        const badges: Record<ClockState, { bg: string; text: string; border: string }> = {
          Abierta: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
          Cerrada: { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-300' },
          Corregida: { bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-300' },
          Anulada: { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300' },
        };
        const st = badges[r.state] || badges.Abierta;
        return (
          <div className="flex justify-center">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${st.bg} ${st.text} ${st.border}`}>
              {r.state}
            </span>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'center',
      render: (r) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => setEditingRecord(r)}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] rounded-xl transition shadow-xs"
            title="Corregir / Auditar Marcación"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
            <span>Corregir</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Section Header & View Mode Switcher */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-6 h-6 text-rose-600" />
            <span>Recursos Humanos — Marcación de Horas</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro de asistencia de personal, cálculo automático de jornadas y auditoría.
          </p>
        </div>

        {/* View Mode Toggle Switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('empleado')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition ${
              viewMode === 'empleado'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Vista Empleado (Operativa)</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('admin')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition ${
              viewMode === 'admin'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Vista Administrador (Control)</span>
          </button>
        </div>
      </div>

      {/* VISTA 1: VISTA EMPLEADO (OPERATIVA) */}
      {viewMode === 'empleado' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Clock Terminal Box */}
          <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-base">Terminal de Marcación Rápida</h3>
                <p className="text-xs text-slate-500">
                  Ingrese su DNI para registrar entrada o salida de su turno.
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold text-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Terminal Online</span>
              </span>
            </div>

            {/* DNI Input */}
            <div className="space-y-4">
              <div>
                <label className="font-extrabold text-slate-800 text-xs block mb-1">
                  Ingrese su DNI <span className="text-rose-600">*</span>:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={dniInput}
                    onChange={(e) => {
                      setDniInput(e.target.value);
                      setFeedbackMessage(null);
                    }}
                    placeholder="Ej.: 42893400"
                    className="w-full p-4 pl-12 bg-slate-50 border-2 border-slate-200 focus:border-rose-500 rounded-2xl text-lg font-mono font-black text-slate-900 focus:outline-none"
                  />
                  <Search className="w-6 h-6 text-slate-400 absolute left-4 top-4" />
                </div>
              </div>

              {/* Employee Lookup Result Card */}
              <div>
                <label className="font-extrabold text-slate-800 text-xs block mb-1">
                  Nombre y Apellido [AUTO]:
                </label>
                <input
                  type="text"
                  readOnly
                  value={matchedEmployee ? matchedEmployee.name : cleanDni ? 'Empleado no registrado' : ''}
                  className={`w-full p-3.5 rounded-xl text-sm font-extrabold font-sans border transition ${
                    matchedEmployee
                      ? 'bg-emerald-50/50 border-emerald-300 text-emerald-900'
                      : cleanDni
                      ? 'bg-rose-50/50 border-rose-300 text-rose-900'
                      : 'bg-slate-100 border-slate-200 text-slate-400'
                  }`}
                />
              </div>

              {/* Open Record Notice Banner */}
              {openRecordForEmployee && (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-center gap-3 text-amber-900">
                  <Clock className="w-6 h-6 text-amber-600 shrink-0" />
                  <div className="text-xs">
                    <span className="font-extrabold block">Marcación Abierta Detectada</span>
                    <span>
                      Entrada registrada el {openRecordForEmployee.checkIn}. Haga clic en <strong>SALIR</strong> para finalizar.
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons: ENTRAR vs SALIR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleClockIn}
                  disabled={Boolean(openRecordForEmployee) || !matchedEmployee}
                  className={`p-6 rounded-3xl flex flex-col items-center justify-center gap-2 font-black text-base transition shadow-lg ${
                    Boolean(openRecordForEmployee) || !matchedEmployee
                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95 shadow-emerald-600/30'
                  }`}
                >
                  <LogIn className="w-8 h-8" />
                  <span>ENTRAR</span>
                  <span className="text-xs font-normal opacity-80">Registrar Entrada</span>
                </button>

                <button
                  type="button"
                  onClick={handleClockOut}
                  disabled={!Boolean(openRecordForEmployee)}
                  className={`p-6 rounded-3xl flex flex-col items-center justify-center gap-2 font-black text-base transition shadow-lg ${
                    !Boolean(openRecordForEmployee)
                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95 shadow-indigo-600/30'
                  }`}
                >
                  <LogOut className="w-8 h-8" />
                  <span>SALIR</span>
                  <span className="text-xs font-normal opacity-80">Registrar Salida</span>
                </button>
              </div>

              {/* Feedback Message Alert */}
              {feedbackMessage && (
                <div
                  className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
                    feedbackMessage.type === 'success'
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                      : 'bg-rose-100 border-rose-300 text-rose-900'
                  }`}
                >
                  {feedbackMessage.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                  <span>{feedbackMessage.text}</span>
                </div>
              )}
            </div>
          </div>

          {/* Info Card Sidebar */}
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4 h-fit">
            <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Info className="w-4 h-4 text-rose-600" />
              <span>Información de la Terminal</span>
            </h4>

            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>No muestra valores de valor hora ni costos de jornada.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>No permite edición de marcaciones ni alteraciones de horario.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Interfaz simplificada y rápida para operación en salón o cocina.</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* VISTA 2: VISTA ADMINISTRADOR (CONTROL) */}
      {viewMode === 'admin' && (
        <div className="space-y-6">
          {/* KPI Dashboard Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
              <span className="text-xs text-emerald-700 font-bold uppercase tracking-wider block">
                Marcaciones Abiertas
              </span>
              <div className="text-2xl font-black text-emerald-700 mt-1">{openCount}</div>
              <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
                Personal actualmente trabajando
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-sky-200 bg-sky-50/20 shadow-2xs">
              <span className="text-xs text-sky-700 font-bold uppercase tracking-wider block">
                Marcaciones Cerradas
              </span>
              <div className="text-2xl font-black text-sky-900 mt-1">{closedCount}</div>
              <span className="text-[11px] text-sky-700 font-semibold mt-1 block">Jornadas completadas</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                Total Horas Registradas
              </span>
              <div className="text-2xl font-black text-slate-900 font-mono mt-1">
                {totalHours.toFixed(1)} hs
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">Horas acumuladas</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-2xs">
              <span className="text-xs text-rose-700 font-bold uppercase tracking-wider block">
                Costo Total Estimado
              </span>
              <div className="text-2xl font-black text-rose-900 font-mono mt-1">
                $ {totalCostSum.toLocaleString('es-AR')}
              </div>
              <span className="text-[11px] text-rose-700 font-semibold mt-1 block">
                Monto acumulado a liquidar
              </span>
            </div>
          </div>

          {/* Data Table */}
          <StandardDataTable
            title="Historial de Marcaciones & Auditoría"
            subtitle="Consulte, corrija y exporte los registros de asistencia."
            data={filteredRecords}
            columns={columns}
            keyExtractor={(r) => r.id}
            searchPlaceholder="Buscar por DNI o empleado..."
            searchFilterKey={(r) => `${r.dni} ${r.employeeName}`}
            headerActions={
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                {/* State Filter */}
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
                >
                  <option value="todas">Todos los estados</option>
                  <option value="Abierta">🟢 Abierta</option>
                  <option value="Cerrada">🔵 Cerrada</option>
                  <option value="Corregida">🟠 Corregida</option>
                  <option value="Anulada">🔴 Anulada</option>
                </select>

                {/* CSV Export Button */}
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-xs transition"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Exportar CSV</span>
                </button>
              </div>
            }
          />

          {/* Admin Info Banner */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-rose-600 shrink-0" />
              <span>
                Las marcaciones cerradas quedan disponibles automáticamente para el módulo de Liquidación de Sueldos.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modal Corrección Marcación */}
      {editingRecord && (
        <ClockCorrectionModal
          record={editingRecord}
          onClose={() => setEditingRecord(null)}
        />
      )}
    </div>
  );
};
