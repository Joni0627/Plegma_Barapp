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

interface AppContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  providers: Provider[];
  items: Item[];
  providerItems: ProviderItemRelation[];
  orders: Order[];
  stockCounts: StockCount[];
  receptionHours: ReceptionHoursConfig;
  priceHistory: PriceHistoryEntry[];
  expenses: ExpenseRecord[];
  auditLogs: AuditLog[];

  // Actions
  getProviderState: (providerId: string) => ProcessState;
  getProviderActiveOrder: (providerId: string) => Order | undefined;
  getProviderActiveCount: (providerId: string) => StockCount | undefined;
  reorderProviderInDay: (providerId: string, day: DayOfWeek, direction: 'up' | 'down') => void;
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

const LOCAL_STORAGE_KEY = 'gastronomic_erp_state_v1';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [providers, setProviders] = useState<Provider[]>(INITIAL_PROVIDERS);
  const [items, setItems] = useState<Item[]>(INITIAL_ITEMS);
  const [providerItems, setProviderItems] = useState<ProviderItemRelation[]>(INITIAL_PROVIDER_ITEMS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [stockCounts, setStockCounts] = useState<StockCount[]>([]);
  const [receptionHours, setReceptionHours] = useState<ReceptionHoursConfig>(INITIAL_RECEPTION_HOURS);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryEntry[]>(INITIAL_PRICE_HISTORY);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // Load from LocalStorage
  useEffect(() => {
    try {
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
        .filter((p) => p.orderDays.includes(day))
        .sort((a, b) => a.priority - b.priority);

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
        providers,
        items,
        providerItems,
        orders,
        stockCounts,
        receptionHours,
        priceHistory,
        expenses,
        auditLogs,
        getProviderState,
        getProviderActiveOrder,
        getProviderActiveCount,
        reorderProviderInDay,
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
