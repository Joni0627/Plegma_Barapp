import React, { useState } from 'react';
import { X, Calendar, Save, AlertTriangle, Users, MapPin } from 'lucide-react';
import { Button } from '../ui/Button';
import { FormField, SelectInput, TextInput } from '../ui/Form';
import { Reservation, RestaurantTable, Client } from '../../types';

interface ReservationModalProps {
  reservationToEdit?: Reservation | null;
  tables: RestaurantTable[];
  clients: Client[];
  onClose: () => void;
  onSave: (data: any) => { success: boolean; message: string };
  checkOverbooking: (tableId: string, dateTime: string, excludeId?: string) => boolean;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  reservationToEdit,
  tables,
  clients,
  onClose,
  onSave,
  checkOverbooking,
}) => {
  const [clientId, setClientId] = useState(reservationToEdit?.clientId || clients[0]?.id || '');
  const [tableId, setTableId] = useState(reservationToEdit?.tableId || tables[0]?.id || '');
  const [guestsCountStr, setGuestsCountStr] = useState(
    reservationToEdit ? String(reservationToEdit.guestsCount) : '2'
  );

  // Initial datetime-local string
  const formatForInput = (dtStr?: string) => {
    if (!dtStr) {
      const d = new Date();
      d.setHours(d.getHours() + 2, 0, 0, 0); // default 2 hours in future
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
    return dtStr.replace(' ', 'T').substring(0, 16);
  };

  const [dateTimeLocal, setDateTimeLocal] = useState(formatForInput(reservationToEdit?.dateTime));
  const [notes, setNotes] = useState(reservationToEdit?.notes || '');
  const [error, setError] = useState('');

  const clientOptions = clients.map((c) => ({
    value: c.id,
    label: `${c.name} (${c.phone || c.code})`,
  }));

  const tableOptions = tables
    .filter((t) => t.active)
    .map((t) => ({
      value: t.id,
      label: `${t.name} (Capacidad: ${t.capacity} pax - ${t.sector})`,
    }));

  const selectedTable = tables.find((t) => t.id === tableId);
  const selectedClient = clients.find((c) => c.id === clientId);

  // Check overbooking live on selection change
  const normalizedDateTime = dateTimeLocal.replace('T', ' ') + ':00';
  const isOverbooked = tableId && dateTimeLocal
    ? checkOverbooking(tableId, normalizedDateTime, reservationToEdit?.id)
    : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      setError('Debe seleccionar un cliente asignado.');
      return;
    }
    if (!tableId) {
      setError('Debe asignar una mesa para la reserva (R02).');
      return;
    }
    const guests = parseInt(guestsCountStr, 10);
    if (isNaN(guests) || guests < 1) {
      setError('La cantidad de personas debe ser al menos 1 (R03).');
      return;
    }
    if (!dateTimeLocal) {
      setError('Debe ingresar la fecha y hora de la reserva (R01).');
      return;
    }

    if (isOverbooked) {
      setError(`Overbooking bloqueado (A06): La mesa "${selectedTable?.name}" ya tiene otra reserva confirmada en un horario cercano.`);
      return;
    }

    const payload = {
      ...(reservationToEdit ? reservationToEdit : {}),
      dateTime: normalizedDateTime,
      clientId,
      clientName: selectedClient?.name || 'Cliente',
      clientPhone: selectedClient?.phone,
      guestsCount: guests,
      tableId,
      tableName: selectedTable?.name || 'Mesa',
      notes: notes.trim() || undefined,
    };

    const result = onSave(payload);
    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl space-y-0">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">
                {reservationToEdit ? 'Editar Reserva de Mesa' : 'Crear Nueva Reserva'}
              </h3>
              <p className="text-xs text-slate-400">Organice la disponibilidad y asignación de mesas</p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Overbooking Alert Banner */}
          {isOverbooked && (
            <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex items-center gap-3 text-amber-900 text-xs font-bold animate-fadeIn">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p>Conflicto de Horario (Overbooking - A06)</p>
                <p className="text-[11px] font-normal text-amber-700">
                  La mesa "{selectedTable?.name}" posee otra reserva confirmada en un lapso menor a 2 horas. Seleccione otra mesa u horario.
                </p>
              </div>
            </div>
          )}

          <FormField label="Cliente" required hint="Seleccione desde la nómina de clientes">
            <SelectInput
              options={clientOptions}
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                setError('');
              }}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Mesa Asignada" required hint="[CFG] Mesas del local (R02)">
              <SelectInput
                options={tableOptions}
                value={tableId}
                onChange={(e) => {
                  setTableId(e.target.value);
                  setError('');
                }}
              />
            </FormField>

            <FormField label="Cantidad de Personas" required hint="Comensales esperados (min 1)">
              <TextInput
                type="number"
                min="1"
                placeholder="2"
                value={guestsCountStr}
                onChange={(e) => {
                  setGuestsCountStr(e.target.value);
                  setError('');
                }}
              />
            </FormField>
          </div>

          <FormField label="Fecha y Hora Programada" required hint="Fecha/Hora solicitada para la reserva (R01)">
            <TextInput
              type="datetime-local"
              value={dateTimeLocal}
              onChange={(e) => {
                setDateTimeLocal(e.target.value);
                setError('');
              }}
            />
          </FormField>

          <FormField label="Observaciones o Notas Adicionales" hint="Ej. Pedido de silla alta, mesa con sombra, etc.">
            <TextInput
              placeholder="Ej. Aniversario, requieren mesa tranquila cerca del ventanal..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </FormField>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isOverbooked}
              leftIcon={<Save className="w-4 h-4" />}
            >
              {reservationToEdit ? 'Guardar Cambios' : 'Confirmar Reserva'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
