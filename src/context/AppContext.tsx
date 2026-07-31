import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Provider,
  Item,
  ProviderItemRelation,
  Order,
  StockCount,
  ReceptionHoursConfig,
  PriceHistoryEntry,
  ExpenseRecord,
  AuditLog,
  ProcessState,
  UserRole,
  DayOfWeek,
  UserPermissions,
  AppUser,
  BrandingConfig,
} from '../types';
import {
  INITIAL_PROVIDERS,
  INITIAL_ITEMS,
  INITIAL_PROVIDER_ITEMS,
  INITIAL_ORDERS,
  INITIAL_RECEPTION_HOURS,
  INITIAL_PRICE_HISTORY,
  INITIAL_AUDIT_LOGS,
} from '../data/initialData';

const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  admin: {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canInlineCreate: true,
    canApprovePayment: true,
    canManageUsers: true,
  },
  compras: {
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canInlineCreate: true,
    canApprovePayment: false,
    canManageUsers: false,
  },
  recepcion: {
    canCreate: true,
    canEdit: false,
    canDelete: false,
    canInlineCreate: false,
    canApprovePayment: false,
    canManageUsers: false,
  },
  caja: {
    canCreate: false,
    canEdit: true,
    canDelete: false,
    canInlineCreate: false,
    canApprovePayment: true,
    canManageUsers: false,
  },
};

