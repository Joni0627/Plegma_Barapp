import { SiteConfig, RestaurantTableConfig, SaleTypeConfig } from '../types';

// -----------------------------------------------
// SITIOS / SECTORES DEL LOCAL
// -----------------------------------------------
export const INITIAL_SITE_CONFIGS: SiteConfig[] = [
  { id: 'site-001', name: 'Salón Principal', description: 'Área central con aire acondicionado', active: true, order: 1 },
  { id: 'site-002', name: 'Salón Fondo', description: 'Espacio más privado para grupos', active: true, order: 2 },
  { id: 'site-003', name: 'Terraza VIP', description: 'Vista exterior panorámica con calefacción', active: true, order: 3 },
  { id: 'site-004', name: 'Patio Exterior / Vereda', description: 'Mesas al aire libre en vereda', active: true, order: 4 },
  { id: 'site-005', name: 'Barra Central', description: 'Lugares individuales frente a la barra', active: true, order: 5 },
];

// -----------------------------------------------
// CONFIGURACIÓN DE MESAS FÍSICAS
// -----------------------------------------------
export const INITIAL_TABLE_CONFIGS: RestaurantTableConfig[] = [
  { id: 'tbl-001', number: 'Mesa 01', capacity: 4, siteId: 'site-001', siteName: 'Salón Principal', name: 'Mesa 01 Ventana', isFree: true, active: true },
  { id: 'tbl-002', number: 'Mesa 02', capacity: 2, siteId: 'site-001', siteName: 'Salón Principal', name: 'Mesa 02 Parejas', isFree: true, active: true },
  { id: 'tbl-003', number: 'Mesa 03', capacity: 6, siteId: 'site-001', siteName: 'Salón Principal', name: 'Mesa 03 Familiar', isFree: true, active: true },
  { id: 'tbl-004', number: 'Mesa 04', capacity: 8, siteId: 'site-003', siteName: 'Terraza VIP', name: 'Mesa 04 VIP Grande', isFree: true, active: true },
  { id: 'tbl-005', number: 'Mesa 05', capacity: 4, siteId: 'site-004', siteName: 'Patio Exterior / Vereda', name: 'Mesa 05 Vereda', isFree: true, active: true },
  { id: 'tbl-006', number: 'Mesa 06', capacity: 10, siteId: 'site-003', siteName: 'Terraza VIP', name: 'Mesa 06 Eventos', isFree: true, active: true },
  { id: 'tbl-007', number: 'Mesa 07', capacity: 2, siteId: 'site-005', siteName: 'Barra Central', name: 'Barra Lote A', isFree: true, active: true },
];

// -----------------------------------------------
// CANALES Y TIPOS DE VENTA
// -----------------------------------------------
export const INITIAL_SALE_TYPE_CONFIGS: SaleTypeConfig[] = [
  {
    id: 'st-001',
    name: 'Salón / Comedor',
    isSalonSale: true,
    requiresTable: true,
    requiresClient: false,
    initialOrderStatus: 'Pendiente de conteo',
    finalOrderStatus: 'Pagado',
    autoPrintTicket: true,
    kitchenPrinter: 'Impresora Cocina Salón',
    active: true,
  },
  {
    id: 'st-002',
    name: 'Delivery a Domicilio',
    isSalonSale: false,
    requiresTable: false,
    requiresClient: true,
    initialOrderStatus: 'Pedido confirmado',
    finalOrderStatus: 'Entregado / Ingresado',
    autoPrintTicket: true,
    kitchenPrinter: 'Impresora Despacho Delivery',
    active: true,
  },
  {
    id: 'st-003',
    name: 'Takeaway / Retiro en Local',
    isSalonSale: false,
    requiresTable: false,
    requiresClient: false,
    initialOrderStatus: 'Pedido confirmado',
    finalOrderStatus: 'Finalizado',
    autoPrintTicket: true,
    kitchenPrinter: 'Impresora Barra',
    active: true,
  },
  {
    id: 'st-004',
    name: 'Eventos / Catering Corporativo',
    isSalonSale: true,
    requiresTable: true,
    requiresClient: true,
    initialOrderStatus: 'Pendiente de entrega',
    finalOrderStatus: 'Finalizado',
    autoPrintTicket: true,
    kitchenPrinter: 'Impresora Cocina Salón',
    active: true,
  },
];
