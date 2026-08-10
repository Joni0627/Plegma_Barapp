import { MasterCashBox, CashShift, CashLine, CashMovement } from '../types';

// -----------------------------------------------
// CAJAS MAESTRAS (Permanentes - "Siempre Abierta")
// -----------------------------------------------
export const INITIAL_MASTER_CASH_BOXES: MasterCashBox[] = [
  {
    id: 'mb-001',
    name: 'Caja Fuerte Principal (Efectivo)',
    boxType: 'Efectivo',
    status: 'Siempre Abierta',
    currentBalance: 450000,
  },
  {
    id: 'mb-002',
    name: 'Cuenta Mercado Pago Empresa',
    boxType: 'Mercado Pago 1',
    status: 'Siempre Abierta',
    currentBalance: 1250000,
  },
  {
    id: 'mb-003',
    name: 'Banco Galicia Cta Cte',
    boxType: 'Transferencia Bancaria',
    status: 'Siempre Abierta',
    currentBalance: 890000,
  },
];

// -----------------------------------------------
// CAJA DE TURNO INICIAL (Abierta)
// -----------------------------------------------
export const INITIAL_CASH_SHIFTS: CashShift[] = [
  {
    id: 'shift-001',
    shift: 'Mañana',
    createdAt: '2026-08-10 08:00:00',
    name: 'MAÑANA 10/08/2026',
    status: 'Abierta',
    openedByUserId: 'usr-1',
    openedByUserName: 'Admin General',
    notes: 'Turno mañana apertura normal de salón y barra.',
  },
];

// -----------------------------------------------
// LÍNEAS DE CAJA INICIALES
// -----------------------------------------------
export const INITIAL_CASH_LINES: CashLine[] = [
  {
    id: 'line-001',
    shiftId: 'shift-001',
    boxType: 'Efectivo',
    initialAmount: 15000,
    ticketsTotal: 48500,
    expensesTotal: 5000,
    withdrawalsTotal: 20000,
    theoreticalAmount: 38500, // 15000 + 48500 - 5000 - 20000 = 38500
    status: 'Abierta',
  },
  {
    id: 'line-002',
    shiftId: 'shift-001',
    boxType: 'Mercado Pago 1',
    initialAmount: 0,
    ticketsTotal: 62300,
    expensesTotal: 0,
    withdrawalsTotal: 0,
    theoreticalAmount: 62300,
    status: 'Abierta',
  },
  {
    id: 'line-003',
    shiftId: 'shift-001',
    boxType: 'Cuenta Corriente',
    initialAmount: 0,
    ticketsTotal: 18000,
    expensesTotal: 0,
    withdrawalsTotal: 0,
    theoreticalAmount: 18000,
    status: 'Abierta',
  },
];

// -----------------------------------------------
// MOVIMIENTOS DE LÍNEAS DE CAJA INICIALES
// -----------------------------------------------
export const INITIAL_CASH_MOVEMENTS: CashMovement[] = [
  // Line 1: Efectivo
  {
    id: 'cm-001',
    lineId: 'line-001',
    shiftId: 'shift-001',
    dateTime: '2026-08-10 08:00:00',
    type: 'Apertura',
    origin: 'Saldo Inicial',
    amount: 15000,
    userId: 'usr-1',
    userName: 'Admin General',
    notes: 'Cambio inicial de caja chica',
  },
  {
    id: 'cm-002',
    lineId: 'line-001',
    shiftId: 'shift-001',
    dateTime: '2026-08-10 09:30:15',
    type: 'Ticket',
    origin: 'Ticket TKT-00101',
    voucherNumber: 'TKT-00101',
    amount: 18500,
    userId: 'usr-1',
    userName: 'Admin General',
    notes: 'Cobro Mesa 4 - Almuerzo ejecutivo',
  },
  {
    id: 'cm-003',
    lineId: 'line-001',
    shiftId: 'shift-001',
    dateTime: '2026-08-10 10:15:20',
    type: 'Gasto',
    origin: 'Compra Insumo Limpieza',
    voucherNumber: 'FAC-00892',
    amount: -5000,
    userId: 'usr-1',
    userName: 'Admin General',
    notes: 'Pago a proveedor minorista de limpieza',
  },
  {
    id: 'cm-004',
    lineId: 'line-001',
    shiftId: 'shift-001',
    dateTime: '2026-08-10 11:20:45',
    type: 'Ticket',
    origin: 'Ticket TKT-00102',
    voucherNumber: 'TKT-00102',
    amount: 30000,
    userId: 'usr-1',
    userName: 'Admin General',
    notes: 'Cobro Mesa 2 - Menú corporativo',
  },
  {
    id: 'cm-005',
    lineId: 'line-001',
    shiftId: 'shift-001',
    dateTime: '2026-08-10 12:45:00',
    type: 'Retiro',
    origin: 'Retiro a Caja Fuerte Principal',
    voucherNumber: 'RET-00001',
    amount: -20000,
    userId: 'usr-1',
    userName: 'Admin General',
    notes: 'Retiro parcial de resguardo de efectivo',
  },
  // Line 2: Mercado Pago 1
  {
    id: 'cm-006',
    lineId: 'line-002',
    shiftId: 'shift-001',
    dateTime: '2026-08-10 10:05:00',
    type: 'Ticket',
    origin: 'Ticket TKT-00103',
    voucherNumber: 'TKT-00103',
    amount: 27300,
    userId: 'usr-1',
    userName: 'Admin General',
    notes: 'Cobro QR Mercado Pago Mesa 5',
  },
  {
    id: 'cm-007',
    lineId: 'line-002',
    shiftId: 'shift-001',
    dateTime: '2026-08-10 12:10:30',
    type: 'Ticket',
    origin: 'Ticket TKT-00104',
    voucherNumber: 'TKT-00104',
    amount: 35000,
    userId: 'usr-1',
    userName: 'Admin General',
    notes: 'Cobro QR Mercado Pago Mesa 8',
  },
  // Line 3: Cuenta Corriente
  {
    id: 'cm-008',
    lineId: 'line-003',
    shiftId: 'shift-001',
    dateTime: '2026-08-10 11:00:00',
    type: 'Ticket',
    origin: 'Ticket TKT-00105',
    voucherNumber: 'TKT-00105',
    amount: 18000,
    userId: 'usr-1',
    userName: 'Admin General',
    notes: 'Imputación a Cuenta Corriente - Restaurante El Mirador SRL',
  },
];