interface AppContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  users: AppUser[];
  addUser: (user: AppUser) => void;
  updateUser: (user: AppUser) => void;
  deleteUser: (userId: string) => void;
  updateUserCustomPermissions: (userId: string, perms: Partial<UserPermissions>) => void;
  activeUserId: string;
  setActiveUserId: (id: string) => void;
  rolePermissions: Record<UserRole, UserPermissions>;
  hasPermission: (permission: keyof UserPermissions) => boolean;
  updateRolePermissions: (role: UserRole, newPerms: Partial<UserPermissions>) => void;
  providers: Provider[];
  addProvider: (provider: Provider) => void;
  updateProvider: (provider: Provider) => void;
  deleteProvider: (providerId: string) => void;
  items: Item[];
  providerItems: ProviderItemRelation[];
  orders: Order[];
  stockCounts: StockCount[];
  receptionHours: ReceptionHoursConfig;
  priceHistory: PriceHistoryEntry[];
  expenses: ExpenseRecord[];
  auditLogs: AuditLog[];
  branding: BrandingConfig;
  updateBranding: (newConfig: Partial<BrandingConfig>) => void;

  // Actions
  getProviderState: (providerId: string) => ProcessState;
  getProviderActiveOrder: (providerId: string) => Order | undefined;
  getProviderActiveCount: (providerId: string) => StockCount | undefined;
  reorderProviderInDay: (providerId: string, day: DayOfWeek, direction: 'up' | 'down') => void;
  moveProviderToPosition: (
    draggedProviderId: string,
    sourceDay: DayOfWeek,
    targetDay: DayOfWeek,
    targetProviderId?: string
  ) => void;
  updateProviderDays: (providerId: string, orderDays: DayOfWeek[], deliveryDays: DayOfWeek[]) => void;
  
  // Stock Counts
  saveStockCount: (count: StockCount) => void;
  
  // Orders
  createOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, newStatus: ProcessState) => void;
  
  // Reception
  receiveGoods: (
    orderId: string,
    receivedItems: { itemId: string; receivedQty: number; price?: number }[],
    notes: string,
    invoiceNumber: string,
    deliveryType: 'completa' | 'parcial',
    paymentStatus: Order['paymentStatus'],
    paymentDetails?: {
      amount: number;
      method: Order['paymentMethod'];
      account: string;
      receiptNumber?: string;
    }
  ) => void;

  // Payments
  recordPayment: (
    orderId: string,
    amount: number,
    method: NonNullable<Order['paymentMethod']>,
    account: string,
    receiptNumber?: string
  ) => void;

  // Items & Providers CRUD
  updateReceptionHours: (config: ReceptionHoursConfig) => void;
  addOrUpdateProvider: (provider: Provider) => void;
  addOrUpdateItem: (item: Item, providerRelations?: Partial<ProviderItemRelation>[]) => void;
  
  // Reset
  resetToDefaults: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'gastronomic_erp_state_clean_v1';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [activeUserId, setActiveUserId] = useState<string>('usr-1');
  const [users, setUsers] = useState<AppUser[]>([
    {
      id: 'usr-1',
      dni: '35.123.456',
      name: 'Admin General',
      email: 'admin@plegma.com',
      phone: '+54 11 5555-1111',
      address: 'Av. Santa Fe 1200, CABA',
      profileId: 'p-1',
      profileName: 'Administrador General',
      assignedRoleIds: ['r-1'],
      role: 'admin',
      status: 'Activo',
      lastAccess: 'Hoy 10:30 hs',
      customPermissions: {
        canInlineCreate: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canApprovePayment: true,
        canManageUsers: true,
      },
    },
    {
      id: 'usr-2',
      dni: '38.987.654',
      name: 'Jefe de Compras',
      email: 'compras@plegma.com',
      phone: '+54 11 4444-2222',
      address: 'Calle Corrientes 3400, CABA',
      profileId: 'p-2',
      profileName: 'Encargado de Compras',
      assignedRoleIds: ['r-2', 'r-5'],
      role: 'compras',
      status: 'Activo',
      lastAccess: 'Ayer 18:15 hs',
    },
    {
      id: 'usr-3',
      dni: '40.555.777',
      name: 'Recepcionista Depósito',
      email: 'recepcion@plegma.com',
      phone: '+54 11 3333-8888',
      address: 'Honduras 5100, CABA',
      profileId: 'p-7',
      profileName: 'Encargado de Depósito',
      assignedRoleIds: ['r-3'],
      role: 'recepcion',
      status: 'Activo',
      lastAccess: 'Hace 2 horas',
    },
  ]);

  const [rolePermissions, setRolePermissions] = useState<Record<UserRole, UserPermissions>>(DEFAULT_ROLE_PERMISSIONS);
  const [providers, setProviders] = useState<Provider[]>(INITIAL_PROVIDERS);
  const [items, setItems] = useState<Item[]>(INITIAL_ITEMS);
  const [providerItems, setProviderItems] = useState<ProviderItemRelation[]>(INITIAL_PROVIDER_ITEMS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [stockCounts, setStockCounts] = useState<StockCount[]>([]);
  const [receptionHours, setReceptionHours] = useState<ReceptionHoursConfig>(INITIAL_RECEPTION_HOURS);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryEntry[]>(INITIAL_PRICE_HISTORY);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [branding, setBranding] = useState<BrandingConfig>({
    navigationStyle: 'top',
    menuBgHex: '#0f172a',
    menuTextHex: '#94a3b8',
    menuActiveBgHex: '#f59e0b',
    menuActiveTextHex: '#0f172a',
    menuFontFamily: 'Inter',
    menuFontSize: 'md',

    appBgHex: '#f8fafc',
    cardBgHex: '#ffffff',
    cardBorderHex: '#e2e8f0',
    primaryHex: '#f59e0b',
    buttonBgHex: '#f59e0b',
    buttonTextHex: '#0f172a',

    buttonRadius: 'rounded-xl',
    buttonStyleVariant: 'solid',
    buttonShadowStyle: 'md',
    buttonFontWeight: 'font-bold',
    buttonHoverEffect: 'scale',

    toggleStyle: 'pill',
    toggleActiveHex: '#f59e0b',
    toggleInactiveHex: '#cbd5e1',
    toggleKnobSize: 'md',

    menuIconStrokeWidth: 2,
    menuIconHex: '#94a3b8',
    menuActiveIconHex: '#0f172a',
    submenuIconHex: '#94a3b8',
    submenuActiveIconHex: '#0f172a',

    kanbanColumnBgHex: '#f1f5f9',
    kanbanHeaderBgHex: '#e2e8f0',
    kanbanCardBgHex: '#ffffff',
    kanbanCardBorderHex: '#e2e8f0',
    kanbanDraftHex: '#f59e0b',
    kanbanPendingHex: '#3b82f6',
    kanbanOrderedHex: '#8b5cf6',
    kanbanReceivedHex: '#10b981',

    fontFamily: 'Inter',
    fontSizeScale: 'normal',
    headingFontWeight: 'font-extrabold',
  });

  const updateBranding = (newConfig: Partial<BrandingConfig>) => {
    setBranding((prev) => {
      const updated = { ...prev, ...newConfig };
      try {
        localStorage.setItem('plegma_branding_config', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  useEffect(() => {
    try {
      const savedBranding = localStorage.getItem('plegma_branding_config');
      if (savedBranding) {
        setBranding((prev) => ({ ...prev, ...JSON.parse(savedBranding) }));
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (branding) {
      // 1. Dynamic Google Fonts Loader for App Font & Menu Font
      const fontsToLoad = Array.from(new Set([branding.fontFamily || 'Inter', branding.menuFontFamily || 'Inter']));
      fontsToLoad.forEach((fontName) => {
        const formattedFontName = fontName.replace(/ /g, '+');
        const fontLinkId = `google-font-${fontName.toLowerCase().replace(/ /g, '-')}`;
        if (!document.getElementById(fontLinkId)) {
          const linkElem = document.createElement('link');
          linkElem.id = fontLinkId;
          linkElem.rel = 'stylesheet';
          linkElem.href = `https://fonts.googleapis.com/css2?family=${formattedFontName}:wght@300;400;500;600;700;800;900&display=swap`;
          document.head.appendChild(linkElem);
        }
      });

      document.body.style.fontFamily = `'${branding.fontFamily || 'Inter'}', system-ui, -apple-system, sans-serif`;

      // 2. Set root CSS custom variables for live color application across the app
      const root = document.documentElement;
      if (branding.appBgHex) root.style.setProperty('--app-bg-hex', branding.appBgHex);
      if (branding.menuBgHex) root.style.setProperty('--menu-bg-hex', branding.menuBgHex);
      if (branding.menuTextHex) root.style.setProperty('--menu-text-hex', branding.menuTextHex);
      if (branding.menuActiveBgHex) root.style.setProperty('--menu-active-bg-hex', branding.menuActiveBgHex);
      if (branding.menuActiveTextHex) root.style.setProperty('--menu-active-text-hex', branding.menuActiveTextHex);
      if (branding.primaryHex) root.style.setProperty('--primary-hex', branding.primaryHex);
      if (branding.buttonBgHex) root.style.setProperty('--button-bg-hex', branding.buttonBgHex);
      if (branding.buttonTextHex) root.style.setProperty('--button-text-hex', branding.buttonTextHex);
    }
  }, [branding]);

  const addUser = (newUser: AppUser) => {
    setUsers((prev) => [newUser, ...(prev || [])]);
  };

  const updateUser = (updatedUser: AppUser) => {
    setUsers((prev) => (prev || []).map((u) => (u.id === updatedUser.id ? updatedUser : u)));
  };

  const deleteUser = (userId: string) => {
    setUsers((prev) => (prev || []).filter((u) => u.id !== userId));
  };

  const addProvider = (newProvider: Provider) => {
    setProviders((prev) => [newProvider, ...(prev || [])]);
  };

  const updateProvider = (updatedProvider: Provider) => {
    setProviders((prev) => (prev || []).map((p) => (p.id === updatedProvider.id ? updatedProvider : p)));
  };

  const deleteProvider = (providerId: string) => {
    setProviders((prev) => (prev || []).filter((p) => p.id !== providerId));
  };

  const updateUserCustomPermissions = (userId: string, perms: Partial<UserPermissions>) => {
    setUsers((prev) =>
      (prev || []).map((u) => (u.id === userId ? { ...u, customPermissions: { ...u.customPermissions, ...perms } } : u))
    );
  };

  const hasPermission = (permission: keyof UserPermissions): boolean => {
    if (!permission) return true;
    const safeUsers = Array.isArray(users) ? users : [];
    const activeUser =
      safeUsers.find((u) => u && u.id === activeUserId) ||
      safeUsers.find((u) => u && u.role === userRole);
    if (activeUser?.customPermissions && activeUser.customPermissions[permission] !== undefined) {
      return Boolean(activeUser.customPermissions[permission]);
    }
    const rolePerms =
      (rolePermissions && rolePermissions[userRole]) ||
      DEFAULT_ROLE_PERMISSIONS[userRole] ||
      DEFAULT_ROLE_PERMISSIONS.admin;
    return Boolean(rolePerms?.[permission]);
  };

  const updateRolePermissions = (role: UserRole, newPerms: Partial<UserPermissions>) => {
    setRolePermissions((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        ...newPerms,
      },
    }));
  };

  // Load from LocalStorage
  useEffect(() => {
    try {
      localStorage.removeItem('gastronomic_erp_state_v1');
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.providers) setProviders(parsed.providers);
        if (parsed.items) setItems(parsed.items);
        if (parsed.providerItems) setProviderItems(parsed.providerItems);
        if (parsed.orders) setOrders(parsed.orders);
        if (parsed.stockCounts) setStockCounts(parsed.stockCounts);
        if (parsed.receptionHours) setReceptionHours(parsed.receptionHours);
        if (parsed.priceHistory) setPriceHistory(parsed.priceHistory);
        if (parsed.expenses) setExpenses(parsed.expenses);
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
      }
    } catch (e) {
      console.error('Error reading localStorage', e);
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    try {
      const payload = {
        providers,
        items,
        providerItems,
        orders,
        stockCounts,
        receptionHours,
        priceHistory,
        expenses,
        auditLogs,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Error saving localStorage', e);
    }
  }, [providers, items, providerItems, orders, stockCounts, receptionHours, priceHistory, expenses, auditLogs]);

  // Log audit helper
  const logAudit = (action: string, entityType: AuditLog['entityType'], entityId: string, details?: string) => {
    const newLog: AuditLog = {
      id: 'aud-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: `usr-${userRole}`,
      userName: `Usuario (${userRole.toUpperCase()})`,
      action,
      entityType,
      entityId,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // State derivation for a provider based on active orders & stock counts
  const getProviderState = (providerId: string): ProcessState => {
    // Check if there is an active order for this provider
    const providerOrders = orders.filter((o) => o.providerId === providerId);
    if (providerOrders.length > 0) {
      // Find the most recent order
      const latestOrder = [...providerOrders].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];

      if (latestOrder.status === 'Pendiente de entrega') return 'Pendiente de entrega';
      if (latestOrder.status === 'Entregado / Ingresado') {
        if (latestOrder.paymentStatus === 'Pendiente de pago' || latestOrder.paymentStatus === 'Pago parcial') {
          return 'Pendiente de pago';
        }
        if (latestOrder.paymentStatus === 'Pagado') return 'Pagado';
        return 'Entregado / Ingresado';
      }
      if (latestOrder.status === 'Pedido confirmado') return 'Pedido confirmado';
      if (latestOrder.status === 'Pagado') return 'Pagado';
      if (latestOrder.status === 'Finalizado') return 'Finalizado';
    }

    // Check count status
    const providerCounts = stockCounts.filter((c) => c.providerId === providerId);
    if (providerCounts.length > 0) {
      const latestCount = [...providerCounts].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];

      if (latestCount.status === 'finalizado') return 'Conteo finalizado';
    }

    return 'Pendiente de conteo';
  };

  const getProviderActiveOrder = (providerId: string): Order | undefined => {
    const providerOrders = orders.filter((o) => o.providerId === providerId);
    if (providerOrders.length === 0) return undefined;
    return [...providerOrders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  };

  const getProviderActiveCount = (providerId: string): StockCount | undefined => {
    const providerCounts = stockCounts.filter((c) => c.providerId === providerId);
    if (providerCounts.length === 0) return undefined;
    return [...providerCounts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  };

  // Reorder provider priority
  const reorderProviderInDay = (providerId: string, day: DayOfWeek, direction: 'up' | 'down') => {
    setProviders((prev) => {
      const dayProviders = prev
        .filter((p) => (p.orderDays ? p.orderDays.includes(day) : true))
        .sort((a, b) => (a.priority || 0) - (b.priority || 0));

      const index = dayProviders.findIndex((p) => p.id === providerId);
      if (index === -1) return prev;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= dayProviders.length) return prev;

      // Swap priorities
      const curr = dayProviders[index];
      const target = dayProviders[targetIndex];

      return prev.map((p) => {
        if (p.id === curr.id) return { ...p, priority: target.priority };
        if (p.id === target.id) return { ...p, priority: curr.priority };
        return p;
      });
    });
    logAudit('Reordenar Proveedores', 'proveedor', providerId, `Mover prioridad en día ${day}`);
  };

  const moveProviderToPosition = (
    draggedProviderId: string,
    sourceDay: DayOfWeek,
    targetDay: DayOfWeek,
    targetProviderId?: string
  ) => {
    setProviders((prev) => {
      const dragged = prev.find((p) => p.id === draggedProviderId);
      if (!dragged) return prev;

      let updatedProviders = [...prev];

      // 1. Update orderDays if dragged across day columns
      if (sourceDay !== targetDay) {
        const currentOrderDays = dragged.orderDays || [];
        const newOrderDays = Array.from(
          new Set([...currentOrderDays.filter((d) => d !== sourceDay), targetDay])
        );
        updatedProviders = updatedProviders.map((p) =>
          p.id === draggedProviderId ? { ...p, orderDays: newOrderDays } : p
        );
      }

      // Helper to get priority for day
      const getPriority = (p: Provider, day: DayOfWeek) => {
        if (p.dayPriorities && p.dayPriorities[day] !== undefined) {
          return p.dayPriorities[day]!;
        }
        return p.priority || 999;
      };

      // 2. Reorder priorities within targetDay column independently
      const targetDayProviders = updatedProviders
        .filter((p) => (p.orderDays ? p.orderDays.includes(targetDay) : true))
        .sort((a, b) => getPriority(a, targetDay) - getPriority(b, targetDay));

      const draggedIdx = targetDayProviders.findIndex((p) => p.id === draggedProviderId);
      if (draggedIdx === -1) return updatedProviders;

      const [removed] = targetDayProviders.splice(draggedIdx, 1);

      let insertIdx = targetDayProviders.length;
      if (targetProviderId) {
        const targetIdx = targetDayProviders.findIndex((p) => p.id === targetProviderId);
        if (targetIdx !== -1) {
          insertIdx = targetIdx;
        }
      }

      targetDayProviders.splice(insertIdx, 0, removed);

      // Assign independent priority for targetDay ONLY
      const dayPriorityMap = new Map<string, number>();
      targetDayProviders.forEach((p, idx) => {
        dayPriorityMap.set(p.id, idx + 1);
      });

      return updatedProviders.map((p) => {
        if (dayPriorityMap.has(p.id)) {
          const newDayPriorities = {
            ...(p.dayPriorities || {}),
            [targetDay]: dayPriorityMap.get(p.id)!,
          };
          return { ...p, dayPriorities: newDayPriorities };
        }
        return p;
      });
    });

    logAudit('Drag & Drop Proveedor', 'proveedor', draggedProviderId, `Arrastrar a ${targetDay}`);
  };

  const updateProviderDays = (providerId: string, orderDays: DayOfWeek[], deliveryDays: DayOfWeek[]) => {
    setProviders((prev) =>
      prev.map((p) => (p.id === providerId ? { ...p, orderDays, deliveryDays } : p))
    );
    logAudit('Actualizar Días de Pedido/Entrega', 'proveedor', providerId);
  };

  // Save stock count
  const saveStockCount = (count: StockCount) => {
    setStockCounts((prev) => {
      const existingIdx = prev.findIndex((c) => c.id === count.id);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = count;
        return copy;
      }
      return [count, ...prev];
    });

    // If final, update stock in items
    if (count.status === 'finalizado') {
      setItems((prevItems) => {
        return prevItems.map((item) => {
          const countItem = count.items.find((ci) => ci.itemId === item.id);
          if (countItem) {
            return {
              ...item,
              currentStock: countItem.currentStock,
            };
          }
          return item;
        });
      });
    }

    logAudit(
      count.status === 'finalizado' ? 'Finalizar Conteo Stock' : 'Guardar Borrador Conteo',
      'conteo',
      count.id,
      `Conteo #${count.countNumber} para proveedor`
    );
  };

  // Create Order
  const createOrder = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
    logAudit('Crear Pedido', 'pedido', order.id, `Pedido #${order.orderNumber} por $${order.estimatedTotal.toLocaleString('es-AR')}`);
  };

  const updateOrderStatus = (orderId: string, newStatus: ProcessState) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    logAudit('Cambiar Estado de Pedido', 'pedido', orderId, `Nuevo estado: ${newStatus}`);
  };

  // Receive Goods (Ingreso de Mercadería)
  const receiveGoods = (
    orderId: string,
    receivedItems: { itemId: string; receivedQty: number; price?: number }[],
    notes: string,
    invoiceNumber: string,
    deliveryType: 'completa' | 'parcial',
    paymentStatus: Order['paymentStatus'],
    paymentDetails?: {
      amount: number;
      method: Order['paymentMethod'];
      account: string;
      receiptNumber?: string;
    }
  ) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    let receivedTotalSum = 0;

    // 1. Update items stock & check for price updates
    setItems((prevItems) =>
      prevItems.map((item) => {
        const rec = receivedItems.find((r) => r.itemId === item.id);
        if (!rec) return item;

        const newStock = item.currentStock + rec.receivedQty;
        let newPrice = item.currentPrice;

        if (rec.price && rec.price !== item.currentPrice) {
          newPrice = rec.price;

          // Log price history
          const oldP = item.currentPrice;
          const varPct = Number((((rec.price - oldP) / oldP) * 100).toFixed(2));
          const priceEntry: PriceHistoryEntry = {
            id: 'ph-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
            itemId: item.id,
            providerId: targetOrder.providerId,
            date: new Date().toISOString().split('T')[0],
            oldPrice: oldP,
            newPrice: rec.price,
            variationPercentage: varPct,
            userId: `usr-${userRole}`,
            orderId,
          };
          setPriceHistory((ph) => [priceEntry, ...ph]);
          logAudit('Actualización de Precio en Recepción', 'precio', item.id, `${item.name}: de $${oldP} a $${rec.price} (${varPct}%)`);
        }

        const itemTotal = rec.receivedQty * newPrice;
        receivedTotalSum += itemTotal;

        return {
          ...item,
          currentStock: newStock,
          currentPrice: newPrice,
        };
      })
    );

    // 2. Update order status
    const isPaid = paymentStatus === 'Pagado';

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;

        const updatedOrderItems = o.items.map((oi) => {
          const rec = receivedItems.find((r) => r.itemId === oi.itemId);
          return rec ? { ...oi, receivedQty: rec.receivedQty } : oi;
        });

        const finalStatus: ProcessState = isPaid
          ? 'Pagado'
          : paymentStatus === 'Pendiente de pago'
          ? 'Pendiente de pago'
          : 'Entregado / Ingresado';

        return {
          ...o,
          status: finalStatus,
          receptionDate: new Date().toISOString(),
          receptionNotes: notes,
          invoiceOrReceiptNumber: invoiceNumber,
          deliveryType,
          items: updatedOrderItems,
          finalReceivedTotal: receivedTotalSum || o.estimatedTotal,
          paymentStatus,
          paidAmount: isPaid ? (paymentDetails?.amount ?? receivedTotalSum) : (paymentDetails?.amount ?? 0),
          remainingDebt: isPaid ? 0 : (receivedTotalSum - (paymentDetails?.amount ?? 0)),
          paymentMethod: paymentDetails?.method,
          paymentAccount: paymentDetails?.account,
          paymentReceiptNumber: paymentDetails?.receiptNumber,
          paymentDate: isPaid ? new Date().toISOString() : undefined,
        };
      })
    );

    // 3. If paid, create expense record
    if (paymentDetails && paymentDetails.amount > 0) {
      const exp: ExpenseRecord = {
        id: 'exp-' + Date.now(),
        date: new Date().toISOString(),
        providerId: targetOrder.providerId,
        orderId,
        amount: paymentDetails.amount,
        account: paymentDetails.account,
        paymentMethod: paymentDetails.method || 'Efectivo',
        receiptNumber: paymentDetails.receiptNumber || invoiceNumber,
        notes: `Pago al ingresar pedido #${targetOrder.orderNumber}`,
      };
      setExpenses((prev) => [exp, ...prev]);
    }

    logAudit(
      'Ingreso de Mercadería Registrado',
      'recepcion',
      orderId,
      `Pedido #${targetOrder.orderNumber} - Entrega ${deliveryType}. Total: $${receivedTotalSum.toLocaleString('es-AR')}`
    );
  };

  // Record Payment
  const recordPayment = (
    orderId: string,
    amount: number,
    method: NonNullable<Order['paymentMethod']>,
    account: string,
    receiptNumber?: string
  ) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;

        const currentPaid = o.paidAmount || 0;
        const newPaidTotal = currentPaid + amount;
        const totalAmount = o.finalReceivedTotal || o.estimatedTotal;
        const newDebt = Math.max(0, totalAmount - newPaidTotal);
        const isFullyPaid = newDebt === 0;

        return {
          ...o,
          paymentStatus: isFullyPaid ? 'Pagado' : 'Pago parcial',
          status: isFullyPaid ? 'Pagado' : 'Pendiente de pago',
          paidAmount: newPaidTotal,
          remainingDebt: newDebt,
          paymentMethod: method,
          paymentAccount: account,
          paymentReceiptNumber: receiptNumber || o.paymentReceiptNumber,
          paymentDate: new Date().toISOString(),
        };
      })
    );

    const targetOrder = orders.find((o) => o.id === orderId);
    if (targetOrder) {
      const exp: ExpenseRecord = {
        id: 'exp-' + Date.now(),
        date: new Date().toISOString(),
        providerId: targetOrder.providerId,
        orderId,
        amount,
        account,
        paymentMethod: method,
        receiptNumber,
        notes: `Registro de pago a pedido #${targetOrder.orderNumber}`,
      };
      setExpenses((prev) => [exp, ...prev]);
    }

    logAudit('Registro de Pago', 'pago', orderId, `Pago de $${amount.toLocaleString('es-AR')} mediante ${method} (${account})`);
  };

  const updateReceptionHours = (config: ReceptionHoursConfig) => {
    setReceptionHours(config);
    logAudit('Actualizar Horarios de Recepción', 'proveedor', 'config-global');
  };

  const addOrUpdateProvider = (provider: Provider) => {
    setProviders((prev) => {
      const idx = prev.findIndex((p) => p.id === provider.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = provider;
        return copy;
      }
      return [...prev, provider];
    });
    logAudit('Guardar Proveedor', 'proveedor', provider.id, provider.name);
  };

  const addOrUpdateItem = (item: Item, providerRelations?: Partial<ProviderItemRelation>[]) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === item.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = item;
        return copy;
      }
      return [...prev, item];
    });

    if (providerRelations && providerRelations.length > 0) {
      setProviderItems((prev) => {
        let updated = [...prev];
        providerRelations.forEach((rel) => {
          if (!rel.providerId) return;
          const existingIdx = updated.findIndex(
            (r) => r.providerId === rel.providerId && r.itemId === item.id
          );
          if (existingIdx >= 0) {
            updated[existingIdx] = { ...updated[existingIdx], ...rel };
          } else {
            updated.push({
              id: 'pi-' + Date.now() + Math.random().toString(36).substring(2, 4),
              providerId: rel.providerId,
              itemId: item.id,
              supplierProductCode: rel.supplierProductCode || item.code,
              purchaseUnit: rel.purchaseUnit || item.purchaseUnit,
              packQuantity: rel.packQuantity || item.packQuantity,
              minStock: rel.minStock || item.minStock,
              maxStock: rel.maxStock || item.maxStock,
              lastPurchasePrice: rel.lastPurchasePrice || item.currentPrice,
              isPrimarySupplier: rel.isPrimarySupplier ?? true,
              active: true,
            });
          }
        });
        return updated;
      });
    }

    logAudit('Guardar Insumo', 'conteo', item.id, item.name);
  };

  const resetToDefaults = () => {
    setProviders(INITIAL_PROVIDERS);
    setItems(INITIAL_ITEMS);
    setProviderItems(INITIAL_PROVIDER_ITEMS);
    setOrders(INITIAL_ORDERS);
    setStockCounts([]);
    setReceptionHours(INITIAL_RECEPTION_HOURS);
    setPriceHistory(INITIAL_PRICE_HISTORY);
    setExpenses([]);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  return (
    <AppContext.Provider
      value={{
        userRole,
        setUserRole,
        users,
        addUser,
        updateUser,
        deleteUser,
        updateUserCustomPermissions,
        activeUserId,
        setActiveUserId,
        rolePermissions,
        hasPermission,
        updateRolePermissions,
        providers,
        addProvider,
        updateProvider,
        deleteProvider,
        items,
        providerItems,
        orders,
        stockCounts,
        receptionHours,
        priceHistory,
        expenses,
        auditLogs,
        branding,
        updateBranding,
        getProviderState,
        getProviderActiveOrder,
        getProviderActiveCount,
        reorderProviderInDay,
        moveProviderToPosition,
        updateProviderDays,
        saveStockCount,
        createOrder,
        updateOrderStatus,
        receiveGoods,
        recordPayment,
        updateReceptionHours,
        addOrUpdateProvider,
        addOrUpdateItem,
        resetToDefaults,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
