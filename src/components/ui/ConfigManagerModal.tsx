import React, { useState } from 'react';
import { X, Plus, Edit2, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { ConfigOption } from '../../types';
import { ConfirmModal } from './ConfirmModal';

interface ConfigManagerModalProps {
  title: string;
  options: ConfigOption[];
  onClose: () => void;
  onUpdate: (newOptions: ConfigOption[]) => void;
}

export const ConfigManagerModal: React.FC<ConfigManagerModalProps> = ({ title, options, onClose, onUpdate }) => {
  const [localOptions, setLocalOptions] = useState<ConfigOption[]>(options);
  const [newValue, setNewValue] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [deletingOpt, setDeletingOpt] = useState<ConfigOption | null>(null);

  const handleAdd = () => {
    if (!newValue.trim()) return;
    const newOpt: ConfigOption = {
      id: `opt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: newValue.trim(),
      active: true,
    };
    setLocalOptions([...localOptions, newOpt]);
    setNewValue('');
  };

  const handleToggleActive = (id: string) => {
    setLocalOptions(prev => prev.map(o => o.id === id ? { ...o, active: !o.active } : o));
  };

  const handleSaveEdit = (id: string) => {
    if (!editValue.trim()) return;
    setLocalOptions(prev => prev.map(o => o.id === id ? { ...o, name: editValue.trim() } : o));
    setEditingId(null);
  };

  const handleSaveAll = () => {
    onUpdate(localOptions);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-md border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <h3 className="font-extrabold text-base text-slate-900">Gestionar {title}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder={`Nuevo ${title}...`}
            className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
          />
          <button
            type="button"
            onClick={handleAdd}
            className="px-3 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 flex items-center gap-1 text-sm font-bold"
          >
            <Plus className="w-4 h-4" /> Agregar
          </button>
        </div>

        <div className="max-h-60 overflow-y-auto no-scrollbar space-y-2 mb-4">
          {localOptions.map(opt => (
            <div key={opt.id} className={`flex items-center justify-between p-2 rounded-xl border ${opt.active ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50 text-slate-400'}`}>
              <div className="flex items-center gap-3 flex-1">
                <button type="button" onClick={() => handleToggleActive(opt.id)}>
                  {opt.active ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5 text-slate-300" />}
                </button>
                {editingId === opt.id ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1 p-1 bg-white border border-amber-500 rounded text-sm text-slate-900"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSaveEdit(opt.id))}
                  />
                ) : (
                  <span className={`text-sm font-bold ${!opt.active && 'line-through'}`}>{opt.name}</span>
                )}
              </div>
              <div className="flex gap-1 ml-2">
                {editingId === opt.id ? (
                  <button type="button" onClick={() => handleSaveEdit(opt.id)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                ) : (
                  <>
                    <button type="button" onClick={() => { setEditingId(opt.id); setEditValue(opt.name); }} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => setDeletingOpt(opt)} className="p-1.5 text-rose-400 hover:bg-rose-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          {localOptions.length === 0 && (
            <p className="text-center text-slate-500 text-sm py-4">No hay elementos configurados.</p>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 font-bold text-xs rounded-xl text-slate-600">
            Cancelar
          </button>
          <button type="button" onClick={handleSaveAll} className="px-5 py-2 bg-amber-500 text-white font-extrabold text-xs rounded-xl hover:bg-amber-600">
            Guardar Cambios
          </button>
        </div>
      </div>
      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={deletingOpt !== null}
        title={`Eliminar Opción`}
        message={`¿Estás seguro que deseas eliminar "${deletingOpt?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Sí, Eliminar"
        cancelText="Cancelar"
        onConfirm={() => {
          if (deletingOpt) {
            setLocalOptions(prev => prev.filter(o => o.id !== deletingOpt.id));
            setDeletingOpt(null);
          }
        }}
        onCancel={() => setDeletingOpt(null)}
      />
    </div>
  );
};
