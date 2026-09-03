import React, { useState } from 'react';
import { X, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { FormField, TextInput } from '../ui/Form';
import { SaleOrderItem } from '../../types';

interface OrderItemCommentModalProps {
  item: SaleOrderItem;
  onClose: () => void;
  onSaveComment: (itemId: string, comment?: string) => void;
}

export const OrderItemCommentModal: React.FC<OrderItemCommentModalProps> = ({
  item,
  onClose,
  onSaveComment,
}) => {
  const [comment, setComment] = useState<string>(item.lineComment || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveComment(item.id, comment.trim() || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col border border-slate-200">
        {/* Header estilo PLEGMA */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                Comentario por Ítem
              </span>
              <h2 className="text-base font-black tracking-tight line-clamp-1">{item.productName}</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <p className="text-xs font-bold text-slate-700">Artículo seleccionado:</p>
            <p className="text-sm font-black text-slate-900 mt-0.5">{item.productName} ({item.quantity}x)</p>
            {item.selectedOptions && item.selectedOptions.length > 0 && (
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Opciones: {item.selectedOptions.map((o) => o.optionName).join(', ')}
              </p>
            )}
          </div>

          <FormField label="Observación / Especificación para Cocina">
            <TextInput
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ej: Sin sal, bien cocido, sin hielo, aderezo aparte..."
              autoFocus
            />
          </FormField>

          {/* Quick presets */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Sugerencias rápidas:</span>
            <div className="flex flex-wrap gap-1.5">
              {['Sin cebolla', 'Sin sal', 'Punto medio', 'Bien cocido', 'Salsa aparte', 'Sin Hielo', 'Para llevar'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setComment((prev) => (prev ? `${prev}, ${preset}` : preset))}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-100 hover:text-amber-900 border border-slate-200 text-xs font-bold text-slate-700 transition-colors"
                >
                  +{preset}
                </button>
              ))}
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {item.lineComment ? (
              <button
                type="button"
                onClick={() => onSaveComment(item.id, undefined)}
                className="text-xs text-rose-600 hover:text-rose-800 font-extrabold"
              >
                Quitar comentario
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex space-x-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" size="sm" leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                Guardar
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
