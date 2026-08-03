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
  dayPriorities?: Partial<Record<DayOfWeek, number>>;
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
  | 'Playfair Display'
  | 'Raleway'
  | 'Oswald'
  | 'Lora'
  | 'Fira Code'
  | 'Cinzel';

export interface BrandingConfig {
  // Brand Logo & Company Details
  logoUrl?: string;
  companyName?: string;
  companySubtitle?: string;
  cuit?: string;
  address?: string;
  phone?: string;
  email?: string;

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
  buttonFontFamily?: FontFamilyOption;

  // Toggle Switch Properties
  toggleStyle: ToggleStyle;
  toggleActiveHex: string;
  toggleInactiveHex: string;
  toggleKnobSize: 'sm' | 'md' | 'lg';

  // Menu Icon Customization
  menuIconStrokeWidth?: number;
  menuIconHex?: string;
  menuActiveIconHex?: string;
  submenuIconHex?: string;
  submenuActiveIconHex?: string;

  // Kanban Board Customization
  kanbanColumnBgHex?: string;
  kanbanHeaderBgHex?: string;
  kanbanCardBgHex?: string;
  kanbanCardBorderHex?: string;
  kanbanDraftHex?: string;
  kanbanPendingHex?: string;
  kanbanOrderedHex?: string;
  kanbanReceivedHex?: string;

  // Expanded Typography Options
  fontFamily: FontFamilyOption;
  fontSizeScale: 'compact' | 'normal' | 'large';
  headingFontWeight: 'font-bold' | 'font-extrabold' | 'font-black';
}

// ----------------------------------------------------
// RECURSOS HUMANOS (RR.HH.) - EMPLEADOS TYPES
// ----------------------------------------------------

export type EmployeeDayOfWeek =
  | 'Lunes'
  | 'Martes'
  | 'Miércoles'
  | 'Jueves'
  | 'Viernes'
  | 'Sábado'
  | 'Domingo';

export interface HourlyRateLog {
  id: string;
  employeeId: string;
  timestamp: string; // Fecha Hora Modificación [SYS]
  oldPrice: number; // Valor Anterior [AUTO]
  newPrice: number; // Valor Nuevo
  percentageIncrease: number; // % Aumento = ((Nuevo - Anterior) / Anterior) * 100 [AUTO]
  modifiedBy: string; // Usuario Modificación [EXT]
  notes?: string; // Observaciones
}

export interface WorkScheduleItem {
  id: string;
  employeeId: string;
  day: EmployeeDayOfWeek;
  startTime: string; // e.g. "08:00"
  endTime: string; // e.g. "16:00"
  specialHourlyRate?: number; // Moneda (Tarifa especial)
  active: boolean; // Si / No
  notes?: string;
}

export interface Employee {
  id: string;
  dni: string; // Número, Obligatorio, Único
  name: string; // Texto, Obligatorio (Nombre y apellido)
  address: string; // Texto, Obligatorio (Domicilio)
  phone: string; // Texto/Número, Obligatorio
  birthDate?: string; // Fecha
  gender?: 'Masculino' | 'Femenino' | 'Otro';
  position: string; // Lista [CFG] Puestos, Obligatorio
  profile: string; // Lista [CFG] Perfiles, Obligatorio
  loginEmail?: string; // Email
  isSharedEmail?: boolean; // Si / No
  enableClockIn: boolean; // Si / No, Obligatorio
  hourlyRate: number; // Moneda, Obligatorio
  isPartner: boolean; // Si / No, Obligatorio
  relatedProviderId?: string; // Lista [EXT] Proveedores
  active: boolean; // Si / No, Obligatorio

  // Datos de Cuenta / Pago
  bankCompany?: 'Mercado Pago' | 'Naranja X' | 'Banco' | 'Ualá' | 'Otra';
  accountType?: 'Caja de Ahorro' | 'Cuenta Corriente' | 'CVU';
  cbuCvu?: string;
  alias?: string;

  // Logs & Work Schedule
  hourlyRateLogs?: HourlyRateLog[];
  schedule?: WorkScheduleItem[];
}

export type ClockState = 'Abierta' | 'Cerrada' | 'Corregida' | 'Anulada';

export interface ClockRecord {
  id: string;
  employeeId: string;
  dni: string;
  employeeName: string;
  checkIn: string; // YYYY-MM-DD HH:mm:ss
  checkOut?: string; // YYYY-MM-DD HH:mm:ss
  hoursWorked?: number; // Duration in hours (e.g. 7.5)
  hourlyRate: number; // Frozen rate at check-in time
  totalCost?: number; // hoursWorked * hourlyRate
  state: ClockState;
  modifiedBy?: string;
  modificationReason?: string;
  modifiedAt?: string;
  notes?: string;
}

export type AdvanceStatus = 'Pendiente' | 'En descuento' | 'Descontado' | 'Anulado';

export interface EmployeeConsumption {
  id: string;
  employeeId: string;
  employeeName: string;
  dni: string;
  date: string; // YYYY-MM-DD HH:mm
  orderNumber: string;
  amount: number;
  detail: string;
  liquidationPeriod?: string; // e.g. "Julio/2026"
  status: 'Pendiente' | 'Aplicado';
}

export interface AdvanceInstallment {
  installmentNumber: number;
  amount: number;
  liquidationPeriod: string; // e.g. "Julio/2026"
  status: 'Pendiente' | 'Aplicado';
  appliedIn?: string;
}

export interface EmployeeAdvance {
  id: string;
  employeeId: string;
  employeeName: string;
  dni: string;
  date: string; // YYYY-MM-DD HH:mm
  amount: number;
  detail?: string;
  paymentMethod?: string;
  cashRegister?: string;
  liquidationStartPeriod: string; // e.g. "Julio/2026"
  isInstallments: boolean;
  installmentsCount: number;
  installmentAmount: number;
  pendingBalance: number;
  status: AdvanceStatus;
  installments: AdvanceInstallment[];
  createdUser?: string;
}

export type PayrunStatus = 'Pendiente' | 'En curso' | 'Liquidada' | 'Anulada';
export type EmployeePayrunStatus = 'Pendiente' | 'En proceso' | 'Pagado';

export interface PayrunDeduction {
  id: string;
  concept: string; // "Adelanto de Sueldo" | "Consumo de Empleado"
  detail: string; // e.g. "3/4 cuota (1 de 3)" or "Pedido #40.663"
  amount: number;
  sourceId?: string;
}

export interface PayrunEmployeeDetail {
  employeeId: string;
  employeeName: string;
  dni: string;
  position: string;
  hoursWorkedStr: string; // HH:MM:SS
  hoursWorkedDecimal: number;
  hourlyRate: number;
  grossAmount: number;
  deductions: PayrunDeduction[];
  totalDeductions: number;
  netAmount: number;
  paidAmount: number;
  pendingAmount: number;
  status: EmployeePayrunStatus;
  paymentMethod?: string;
  cashRegister?: string;
  paymentDate?: string;
}

export interface Payrun {
  id: string;
  periodName: string;
  startDate: string; // YYYY-MM-DD HH:mm
  endDate: string; // YYYY-MM-DD HH:mm
  employeeCount: number;
  totalToPay: number;
  totalPaid: number;
  totalPending: number;
  status: PayrunStatus;
  employeesDetails: PayrunEmployeeDetail[];
  createdAt: string;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastNotification {
  id: string;
  message: string;
  type: ToastType;
}
