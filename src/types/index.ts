export type DayOfWeek = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado';

export type ProcessState =
  | 'Pendiente de conteo'
  | 'Conteo finalizado'
  | 'Pedido confirmado'
  | 'Pendiente de entrega'
  | 'Entregado / Ingresado'
  | 'Pendiente de pago'
  | 'Pagado'
  | 'Finalizado';

export type UserRole = 'compras' | 'recepcion' | 'caja' | 'admin';

export interface Provider {
  id: string;
  code: string;
  name: string;
  commercialName: string;
  rubro: string; // e.g., Lácteos, Carnes, Bebidas, Verduras, Almacén
  logoUrl?: string;
  contactName: string;
  phone: string;
  whatsapp: string;
  email: string;
  cuit: string;
  address: string;
  notes?: string;

  // Planning
  orderDays: DayOfWeek[];
  deliveryDays: DayOfWeek[];
  priority: number; // 1 = highest
  purchaseFrequency: 'Semanal' | 'Bisemanal' | 'Diario' | 'Quincenal';
  cutoffTime: string; // e.g., "14:00"
  habitualLeadTimeDays: number;
  operationalNotes?: string;

  // Commercial
  currentAccount: boolean;
  acceptsCash: boolean;
  acceptsTransfer: boolean;
  acceptsCheque: boolean;
  paymentTermDays: number;
  paymentCondition: string; // e.g., "Contado", "7 días", "Cuenta Corriente 15 días"
  commercialNotes?: string;

  // Banking
  bankName?: string;
  accountOwner?: string;
  ownerCuit?: string;
  alias?: string;
  cbuCvu?: string;

  // Status & Priority
  active: boolean;
}

export interface Item {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  brand: string;
  storageUnit: string; // e.g., "kg", "L", "un"
  purchaseUnit: string; // e.g., "caja", "horma", "bolsa 10kg"
  packQuantity: number; // un per purchase unit
  location: string; // Depósito / Heladera / Cama Fría
  currentStock: number;
  minStock: number;
  maxStock: number;
  currentPrice: number;
  active: boolean;
  notes?: string;
}

export interface ProviderItemRelation {
  id: string;
  providerId: string;
  itemId: string;
  supplierProductCode: string;
  purchaseUnit: string;
  packQuantity: number;
  minStock: number;
  maxStock: number;
  lastPurchasePrice: number;
  lastPurchaseDate?: string;
  lastPriceHikeDate?: string;
  isPrimarySupplier: boolean;
  active: boolean;
  commercialNotes?: string;
}

export interface StockCountItem {
  itemId: string;
  previousStock: number;
  currentStock: number;
  receivedSinceLastCount: number;
  estimatedConsumption: number; // (prev + received - current)
  notes?: string;
}

export interface StockCount {
  id: string;
  countNumber: string;
  providerId: string;
  date: string; // ISO string
  userId: string;
  userName: string;
  status: 'borrador' | 'finalizado';
  items: StockCountItem[];
  notes?: string;
}

export interface OrderItem {
  itemId: string;
  itemName: string;
  unit: string;
  suggestedQty: number;
  finalQty: number;
  receivedQty?: number;
  referencePrice: number;
  itemNotes?: string;
}

export interface ReceptionHoursConfig {
  morningStart: string; // e.g., "08:00"
  morningEnd: string;   // e.g., "12:00"
  morningActive: boolean;
  afternoonStart: string; // e.g., "16:00"
  afternoonEnd: string;   // e.g., "19:00"
  afternoonActive: boolean;
  additionalNotes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string; // ISO string
  providerId: string;
  expectedDeliveryDate: string;
  userId: string;
  userName: string;
  status: ProcessState;
  items: OrderItem[];
  generalNotes?: string;
  receptionHoursSnapshot: ReceptionHoursConfig;
  
  // Amounts
  estimatedTotal: number;
  finalReceivedTotal?: number;
  
  // Receptions
  receptionDate?: string;
  receptionNotes?: string;
  invoiceOrReceiptNumber?: string;
  deliveryType?: 'completa' | 'parcial';
  
  // Payments
  paymentStatus: 'Pagado' | 'Pendiente de pago' | 'Pago parcial' | 'Cuenta corriente' | 'Sin cargo';
  paidAmount?: number;
  remainingDebt?: number;
  paymentDate?: string;
  paymentMethod?: 'Efectivo' | 'Transferencia' | 'Cheque' | 'Tarjeta' | 'Cuenta corriente';
  paymentAccount?: string; // e.g., "Caja Principal", "Banco Galicia", "Mercado Pago"
  paymentReceiptNumber?: string;
}

export interface PriceHistoryEntry {
  id: string;
  itemId: string;
  providerId: string;
  date: string;
  oldPrice: number;
  newPrice: number;
  variationPercentage: number;
  userId: string;
  orderId?: string;
}

export interface ExpenseRecord {
  id: string;
  date: string;
  providerId: string;
  orderId: string;
  amount: number;
  account: string;
  paymentMethod: string;
  receiptNumber?: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  entityType: 'conteo' | 'pedido' | 'recepcion' | 'precio' | 'pago' | 'proveedor';
  entityId: string;
  oldValue?: string;
  newValue?: string;
  details?: string;
}
