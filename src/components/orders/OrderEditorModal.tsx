import React, { useState } from 'react';
import { X, Plus, Trash2, ShoppingCart, Save, AlertTriangle, Layers, Tag } from 'lucide-react';
import { Button } from '../ui/Button';
import { FormField, SelectInput, TextInput } from '../ui/Form';
import { SaleOrder, SaleOrderItem, SaleTypeConfig, RestaurantTableConfig, Client } from '../../types';
import { SALE_PRODUCT_CATALOG, SaleProductCatalogItem } from '../../data/ordersData';

interface OrderEditorModalProps {
  orderToEdit?: SaleOrder | null;
  saleTypes: SaleTypeConfig[];
  tables: RestaurantTableConfig[];
  clients: Client[];
  defaultSaleTypeId?: string;
  defaultTableId?: string;
  onClose: () => void;
  onSave: (data: any) => { success: boolean; message: string; order?: SaleOrder };
}

const fmt = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n);

export const OrderEditorModal: React.FC<OrderEditorModalProps> = ({
  orderToEdit,
  saleTypes,
  tables,
  clients,
  defaultSaleTypeId,
  defaultTableId,
  onClose,
  onSave,
}) => {
  const activeSaleTypes = saleTypes.filter((st) => st.active);
  const activeTables = tables.filter((t) => t.active);

  const [saleTypeId, setSaleTypeId] = useState(
    orderToEdit?.saleTypeId || defaultSaleTypeId || activeSaleTypes[0]?.id || ''
  );
  const [clientId, setClientId] = useState(orderToEdit?.clientId || clients[0]?.id || '');
  const [tableId, setTableId] = useState(orderToEdit?.tableId || defaultTableId || activeTables[0]?.id || '');
  const [generalNotes, setGeneralNotes] = useState(orderToEdit?.generalNotes || '');
  const [items, setItems] = useState<SaleOrderItem[]>(orderToEdit?.items || []);
  const [error, setError] = useState('');

  // Selected Product Picker state
  const [selectedProdId, setSelectedProdId] = useState(SALE_PRODUCT_CATALOG[0]?.id || '');
  const [itemQuantity, setItemQuantity] = useState('1');
  const [selectedSide, setSelectedSide] = useState('');
  const [lineComment, setLineComment] = useState('');

  const currentSaleType = saleTypes.find((st) => st.id === saleTypeId);
  const selectedProduct = SALE_PRODUCT_CATALOG.find((p) => p.id === selectedProdId);
  const selectedClient = clients.find((c) => c.id === clientId);

  // CP03: Cobro Diferenciado si el cliente lo requiere
  const isDifferentiatedClient = selectedClient?.differentiatedPricing || false;

  // Options for SelectInputs
  const saleTypeOptions = activeSaleTypes.map((st) => ({
    value: st.id,
    label: `${st.name} ${st.requiresTable ? '(Mesa Req.)' : ''}`,
  }));

  const tableOptions = activeTables.map((t) => ({
    value: t.id,
    label: `${t.number} (${t.siteName} - Cap: ${t.capacity} pax)`,
  }));

  const clientOptions = clients.map((c) => ({
    value: c.id,
    label: `${c.name} ${c.differentiatedPricing ? '[Cobro Dif. Costo]' : ''}`,
  }));

  const productOptions = SALE_PRODUCT_CATALOG.map((p) => {
    const priceToDisplay = isDifferentiatedClient ? p.costPrice : p.unitPrice;
    return {
      value: p.id,
      label: `${p.name} - ${fmt(priceToDisplay)} (${p.category})`,
    };
  });

  // Dynamic recalculation of total (A04)
  const totalAmount = items.reduce((acc, i) => acc + i.subtotal, 0);

  const handleAddItem = () => {
    if (!selectedProduct) return;
    const qty = parseInt(itemQuantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setError('La cantidad debe ser mayor a 0.');
      return;
    }

    // R09: Acompañamiento Obligatorio
    if (selectedProduct.requiresSideOption && (!selectedSide || !selectedSide.trim())) {
      setError(`El producto "${selectedProduct.name}" requiere seleccionar un acompañamiento obligatorio (R09).`);
      return;
    }

    const price = isDifferentiatedClient ? selectedProduct.costPrice : selectedProduct.unitPrice;
    const newItem: SaleOrderItem = {
      id: 'item-' + Date.now() + Math.random(),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      category: selectedProduct.category,
      unitPrice: price,
      costPrice: selectedProduct.costPrice,
      quantity: qty,
      sideOption: selectedProduct.requiresSideOption ? selectedSide : undefined,
      requiresSideOption: selectedProduct.requiresSideOption,
      subtotal: price * qty,
      lineComment: lineComment.trim() || undefined,
    };

    setItems([...items, newItem]);
    setLineComment('');
    setError('');
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter((i) => i.id !== itemId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setError('Debe agregar al menos 1 producto al pedido.');
      return;
    }
    if (currentSaleType?.requiresTable && (!tableId || !tableId.trim())) {
      setError(`El canal "${currentSaleType.name}" exige seleccionar una mesa válida (R03).`);
      return;
    }
    if (currentSaleType?.requiresClient && (!clientId || !clientId.trim())) {
      setError(`El canal "${currentSaleType.name}" exige asociar un cliente (R04).`);
      return;
    }

    const targetTable = tables.find((t) => t.id === tableId);

    const payload = {
      ...(orderToEdit ? orderToEdit : {}),
      saleTypeId,
      saleTypeName: currentSaleType?.name || 'Salón',
      clientId,
      clientName: selectedClient?.name || 'Cliente',
      clientPhone: selectedClient?.phone,
      tableId: currentSaleType?.requiresTable ? tableId : undefined,
      tableName: currentSaleType?.requiresTable ? targetTable?.number : undefined,
      generalNotes: generalNotes.trim() || undefined,
      items,
      totalAmount,
    };

    const res = onSave(payload);
    if (!res.success) {
      setError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl space-y-0 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">
                {orderToEdit ? `Editar Pedido #${orderToEdit.orderNumber}` : 'Carga Rápida de Pedido'}
              </h3>
              <p className="text-xs text-slate-400">Selección de productos, acompañamientos y recálculo automático</p>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Header selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField label="Tipo de Venta / Canal" required hint="Define requerimientos (R03/R04)">
              <SelectInput
                options={saleTypeOptions}
                value={saleTypeId}
                onChange={(e) => setSaleTypeId(e.target.value)}
              />
            </FormField>

            <FormField label="Cliente" required hint="Cliente asignado ([EXT] Clientes)">
              <SelectInput
                options={clientOptions}
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
              />
            </FormField>

            {currentSaleType?.requiresTable && (
              <FormField label="Mesa Asignada" required hint="[CFG] Mesas activas (R03)">
                <SelectInput
                  options={tableOptions}
                  value={tableId}
                  onChange={(e) => setTableId(e.target.value)}
                />
              </FormField>
            )}
          </div>

          {/* Differentiated pricing badge CP03 */}
          {isDifferentiatedClient && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-bold flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-600" />
              <span>Cliente con Cobro Diferenciado (CP03): Los artículos se valorizan a precio de Costo.</span>
            </div>
          )}

          {/* Add Product Section */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-indigo-600" /> Agregar Producto al Detalle
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <FormField label="Producto del Catálogo">
                  <SelectInput
                    options={productOptions}
                    value={selectedProdId}
                    onChange={(e) => {
                      setSelectedProdId(e.target.value);
                      const prod = SALE_PRODUCT_CATALOG.find((p) => p.id === e.target.value);
                      if (prod?.availableSides && prod.availableSides.length > 0) {
                        setSelectedSide(prod.availableSides[0]);
                      } else {
                        setSelectedSide('');
                      }
                    }}
                  />
                </FormField>
              </div>

              <FormField label="Cantidad">
                <TextInput
                  type="number"
                  min="1"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(e.target.value)}
                />
              </FormField>

              <div className="flex items-end">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={handleAddItem}
                >
                  Agregar Línea
                </Button>
              </div>
            </div>

            {/* Side dish selection if required (R09) */}
            {selectedProduct?.requiresSideOption && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <FormField label="Acompañamiento Obligatorio (R09)" required>
                  <SelectInput
                    options={(selectedProduct.availableSides || []).map((s) => ({ value: s, label: s }))}
                    value={selectedSide}
                    onChange={(e) => setSelectedSide(e.target.value)}
                  />
                </FormField>

                <FormField label="Comentario por Línea (opcional)">
                  <TextInput
                    placeholder="Ej. Sin sal, término medio, etc."
                    value={lineComment}
                    onChange={(e) => setLineComment(e.target.value)}
                  />
                </FormField>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Detalle de Productos Cargados ({items.length})
            </h4>
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 font-bold text-slate-700">
                  <tr>
                    <th className="p-2.5">Producto / Acompañamiento</th>
                    <th className="p-2.5 text-center">Cant.</th>
                    <th className="p-2.5 text-right">Precio Un.</th>
                    <th className="p-2.5 text-right">Subtotal</th>
                    <th className="p-2.5 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-400 italic">
                        No hay productos cargados en este pedido.
                      </td>
                    </tr>
                  ) : (
                    items.map((it) => (
                      <tr key={it.id} className="hover:bg-slate-50">
                        <td className="p-2.5">
                          <p className="font-bold text-slate-900">{it.productName}</p>
                          {it.sideOption && (
                            <p className="text-[10px] text-indigo-600 font-semibold">
                              + Acompañamiento: {it.sideOption}
                            </p>
                          )}
                          {it.lineComment && <p className="text-[10px] text-slate-500 italic">"{it.lineComment}"</p>}
                        </td>
                        <td className="p-2.5 text-center font-bold">{it.quantity}</td>
                        <td className="p-2.5 text-right font-medium">{fmt(it.unitPrice)}</td>
                        <td className="p-2.5 text-right font-black text-slate-900">{fmt(it.subtotal)}</td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(it.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-900 text-white font-black text-xs">
                    <td colSpan={3} className="p-2.5">TOTAL GENERAL (A04)</td>
                    <td className="p-2.5 text-right text-sm text-amber-400 font-mono">{fmt(totalAmount)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <FormField label="Observaciones Generales del Pedido (Opcional)">
            <TextInput
              placeholder="Ej. Servir postre al final, cliente prefiere servilletas adicionales..."
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
            />
          </FormField>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 shrink-0">
            <span className="text-xs text-slate-500 font-semibold">
              Total recalculado: <strong className="text-slate-900 text-sm font-mono">{fmt(totalAmount)}</strong>
            </span>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" leftIcon={<Save className="w-4 h-4" />}>
                {orderToEdit ? 'Guardar Cambios' : 'Confirmar Pedido'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
