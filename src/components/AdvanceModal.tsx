import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EmployeeAdvance, AdvanceInstallment, Employee } from '../types';
import { X, CreditCard, DollarSign, Calendar, Save, Plus, Minus, Calculator } from 'lucide-react';

interface AdvanceModalProps {
  advanceToEdit?: EmployeeAdvance | null;
  initialEmployee?: Employee | null;
  onClose: () => void;
}

const FUTURE_LIQUIDATIONS = [
  'Julio/2026',
  'Agosto/2026',
  'Septiembre/2026',
  'Octubre/2026',
  'Noviembre/2026',
  'Diciembre/2026',
  'Enero/2027',
  'Febrero/2027',
];

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const getNextPeriod = (currentPeriod: string, monthsToAdd: number): string => {
  const [monthName, yearStr] = currentPeriod.split('/');
  let year = parseInt(yearStr, 10);
  let monthIdx = MONTH_NAMES.indexOf(monthName);
  if (monthIdx === -1) monthIdx = 6; // default July

  monthIdx += monthsToAdd;
  while (monthIdx >= 12) {
    monthIdx -= 12;
    year += 1;
  }
  return `${MONTH_NAMES[monthIdx]}/${year}`;
};

export const AdvanceModal: React.FC<AdvanceModalProps> = ({
  advanceToEdit,
  initialEmployee,
  onClose,
}) => {
  const { employees, addOrUpdateAdvance, showToast } = useApp();

  const activeEmployees = employees.filter((e) => e.active);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(
    advanceToEdit?.employeeId || initialEmployee?.id || activeEmployees[0]?.id || ''
  );

  const [amount, setAmount] = useState<number>(advanceToEdit?.amount || 42500);
  const [detail, setDetail] = useState<string>(advanceToEdit?.detail || '');
  const [paymentMethod, setPaymentMethod] = useState<string>(advanceToEdit?.paymentMethod || 'Mercado Pago');
  const [cashRegister, setCashRegister] = useState<string>(advanceToEdit?.cashRegister || 'MERCADO PAGO');
  const [liquidationStartPeriod, setLiquidationStartPeriod] = useState<string>(
    advanceToEdit?.liquidationStartPeriod || 'Julio/2026'
  );
  const [isInstallments, setIsInstallments] = useState<boolean>(
    advanceToEdit?.isInstallments !== undefined ? advanceToEdit.isInstallments : true
  );
  const [installmentsCount, setInstallmentsCount] = useState<number>(advanceToEdit?.installmentsCount || 3);

  // Calculated values
  const actualInstallmentsCount = isInstallments ? Math.max(1, installmentsCount) : 1;
  const installmentAmount = amount > 0 ? Number((amount / actualInstallmentsCount).toFixed(2)) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEmployeeId) {
      showToast('Debe seleccionar un empleado obligatoriamente.', 'error');
      return;
    }

    if (amount <= 0) {
      showToast('El monto del adelanto debe ser mayor a cero.', 'error');
      return;
    }

    const emp = employees.find((e) => e.id === selectedEmployeeId);
    if (!emp) {
      showToast('Empleado no encontrado.', 'error');
      return;
    }

    // Generate installments array
    const generatedInstallments: AdvanceInstallment[] = [];
    for (let i = 0; i < actualInstallmentsCount; i++) {
      const period = getNextPeriod(liquidationStartPeriod, i);
      generatedInstallments.push({
        installmentNumber: i + 1,
        amount: installmentAmount,
        liquidationPeriod: period,
        status: 'Pendiente',
      });
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const advRecord: EmployeeAdvance = {
      id: advanceToEdit?.id || 'adv-' + Date.now(),
      employeeId: emp.id,
      employeeName: emp.name,
      dni: emp.dni,
      date: advanceToEdit?.date || nowStr,
      amount,
      detail: detail.trim(),
      paymentMethod,
      cashRegister,
      liquidationStartPeriod,
      isInstallments,
      installmentsCount: actualInstallmentsCount,
      installmentAmount,
      pendingBalance: amount,
      status: 'En descuento',
      installments: generatedInstallments,
      createdUser: 'ADMINISTRADOR',
    };

    addOrUpdateAdvance(advRecord);
    showToast(advanceToEdit ? 'Adelanto actualizado exitosamente.' : 'Nuevo adelanto registrado exitosamente.', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-md">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">
                {advanceToEdit ? 'Editar Adelanto de Sueldo' : 'Registrar Nuevo Adelanto de Sueldo'}
              </h3>
              <p className="text-xs text-slate-400">
                Formulario de carga de vales y adelantos descontables en liquidaciones.
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
          {/* Scrollable Body without visible scrollbar */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-5 sm:p-6 space-y-5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Empleado */}
            <div>
              <label className="font-extrabold text-slate-800 block mb-1">
                Empleado <span className="text-rose-600">*</span>:
              </label>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold cursor-pointer"
              >
                {activeEmployees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} (DNI: {e.dni})
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo */}
            <div>
              <label className="font-extrabold text-slate-800 block mb-1">Tipo de Movimiento:</label>
              <input
                type="text"
                readOnly
                value="Adelanto de Sueldo"
                className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-600"
              />
            </div>

            {/* Monto */}
            <div>
              <label className="font-extrabold text-slate-800 block mb-1">
                Monto del Adelanto ($) <span className="text-rose-600">*</span>:
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setAmount((prev) => Math.max(0, prev - 1000))}
                  className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-bold"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <input
                  type="number"
                  min="1"
                  step="500"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-black font-mono text-slate-900 focus:ring-2 focus:ring-rose-500 text-center"
                />

                <button
                  type="button"
                  onClick={() => setAmount((prev) => prev + 1000)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-bold"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Liquidación Inicio Descuento */}
            <div>
              <label className="font-extrabold text-slate-800 block mb-1">
                Liquidación Inicio Descuento <span className="text-rose-600">*</span>:
              </label>
              <select
                value={liquidationStartPeriod}
                onChange={(e) => setLiquidationStartPeriod(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold cursor-pointer font-mono"
              >
                {FUTURE_LIQUIDATIONS.map((period) => (
                  <option key={period} value={period}>
                    {period}
                  </option>
                ))}
              </select>
            </div>

            {/* Medio de Pago */}
            <div>
              <label className="font-extrabold text-slate-800 block mb-1">Medio de Pago:</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold cursor-pointer"
              >
                <option value="Mercado Pago">Mercado Pago</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                <option value="Naranja X">Naranja X</option>
              </select>
            </div>

            {/* Caja */}
            <div>
              <label className="font-extrabold text-slate-800 block mb-1">Caja de Salida:</label>
              <select
                value={cashRegister}
                onChange={(e) => setCashRegister(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold cursor-pointer"
              >
                <option value="MERCADO PAGO">MERCADO PAGO</option>
                <option value="CAJA CENTRAL">CAJA CENTRAL</option>
                <option value="CAJA CHICA">CAJA CHICA</option>
              </select>
            </div>
          </div>

          {/* Detalle */}
          <div>
            <label className="font-extrabold text-slate-800 block mb-1">Detalle / Motivo del Adelanto:</label>
            <textarea
              rows={2}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Ej.: Adelanto para medicamentos o gastos personales."
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Descuento en Cuotas Group */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 text-xs">Descuento en Cuotas:</span>
              <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsInstallments(false)}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                    !isInstallments ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-500'
                  }`}
                >
                  NO (1 pago)
                </button>
                <button
                  type="button"
                  onClick={() => setIsInstallments(true)}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                    isInstallments ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-500'
                  }`}
                >
                  SÍ (En cuotas)
                </button>
              </div>
            </div>

            {isInstallments && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Cantidad de Cuotas (*):</label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setInstallmentsCount((prev) => Math.max(1, prev - 1))}
                      className="p-2 bg-white hover:bg-slate-100 rounded-xl text-slate-700 font-bold border border-slate-200"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <input
                      type="number"
                      min="1"
                      max="24"
                      required
                      value={installmentsCount}
                      onChange={(e) => setInstallmentsCount(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-center font-bold text-sm font-mono"
                    />

                    <button
                      type="button"
                      onClick={() => setInstallmentsCount((prev) => prev + 1)}
                      className="p-2 bg-white hover:bg-slate-100 rounded-xl text-slate-700 font-bold border border-slate-200"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Auto Calculated Installment Box */}
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-center">
                  <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                    Monto por Cuota (Calculado)
                  </span>
                  <span className="text-base font-black font-mono text-rose-900 mt-0.5 block">
                    $ {installmentAmount.toLocaleString('es-AR')}
                  </span>
                </div>
              </div>
            )}
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
              <span>Guardar Adelanto</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
