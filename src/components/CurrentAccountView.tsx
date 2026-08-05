import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Users,
  Receipt,
  CreditCard,
  CheckSquare,
  FileText,
  Trash2,
  FileBadge,
  AlertCircle,
  TrendingUp,
  Clock,
  UserCheck,
} from 'lucide-react';
import { Button } from './ui/Button';
import { StandardDataTable } from './ui/DataTable';
import { useApp } from '../context/AppContext';
import { Client, CurrentAccountMovement, Receipt as ReceiptType } from '../types';
import {
  INITIAL_CC_CLIENTS,
  INITIAL_CC_MOVEMENTS,
  INITIAL_RECEIPTS,
  EMPLOYEE_CLIENT_IDS,
} from '../data/currentAccountData';

// -----------------------------------------------
// HELPERS
// -----------------------------------------------
const fmt = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n);

const padReceiptNumber = (n: number) => `REC-${String(n).padStart(5, '0')}`;
const padTicketNumber = (n: number) => `TKT-${String(n).padStart(5, '0')}`;

// -----------------------------------------------
// BADGE COMPONENTS
// -----------------------------------------------
const StateBadge: React.FC<{ state: string }> = ({ state }) => {
  const cfg: Record<string, string> = {
    'Con recibo': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Sin recibo': 'bg-amber-100 text-amber-700 border-amber-200',
    Pendiente: 'bg-amber-100 text-amber-700 border-amber-200',
    Facturado: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Pagada: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${cfg[state] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
      {state}
    </span>
  );
};

const SummaryCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; accent?: string }> = ({
  icon, label, value, accent = 'bg-amber-50 text-amber-600',
}) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
      {icon}
    </div>
    <div>
      <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-base font-black text-slate-900 leading-tight mt-0.5">{value}</p>
    </div>
  </div>
);

// -----------------------------------------------
// VISTA DETALLE DEL CLIENTE
// -----------------------------------------------
interface ClientDetailProps {
  client: Client;
  movements: CurrentAccountMovement[];
  receipts: ReceiptType[];
  isEmployee: boolean;
  onBack: () => void;
  onDataChange: (movements: CurrentAccountMovement[], receipts: ReceiptType[]) => void;
}

