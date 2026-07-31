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
  commercialName?: string;
  rubro?: string; // e.g., Lácteos, Carnes, Bebidas, Verduras, Almacén
  logoUrl?: string;
  contactName?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  cuit?: string;
  address?: string;
  subrubro?: string;
  notes?: string;

  // Planning
  orderDays?: DayOfWeek[];
  deliveryDays?: DayOfWeek[];
  priority?: number; // 1 = highest
  purchaseFrequency?: 'Semanal' | 'Bisemanal' | 'Diario' | 'Quincenal';
  cutoffTime?: string; // e.g., "14:00"
  habitualLeadTimeDays?: number;
  operationalNotes?: string;

  // Commercial
  currentAccount?: boolean;
  acceptsCash?: boolean;
  acceptsTransfer?: boolean;
  acceptsCheque?: boolean;
  paymentTermDays?: number;
  paymentCondition?: string; // e.g., "Contado", "7 días", "Cuenta Corriente 15 días"
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

export type PurchaseStatus = 'Recibida' | 'Anulada' | 'En Proceso';
export type PaymentStatus = 'Pagada' | 'Pendiente' | 'Parcial' | 'Anulada';

export interface ProviderPurchase {
  id: string;
  providerId: string;
  purchaseDate: string; // [SYS]
  voucherNumber: string; // Comprobante
  totalAmount: number; // [AUTO]
  paidAmount: number; // [AUTO]
  purchaseStatus: PurchaseStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
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

export type MovementType = 'Venta' | 'Recibo' | 'Ajuste';
export type LineState = 'Pendiente' | 'Seleccionada' | 'Pagada';

export interface CurrentAccountMovement {
  id: string;
  clientId: string;
  dateTime: string;
  voucherType: string;
  type: MovementType;
  total: number;
  ticketDetail?: string;
  lineState: LineState;
}

export interface Client {
  id: string;
  code: string;
  name: string; // Cliente / Razón Social (Obligatorio)
  phone: string; // Teléfono (Obligatorio)
  address: string; // Dirección (Obligatorio)
  hasCurrentAccount: boolean; // Cuenta Corriente (Sí/No, Obligatorio)
  differentiatedBilling: boolean; // Cobro Diferenciado (Sí/No, Obligatorio, por defecto No)
  isDefault: boolean; // Por Defecto (Sí/No, Obligatorio)
  isGeneric: boolean; // Genérico (Sí/No, Obligatorio)
  debt: number; // Deuda Moneda [AUTO]
  active: boolean; // Activo (Sí/No, Obligatorio)
  notes?: string; // Observaciones (Texto largo, opcional)

  clientType?: 'Salon' | 'Barra' | 'Eventos' | 'Delivery' | 'Corporativo';
  contactName?: string;
  email?: string;
  cuit?: string;
  categoryId?: string;
}

export type ModuleActionLevel = 'none' | 'view' | 'create' | 'edit' | 'full';

export interface ModuleAccessMatrix {
  kanban: ModuleActionLevel;
  inbox: ModuleActionLevel;
  items: ModuleActionLevel;
  dashboard: ModuleActionLevel;
  audit: ModuleActionLevel;
  maestros: ModuleActionLevel;
}

export interface GranularRole {
  id: string;
  name: string;
  description: string;
  moduleAccess: ModuleAccessMatrix;
}

export interface UserProfile {
  id: string;
  name: string;
  description: string;
}

export interface AppUser {
  id: string;
  dni: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  profileId?: string;
  profileName?: string;
  assignedRoleIds: string[];
  role?: UserRole;
  status: 'Activo' | 'Inactivo';
  lastAccess?: string;
  customPermissions?: Partial<UserPermissions>;
}

export interface UserPermissions {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canInlineCreate: boolean;
  canApprovePayment: boolean;
  canManageUsers: boolean;
}

export interface RoleProfile {
  id: string;
  name: string;
  roleKey: UserRole;
  description: string;
  permissions: UserPermissions;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  itemCount: number;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  type: 'Frío' | 'Seco' | 'Cocina' | 'Barra' | 'General';
  responsibleName?: string;
  active: boolean;
}

export type NavigationStyle = 'top' | 'sidebar';
export type ButtonStyleVariant = 'solid' | 'outline' | 'glass' | 'gradient';
export type ButtonShadowStyle = 'none' | 'sm' | 'md' | 'xl';
export type ButtonRadius = 'rounded-full' | 'rounded-2xl' | 'rounded-xl' | 'rounded-lg' | 'rounded-none';
export type ToggleStyle = 'pill' | 'square' | 'ios';
export type FontFamilyOption =
  | 'Inter'
  | 'Outfit'
  | 'Roboto'
  | 'Plus Jakarta Sans'
  | 'Poppins'
  | 'Space Grotesk'
  | 'Montserrat'
  | 'Playfair Display';

export interface BrandingConfig {
  // Navigation Layout
  navigationStyle: NavigationStyle;

  // Dedicated Menu Customization
  menuBgHex: string;
  menuTextHex: string;
  menuActiveBgHex: string;
  menuActiveTextHex: string;
  menuFontFamily: FontFamilyOption;
  menuFontSize: 'sm' | 'md' | 'lg';

  // HEX Colors per Component
  appBgHex: string;
  cardBgHex: string;
  cardBorderHex: string;
  primaryHex: string;
  buttonBgHex: string;
  buttonTextHex: string;

  // Advanced Button Properties
  buttonRadius: ButtonRadius;
  buttonStyleVariant: ButtonStyleVariant;
  buttonShadowStyle: ButtonShadowStyle;
  buttonFontWeight: 'font-normal' | 'font-medium' | 'font-semibold' | 'font-bold' | 'font-extrabold';
  buttonHoverEffect: 'none' | 'scale' | 'lift' | 'glow';

  // Toggle Switch Properties
  toggleStyle: ToggleStyle;
  toggleActiveHex: string;
  toggleInactiveHex: string;
  toggleKnobSize: 'sm' | 'md' | 'lg';

  // Expanded Typography Options
  fontFamily: FontFamilyOption;
  fontSizeScale: 'compact' | 'normal' | 'large';
  headingFontWeight: 'font-bold' | 'font-extrabold' | 'font-black';
}
