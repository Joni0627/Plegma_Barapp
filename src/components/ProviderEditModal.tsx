import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Provider, DayOfWeek } from '../types';
import { SelectWithInlineAdd } from './ui/Form';
import { X, Building2, Save, Calendar, CreditCard } from 'lucide-react';

interface ProviderEditModalProps {
  providerToEdit?: Provider | null;
  onClose: () => void;
}

const ALL_DAYS: DayOfWeek[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export const ProviderEditModal: React.FC<ProviderEditModalProps> = ({
  providerToEdit,
  onClose,
}) => {
  const { addOrUpdateProvider } = useApp();

  const [name, setName] = useState(providerToEdit?.name || '');
  const [commercialName, setCommercialName] = useState(providerToEdit?.commercialName || '');
  const [rubro, setRubro] = useState(providerToEdit?.rubro || 'Lácteos y Quesos');
  const [contactName, setContactName] = useState(providerToEdit?.contactName || '');
  const [phone, setPhone] = useState(providerToEdit?.phone || '');
  const [whatsapp, setWhatsapp] = useState(providerToEdit?.whatsapp || '');
  const [cuit, setCuit] = useState(providerToEdit?.cuit || '');
  const [cutoffTime, setCutoffTime] = useState(providerToEdit?.cutoffTime || '14:00');
  const [paymentCondition, setPaymentCondition] = useState(
    providerToEdit?.paymentCondition || 'Cuenta Corriente 14 días'
  );
  const [orderDays, setOrderDays] = useState<DayOfWeek[]>(
    providerToEdit?.orderDays || ['Lunes', 'Jueves']
  );
  const [deliveryDays, setDeliveryDays] = useState<DayOfWeek[]>(
    providerToEdit?.deliveryDays || ['Martes', 'Viernes']
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProv: Provider = {
      id: providerToEdit?.id || 'prov-' + Date.now(),
      code: providerToEdit?.code || 'PRV-' + Math.floor(100 + Math.random() * 900),
      name,
      commercialName: commercialName || name,
      rubro,
      logoUrl:
        providerToEdit?.logoUrl ||
        'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=120&auto=format&fit=crop&q=80',
      contactName: contactName || 'Representante Ventas',
      phone: phone || '+54 11 4000-0000',
      whatsapp: whatsapp || '5491140000000',
      email: 'ventas@proveedor.com.ar',
      cuit: cuit || '30-11223344-5',
      address: 'Av. Corrientes 2000, CABA',
      orderDays: orderDays.length > 0 ? orderDays : ['Lunes'],
      deliveryDays: deliveryDays.length > 0 ? deliveryDays : ['Martes'],
      priority: providerToEdit?.priority || 1,
      purchaseFrequency: 'Semanal',
      cutoffTime,
      habitualLeadTimeDays: 1,
      currentAccount: true,
      acceptsCash: true,
      acceptsTransfer: true,
      acceptsCheque: true,
      paymentTermDays: 14,
      paymentCondition,
      bankName: 'Banco Galicia',
      accountOwner: commercialName || name,
      alias: name.toUpperCase().replace(/\s+/g, '.') + '.GALICIA',
      active: true,
    };

    addOrUpdateProvider(newProv);
    alert('Proveedor guardado exitosamente.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto no-scrollbar space-y-4 border border-slate-200"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-orange-600" />
            <span>{providerToEdit ? 'Editar Proveedor' : 'Registrar Nuevo Proveedor'}</span>
          </h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Nombre Comercial:</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej.: Lácteos La Serenísima"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Rubro / Categoría:</label>
            <SelectWithInlineAdd
              options={[
                { value: 'Lácteos y Quesos', label: 'Lácteos y Quesos' },
                { value: 'Almacén y Secos', label: 'Almacén y Secos' },
                { value: 'Carnicería y Fritos', label: 'Carnicería y Fritos' },
                { value: 'Frutas y Verduras', label: 'Frutas y Verduras' },
                { value: 'Bebidas y Cervezas', label: 'Bebidas y Cervezas' },
                { value: 'Avícola y Huevos', label: 'Avícola y Huevos' },
              ]}
              value={rubro}
              onChange={(e) => setRubro(e.target.value)}
              onInlineAdd={(newRubro) => setRubro(newRubro)}
              inlineAddTitle="Agregar Rubro"
              inlineAddPlaceholder="Ej. Limpieza y Desinfectantes"
              requiredPermission="canInlineCreate"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Persona de Contacto:</label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Ej.: Carlos Gómez"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Teléfono WhatsApp:</label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="Ej.: 5491143218765"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">CUIT:</label>
            <input
              type="text"
              value={cuit}
              onChange={(e) => setCuit(e.target.value)}
              placeholder="30-50001234-9"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Horario Cierre Pedidos:</label>
            <input
              type="text"
              value={cutoffTime}
              onChange={(e) => setCutoffTime(e.target.value)}
              placeholder="13:00"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>
        </div>

        {/* Order Days Selection */}
        <div className="pt-2 border-t border-slate-100">
          <label className="font-bold text-xs text-slate-800 block mb-2">
            Días de Control y Pedido (Agenda Semanal):
          </label>
          <div className="flex flex-wrap gap-2">
            {ALL_DAYS.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() =>
                  setOrderDays((prev) =>
                    prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
                  )
                }
                className={`px-3 py-1 rounded-lg text-xs font-bold border transition ${
                  orderDays.includes(day)
                    ? 'bg-orange-600 text-white border-orange-600'
                    : 'bg-slate-50 text-slate-600 border-slate-300'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-orange-600 text-white font-extrabold text-xs rounded-xl hover:bg-orange-700 shadow-md flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Proveedor</span>
          </button>
        </div>
      </form>
    </div>
  );
};
