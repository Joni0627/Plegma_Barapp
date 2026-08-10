import { RestaurantTable, Reservation } from '../types';

// -----------------------------------------------
// MESAS CONFIGURADAS EN EL LOCAL
// -----------------------------------------------
export const INITIAL_RESTAURANT_TABLES: RestaurantTable[] = [
  { id: 'tbl-001', code: 'TBL-01', name: 'Mesa 01 - Salón Principal', capacity: 4, sector: 'Salón Principal', active: true },
  { id: 'tbl-002', code: 'TBL-02', name: 'Mesa 02 - Salón Principal', capacity: 2, sector: 'Salón Principal', active: true },
  { id: 'tbl-003', code: 'TBL-03', name: 'Mesa 03 - Salón Principal', capacity: 6, sector: 'Salón Principal', active: true },
  { id: 'tbl-004', code: 'TBL-04', name: 'Mesa 04 - Salón VIP', capacity: 8, sector: 'VIP', active: true },
  { id: 'tbl-005', code: 'TBL-05', name: 'Mesa 05 - Terraza', capacity: 4, sector: 'Terraza', active: true },
  { id: 'tbl-006', code: 'TBL-06', name: 'Mesa 06 - Terraza VIP', capacity: 10, sector: 'Terraza', active: true },
  { id: 'tbl-007', code: 'TBL-07', name: 'Mesa 07 - Barra Central', capacity: 2, sector: 'Barra', active: true },
];

// -----------------------------------------------
// RESERVAS INICIALES (DEMOSTRACIÓN)
// -----------------------------------------------
export const INITIAL_RESERVATIONS: Reservation[] = [
  // Reservas Próximas (Confirmadas en el futuro)
  {
    id: 'res-001',
    dateTime: '2026-08-11 21:00:00',
    clientId: 'cli-001',
    clientName: 'Restaurante El Mirador SRL',
    clientPhone: '+54 351 555-1001',
    guestsCount: 6,
    tableId: 'tbl-003',
    tableName: 'Mesa 03 - Salón Principal',
    status: 'Confirmada',
    createdByUserId: 'usr-1',
    createdByUserName: 'Admin General',
    createdAt: '2026-08-10 10:30:00',
    notes: 'Solicitan mesa cerca de la ventana principal. Cena ejecutiva.',
  },
  {
    id: 'res-002',
    dateTime: '2026-08-11 22:30:00',
    clientId: 'cli-002',
    clientName: 'Gonzalez, Martin',
    clientPhone: '+54 351 555-2002',
    guestsCount: 2,
    tableId: 'tbl-002',
    tableName: 'Mesa 02 - Salón Principal',
    status: 'Confirmada',
    createdByUserId: 'usr-1',
    createdByUserName: 'Admin General',
    createdAt: '2026-08-10 14:15:00',
    notes: 'Reserva para aniversario. Postre sorpresa con vela.',
  },
  {
    id: 'res-003',
    dateTime: '2026-08-12 20:30:00',
    clientId: 'cli-003',
    clientName: 'Eventos Caterin S.A.',
    clientPhone: '+54 351 555-3003',
    guestsCount: 8,
    tableId: 'tbl-004',
    tableName: 'Mesa 04 - Salón VIP',
    status: 'Confirmada',
    createdByUserId: 'usr-1',
    createdByUserName: 'Admin General',
    createdAt: '2026-08-09 11:00:00',
    notes: 'Reunión directiva. Menú degustación a la carta.',
  },
  // Reservas Históricas (Fechas pasadas)
  {
    id: 'res-004',
    dateTime: '2026-08-08 21:00:00',
    clientId: 'cli-004',
    clientName: 'Lopez, Ana',
    clientPhone: '+54 351 555-4004',
    guestsCount: 4,
    tableId: 'tbl-001',
    tableName: 'Mesa 01 - Salón Principal',
    status: 'Histórica',
    createdByUserId: 'usr-1',
    createdByUserName: 'Admin General',
    createdAt: '2026-08-07 09:30:00',
    notes: 'Cena familiar asistida puntualmente.',
  },
  {
    id: 'res-005',
    dateTime: '2026-08-07 22:00:00',
    clientId: 'cli-005',
    clientName: 'Grupo Corporativo Norte',
    clientPhone: '+54 351 555-5005',
    guestsCount: 10,
    tableId: 'tbl-006',
    tableName: 'Mesa 06 - Terraza VIP',
    status: 'Histórica',
    createdByUserId: 'usr-2',
    createdByUserName: 'Jefe de Compras',
    createdAt: '2026-08-05 16:40:00',
    notes: 'Cierre de proyecto corporativo en terraza.',
  },
  // Reservas Canceladas
  {
    id: 'res-006',
    dateTime: '2026-08-10 19:30:00',
    clientId: 'cli-002',
    clientName: 'Gonzalez, Martin',
    clientPhone: '+54 351 555-2002',
    guestsCount: 4,
    tableId: 'tbl-005',
    tableName: 'Mesa 05 - Terraza',
    status: 'Cancelada',
    createdByUserId: 'usr-1',
    createdByUserName: 'Admin General',
    createdAt: '2026-08-09 18:00:00',
    notes: 'Cancelación telefónica del cliente por motivo personal.',
    cancelReason: 'Cliente avisó imposibilidad de viajar a tiempo.',
  },
];