function ClientDetailView({ client, movements, receipts, isEmployee, onBack, onDataChange }: ClientDetailProps) {
  const { showToast, users, activeUserId } = useApp();
  const [activeTab, setActiveTab] = useState<'consumos' | 'recibos'>('consumos');
  const [selectedMovIds, setSelectedMovIds] = useState<string[]>([]);
  const [selectedRecIds, setSelectedRecIds] = useState<string[]>([]);

  const clientMovements = useMemo(() => movements.filter(m => m.clientId === client.id), [movements, client.id]);
  const clientReceipts = useMemo(() => receipts.filter(r => r.clientId === client.id), [receipts, client.id]);

  const totalDebt = useMemo(
    () => clientMovements.filter(m => m.lineState === 'Pendiente').reduce((acc, m) => acc + m.total, 0),
    [clientMovements]
  );

  const activeUser = users.find(u => u.id === activeUserId);

  // Determine movement display state
  const getMovState = (mov: CurrentAccountMovement): string => {
    const linkedReceipt = clientReceipts.find(r => r.movementIds.includes(mov.id));
    return linkedReceipt ? 'Con recibo' : mov.lineState === 'Pagada' ? 'Con recibo' : 'Sin recibo';
  };

  const isMovSelectable = (mov: CurrentAccountMovement) => {
    const state = getMovState(mov);
    return state === 'Sin recibo';
  };

  const toggleMovSelection = (id: string) => {
    setSelectedMovIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleRecSelection = (id: string) => {
    const rec = clientReceipts.find(r => r.id === id);
    if (!rec || rec.status === 'Facturado') return;
    setSelectedRecIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleGenerateReceipt = () => {
    if (selectedMovIds.length === 0) return;
    const amount = clientMovements
      .filter(m => selectedMovIds.includes(m.id))
      .reduce((acc, m) => acc + m.total, 0);

    const nextNum = receipts.length + 1;
    const newReceipt: ReceiptType = {
      id: `rec-${Date.now()}`,
      receiptNumber: padReceiptNumber(nextNum),
      clientId: client.id,
      dateTime: new Date().toLocaleString('sv-SE').slice(0, 16),
      totalAmount: amount,
      status: 'Pendiente',
      userName: activeUser?.name || 'Admin General',
      movementIds: [...selectedMovIds],
    };

    // Mark movements as Pagada so they show "Con recibo"
    const updatedMovements = movements.map(m =>
      selectedMovIds.includes(m.id) ? { ...m, lineState: 'Pagada' as const } : m
    );
    onDataChange(updatedMovements, [...receipts, newReceipt]);
    setSelectedMovIds([]);
    showToast(`Recibo ${newReceipt.receiptNumber} generado correctamente.`, 'success');
  };

  const handleDeleteReceipts = () => {
    if (selectedRecIds.length === 0) return;
    const deletedMoveIds = receipts
      .filter(r => selectedRecIds.includes(r.id))
      .flatMap(r => r.movementIds);

    const updatedReceipts = receipts.filter(r => !selectedRecIds.includes(r.id));
    const updatedMovements = movements.map(m =>
      deletedMoveIds.includes(m.id) ? { ...m, lineState: 'Pendiente' as const } : m
    );
    onDataChange(updatedMovements, updatedReceipts);
    setSelectedRecIds([]);
    showToast(`${selectedRecIds.length} recibo(s) eliminado(s).`, 'success');
  };

  const handleBillReceipts = () => {
    if (selectedRecIds.length === 0) return;
    const updatedReceipts = receipts.map(r =>
      selectedRecIds.includes(r.id) ? { ...r, status: 'Facturado' as const } : r
    );
    onDataChange(movements, updatedReceipts);
    setSelectedRecIds([]);
    showToast(`${selectedRecIds.length} recibo(s) facturado(s) correctamente.`, 'success');
  };

  const pendingReceiptsSelected = selectedRecIds.every(id => {
    const r = clientReceipts.find(rec => rec.id === id);
    return r && r.status === 'Pendiente';
  });

  return (
    <div className="space-y-5">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Volver a Cuenta Corriente
      </button>

      {/* Client Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
              <span className="text-white text-lg font-black">{client.name.charAt(0)}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-black text-slate-900">{client.name}</h2>
                {isEmployee && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold border border-violet-200">
                    <UserCheck className="w-3 h-3" /> Empleado
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {client.code} &bull; {client.phone}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-slate-500 uppercase tracking-wide font-medium">Total cuenta corriente</p>
            <p className="text-xl font-black text-rose-600">{fmt(totalDebt)}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {(['consumos', 'recibos'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setSelectedMovIds([]); setSelectedRecIds([]); }}
            className={`px-5 py-2 rounded-lg text-xs font-bold capitalize transition-all duration-200 ${
              activeTab === tab
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab === 'consumos' ? (
              <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Consumos ({clientMovements.length})</span>
            ) : (
              <span className="flex items-center gap-1.5"><Receipt className="w-3.5 h-3.5" /> Recibos ({clientReceipts.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* TAB: CONSUMOS */}
      {activeTab === 'consumos' && (
        <div className="space-y-3">
          {selectedMovIds.length > 0 && (
            <div className="flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
              <p className="text-xs font-semibold text-amber-800">
                <CheckSquare className="w-4 h-4 inline mr-1 text-amber-600" />
                {selectedMovIds.length} ticket(s) seleccionado(s) &bull; Total: <strong>{fmt(clientMovements.filter(m => selectedMovIds.includes(m.id)).reduce((a, m) => a + m.total, 0))}</strong>
              </p>
              <Button
                size="sm"
                variant="primary"
                leftIcon={<Receipt className="w-3.5 h-3.5" />}
                onClick={handleGenerateReceipt}
              >
                Generar Recibo
              </Button>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Consumos / Tickets</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Selecciona tickets sin recibo para generar uno</p>
              </div>
              {selectedMovIds.length === 0 && (
                <span className="text-[11px] text-slate-400">Clic en fila para seleccionar</span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4 w-8"></th>
                    <th className="py-3 px-4 text-left">Fecha y Hora</th>
                    <th className="py-3 px-4 text-left">N° Ticket</th>
                    <th className="py-3 px-4 text-right">Monto Total</th>
                    <th className="py-3 px-4 text-left">Detalle de Ticket</th>
                    <th className="py-3 px-4 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {clientMovements.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="w-8 h-8 text-slate-300" />
                          <p className="font-semibold text-slate-600">No hay consumos registrados</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    clientMovements.map((mov, idx) => {
                      const selectable = isMovSelectable(mov);
                      const isSelected = selectedMovIds.includes(mov.id);
                      const state = getMovState(mov);
                      return (
                        <tr
                          key={mov.id}
                          onClick={() => selectable && toggleMovSelection(mov.id)}
                          className={`transition-colors ${
                            selectable ? 'cursor-pointer hover:bg-indigo-50/50' : 'opacity-60 cursor-not-allowed'
                          } ${isSelected ? 'bg-indigo-50 border-l-2 border-indigo-400' : ''}`}
                        >
                          <td className="py-3.5 px-4">
                            {selectable && (
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                                isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300'
                              }`}>
                                {isSelected && <div className="w-2 h-2 bg-white rounded-sm" />}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-700 whitespace-nowrap">{mov.dateTime}</td>
                          <td className="py-3.5 px-4 font-mono text-indigo-700 font-semibold">{padTicketNumber(idx + 1)}</td>
                          <td className="py-3.5 px-4 text-right font-bold text-slate-900">{fmt(mov.total)}</td>
                          <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{mov.ticketDetail || '-'}</td>
                          <td className="py-3.5 px-4 text-center"><StateBadge state={state} /></td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between">
              <span>Mostrando <strong>{clientMovements.length}</strong> registros</span>
              <span className="font-medium">Total pendiente: <strong className="text-rose-600">{fmt(totalDebt)}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* TAB: RECIBOS */}
      {activeTab === 'recibos' && (
        <div className="space-y-3">
          {selectedRecIds.length > 0 && (
            <div className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 flex-wrap">
              <p className="text-xs font-semibold text-slate-700">
                <CheckSquare className="w-4 h-4 inline mr-1 text-indigo-500" />
                {selectedRecIds.length} recibo(s) seleccionado(s)
              </p>
              <div className="flex gap-2">
                {pendingReceiptsSelected && (
                  <>
                    <Button size="sm" variant="primary" leftIcon={<FileBadge className="w-3.5 h-3.5" />} onClick={handleBillReceipts}>
                      Facturar
                    </Button>
                    <Button size="sm" variant="danger" leftIcon={<Trash2 className="w-3.5 h-3.5" />} onClick={handleDeleteReceipts}>
                      Eliminar
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200">
              <h4 className="font-bold text-slate-900 text-sm">Recibos emitidos</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Solo recibos en estado Pendiente son editables</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4 w-8"></th>
                    <th className="py-3 px-4 text-left">Fecha y Hora Emisión</th>
                    <th className="py-3 px-4 text-left">N° Recibo</th>
                    <th className="py-3 px-4 text-right">Monto Total</th>
                    <th className="py-3 px-4 text-center">Estado</th>
                    <th className="py-3 px-4 text-left">Usuario</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {clientReceipts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                          <Receipt className="w-8 h-8 text-slate-300" />
                          <p className="font-semibold text-slate-600">No hay recibos generados</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    clientReceipts.map(rec => {
                      const selectable = rec.status === 'Pendiente';
                      const isSelected = selectedRecIds.includes(rec.id);
                      return (
                        <tr
                          key={rec.id}
                          onClick={() => toggleRecSelection(rec.id)}
                          className={`transition-colors ${
                            selectable ? 'cursor-pointer hover:bg-emerald-50/50' : 'cursor-not-allowed opacity-60'
                          } ${isSelected ? 'bg-emerald-50 border-l-2 border-emerald-400' : ''}`}
                        >
                          <td className="py-3.5 px-4">
                            {selectable && (
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                                isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'
                              }`}>
                                {isSelected && <div className="w-2 h-2 bg-white rounded-sm" />}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-medium whitespace-nowrap">{rec.dateTime}</td>
                          <td className="py-3.5 px-4 font-mono text-emerald-700 font-semibold">{rec.receiptNumber}</td>
                          <td className="py-3.5 px-4 text-right font-bold text-slate-900">{fmt(rec.totalAmount)}</td>
                          <td className="py-3.5 px-4 text-center"><StateBadge state={rec.status} /></td>
                          <td className="py-3.5 px-4 text-slate-600">{rec.userName}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
              <span>Mostrando <strong>{clientReceipts.length}</strong> registros</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------
// VISTA PRINCIPAL - LISTADO DE CLIENTES
// -----------------------------------------------
export function CurrentAccountView() {
  const [movements, setMovements] = useState<CurrentAccountMovement[]>(INITIAL_CC_MOVEMENTS);
  const [receipts, setReceipts] = useState<ReceiptType[]>(INITIAL_RECEIPTS);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const handleDataChange = (newMovements: CurrentAccountMovement[], newReceipts: ReceiptType[]) => {
    setMovements(newMovements);
    setReceipts(newReceipts);
  };

  // Summaries
  const totalDebt = useMemo(
    () => INITIAL_CC_CLIENTS.reduce((acc, c) => {
      const pending = movements.filter(m => m.clientId === c.id && m.lineState === 'Pendiente').reduce((s, m) => s + m.total, 0);
      return acc + pending;
    }, 0),
    [movements]
  );

  const pendingReceipts = receipts.filter(r => r.status === 'Pendiente').length;
  const billedReceipts = receipts.filter(r => r.status === 'Facturado').length;

  // Client debt calculation
  const getClientDebt = (clientId: string) =>
    movements.filter(m => m.clientId === clientId && m.lineState === 'Pendiente').reduce((acc, m) => acc + m.total, 0);

  const getLastMovement = (clientId: string) => {
    const clientMovs = movements.filter(m => m.clientId === clientId);
    if (clientMovs.length === 0) return '-';
    return clientMovs.sort((a, b) => b.dateTime.localeCompare(a.dateTime))[0].dateTime;
  };

  const columns = [
    {
      key: 'code',
      header: 'ID Cliente',
      sortable: true,
      render: (c: Client) => (
        <span className="font-mono text-slate-500 text-[11px]">{c.code}</span>
      ),
    },
    {
      key: 'name',
      header: 'Cliente',
      sortable: true,
      render: (c: Client) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-black">{c.name.charAt(0)}</span>
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-xs">{c.name}</p>
            {c.phone && <p className="text-[10px] text-slate-400">{c.phone}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'debt',
      header: 'Total Acumulado',
      sortable: true,
      align: 'right' as const,
      render: (c: Client) => {
        const debt = getClientDebt(c.id);
        return (
          <span className={`font-black text-sm ${debt > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {fmt(debt)}
          </span>
        );
      },
    },
    {
      key: 'lastMovement',
      header: 'Ultimo Movimiento',
      render: (c: Client) => (
        <span className="text-slate-500 text-xs flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-400" />
          {getLastMovement(c.id)}
        </span>
      ),
    },
    {
      key: 'isEmployee',
      header: 'Es Empleado',
      align: 'center' as const,
      render: (c: Client) => (
        EMPLOYEE_CLIENT_IDS.includes(c.id) ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold border border-violet-200">
            <UserCheck className="w-3 h-3" /> Si
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-semibold border border-slate-200">
            No
          </span>
        )
      ),
    },
  ];

  if (selectedClient) {
    return (
      <ClientDetailView
        client={selectedClient}
        movements={movements}
        receipts={receipts}
        isEmployee={EMPLOYEE_CLIENT_IDS.includes(selectedClient.id)}
        onBack={() => setSelectedClient(null)}
        onDataChange={handleDataChange}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Gestion Operativa</span>
            <span>/</span>
            <span className="text-indigo-600 font-semibold">Ventas</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Cuenta Corriente</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            Cuenta Corriente
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestion de cuentas corrientes de clientes, consumos y recibos
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard
          icon={<Users className="w-5 h-5" />}
          label="Clientes CC"
          value={INITIAL_CC_CLIENTS.length}
          accent="bg-indigo-50 text-indigo-600"
        />
        <SummaryCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Total Pendiente"
          value={fmt(totalDebt)}
          accent="bg-rose-50 text-rose-600"
        />
        <SummaryCard
          icon={<AlertCircle className="w-5 h-5" />}
          label="Recibos Pendientes"
          value={pendingReceipts}
          accent="bg-amber-50 text-amber-600"
        />
        <SummaryCard
          icon={<FileBadge className="w-5 h-5" />}
          label="Recibos Facturados"
          value={billedReceipts}
          accent="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Clients Table */}
      <StandardDataTable
        data={INITIAL_CC_CLIENTS}
        columns={columns}
        keyExtractor={c => c.id}
        title="Clientes con Cuenta Corriente"
        subtitle="Haga clic en un cliente para ver el detalle de su cuenta corriente"
        searchFilterKey={c => `${c.name} ${c.code} ${c.phone}`}
        searchPlaceholder="Buscar cliente..."
        emptyMessage="No hay clientes con cuenta corriente habilitada."
        emptyIcon={<Users className="w-8 h-8 text-slate-300" />}
        onRowClick={c => setSelectedClient(c)}
      />
    </div>
  );
}
