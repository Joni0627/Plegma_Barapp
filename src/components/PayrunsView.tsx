import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Payrun, PayrunEmployeeDetail, PayrunStatus, EmployeePayrunStatus } from '../types';
import { PayrunModal } from './PayrunModal';
import { PayrunReceiptModal } from './PayrunReceiptModal';
import { StandardDataTable, Column } from './ui/DataTable';
import {
  FileText,
  Plus,
  Search,
  Filter,
  ChevronRight,
  ArrowLeft,
  DollarSign,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Download,
  Printer,
  Ban,
  Clock,
  UserCheck,
} from 'lucide-react';

export const PayrunsView: React.FC = () => {
  const { payruns, voidPayrun, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [selectedPayrun, setSelectedPayrun] = useState<Payrun | null>(null);

  // Modals state
  const [isPayrunModalOpen, setIsPayrunModalOpen] = useState(false);
  const [viewingEmployeeReceipt, setViewingEmployeeReceipt] = useState<{
    payrun: Payrun;
    detail: PayrunEmployeeDetail;
  } | null>(null);

  // Active payrun (live synchronized state)
  const currentPayrun = selectedPayrun
    ? payruns.find((p) => p.id === selectedPayrun.id) || selectedPayrun
    : null;

  // Filtered Payruns for Main Table
  const filteredPayruns = payruns.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.periodName.toLowerCase().includes(q) ||
      p.startDate.includes(q) ||
      p.endDate.includes(q)
    );
  });

  // KPI Calculations across all payruns
  const grandTotalToPay = payruns.reduce((sum, p) => sum + (p.status !== 'Anulada' ? p.totalToPay : 0), 0);
  const grandTotalPaid = payruns.reduce((sum, p) => sum + (p.status !== 'Anulada' ? p.totalPaid : 0), 0);
  const grandTotalPending = payruns.reduce((sum, p) => sum + (p.status !== 'Anulada' ? p.totalPending : 0), 0);

  const handleVoidPayrun = (payrun: Payrun) => {
    if (confirm(`¿Está seguro de anular la liquidación ${payrun.periodName}?`)) {
      voidPayrun(payrun.id);
      showToast('Liquidación anulada exitosamente.', 'error');
    }
  };

  const handleExportExcel = () => {
    showToast('Exportando liquidaciones a formato Excel (.xlsx)...', 'info');
  };

  // Main Table Columns
  const payrunColumns: Column<Payrun>[] = [
    {
      key: 'startDate',
      header: 'Inicio',
      sortable: true,
      render: (p) => <span className="font-mono text-slate-800 font-bold">{p.startDate}</span>,
    },
    {
      key: 'endDate',
      header: 'Fin',
      sortable: true,
      render: (p) => <span className="font-mono text-slate-800 font-bold">{p.endDate}</span>,
    },
    {
      key: 'employeeCount',
      header: 'Empleados',
      sortable: true,
      align: 'center',
      render: (p) => (
        <span className="font-mono font-bold text-slate-700">{p.employeeCount}</span>
      ),
    },
    {
      key: 'totalToPay',
      header: 'Total a Liquidar',
      sortable: true,
      align: 'right',
      render: (p) => (
        <div className="text-right font-mono font-extrabold text-slate-900 text-xs">
          $ {p.totalToPay.toLocaleString('es-AR')}
        </div>
      ),
    },
    {
      key: 'totalPaid',
      header: 'Pagado',
      sortable: true,
      align: 'right',
      render: (p) => (
        <div className="text-right font-mono font-extrabold text-emerald-900 text-xs">
          $ {p.totalPaid.toLocaleString('es-AR')}
        </div>
      ),
    },
    {
      key: 'totalPending',
      header: 'Pendiente',
      sortable: true,
      align: 'right',
      render: (p) => (
        <div className="text-right font-mono font-extrabold text-amber-900 text-xs">
          $ {p.totalPending.toLocaleString('es-AR')}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      sortable: true,
      align: 'center',
      render: (p) => {
        const badgeClasses: Record<PayrunStatus, string> = {
          Liquidada: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          'En curso': 'bg-sky-100 text-sky-900 border-sky-300',
          Pendiente: 'bg-amber-100 text-amber-900 border-amber-300',
          Anulada: 'bg-rose-100 text-rose-900 border-rose-300',
        };
        return (
          <span
            className={`px-3 py-0.5 rounded-full text-[10px] font-black border ${
              badgeClasses[p.status]
            }`}
          >
            {p.status}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'center',
      render: (p) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => setSelectedPayrun(p)}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] rounded-xl transition shadow-xs"
          >
            <span>Ver Detalle</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-rose-600" />
            <span>Recursos Humanos — Liquidaciones de Sueldos</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Creación, procesamiento de nómina, recibos de sueldo y control financiero de haberes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-extrabold text-xs rounded-xl transition"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Exportar Excel</span>
          </button>

          <button
            onClick={() => setIsPayrunModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Liquidación</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards (Matching Image 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
            TOTAL A LIQUIDAR
          </span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            $ {grandTotalToPay.toLocaleString('es-AR')}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Bruto a pagar acumulado</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <span className="text-xs text-emerald-700 font-bold uppercase tracking-wider block">
            TOTAL PAGADO
          </span>
          <div className="text-2xl font-black text-emerald-900 font-mono mt-1">
            $ {grandTotalPaid.toLocaleString('es-AR')}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">Haberes efectivamente abonados</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-2xs">
          <span className="text-xs text-amber-700 font-bold uppercase tracking-wider block">
            TOTAL PENDIENTE
          </span>
          <div className="text-2xl font-black text-amber-900 font-mono mt-1">
            $ {grandTotalPending.toLocaleString('es-AR')}
          </div>
          <span className="text-[11px] text-amber-700 font-semibold mt-1 block">Sueldos pendientes de pago</span>
        </div>
      </div>

      {/* VISTA 1: LISTADO PRINCIPAL DE LIQUIDACIONES */}
      {!currentPayrun && (
        <div className="space-y-4">
          <StandardDataTable
            title="Listado de Liquidaciones"
            subtitle="Consulte el historial de liquidaciones de sueldo por período."
            data={filteredPayruns}
            columns={payrunColumns}
            keyExtractor={(p) => p.id}
            searchPlaceholder="Buscar liquidación por período o fecha..."
            searchFilterKey={(p) => `${p.periodName} ${p.startDate} ${p.endDate}`}
          />
        </div>
      )}

      {/* VISTA 2: DETALLE DE EMPLEADOS EN LA LIQUIDACIÓN */}
      {currentPayrun && (
        <div className="space-y-6">
          {/* Back Navigation & Payrun Header Banner */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedPayrun(null)}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-bold transition"
                title="Volver al listado de liquidaciones"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <span>Detalle de Liquidación: {currentPayrun.periodName}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                      currentPayrun.status === 'Liquidada'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : currentPayrun.status === 'En curso'
                        ? 'bg-sky-100 text-sky-900 border-sky-300'
                        : 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}
                  >
                    {currentPayrun.status}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Rango: {currentPayrun.startDate} a {currentPayrun.endDate} • {currentPayrun.employeeCount} Empleados en nómina
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleVoidPayrun(currentPayrun)}
                disabled={currentPayrun.status === 'Anulada'}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs rounded-xl border border-rose-200 transition disabled:opacity-50"
              >
                <Ban className="w-4 h-4" />
                <span>Anular Liquidación</span>
              </button>

              <button
                onClick={() => setSelectedPayrun(null)}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition"
              >
                <span>Volver al Listado</span>
              </button>
            </div>
          </div>

          {/* Table 4: DETALLE DE EMPLEADOS EN LA LIQUIDACIÓN */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
            <h4 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Nómina de Empleados y Cómputo de Sueldos</span>
              <span className="text-xs font-mono font-bold text-slate-500">
                {currentPayrun.employeesDetails.length} empleados registrados
              </span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-3">Empleado</th>
                    <th className="p-3 text-center">Hs Totales</th>
                    <th className="p-3 text-right">Total a Pagar</th>
                    <th className="p-3 text-right">Pagado</th>
                    <th className="p-3 text-right">Pendiente</th>
                    <th className="p-3 text-center">Estado</th>
                    <th className="p-3 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentPayrun.employeesDetails.map((emp) => {
                    const statusBadge: Record<EmployeePayrunStatus, string> = {
                      Pagado: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                      Pendiente: 'bg-amber-100 text-amber-900 border-amber-300',
                      'En proceso': 'bg-sky-100 text-sky-900 border-sky-300',
                    };
                    return (
                      <tr key={emp.employeeId} className="hover:bg-slate-50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-600 font-bold">✔</span>
                            <div>
                              <span className="font-extrabold text-slate-900 block">{emp.employeeName}</span>
                              <span className="text-[10px] text-slate-500 font-mono">{emp.position}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-slate-800">
                          {emp.hoursWorkedStr}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900">
                          $ {emp.netAmount.toLocaleString('es-AR')}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-900">
                          $ {emp.paidAmount.toLocaleString('es-AR')}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-amber-900">
                          $ {emp.pendingAmount.toLocaleString('es-AR')}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                              statusBadge[emp.status]
                            }`}
                          >
                            {emp.status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() =>
                              setViewingEmployeeReceipt({
                                payrun: currentPayrun,
                                detail: emp,
                              })
                            }
                            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 font-extrabold text-[11px] rounded-xl transition shadow-2xs ${
                              emp.status === 'Pagado'
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                                : 'bg-slate-900 hover:bg-slate-800 text-white'
                            }`}
                          >
                            {emp.status === 'Pagado' ? (
                              <>
                                <Printer className="w-3.5 h-3.5 text-rose-600" />
                                <span>Reimprimir Recibo</span>
                              </>
                            ) : (
                              <span>Ver Recibo / Pagar</span>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

                {/* TOTALES ROW (Light Clean Theme) */}
                <tfoot>
                  <tr className="bg-slate-100 text-slate-900 font-black text-xs border-t-2 border-slate-300">
                    <td className="p-3 uppercase font-black text-slate-900">TOTALES</td>
                    <td className="p-3 text-center font-mono text-slate-500">—</td>
                    <td className="p-3 text-right font-mono text-slate-900">
                      $ {currentPayrun.totalToPay.toLocaleString('es-AR')}
                    </td>
                    <td className="p-3 text-right font-mono text-emerald-800">
                      $ {currentPayrun.totalPaid.toLocaleString('es-AR')}
                    </td>
                    <td className="p-3 text-right font-mono text-amber-800">
                      $ {currentPayrun.totalPending.toLocaleString('es-AR')}
                    </td>
                    <td colSpan={2} className="p-3"></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Legend Footer Badges */}
            <div className="pt-2 flex items-center gap-4 text-xs font-bold text-slate-600 border-t border-slate-100">
              <span className="flex items-center gap-1 text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Pagado
              </span>
              <span className="flex items-center gap-1 text-amber-700">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Pendiente
              </span>
              <span className="flex items-center gap-1 text-sky-700">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> En proceso
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nueva Liquidación */}
      {isPayrunModalOpen && <PayrunModal onClose={() => setIsPayrunModalOpen(false)} />}

      {/* Modal Recibo de Sueldo de Empleado */}
      {viewingEmployeeReceipt && (
        <PayrunReceiptModal
          payrun={viewingEmployeeReceipt.payrun}
          employeeDetail={viewingEmployeeReceipt.detail}
          onClose={() => setViewingEmployeeReceipt(null)}
        />
      )}
    </div>
  );
};
