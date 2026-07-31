import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Provider, DayOfWeek, ProcessState } from '../types';
import {
  Calendar,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  ClipboardList,
  CheckCircle2,
  PackageCheck,
  DollarSign,
  Truck,
  ArrowRight,
  SlidersHorizontal,
  Plus,
} from 'lucide-react';

interface KanbanBoardProps {
  onSelectProvider: (provider: Provider) => void;
  onStartStockCount: (provider: Provider) => void;
  onStartOrderReview: (provider: Provider) => void;
  onReceiveGoods: (provider: Provider) => void;
  onRecordPayment: (provider: Provider) => void;
  onNewProvider: () => void;
}

const DAYS: DayOfWeek[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

// Spanish current day helper
const getCurrentDayName = (): DayOfWeek => {
  const dayIndex = new Date().getDay(); // 0 is Sun, 1 is Mon...
  const map: DayOfWeek[] = ['Sábado', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return map[dayIndex] || 'Lunes';
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  onSelectProvider,
  onStartStockCount,
  onStartOrderReview,
  onReceiveGoods,
  onRecordPayment,
  onNewProvider,
}) => {
  const {
    providers,
    getProviderState,
    getProviderActiveOrder,
    reorderProviderInDay,
    userRole,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRubro, setSelectedRubro] = useState<string>('todos');
  const [selectedDayMobile, setSelectedDayMobile] = useState<DayOfWeek>(getCurrentDayName());

  const currentDay = getCurrentDayName();

  // Extract unique rubros for filter
  const rubros = Array.from(new Set(providers.map((p) => p.rubro).filter(Boolean))) as string[];

  // Helper for status badge colors & text
  const getStatusBadge = (state: ProcessState) => {
    switch (state) {
      case 'Pendiente de conteo':
        return {
          bg: 'bg-amber-100 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
          label: 'Pendiente de Conteo',
          action: 'Realizar Conteo',
          icon: ClipboardList,
          color: 'text-amber-600',
        };
      case 'Conteo finalizado':
        return {
          bg: 'bg-blue-100 text-blue-800 border-blue-200',
          dot: 'bg-blue-500',
          label: 'Conteo Finalizado',
          action: 'Revisar Pedido Sugerido',
          icon: CheckCircle2,
          color: 'text-blue-600',
        };
      case 'Pedido confirmado':
        return {
          bg: 'bg-purple-100 text-purple-800 border-purple-200',
          dot: 'bg-purple-500',
          label: 'Pedido Confirmado',
          action: 'Ver Documento Pedido',
          icon: Truck,
          color: 'text-purple-600',
        };
      case 'Pendiente de entrega':
        return {
          bg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          dot: 'bg-indigo-500',
          label: 'Pendiente de Entrega',
          action: 'Registrar Ingreso Mercadería',
          icon: Truck,
          color: 'text-indigo-600',
        };
      case 'Entregado / Ingresado':
        return {
          bg: 'bg-teal-100 text-teal-800 border-teal-200',
          dot: 'bg-teal-500',
          label: 'Ingresado en Stock',
          action: 'Registrar Pago',
          icon: PackageCheck,
          color: 'text-teal-600',
        };
      case 'Pendiente de pago':
        return {
          bg: 'bg-rose-100 text-rose-800 border-rose-200',
          dot: 'bg-rose-500',
          label: 'Pendiente de Pago',
          action: 'Saldar Deuda / Pago',
          icon: DollarSign,
          color: 'text-rose-600',
        };
      case 'Pagado':
      case 'Finalizado':
        return {
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
          label: 'Finalizado / Pagado',
          action: 'Ver Historial',
          icon: CheckCircle2,
          color: 'text-emerald-600',
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-800 border-slate-200',
          dot: 'bg-slate-500',
          label: state,
          action: 'Ver Ficha',
          icon: ArrowRight,
          color: 'text-slate-600',
        };
    }
  };

  // Filter providers function
  const filterProvidersForDay = (day: DayOfWeek) => {
    return providers
      .filter((p) => p.active && (p.orderDays ? p.orderDays.includes(day) : true))
      .filter((p) => {
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchName = (p.name || '').toLowerCase().includes(q) || (p.commercialName || '').toLowerCase().includes(q);
          const matchRubro = (p.rubro || '').toLowerCase().includes(q);
          if (!matchName && !matchRubro) return false;
        }
        if (selectedRubro !== 'todos' && p.rubro !== selectedRubro) return false;
        return true;
      })
      .sort((a, b) => (a.priority || 0) - (b.priority || 0));
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Banner */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-orange-500" />
            <span>Tablero Semanal de Proveedores</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Planificación diaria de controles, conteos de stock y pedidos. Día de hoy: {' '}
            <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
              {currentDay}
            </span>
          </p>
        </div>

        {/* Filters & Add Provider button */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar proveedor o rubro..."
              className="w-full sm:w-56 pl-3 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Rubro Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 border border-slate-300 rounded-xl text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedRubro}
              onChange={(e) => setSelectedRubro(e.target.value)}
              className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="todos">Todos los rubros</option>
              {rubros.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Add Provider Button (Admin only) */}
          {(userRole === 'admin' || userRole === 'compras') && (
            <button
              onClick={onNewProvider}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 text-white font-semibold text-xs hover:bg-orange-700 shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Proveedor</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Day Switcher Tabs (Only visible on small screens) */}
      <div className="flex lg:hidden overflow-x-auto gap-2 pb-1 scrollbar-none">
        {DAYS.map((day) => {
          const isToday = day === currentDay;
          const count = filterProvidersForDay(day).length;
          return (
            <button
              key={day}
              onClick={() => setSelectedDayMobile(day)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                selectedDayMobile === day
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{day}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                  selectedDayMobile === day
                    ? 'bg-orange-500 text-white'
                    : isToday
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Kanban Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-start">
        {DAYS.map((day) => {
          const isToday = day === currentDay;
          const dayProviders = filterProvidersForDay(day);

          // On mobile, show only the selected day column; on desktop show all 6 columns
          const isMobileHidden = selectedDayMobile !== day;

          return (
            <div
              key={day}
              className={`flex flex-col bg-slate-100/90 rounded-2xl p-3 border ${
                isToday
                  ? 'border-orange-400 bg-orange-50/20 ring-2 ring-orange-400/20'
                  : 'border-slate-200'
              } ${isMobileHidden ? 'hidden lg:flex' : 'flex'}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/80">
                <div className="flex items-center gap-2">
                  <h3
                    className={`font-extrabold text-sm ${
                      isToday ? 'text-orange-700' : 'text-slate-800'
                    }`}
                  >
                    {day}
                  </h3>
                  {isToday && (
                    <span className="bg-orange-500 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded tracking-wider shadow-xs">
                      HOY
                    </span>
                  )}
                </div>
                <span className="text-xs font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                  {dayProviders.length}
                </span>
              </div>

              {/* Provider Cards Container */}
              <div className="space-y-3 min-h-[300px]">
                {dayProviders.length === 0 ? (
                  <div className="p-4 text-center rounded-xl border border-dashed border-slate-300 text-xs text-slate-400">
                    Sin pedidos previstos para el {day.toLowerCase()}
                  </div>
                ) : (
                  dayProviders.map((provider, index) => {
                    const state = getProviderState(provider.id);
                    const activeOrder = getProviderActiveOrder(provider.id);
                    const badgeInfo = getStatusBadge(state);
                    const BadgeIcon = badgeInfo.icon;

                    return (
                      <div
                        key={`${provider.id}-${day}`}
                        className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200/90 hover:shadow-md hover:border-slate-300 transition-all cursor-pointer relative group flex flex-col justify-between"
                        onClick={() => onSelectProvider(provider)}
                      >
                        {/* Top Card Row: Priority, Logo & Reorder Controls */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {/* Priority Rank Pill */}
                              <span
                                className="w-5 h-5 rounded-full bg-slate-900 text-white font-extrabold text-[10px] flex items-center justify-center shadow-xs"
                                title={`Prioridad ${provider.priority}`}
                              >
                                {index + 1}
                              </span>

                              {/* Rubro Badge */}
                              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                                {provider.rubro}
                              </span>
                            </div>

                            {/* Reorder Buttons (Admin/Compras) */}
                            {(userRole === 'admin' || userRole === 'compras') && (
                              <div
                                className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  disabled={index === 0}
                                  onClick={() => reorderProviderInDay(provider.id, day, 'up')}
                                  className="p-1 hover:bg-slate-100 rounded text-slate-600 disabled:opacity-20"
                                  title="Mover arriba"
                                >
                                  <ChevronUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  disabled={index === dayProviders.length - 1}
                                  onClick={() => reorderProviderInDay(provider.id, day, 'down')}
                                  className="p-1 hover:bg-slate-100 rounded text-slate-600 disabled:opacity-20"
                                  title="Mover abajo"
                                >
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Provider Info Header */}
                          <div className="flex items-start gap-2.5 my-1.5">
                            {provider.logoUrl ? (
                              <img
                                src={provider.logoUrl}
                                alt={provider.name}
                                className="w-10 h-10 rounded-lg object-cover border border-slate-200 shadow-xs shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-700 font-bold flex items-center justify-center border border-orange-200 shrink-0">
                                {provider.name.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div className="overflow-hidden">
                              <h4 className="font-bold text-xs text-slate-900 leading-tight truncate">
                                {provider.name}
                              </h4>
                              <p className="text-[11px] text-slate-500 truncate">
                                {provider.contactName} • {provider.phone}
                              </p>
                            </div>
                          </div>

                          {/* Cutoff & Delivery Schedule info */}
                          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                            <span>
                              Cierre:{' '}
                              <strong className="text-slate-800">{provider.cutoffTime} hs</strong>
                            </span>
                            <span>
                              Entrega:{' '}
                              <strong className="text-slate-800">
                                {provider.deliveryDays.join(', ')}
                              </strong>
                            </span>
                          </div>

                          {/* Financial or Order Amount preview if active order exists */}
                          {activeOrder && (
                            <div className="mt-2 bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                              <span className="text-slate-500 font-medium">
                                #{activeOrder.orderNumber}:
                              </span>
                              <strong className="text-slate-900 font-bold">
                                ${' '}
                                {(activeOrder.finalReceivedTotal || activeOrder.estimatedTotal).toLocaleString(
                                  'es-AR'
                                )}
                              </strong>
                            </div>
                          )}

                          {/* Process State Badge */}
                          <div className="mt-3">
                            <span
                              className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-md border ${badgeInfo.bg} w-full justify-center`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${badgeInfo.dot}`} />
                              <span>{badgeInfo.label}</span>
                            </span>
                          </div>
                        </div>

                        {/* Primary Recommended Action Button */}
                        <div className="mt-3 pt-2.5 border-t border-slate-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (state === 'Pendiente de conteo') {
                                onStartStockCount(provider);
                              } else if (state === 'Conteo finalizado') {
                                onStartOrderReview(provider);
                              } else if (
                                state === 'Pedido confirmado' ||
                                state === 'Pendiente de entrega'
                              ) {
                                onReceiveGoods(provider);
                              } else if (
                                state === 'Entregado / Ingresado' ||
                                state === 'Pendiente de pago'
                              ) {
                                onRecordPayment(provider);
                              } else {
                                onSelectProvider(provider);
                              }
                            }}
                            className="w-full flex items-center justify-center gap-1.5 bg-slate-900 text-white hover:bg-orange-600 text-xs font-bold py-1.5 px-2.5 rounded-lg transition-colors shadow-xs"
                          >
                            <BadgeIcon className="w-3.5 h-3.5" />
                            <span>{badgeInfo.action}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
