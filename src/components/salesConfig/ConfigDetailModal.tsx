import React from 'react';
import { X, MapPin, ShoppingBag, Layers, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { RestaurantTableConfig, SaleTypeConfig, SiteConfig } from '../../types';

interface ConfigDetailModalProps {
  item: RestaurantTableConfig | SaleTypeConfig | SiteConfig;
  type: 'table' | 'saleType' | 'site';
  onClose: () => void;
}

export const ConfigDetailModal: React.FC<ConfigDetailModalProps> = ({ item, type, onClose }) => {
  const isTable = type === 'table';
  const isSaleType = type === 'saleType';
  const isSite = type === 'site';

  const tableItem = isTable ? (item as RestaurantTableConfig) : null;
  const saleTypeItem = isSaleType ? (item as SaleTypeConfig) : null;
  const siteItem = isSite ? (item as SiteConfig) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl space-y-0">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              {isTable && <MapPin className="w-5 h-5" />}
              {isSaleType && <ShoppingBag className="w-5 h-5" />}
              {isSite && <Layers className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-base">
                Detalle de {isTable ? 'Mesa' : isSaleType ? 'Tipo de Venta' : 'Sitio / Sector'}
              </h3>
              <p className="text-xs text-slate-400">Inspección completa de parámetros y estado</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Status Banner */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Entidad</p>
              <p className="font-black text-slate-900 text-sm">
                {isTable ? tableItem?.number : isSaleType ? saleTypeItem?.name : siteItem?.name}
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black border ${
                item.active
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-rose-100 text-rose-800 border-rose-300'
              }`}
            >
              {item.active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
              {item.active ? 'Habilitado' : 'Inactivo'}
            </span>
          </div>

          {/* Table Details */}
          {tableItem && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Capacidad Pax</p>
                  <p className="font-black text-slate-900">{tableItem.capacity} personas</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Estado Operativo</p>
                  <p className={`font-black ${tableItem.isFree ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {tableItem.isFree ? 'Libre (Sí)' : 'Ocupada / No Libre'}
                  </p>
                </div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Sitio Asignado</p>
                <p className="font-bold text-slate-800">{tableItem.siteName}</p>
              </div>
              {tableItem.name && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Nombre Descriptivo</p>
                  <p className="text-slate-800">{tableItem.name}</p>
                </div>
              )}
            </div>
          )}

          {/* Sale Type Details */}
          {saleTypeItem && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Venta en Salón</p>
                  <p className="font-bold text-slate-900">{saleTypeItem.isSalonSale ? 'Sí' : 'No'}</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Requiere Mesa</p>
                  <p className="font-bold text-slate-900">{saleTypeItem.requiresTable ? 'Sí' : 'No'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Estado Inicial</p>
                  <p className="font-bold text-slate-800">{saleTypeItem.initialOrderStatus}</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Estado Final</p>
                  <p className="font-bold text-emerald-700">{saleTypeItem.finalOrderStatus}</p>
                </div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Impresora Comanda</p>
                <p className="font-bold text-slate-800">{saleTypeItem.kitchenPrinter || 'Sin Impresora Seleccionada'}</p>
              </div>
            </div>
          )}

          {/* Site Details */}
          {siteItem && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Orden Visual de Presentación</p>
                <p className="font-black text-slate-900 text-sm">Orden #{siteItem.order}</p>
              </div>
              {siteItem.description && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Descripción</p>
                  <p className="text-slate-800">{siteItem.description}</p>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
