import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Item, Provider } from '../types';
import {
  Package,
  Plus,
  Search,
  SlidersHorizontal,
  AlertTriangle,
  Edit2,
  CheckCircle2,
  Building2,
  TrendingUp,
  X,
} from 'lucide-react';

export const ItemMasterView: React.FC = () => {
  const { items, providers, providerItems, addOrUpdateItem, userRole } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [selectedItemDetail, setSelectedItemDetail] = useState<Item | null>(null);

  // New Item Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Almacén');
  const [formBrand, setFormBrand] = useState('');
  const [formStorageUnit, setFormStorageUnit] = useState('kg');
  const [formPurchaseUnit, setFormPurchaseUnit] = useState('Bolsa 20kg');
  const [formPackQty, setFormPackQty] = useState('20');
  const [formMinStock, setFormMinStock] = useState('20');
  const [formMaxStock, setFormMaxStock] = useState('100');
  const [formPrice, setFormPrice] = useState('1500');
  const [formLocation, setFormLocation] = useState('Depósito Seco');
  const [formProviderId, setFormProviderId] = useState(providers[0]?.id || '');

  const categories = Array.from(new Set(items.map((i) => i.category)));

  const filteredItems = items.filter((item) => {
    if (selectedCategory !== 'todas' && item.category !== selectedCategory) return false;
    if (showLowStockOnly && item.currentStock >= item.minStock) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q) || item.brand.toLowerCase().includes(q);
      const matchCode = item.code.toLowerCase().includes(q);
      if (!matchName && !matchCode) return false;
    }
    return true;
  });

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const newItem: Item = {
      id: 'item-' + Date.now(),
      code: 'INS-' + Math.floor(100 + Math.random() * 900),
      name: formName,
      description: formName,
      category: formCategory,
      subcategory: formCategory,
      brand: formBrand || 'Genérica',
      storageUnit: formStorageUnit,
      purchaseUnit: formPurchaseUnit,
      packQuantity: Number(formPackQty) || 1,
      location: formLocation,
      currentStock: Number(formMinStock),
      minStock: Number(formMinStock),
      maxStock: Number(formMaxStock),
      currentPrice: Number(formPrice),
      active: true,
    };

    addOrUpdateItem(newItem, [
      {
        providerId: formProviderId,
        supplierProductCode: newItem.code,
        purchaseUnit: newItem.purchaseUnit,
        packQuantity: newItem.packQuantity,
        minStock: newItem.minStock,
        maxStock: newItem.maxStock,
        lastPurchasePrice: newItem.currentPrice,
        isPrimarySupplier: true,
      },
    ]);

    alert('Insumo registrado correctamente.');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-orange-500" />
            <span>Maestro General de Insumos y Artículos</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Catálogo completo de materia prima, stock de seguridad y relación con proveedores.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar insumo por nombre o código..."
            className="w-full sm:w-56 pl-3 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="todas">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
              showLowStockOnly
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-slate-50 text-slate-700 border-slate-300'
            }`}
          >
            ⚠️ Bajo Mínimo
          </button>

          {(userRole === 'admin' || userRole === 'compras') && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 text-white font-semibold text-xs hover:bg-orange-700 shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Insumo</span>
            </button>
          )}
        </div>
      </div>

      {/* Item Table Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                <th className="p-3">Código</th>
                <th className="p-3">Insumo / Marca</th>
                <th className="p-3">Categoría</th>
                <th className="p-3">Ubicación Depósito</th>
                <th className="p-3 text-center">Stock Actual</th>
                <th className="p-3 text-center">Mín / Máx</th>
                <th className="p-3 text-right">Precio Vigente</th>
                <th className="p-3 text-center">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => {
                const isLow = item.currentStock < item.minStock;
                const isOut = item.currentStock === 0;

                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-mono font-bold text-slate-500">{item.code}</td>
                    <td className="p-3">
                      <span className="font-bold text-slate-900 block">{item.name}</span>
                      <span className="text-[10px] text-slate-400">{item.brand}</span>
                    </td>
                    <td className="p-3 text-slate-600">{item.category}</td>
                    <td className="p-3 text-slate-600">{item.location}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`font-black px-2.5 py-0.5 rounded-full text-xs ${
                          isOut
                            ? 'bg-rose-100 text-rose-800'
                            : isLow
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.currentStock} {item.storageUnit}
                      </span>
                    </td>
                    <td className="p-3 text-center text-slate-500">
                      {item.minStock} / {item.maxStock} {item.storageUnit}
                    </td>
                    <td className="p-3 text-right font-black text-slate-900">
                      $ {item.currentPrice.toLocaleString('es-AR')} / {item.storageUnit}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setSelectedItemDetail(item)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition"
                      >
                        Ver Ficha
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ITEM DETAIL MODAL */}
      {selectedItemDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono text-slate-400 font-bold">
                  {selectedItemDetail.code}
                </span>
                <h3 className="font-black text-lg text-slate-900">{selectedItemDetail.name}</h3>
              </div>
              <button
                onClick={() => setSelectedItemDetail(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-400 block font-medium">Categoría:</span>
                <span className="font-bold text-slate-900">{selectedItemDetail.category}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-400 block font-medium">Marca:</span>
                <span className="font-bold text-slate-900">{selectedItemDetail.brand}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-400 block font-medium">Ubicación Depósito:</span>
                <span className="font-bold text-slate-900">{selectedItemDetail.location}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-400 block font-medium">Unidad de Compra:</span>
                <span className="font-bold text-slate-900">{selectedItemDetail.purchaseUnit}</span>
              </div>
            </div>

            {/* Providers for this item */}
            <div className="pt-2 border-t border-slate-100">
              <h4 className="font-bold text-xs text-slate-700 mb-2">Proveedores Habilitados:</h4>
              <div className="space-y-1.5 text-xs">
                {providerItems
                  .filter((pi) => pi.itemId === selectedItemDetail.id && pi.active)
                  .map((pi) => {
                    const p = providers.find((prov) => prov.id === pi.providerId);
                    return (
                      <div
                        key={pi.id}
                        className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-200"
                      >
                        <span className="font-bold text-slate-900">{p?.name || 'Proveedor'}</span>
                        <span className="font-extrabold text-orange-600">
                          $ {pi.lastPurchasePrice.toLocaleString('es-AR')}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedItemDetail(null)}
                className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW ITEM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveItem}
            className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-lg space-y-4 border border-slate-200"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900">Registrar Nuevo Insumo</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Nombre del Insumo:</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ej.: Mozzarella Barra 4kg"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Categoría:</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="Lácteos">Lácteos</option>
                  <option value="Almacén">Almacén</option>
                  <option value="Carnicería">Carnicería</option>
                  <option value="Verdulería">Verdulería</option>
                  <option value="Bebidas">Bebidas</option>
                  <option value="Avícola">Avícola</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Marca:</label>
                <input
                  type="text"
                  value={formBrand}
                  onChange={(e) => setFormBrand(e.target.value)}
                  placeholder="Ej.: La Serenísima"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Stock Mínimo:</label>
                <input
                  type="number"
                  value={formMinStock}
                  onChange={(e) => setFormMinStock(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Stock Máximo:</label>
                <input
                  type="number"
                  value={formMaxStock}
                  onChange={(e) => setFormMaxStock(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Precio Referencia ($):</label>
                <input
                  type="number"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Proveedor Principal:</label>
                <select
                  value={formProviderId}
                  onChange={(e) => setFormProviderId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-100 font-bold text-xs rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-orange-600 text-white font-extrabold text-xs rounded-xl hover:bg-orange-700"
              >
                Guardar Insumo
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
