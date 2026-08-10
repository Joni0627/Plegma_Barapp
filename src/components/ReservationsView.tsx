import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Users,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  History,
  FileText,
  UserCheck,
} from 'lucide-react';
import { Button } from './ui/Button';
import { StandardDataTable } from './ui/DataTable';
import { useApp } from '../context/AppContext';
import { Reservation, RestaurantTable } from '../types';
import { INITIAL_CC_CLIENTS } from '../data/currentAccountData';
import { ReservationModal } from './reservations/ReservationModal';
import { ReservationDetailModal } from './reservations/ReservationDetailModal';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const cfg: Record<string, string> = {
    Confirmada: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    Cancelada: 'bg-rose-100 text-rose-800 border-rose-300',
    Histórica: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
        cfg[status] || 'bg-slate-100 text-slate-700 border-slate-200'
      }`}
    >
      {status}
    </span>
  );
};

export function ReservationsView() {
  const {
    reservations,
    restaurantTables,
    addReservation,
    updateReservation,
    cancelReservation,
    checkOverbooking,
    userRole,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'proximas' | 'historial' | 'canceladas'>('proximas');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterTableId, setFilterTableId] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [viewingReservation, setViewingReservation] = useState<Reservation | null>(null);

  // Filter reservations according to active tab and filters
  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      // Tab filter
      if (activeTab === 'proximas' && r.status !== 'Confirmada') return false;
      if (activeTab === 'historial' && r.status !== 'Histórica') return false;
      if (activeTab === 'canceladas' && r.status !== 'Cancelada') return false;

      // Date filter
      if (filterDate && !r.dateTime.startsWith(filterDate)) return false;

      // Table filter
      if (filterTableId && r.tableId !== filterTableId) return false;

      // Search query (Client name, phone, table name or notes)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesClient = r.clientName.toLowerCase().includes(q);
        const matchesPhone = (r.clientPhone || '').toLowerCase().includes(q);
        const matchesTable = r.tableName.toLowerCase().includes(q);
        const matchesNotes = (r.notes || '').toLowerCase().includes(q);
        if (!matchesClient && !matchesPhone && !matchesTable && !matchesNotes) return false;
      }

      return true;
    });
  }, [reservations, activeTab, filterDate, filterTableId, searchQuery]);

  // Summaries
  const upcomingCount = useMemo(() => reservations.filter((r) => r.status === 'Confirmada').length, [reservations]);
  const historyCount = useMemo(() => reservations.filter((r) => r.status === 'Histórica').length, [reservations]);
  const cancelledCount = useMemo(() => reservations.filter((r) => r.status === 'Cancelada').length, [reservations]);
  const totalGuestsUpcoming = useMemo(
    () => reservations.filter((r) => r.status === 'Confirmada').reduce((acc, r) => acc + r.guestsCount, 0),
    [reservations]
  );

  // Handlers
  const handleCreateNew = () => {
    setEditingReservation(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (res: Reservation) => {
    // [R05] Inmutabilidad de Históricas
    if (res.status === 'Histórica' && userRole !== 'admin') {
      showToast('Las reservas históricas no se pueden editar (R05).', 'error');
      return;
    }
    setEditingReservation(res);
    setIsModalOpen(true);
  };

  const handleCancelClick = (res: Reservation) => {
    if (res.status === 'Cancelada') return;
    const reason = prompt(`Motivo de cancelación para la reserva de ${res.clientName}:`);
    if (reason === null) return; // User pressed cancel in prompt
    const resCancel = cancelReservation(res.id, reason.trim() || 'Cancelación directa por usuario');
    if (resCancel.success) {
      showToast(resCancel.message, 'warning');
    } else {
      showToast(resCancel.message, 'error');
    }
  };

  const handleSaveModal = (payload: any) => {
    if (editingReservation) {
      const res = updateReservation(payload as Reservation);
      if (res.success) {
        showToast(res.message, 'success');
        setIsModalOpen(false);
      }
      return res;
    } else {
      const res = addReservation(payload);
      if (res.success) {
        showToast(res.message, 'success');
        setIsModalOpen(false);
      }
      return res;
    }
  };

  // Required columns: [Fecha Hora], [Cliente], [Personas], [Mesa], [Estado]
  const columns = [
    {
      key: 'dateTime',
      header: 'Fecha y Hora',
      sortable: true,
      render: (r: Reservation) => (
        <div className="flex items-center gap-1.5 font-mono text-slate-700 font-bold text-xs">
          <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span>{r.dateTime}</span>
        </div>
      ),
    },
    {
      key: 'clientName',
      header: 'Cliente',
      sortable: true,
      render: (r: Reservation) => (
        <div>
          <p className="font-extrabold text-slate-900 text-xs">{r.clientName}</p>
          {r.clientPhone && <p className="text-[10px] text-slate-400">{r.clientPhone}</p>}
        </div>
      ),
    },
    {
      key: 'guestsCount',
      header: 'Personas',
      sortable: true,
      align: 'center' as const,
      render: (r: Reservation) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-black text-xs">
          <Users className="w-3 h-3 text-slate-500" />
          {r.guestsCount} pax
        </span>
      ),
    },
    {
      key: 'tableName',
      header: 'Mesa',
      sortable: true,
      render: (r: Reservation) => (
        <span className="font-semibold text-slate-800 text-xs flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          {r.tableName}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      align: 'center' as const,
      render: (r: Reservation) => <StatusBadge status={r.status} />,
    },
    {
      key: 'actions',
      header: 'Acciones (8)',
      align: 'center' as const,
      render: (r: Reservation) => (
        <div className="flex items-center justify-center gap-1">
          {/* Action 4: EYE - Ver detalle */}
          <button
            type="button"
            onClick={() => setViewingReservation(r)}
            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
            title="Ver detalle de la reserva [4]"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Action 2: EDIT - Editar reserva (R05) */}
          {r.status !== 'Cancelada' && (r.status !== 'Histórica' || userRole === 'admin') && (
            <button
              type="button"
              onClick={() => handleEditClick(r)}
              className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
              title="Editar reserva [2]"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}

          {/* Action 3: CANCEL - Cancelar reserva */}
          {r.status === 'Confirmada' && (
            <button
              type="button"
              onClick={() => handleCancelClick(r)}
              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              title="Cancelar reserva [3]"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Gestión Operativa</span>
            <span>/</span>
            <span className="text-indigo-600 font-semibold">Ventas</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Reservas de Mesas</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Reservas de Mesas
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Organización de disponibilidad, comensales esperados y seguimiento por estado
          </p>
        </div>

        {/* Action 1: Crear reserva */}
        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleCreateNew}
        >
          Crear Reserva [1]
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">Próximas Reservas</p>
            <p className="text-base font-black text-slate-900 mt-0.5">{upcomingCount}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">Comensales Esperados</p>
            <p className="text-base font-black text-indigo-700 mt-0.5">{totalGuestsUpcoming} pax</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">Historial Cumplido</p>
            <p className="text-base font-black text-slate-900 mt-0.5">{historyCount}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">Reservas Canceladas</p>
            <p className="text-base font-black text-rose-600 mt-0.5">{cancelledCount}</p>
          </div>
        </div>
      </div>

      {/* Tabs & Filtering Bar (Actions 5, 6, 7, 8) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Tabs: Actions 5, 6, 7 */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit flex-wrap">
            <button
              onClick={() => setActiveTab('proximas')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === 'proximas'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Próximas Reservas ({upcomingCount}) [5]
            </button>

            <button
              onClick={() => setActiveTab('historial')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === 'historial'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <History className="w-3.5 h-3.5 text-indigo-600" />
              Historial de Reservas ({historyCount}) [6]
            </button>

            <button
              onClick={() => setActiveTab('canceladas')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === 'canceladas'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              Reservas Canceladas ({cancelledCount}) [7]
            </button>
          </div>
        </div>

        {/* Filter controls: Action 8 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por cliente, teléfono o nota..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-700"
            />
          </div>

          <div>
            <select
              value={filterTableId}
              onChange={(e) => setFilterTableId(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-700"
            >
              <option value="">Todas las Mesas / Sectores</option>
              {restaurantTables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.sector})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main DataTable */}
      <StandardDataTable
        data={filteredReservations}
        columns={columns}
        keyExtractor={(r) => r.id}
        title={
          activeTab === 'proximas'
            ? 'Próximas Reservas Confirmadas'
            : activeTab === 'historial'
            ? 'Historial de Reservas Cumplidas'
            : 'Registro de Reservas Canceladas'
        }
        subtitle="Listado con columnas obligatorias: [Fecha Hora], [Cliente], [Personas], [Mesa] y [Estado]"
        emptyMessage={
          activeTab === 'proximas'
            ? 'No hay reservas próximas confirmadas.'
            : activeTab === 'historial'
            ? 'No hay reservas en el historial cumplido.'
            : 'No hay reservas canceladas registradas.'
        }
        emptyIcon={<Calendar className="w-8 h-8 text-slate-300" />}
      />

      {/* Modal: Crear / Editar Reserva */}
      {isModalOpen && (
        <ReservationModal
          reservationToEdit={editingReservation}
          tables={restaurantTables}
          clients={INITIAL_CC_CLIENTS}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveModal}
          checkOverbooking={checkOverbooking}
        />
      )}

      {/* Modal: Ver Detalle de Reserva */}
      {viewingReservation && (
        <ReservationDetailModal
          reservation={viewingReservation}
          onClose={() => setViewingReservation(null)}
        />
      )}
    </div>
  );
}
