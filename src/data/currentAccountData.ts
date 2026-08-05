import { CurrentAccountMovement, Receipt, Client } from '../types';

// -----------------------------------------------
// CLIENTES CON CUENTA CORRIENTE HABILITADA
// -----------------------------------------------
export const INITIAL_CC_CLIENTS: Client[] = [
  {
    id: 'cli-001',
    code: 'CLI-001',
    name: 'Restaurante El Mirador SRL',
    phone: '+54 351 555-1001',
    address: 'Av. Colon 1500, Cordoba',
    hasCurrentAccount: true,
    differentiatedBilling: false,
    isDefault: false,
    isGeneric: false,
    debt: 84350,
    active: true,
    clientType: 'Salon',
    email: 'admin@elmirador.com.ar',
    cuit: '30-70123456-1',
  },
  {
    id: 'cli-002',
    code: 'CLI-002',
    name: 'Gonzalez, Martin',
    phone: '+54 351 555-2002',
    address: 'Calle Belgrano 340, Cordoba',
    hasCurrentAccount: true,
    differentiatedBilling: false,
    isDefault: false,
    isGeneric: false,
    debt: 12500,
    active: true,
    clientType: 'Barra',
  },
  {
    id: 'cli-003',
    code: 'CLI-003',
    name: 'Eventos Caterin S.A.',
    phone: '+54 351 555-3003',
    address: 'Ruta 9 Km 12, Cordoba',
    hasCurrentAccount: true,
    differentiatedBilling: true,
    isDefault: false,
    isGeneric: false,
    debt: 230000,
    active: true,
    clientType: 'Eventos',
    email: 'pagos@caterins.com',
    cuit: '30-88776655-9',
  },
  {
    id: 'cli-004',
    code: 'CLI-004',
    name: 'Lopez, Ana',
    phone: '+54 351 555-4004',
    address: 'Av. Velez Sarsfield 850, Cordoba',
    hasCurrentAccount: true,
    differentiatedBilling: false,
    isDefault: false,
    isGeneric: false,
    debt: 4800,
    active: true,
    clientType: 'Salon',
  },
  {
    id: 'cli-005',
    code: 'CLI-005',
    name: 'Grupo Corporativo Norte',
    phone: '+54 351 555-5005',
    address: 'Av. Sabattini 200, Cordoba',
    hasCurrentAccount: true,
    differentiatedBilling: true,
    isDefault: false,
    isGeneric: false,
    debt: 65000,
    active: true,
    clientType: 'Corporativo',
    email: 'compras@gruponorte.com',
    cuit: '30-55443322-7',
  },
];

// IDs de clientes que son empleados (para columna "Es Empleado")
export const EMPLOYEE_CLIENT_IDS: string[] = ['cli-002', 'cli-004'];

