import React, { useState } from 'react';
import { X, CheckCircle2, Coffee, AlertCircle, Plus, Minus } from 'lucide-react';
import { Button } from '../ui/Button';
import { FormField, TextInput } from '../ui/Form';
import { useApp } from '../../context/AppContext';
import { SaleProductCatalogItem } from '../../data/ordersData';
import { ProductOptionGroup, SelectedOptionDetail, SaleOrderItem } from '../../types';

interface ProductConfiguratorModalProps {
  product: SaleProductCatalogItem;
  optionGroups?: ProductOptionGroup[];
  onClose: () => void;
  onConfirmItem: (item: SaleOrderItem) => void;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n);

export const ProductConfiguratorModal: React.FC<ProductConfiguratorModalProps> = ({
  product,
  optionGroups,
  onClose,
  onConfirmItem,
}) => {
  const { productOptionGroups } = useApp();

  // Use passed optionGroups or global context optionGroups
  const availableGroups = optionGroups || productOptionGroups;

  // Filter option groups linked to this product (or all active groups if none linked)
  const relevantGroups = availableGroups.filter((g) =>
    g.active && (product.optionGroupIds ? product.optionGroupIds.includes(g.id) : true)
  );

  // State of selected options per group: { [groupId]: selectedOptionId[] }
  const [selections, setSelections] = useState<Record<string, string[]>>(() => {
    const init: Record<string, string[]> = {};
    relevantGroups.forEach((g) => {
      if (g.isRequired && g.options.length > 0) {
        init[g.id] = [g.options[0].id]; // Default to first option for required groups
      } else {
        init[g.id] = [];
      }
    });
    return init;
  });

  const [quantity, setQuantity] = useState<number>(1);
  const [lineComment, setLineComment] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Handle Option Selection
  const handleSelectOption = (group: ProductOptionGroup, optionId: string) => {
    if (group.selectionType === 'single') {
      setSelections({ ...selections, [group.id]: [optionId] });
    } else {
      const current = selections[group.id] || [];
      if (current.includes(optionId)) {
        setSelections({ ...selections, [group.id]: current.filter((id) => id !== optionId) });
      } else {
        setSelections({ ...selections, [group.id]: [...current, optionId] });
      }
    }
  };

  // Calculate dynamic price per unit
  const calculatedUnitPrice = React.useMemo(() => {
    let extra = 0;
    relevantGroups.forEach((group) => {
      const selectedIds = selections[group.id] || [];
      selectedIds.forEach((optId) => {
        const opt = group.options.find((o) => o.id === optId);
        if (opt && opt.priceModifier > 0) {
          extra += opt.priceModifier;
        }
      });
    });
    return product.unitPrice + extra;
  }, [product.unitPrice, relevantGroups, selections]);

  const calculatedSubtotal = calculatedUnitPrice * quantity;

  const handleSubmit = () => {
    setError('');

    // Check required groups
    for (const group of relevantGroups) {
      if (group.isRequired) {
        const selected = selections[group.id] || [];
        if (selected.length === 0) {
          setError(`Debe seleccionar una opción obligatoria en el grupo "${group.name}".`);
          return;
        }
      }
    }

    // Build SelectedOptionDetail list
    const selectedOptionDetails: SelectedOptionDetail[] = [];
    relevantGroups.forEach((group) => {
      const selectedIds = selections[group.id] || [];
      selectedIds.forEach((optId) => {
        const opt = group.options.find((o) => o.id === optId);
        if (opt) {
          selectedOptionDetails.push({
            groupId: group.id,
            groupName: group.name,
            optionId: opt.id,
            optionName: opt.name,
            priceModifier: opt.priceModifier,
          });
        }
      });
    });

    const newItem: SaleOrderItem = {
      id: 'item-' + Date.now() + Math.random(),
      productId: product.id,
      productName: product.name,
      category: product.category,
      unitPrice: calculatedUnitPrice,
      costPrice: product.costPrice,
      quantity,
      selectedOptions: selectedOptionDetails,
      subtotal: calculatedSubtotal,
      lineComment: lineComment.trim() || undefined,
    };

    onConfirmItem(newItem);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh] border border-slate-200">
        {/* Header estilo PLEGMA */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">Configurador de Producto</span>
              <h2 className="text-lg font-black tracking-tight">{product.name}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">Cantidad de Unidades</span>
              <p className="text-xs text-slate-500 font-medium">Define cuántas unidades agregar a la comanda</p>
            </div>
            <div className="flex items-center space-x-3 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center font-black transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center text-base font-black text-slate-900">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center font-black transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Option Groups */}
          <div className="space-y-5">
            {relevantGroups.map((group, idx) => {
              const selectedIds = selections[group.id] || [];
              return (
                <div key={group.id} className="space-y-2 border-b border-slate-100 pb-4 last:border-b-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                      {idx + 1}. {group.name}{' '}
                      {group.isRequired ? (
                        <span className="text-rose-600 font-extrabold">* (obligatorio)</span>
                      ) : (
                        <span className="text-slate-400 font-medium">(opcional)</span>
                      )}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                    {group.options.map((opt) => {
                      const isSelected = selectedIds.includes(opt.id);
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectOption(group, opt.id)}
                          className={`p-3 rounded-xl border text-left text-xs font-extrabold transition-all flex flex-col justify-between space-y-1 ${
                            isSelected
                              ? 'border-amber-500 bg-amber-50 text-slate-950 shadow-xs'
                              : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{opt.name}</span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 ml-1" />}
                          </div>
                          <span className={`text-[10px] font-bold ${opt.priceModifier > 0 ? 'text-amber-700 font-black' : 'text-slate-400'}`}>
                            {opt.priceModifier > 0 ? `+$${opt.priceModifier}` : 'Incluido'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Line Comment */}
          <FormField label="Comentario u Observación del Ítem (Opcional)">
            <TextInput
              value={lineComment}
              onChange={(e) => setLineComment(e.target.value)}
              placeholder="Ej: Sin azúcar, hielo aparte, término medio..."
            />
          </FormField>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-extrabold text-slate-500">Subtotal Ítem</span>
            <p className="text-xl font-black text-slate-900">{fmt(calculatedSubtotal)}</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSubmit} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
              Confirmar Ítem
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
