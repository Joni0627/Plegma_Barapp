import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  EmployeeAdvance,
  EmployeeConsumption,
  AdvanceInstallment,
  Employee,
  AdvanceStatus,
} from '../types';
import { AdvanceModal } from './AdvanceModal';
import { StandardDataTable, Column } from './ui/DataTable';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  ChevronRight,
  ArrowLeft,
  DollarSign,
  ShoppingCart,
  Calendar,
  Eye,
  Edit,
  Trash2,
  X,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  Ban,
} from 'lucide-react';

interface SummaryRow {
  employee: Employee;
  totalAdvancesPending: number;
  totalConsumptionsPending: number;
  totalPendingToDeduct: number;
}

export const AdvancesConsumptionsView: React.FC = () => {
  const {
    employees,
    employeeAdvances,
    employeeConsumptions,
    voidAdvance,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState<'adelantos' | 'consumos'>('adelantos');

  // Modals state
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [editingAdvance, setEditingAdvance] = useState<EmployeeAdvance | null>(null);
  const [viewingInstallmentsAdvance, setViewingInstallmentsAdvance] = useState<EmployeeAdvance | null>(null);

  // Group summary per employee
  const summaryRows: SummaryRow[] = employees.map((emp) => {
    const empAdvances = employeeAdvances.filter(
      (a) => a.employeeId === emp.id && a.status !== 'Anulado'
    );
    const totalAdvPending = empAdvances.reduce((sum, a) => sum + (a.pendingBalance || 0), 0);

    const empConsumptions = employeeConsumptions.filter(
      (c) => c.employeeId === emp.id && c.status === 'Pendiente'
    );
    const totalCsmPending = empConsumptions.reduce((sum, c) => sum + (c.amount || 0), 0);

    return {
      employee: emp,
      totalAdvancesPending: totalAdvPending,
      totalConsumptionsPending: totalCsmPending,
      totalPendingToDeduct: totalAdvPending + totalCsmPending,
    };
  });

  const filteredSummaryRows = summaryRows.filter((row) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      row.employee.name.toLowerCase().includes(q) ||
      row.employee.dni.toLowerCase().includes(q)
    );
  });

  // KPI Calculations
  const grandTotalAdvPending = summaryRows.reduce((sum, r) => sum + r.totalAdvancesPending, 0);
  const grandTotalCsmPending = summaryRows.reduce((sum, r) => sum + r.totalConsumptionsPending, 0);
  const grandTotalPending = grandTotalAdvPending + grandTotalCsmPending;
  const employeesWithPending = summaryRows.filter((r) => r.totalPendingToDeduct > 0).length;

  const handleOpenNewAdvance = (emp?: Employee) => {
    setEditingAdvance(null);
    if (emp) setSelectedEmployee(emp);
    setIsAdvanceModalOpen(true);
  };

  const handleEditAdvance = (adv: EmployeeAdvance) => {
    if (adv.status === 'Descontado') {
      showToast('No se pueden modificar adelantos que ya fueron totalmente descontados en liquidación.', 'warning');
      return;
    }
    setEditingAdvance(adv);
    setIsAdvanceModalOpen(true);
  };

  const handleVoidAdvance = (adv: EmployeeAdvance) => {
    if (adv.status === 'Descontado') {
      showToast('No se pueden anular adelantos que ya fueron totalmente descontados en liquidación.', 'warning');
      return;
    }
    if (confirm(`¿Está seguro de anular el adelanto de $${adv.amount.toLocaleString('es-AR')}?`)) {
      voidAdvance(adv.id);
      showToast('Adelanto anulado exitosamente.', 'error');
    }
  };

  // Selected Employee records
  const selectedEmployeeAdvances = selectedEmployee
    ? employeeAdvances.filter((a) => a.employeeId === selectedEmployee.id)
    : [];

  const selectedEmployeeConsumptions = selectedEmployee
    ? employeeConsumptions.filter((c) => c.employeeId === selectedEmployee.id)
    : [];

  // Table Columns for Main Summary
  const summaryColumns: Column<SummaryRow>[] = [
    {
      key: 'employee',
      header: 'Empleado',
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
            {r.employee.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <span className="font-extrabold text-slate-900 text-xs block">{r.employee.name}</span>
            <span className="font-mono text-[10px] text-slate-500">DNI: {r.employee.dni} • {r.employee.position}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'totalAdvancesPending',
      header: 'Total Adelantos Pendientes',
      sortable: true,
      align: 'right',
      render: (r) => (
        <div className="text-right font-mono font-extrabold text-xs text-slate-800">
          $ {r.totalAdvancesPending.toLocaleString('es-AR')}
        </div>
      ),
    },
    {
      key: 'totalConsumptionsPending',
      header: 'Total Consumos Pendientes',
      sortable: true,
      align: 'right',
      render: (r) => (
        <div className="text-right font-mono font-extrabold text-xs text-slate-800">
          $ {r.totalConsumptionsPending.toLocaleString('es-AR')}
        </div>
      ),
    },
    {
      key: 'totalPendingToDeduct',
      header: 'Total Pendiente a Descontar',
      sortable: true,
      align: 'right',
      render: (r) => (
        <div className="text-right font-mono font-black text-xs text-rose-900">
          $ {r.totalPendingToDeduct.toLocaleString('es-AR')}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'center',
      render: (r) => (
        <div className="flex items-center justify-center">
          <button
            onClick={() => setSelectedEmployee(r.employee)}
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
            <CreditCard className="w-6 h-6 text-rose-600" />
            <span>Recursos Humanos — Adelantos & Consumos</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestión de vales de sueldo, cuotas pendientes y consumos de personal a descontar en liquidaciones.
          </p>
        </div>

        <button
          onClick={() => handleOpenNewAdvance(selectedEmployee || undefined)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Adelanto</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-2xs">
          <span className="text-xs text-rose-700 font-bold uppercase tracking-wider block">
            Adelantos Pendientes
          </span>
          <div className="text-2xl font-black text-rose-900 font-mono mt-1">
            $ {grandTotalAdvPending.toLocaleString('es-AR')}
          </div>
          <span className="text-[11px] text-rose-700 font-semibold mt-1 block">Vales en cartera</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-2xs">
          <span className="text-xs text-amber-700 font-bold uppercase tracking-wider block">
            Consumos Pendientes
          </span>
          <div className="text-2xl font-black text-amber-900 font-mono mt-1">
            $ {grandTotalCsmPending.toLocaleString('es-AR')}
          </div>
          <span className="text-[11px] text-amber-700 font-semibold mt-1 block">Ventas a descontar</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
            Total Pendiente General
          </span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            $ {grandTotalPending.toLocaleString('es-AR')}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Suma a descontar</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-indigo-200 bg-indigo-50/20 shadow-2xs">
          <span className="text-xs text-indigo-700 font-bold uppercase tracking-wider block">
            Empleados con Deuda
          </span>
          <div className="text-2xl font-black text-indigo-900 mt-1">{employeesWithPending}</div>
          <span className="text-[11px] text-indigo-700 font-semibold mt-1 block">Con saldos pendientes</span>
        </div>
      </div>

      {/* VISTA 1: RESUMEN POR EMPLEADO */}
      {!selectedEmployee && (
        <StandardDataTable
          title="Vista Principal — Resumen por Empleado"
          subtitle="Consulte el acumulado de vales, consumos y saldos pendientes."
          data={filteredSummaryRows}
          columns={summaryColumns}
          keyExtractor={(r) => r.employee.id}
          searchPlaceholder="Buscar empleado por nombre o DNI..."
          searchFilterKey={(r) => `${r.employee.name} ${r.employee.dni}`}
        />
      )}

      {/* VISTA 2: DETALLE INDIVIDUAL DE UN EMPLEADO */}
      {selectedEmployee && (
        <div className="space-y-6">
          {/* Back Navigation & Employee Header Banner */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedEmployee(null)}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-bold transition"
                title="Volver a la vista principal"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <span>Detalle de Movimientos: {selectedEmployee.name}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  DNI: {selectedEmployee.dni} • Puesto: {selectedEmployee.position}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleOpenNewAdvance(selectedEmployee)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Adelanto para {selectedEmployee.name.split(' ')[0]}</span>
            </button>
          </div>

          {/* Sub-Tabs: Adelantos vs Consumos */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
            <div className="flex items-center border-b border-slate-200 pb-3 gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('adelantos')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition ${
                  activeTab === 'adelantos'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200 font-black'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-4 h-4 text-rose-600" />
                <span>Adelantos de Sueldo ({selectedEmployeeAdvances.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('consumos')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition ${
                  activeTab === 'consumos'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200 font-black'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ShoppingCart className="w-4 h-4 text-rose-600" />
                <span>Consumos de Empleado ({selectedEmployeeConsumptions.length})</span>
              </button>
            </div>

            {/* TAB ADELANTOS */}
            {activeTab === 'adelantos' && (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <th className="p-3">Fecha Hora</th>
                        <th className="p-3 text-right">Monto Total</th>
                        <th className="p-3 text-center">Cuotas</th>
                        <th className="p-3 text-right">Saldo Pendiente</th>
                        <th className="p-3 text-center">Estado</th>
                        <th className="p-3 text-center">Liquidación Inicio</th>
                        <th className="p-3 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedEmployeeAdvances.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-6 text-center text-slate-400">
                            No existen adelantos registrados para este empleado.
                          </td>
                        </tr>
                      ) : (
                        selectedEmployeeAdvances.map((adv) => {
                          const statusBadges: Record<AdvanceStatus, string> = {
                            Pendiente: 'bg-amber-100 text-amber-900 border-amber-300',
                            'En descuento': 'bg-sky-100 text-sky-900 border-sky-300',
                            Descontado: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                            Anulado: 'bg-rose-100 text-rose-900 border-rose-300',
                          };
                          return (
                            <tr key={adv.id} className="hover:bg-slate-50">
                              <td className="p-3 font-mono text-slate-600">{adv.date}</td>
                              <td className="p-3 text-right font-mono font-bold text-slate-900">
                                $ {adv.amount.toLocaleString('es-AR')}
                              </td>
                              <td className="p-3 text-center font-mono font-bold text-slate-700">
                                {adv.installmentsCount}
                              </td>
                              <td className="p-3 text-right font-mono font-bold text-rose-900">
                                $ {adv.pendingBalance.toLocaleString('es-AR')}
                              </td>
                              <td className="p-3 text-center">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                                    statusBadges[adv.status]
                                  }`}
                                >
                                  {adv.status}
                                </span>
                              </td>
                              <td className="p-3 text-center font-mono font-bold text-slate-700">
                                {adv.liquidationStartPeriod}
                              </td>
                              <td className="p-3 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => setViewingInstallmentsAdvance(adv)}
                                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                                    title="Ver Cuotas"
                                  >
                                    <Layers className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => handleEditAdvance(adv)}
                                    disabled={adv.status === 'Descontado'}
                                    className={`p-1.5 rounded-lg transition ${
                                      adv.status === 'Descontado'
                                        ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                    }`}
                                    title="Editar Adelanto"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => handleVoidAdvance(adv)}
                                    disabled={adv.status === 'Descontado' || adv.status === 'Anulado'}
                                    className={`p-1.5 rounded-lg transition ${
                                      adv.status === 'Descontado' || adv.status === 'Anulado'
                                        ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                        : 'bg-rose-50 hover:bg-rose-100 text-rose-600'
                                    }`}
                                    title="Anular Adelanto"
                                  >
                                    <Ban className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONSUMOS (SOLO CONSULTA) */}
            {activeTab === 'consumos' && (
              <div className="space-y-4">
                {/* Info banner for consumptions */}
                <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl flex items-center gap-3 text-sky-900 text-xs">
                  <ShoppingCart className="w-5 h-5 text-sky-600 shrink-0" />
                  <div>
                    <span className="font-extrabold block">Consumos de Empleado (Solo Consulta)</span>
                    <span>
                      Los consumos se generan automáticamente desde Pedidos/Ventas cuando se usa el pago <strong>Consumo de Empleado</strong>. Aquí solo se consultan, no se cargan manualmente.
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <th className="p-3">Fecha Hora</th>
                        <th className="p-3 text-center">Pedido #</th>
                        <th className="p-3 text-right">Monto</th>
                        <th className="p-3">Detalle</th>
                        <th className="p-3 text-center">Liquidación</th>
                        <th className="p-3 text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedEmployeeConsumptions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-slate-400">
                            No existen consumos registrados para este empleado.
                          </td>
                        </tr>
                      ) : (
                        selectedEmployeeConsumptions.map((csm) => (
                          <tr key={csm.id} className="hover:bg-slate-50">
                            <td className="p-3 font-mono text-slate-600">{csm.date}</td>
                            <td className="p-3 text-center font-mono font-bold text-slate-900">{csm.orderNumber}</td>
                            <td className="p-3 text-right font-mono font-bold text-slate-900">
                              $ {csm.amount.toLocaleString('es-AR')}
                            </td>
                            <td className="p-3 text-slate-700">{csm.detail}</td>
                            <td className="p-3 text-center font-mono font-bold text-slate-600">
                              {csm.liquidationPeriod || 'Pendiente'}
                            </td>
                            <td className="p-3 text-center">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                                  csm.status === 'Aplicado'
                                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                    : 'bg-amber-100 text-amber-900 border-amber-300'
                                }`}
                              >
                                {csm.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Nuevo / Editar Adelanto */}
      {isAdvanceModalOpen && (
        <AdvanceModal
          advanceToEdit={editingAdvance}
          initialEmployee={selectedEmployee}
          onClose={() => setIsAdvanceModalOpen(false)}
        />
      )}

      {/* Modal Ver Cuotas de Adelanto */}
      {viewingInstallmentsAdvance && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-md">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-tight">Desglose de Cuotas de Adelanto</h3>
                  <p className="text-xs text-slate-400">
                    Adelanto de ${viewingInstallmentsAdvance.amount.toLocaleString('es-AR')} en {viewingInstallmentsAdvance.installmentsCount} cuotas desde {viewingInstallmentsAdvance.liquidationStartPeriod}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewingInstallmentsAdvance(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-5 sm:p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-slate-900 text-sm block">{viewingInstallmentsAdvance.employeeName}</span>
                  <span className="font-mono text-slate-500 text-xs">DNI: {viewingInstallmentsAdvance.dni}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Saldo Pendiente</span>
                  <span className="font-mono font-black text-rose-900 text-xs">
                    $ {viewingInstallmentsAdvance.pendingBalance.toLocaleString('es-AR')}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="p-3 text-center">N° Cuota</th>
                      <th className="p-3 text-right">Monto Cuota</th>
                      <th className="p-3 text-center">Liquidación Asociada</th>
                      <th className="p-3 text-center">Estado</th>
                      <th className="p-3 text-center">Aplicado en</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {viewingInstallmentsAdvance.installments.map((inst) => (
                      <tr key={inst.installmentNumber} className="hover:bg-slate-50">
                        <td className="p-3 text-center font-mono font-bold text-slate-900">
                          {inst.installmentNumber} / {viewingInstallmentsAdvance.installmentsCount}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900">
                          $ {inst.amount.toLocaleString('es-AR')}
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-slate-700">
                          {inst.liquidationPeriod}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                              inst.status === 'Aplicado'
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                : 'bg-amber-100 text-amber-900 border-amber-300'
                            }`}
                          >
                            {inst.status}
                          </span>
                        </td>
                        <td className="p-3 text-center font-mono text-slate-600">
                          {inst.appliedIn || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-rose-50/50 border border-rose-200 rounded-2xl flex items-start gap-2 text-rose-900 text-xs">
                <Info className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  Las cuotas se asignan automáticamente a las liquidaciones posteriores según la cantidad de cuotas y el inicio seleccionado. El descuento se aplicará en cada liquidación hasta completar el total.
                </span>
              </div>
            </div>

            <div className="bg-slate-900 p-4 border-t border-slate-800 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setViewingInstallmentsAdvance(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
