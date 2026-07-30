import React from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  DollarSign,
  AlertTriangle,
  PackageCheck,
  Building2,
  TrendingDown,
  BarChart3,
  Calendar,
} from 'lucide-react';

export const PurchasingDashboard: React.FC = () => {
  const { orders, providers, items, priceHistory, expenses } = useApp();

  // Financial aggregates
  const totalPurchases = orders.reduce(
    (sum, o) => sum + (o.finalReceivedTotal || o.estimatedTotal),
    0
  );
  const totalPaid = orders.reduce((sum, o) => sum + (o.paidAmount || 0), 0);
  const totalDebt = orders.reduce((sum, o) => sum + (o.remainingDebt || 0), 0);

  // Items below min stock
  const lowStockItems = items.filter((i) => i.currentStock < i.minStock);

  // Supplier debt breakdown
  const debtByProviderMap: { [providerId: string]: number } = {};
  orders.forEach((o) => {
    if (o.remainingDebt && o.remainingDebt > 0) {
      debtByProviderMap[o.providerId] = (debtByProviderMap[o.providerId] || 0) + o.remainingDebt;
    }
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-orange-500" />
            <span>Dashboard de Compras, Inflación y Deuda</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Métricas ejecutivas de gastos gastronómicos, variación de precios de proveedores e insumos críticos.
          </p>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
            Total Compras Período
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            $ {totalPurchases.toLocaleString('es-AR')}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {orders.length} pedidos registrados
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
            Efectivamente Pagado
          </span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            $ {totalPaid.toLocaleString('es-AR')}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
            {Math.round((totalPaid / Math.max(1, totalPurchases)) * 100)}% cancelado
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-2xs">
          <span className="text-xs text-rose-600 font-bold uppercase tracking-wider block">
            Deuda en Cuenta Corriente
          </span>
          <div className="text-2xl font-black text-rose-700 mt-1">
            $ {totalDebt.toLocaleString('es-AR')}
          </div>
          <span className="text-[11px] text-rose-600 font-semibold mt-1 block">
            A pagar a proveedores
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-2xs">
          <span className="text-xs text-amber-700 font-bold uppercase tracking-wider block">
            Insumos Bajo Mínimo
          </span>
          <div className="text-2xl font-black text-amber-900 mt-1">
            {lowStockItems.length} insumos
          </div>
          <span className="text-[11px] text-amber-700 font-semibold mt-1 block">
            Requieren reposición urgente
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supplier Debt Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="w-4 h-4 text-orange-600" />
            <span>Desglose de Deuda por Proveedor</span>
          </h3>

          <div className="space-y-3">
            {Object.keys(debtByProviderMap).length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                ¡Felicitaciones! No existen deudas pendientes con proveedores.
              </div>
            ) : (
              Object.entries(debtByProviderMap).map(([provId, debtAmount]) => {
                const prov = providers.find((p) => p.id === provId);
                const pct = Math.min(100, Math.round((debtAmount / Math.max(1, totalDebt)) * 100));

                return (
                  <div key={provId} className="space-y-1 text-xs">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-800">{prov?.name || 'Proveedor'}</span>
                      <span className="text-rose-600">$ {debtAmount.toLocaleString('es-AR')}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top Price Hikes / Inflation Log */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <TrendingUp className="w-4 h-4 text-orange-600" />
            <span>Mayores Aumentos Registrados (Ajuste Inflacionario)</span>
          </h3>

          <div className="space-y-2.5 text-xs">
            {priceHistory.length === 0 ? (
              <div className="p-6 text-center text-slate-400">Sin historial de aumento de precios.</div>
            ) : (
              priceHistory.slice(0, 5).map((ph) => {
                const itemObj = items.find((i) => i.id === ph.itemId);
                const prov = providers.find((p) => p.id === ph.providerId);

                return (
                  <div
                    key={ph.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">{itemObj?.name || 'Insumo'}</span>
                      <span className="text-[10px] text-slate-500">
                        {prov?.name} • {ph.date}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        +{ph.variationPercentage}%
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        ${ph.oldPrice} → ${ph.newPrice}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
