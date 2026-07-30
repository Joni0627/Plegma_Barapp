import { Provider, Item, ProviderItemRelation, Order, ReceptionHoursConfig, PriceHistoryEntry, AuditLog } from '../types';

export const INITIAL_RECEPTION_HOURS: ReceptionHoursConfig = {
  morningStart: '08:00',
  morningEnd: '12:00',
  morningActive: true,
  afternoonStart: '16:00',
  afternoonEnd: '19:00',
  afternoonActive: true,
  additionalNotes: '',
};

export const INITIAL_PROVIDERS: Provider[] = [];

export const INITIAL_ITEMS: Item[] = [];

export const INITIAL_PROVIDER_ITEMS: ProviderItemRelation[] = [];

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_PRICE_HISTORY: PriceHistoryEntry[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