// -----------------------------------------------
// MOVIMIENTOS / CONSUMOS DE CUENTA CORRIENTE
// -----------------------------------------------
export const INITIAL_CC_MOVEMENTS: CurrentAccountMovement[] = [
  // -- cli-001 --
  { id: 'mov-001', clientId: 'cli-001', dateTime: '2026-07-15 12:30', voucherType: 'Ticket', type: 'Venta', total: 18500, ticketDetail: 'Mesa 4 - Menu ejecutivo x4, Bebidas', lineState: 'Pagada' },
  { id: 'mov-002', clientId: 'cli-001', dateTime: '2026-07-22 20:15', voucherType: 'Ticket', type: 'Venta', total: 27300, ticketDetail: 'Mesa 1 - Cena grupal x8, Vinos', lineState: 'Pagada' },
  { id: 'mov-003', clientId: 'cli-001', dateTime: '2026-07-28 13:05', voucherType: 'Ticket', type: 'Venta', total: 15800, ticketDetail: 'Mesa 7 - Almuerzo corporativo x4', lineState: 'Pendiente' },
  { id: 'mov-004', clientId: 'cli-001', dateTime: '2026-08-01 21:00', voucherType: 'Ticket', type: 'Venta', total: 22750, ticketDetail: 'Evento salon privado - Cena x10', lineState: 'Pendiente' },
  { id: 'mov-005', clientId: 'cli-001', dateTime: '2026-08-04 19:45', voucherType: 'Ticket', type: 'Venta', total: 15300, ticketDetail: 'Mesa 3 - Parrilla + postres x5', lineState: 'Pendiente' },
  // -- cli-002 (empleado) --
  { id: 'mov-006', clientId: 'cli-002', dateTime: '2026-07-20 14:00', voucherType: 'Ticket', type: 'Venta', total: 3200, ticketDetail: 'Consumo empleado - Almuerzo personal', lineState: 'Pagada' },
  { id: 'mov-007', clientId: 'cli-002', dateTime: '2026-07-29 13:30', voucherType: 'Ticket', type: 'Venta', total: 4800, ticketDetail: 'Consumo empleado - Cena personal', lineState: 'Pendiente' },
  { id: 'mov-008', clientId: 'cli-002', dateTime: '2026-08-03 14:15', voucherType: 'Ticket', type: 'Venta', total: 7700, ticketDetail: 'Consumo empleado - Almuerzo + bebidas', lineState: 'Pendiente' },
  // -- cli-003 --
  { id: 'mov-009', clientId: 'cli-003', dateTime: '2026-07-10 10:00', voucherType: 'Ticket', type: 'Venta', total: 85000, ticketDetail: 'Evento catering - Boda 150 pax', lineState: 'Pagada' },
  { id: 'mov-010', clientId: 'cli-003', dateTime: '2026-07-18 11:30', voucherType: 'Ticket', type: 'Venta', total: 72000, ticketDetail: 'Catering corporativo - Almuerzo 80 pax', lineState: 'Pagada' },
  { id: 'mov-011', clientId: 'cli-003', dateTime: '2026-07-25 09:00', voucherType: 'Ticket', type: 'Venta', total: 95000, ticketDetail: 'Evento empresarial - Cena gala 120 pax', lineState: 'Pendiente' },
  { id: 'mov-012', clientId: 'cli-003', dateTime: '2026-08-02 10:45', voucherType: 'Ticket', type: 'Venta', total: 63000, ticketDetail: 'Catering desayuno trabajo - 90 pax', lineState: 'Pendiente' },
  { id: 'mov-013', clientId: 'cli-003', dateTime: '2026-08-04 08:00', voucherType: 'Ticket', type: 'Venta', total: 72000, ticketDetail: 'Evento privado fin de semana - 100 pax', lineState: 'Pendiente' },
  // -- cli-004 (empleada) --
  { id: 'mov-014', clientId: 'cli-004', dateTime: '2026-08-01 13:00', voucherType: 'Ticket', type: 'Venta', total: 2400, ticketDetail: 'Consumo empleada - Almuerzo', lineState: 'Pendiente' },
  { id: 'mov-015', clientId: 'cli-004', dateTime: '2026-08-03 21:30', voucherType: 'Ticket', type: 'Venta', total: 2400, ticketDetail: 'Consumo empleada - Cena', lineState: 'Pendiente' },
  // -- cli-005 --
  { id: 'mov-016', clientId: 'cli-005', dateTime: '2026-07-20 12:00', voucherType: 'Ticket', type: 'Venta', total: 28000, ticketDetail: 'Almuerzo corporativo semanal - 30 pax', lineState: 'Pagada' },
  { id: 'mov-017', clientId: 'cli-005', dateTime: '2026-07-27 12:30', voucherType: 'Ticket', type: 'Venta', total: 30000, ticketDetail: 'Almuerzo corporativo semanal - 35 pax', lineState: 'Pagada' },
  { id: 'mov-018', clientId: 'cli-005', dateTime: '2026-08-03 12:15', voucherType: 'Ticket', type: 'Venta', total: 32000, ticketDetail: 'Almuerzo corporativo semanal - 38 pax', lineState: 'Pendiente' },
  { id: 'mov-019', clientId: 'cli-005', dateTime: '2026-08-05 12:00', voucherType: 'Ticket', type: 'Venta', total: 33000, ticketDetail: 'Almuerzo corporativo semanal - 40 pax', lineState: 'Pendiente' },
];

// -----------------------------------------------
// RECIBOS GENERADOS
// -----------------------------------------------
export const INITIAL_RECEIPTS: Receipt[] = [
  {
    id: 'rec-001',
    receiptNumber: 'REC-00001',
    clientId: 'cli-001',
    dateTime: '2026-07-23 09:00',
    totalAmount: 45800,
    status: 'Facturado',
    userName: 'Admin General',
    movementIds: ['mov-001', 'mov-002'],
  },
  {
    id: 'rec-002',
    receiptNumber: 'REC-00002',
    clientId: 'cli-003',
    dateTime: '2026-07-19 10:00',
    totalAmount: 157000,
    status: 'Pendiente',
    userName: 'Jefe de Compras',
    movementIds: ['mov-009', 'mov-010'],
  },
  {
    id: 'rec-003',
    receiptNumber: 'REC-00003',
    clientId: 'cli-005',
    dateTime: '2026-07-28 11:00',
    totalAmount: 58000,
    status: 'Pendiente',
    userName: 'Admin General',
    movementIds: ['mov-016', 'mov-017'],
  },
];
