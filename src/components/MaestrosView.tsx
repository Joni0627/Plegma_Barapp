import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Client, AppUser, Category, Warehouse, UserRole } from '../types';
import { Button } from './ui/Button';
import { FormField, TextInput, SelectInput, SelectWithInlineAdd } from './ui/Form';
import { StandardDataTable, Column } from './ui/DataTable';
import {
  Package,
  Store,
  Users,
  Tag,
  Building2,
  Utensils,
  UserCheck,
  ShieldCheck,
  Building,
  Plus,
  X,
  ChevronRight,
  CheckCircle2,
  Lock,
  Edit3,
  Trash2,
  AlertTriangle,
  ArrowLeft,
  Palette,
  Layout,
  Type,
  Paintbrush,
} from 'lucide-react';

interface MaestrosViewProps {
  onNavigateToItems: () => void;
  onOpenNewProvider: () => void;
}

export const MaestrosView: React.FC<MaestrosViewProps> = ({
  onNavigateToItems,
  onOpenNewProvider,
}) => {
  const {
    providers,
    items,
    userRole,
    users,
    addUser,
    updateUser,
    deleteUser,
    rolePermissions,
    updateRolePermissions,
    branding,
    updateBranding,
    hasPermission,
  } = useApp();

  // Master Data State
  const [clients, setClients] = useState<Client[]>([
    {
      id: 'cli-1',
      code: 'CLI-001',
      name: 'Salón Principal Las Heras',
      clientType: 'Salón Eventos',
      cuit: '30-71122334-9',
      address: 'Av. Las Heras 2450',
      email: 'salon@plegma.com',
      phone: '011-4555-9988',
      active: true,
    },
    {
      id: 'cli-2',
      code: 'CLI-002',
      name: 'Barra Speakeasy Palermo',
      clientType: 'Barra / Coctelería',
      cuit: '30-88776655-4',
      address: 'Honduras 4890',
      email: 'barras@plegma.com',
      phone: '011-4777-1122',
      active: true,
    },
    {
      id: 'cli-3',
      code: 'CLI-003',
      name: 'Corporativo Tech Summit',
      clientType: 'Catering Corporativo',
      cuit: '30-65432109-1',
      address: 'Puerto Madero 1100',
      email: 'eventos@techsummit.com',
      phone: '011-5222-3344',
      active: true,
    },
  ]);

  const [categories, setCategories] = useState<Category[]>([
    { id: 'cat-1', name: 'Fresco & Lácteos', description: 'Quesos, manteca, crema y lácteos frescos', itemCount: 12 },
    { id: 'cat-2', name: 'Carnicería & Fritos', description: 'Cortes vacunos, cerdos y aves', itemCount: 8 },
    { id: 'cat-3', name: 'Almacén & Secos', description: 'Harinas, aceites, especias y conservas', itemCount: 25 },
    { id: 'cat-4', name: 'Bebidas & Coctelería', description: 'Vinos, destilados, aperitivos y refrescos', itemCount: 30 },
  ]);

  const [warehouses, setWarehouses] = useState<Warehouse[]>([
    { id: 'wh-1', code: 'DEP-01', name: 'Depósito Central Secos', type: 'Seco', responsibleName: 'Jorge Lopez', active: true },
    { id: 'wh-2', code: 'CAM-01', name: 'Cámara Principal Frío', type: 'Frío', responsibleName: 'Marcos Soler', active: true },
    { id: 'wh-3', code: 'BAR-01', name: 'Barra & Salón', type: 'Barra', responsibleName: 'Sofía Rossi', active: true },
  ]);

  // Active Sub-view State (null = Main Grid Dashboard)
  const [activeSubView, setActiveSubView] = useState<
    'clientes' | 'usuarios' | 'perfiles' | 'categorias' | 'depositos' | 'branding' | null
  >(null);

  // Form Modal State (for creating or editing records)
  const [formModal, setFormModal] = useState<{
    entity: 'cliente' | 'usuario' | 'categoria' | 'deposito';
    isNew: boolean;
    data: any;
  } | null>(null);

  // Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    confirmText: string;
    isDanger?: boolean;
    onConfirm: () => void;
  } | null>(null);

  // Toast Notification State
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'danger' | 'info';
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'danger' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAddInlineCategory = (catName: string) => {
    if (!catName.trim()) return;
    const catToAdd: Category = {
      id: 'cat-' + Date.now(),
      name: catName,
      description: 'Creado desde desplegable',
      itemCount: 0,
    };
    setCategories((prev) => [...prev, catToAdd]);
    showToast(`Categoría "${catName}" agregada al catálogo.`, 'success');
  };

  // --- CRUD HANDLERS WITH CONFIRMATION & TOAST ---

  // 1. CLIENTES
  const handleOpenClientForm = (client?: Client) => {
    if (client) {
      setFormModal({
        entity: 'cliente',
        isNew: false,
        data: {
          id: client.id || '',
          code: client.code || '',
          name: client.name || '',
          clientType: client.clientType || 'Salon',
          cuit: client.cuit || '',
          address: client.address || '',
          phone: client.phone || '',
          email: client.email || '',
          categoryId: client.categoryId || '',
          active: client.active ?? true,
        },
      });
    } else {
      setFormModal({
        entity: 'cliente',
        isNew: true,
        data: {
          id: 'cli-' + Date.now(),
          code: `CLI-00${clients.length + 1}`,
          name: '',
          clientType: 'Salon',
          cuit: '',
          address: '',
          phone: '',
          email: '',
          categoryId: '',
          active: true,
        },
      });
    }
  };

  const handleSaveClient = (clientData: Client, isNew: boolean) => {
    if (!clientData.name?.trim()) return;
    const actionWord = isNew ? 'guardar' : 'actualizar';

    setConfirmDialog({
      title: isNew ? 'Confirmar Nuevo Cliente' : 'Guardar Modificaciones de Cliente',
      message: `¿Estás seguro de que deseas ${actionWord} los datos del cliente "${clientData.name}"?`,
      confirmText: isNew ? 'Crear Cliente' : 'Guardar Cambios',
      onConfirm: () => {
        if (isNew) {
          setClients((prev) => [clientData, ...prev]);
          showToast(`Cliente "${clientData.name}" registrado con éxito.`, 'success');
        } else {
          setClients((prev) => prev.map((c) => (c.id === clientData.id ? clientData : c)));
          showToast(`Cliente "${clientData.name}" actualizado correctamente.`, 'success');
        }
        setFormModal(null);
      },
    });
  };

  const handleDeleteClient = (clientId: string, clientName: string) => {
    setConfirmDialog({
      title: '¡Atención! Eliminar Cliente',
      message: `¿Confirmas eliminar permanentemente al cliente "${clientName}"?`,
      confirmText: 'Eliminar Registro',
      isDanger: true,
      onConfirm: () => {
        setClients((prev) => prev.filter((c) => c.id !== clientId));
        showToast(`Cliente "${clientName}" eliminado.`, 'danger');
        setFormModal(null);
      },
    });
  };

  // 2. USUARIOS
  const handleOpenUserForm = (user?: AppUser) => {
    if (user) {
      setFormModal({
        entity: 'usuario',
        isNew: false,
        data: {
          id: user.id || user.dni || '',
          dni: user.dni || user.id || '',
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || '',
          role: user.role || 'compras',
          status: user.status || 'Activo',
          lastAccess: user.lastAccess || 'Hoy',
          canInlineCreate: user.customPermissions?.canInlineCreate ?? true,
          canCreate: user.customPermissions?.canCreate ?? true,
          canEdit: user.customPermissions?.canEdit ?? true,
          canDelete: user.customPermissions?.canDelete ?? false,
        },
      });
    } else {
      setFormModal({
        entity: 'usuario',
        isNew: true,
        data: {
          id: '',
          dni: '',
          name: '',
          email: '',
          phone: '',
          address: '',
          role: 'compras',
          status: 'Activo',
          canInlineCreate: true,
          canCreate: true,
          canEdit: true,
          canDelete: false,
        },
      });
    }
  };

  const handleSaveUser = (userData: any, isNew: boolean) => {
    if (!userData.dni?.trim() || !userData.name?.trim() || !userData.email?.trim()) return;

    const userToSave: AppUser = {
      id: userData.dni.trim(),
      dni: userData.dni.trim(),
      name: userData.name.trim(),
      email: userData.email.trim(),
      phone: userData.phone || '',
      address: userData.address || '',
      role: userData.role || 'compras',
      status: userData.status || 'Activo',
      lastAccess: isNew ? 'Recién creado' : userData.lastAccess,
      customPermissions: {
        canInlineCreate: Boolean(userData.canInlineCreate),
        canCreate: Boolean(userData.canCreate),
        canEdit: Boolean(userData.canEdit),
        canDelete: Boolean(userData.canDelete),
      },
    };

    setConfirmDialog({
      title: isNew ? 'Confirmar Alta de Usuario' : 'Guardar Cambios de Usuario',
      message: `¿Confirmas ${isNew ? 'dar de alta' : 'modificar'} al usuario "${userToSave.name}" (DNI: ${userToSave.dni})?`,
      confirmText: isNew ? 'Dar de Alta' : 'Guardar Cambios',
      onConfirm: () => {
        if (isNew) {
          addUser(userToSave);
          showToast(`Usuario "${userToSave.name}" registrado con éxito.`, 'success');
        } else {
          updateUser(userToSave);
          showToast(`Usuario "${userToSave.name}" actualizado correctamente.`, 'success');
        }
        setFormModal(null);
      },
    });
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    setConfirmDialog({
      title: '¡Atención! Eliminar Usuario',
      message: `¿Confirmas eliminar al usuario "${userName}"? Perderá el acceso al sistema.`,
      confirmText: 'Eliminar Usuario',
      isDanger: true,
      onConfirm: () => {
        deleteUser(userId);
        showToast(`Usuario "${userName}" eliminado.`, 'danger');
        setFormModal(null);
      },
    });
  };

  // 3. CATEGORÍAS
  const handleOpenCategoryForm = (category?: Category) => {
    if (category) {
      setFormModal({
        entity: 'categoria',
        isNew: false,
        data: {
          id: category.id || '',
          name: category.name || '',
          description: category.description || '',
          itemCount: category.itemCount || 0,
        },
      });
    } else {
      setFormModal({
        entity: 'categoria',
        isNew: true,
        data: {
          id: 'cat-' + Date.now(),
          name: '',
          description: '',
          itemCount: 0,
        },
      });
    }
  };

  const handleSaveCategory = (catData: Category, isNew: boolean) => {
    if (!catData.name?.trim()) return;

    setConfirmDialog({
      title: isNew ? 'Confirmar Nueva Categoría' : 'Guardar Cambios en Categoría',
      message: `¿Deseas guardar la categoría "${catData.name}"?`,
      confirmText: isNew ? 'Crear Categoría' : 'Guardar Cambios',
      onConfirm: () => {
        if (isNew) {
          setCategories((prev) => [catData, ...prev]);
          showToast(`Categoría "${catData.name}" creada con éxito.`, 'success');
        } else {
          setCategories((prev) => prev.map((c) => (c.id === catData.id ? catData : c)));
          showToast(`Categoría "${catData.name}" modificada correctamente.`, 'success');
        }
        setFormModal(null);
      },
    });
  };

  const handleDeleteCategory = (catId: string, catName: string) => {
    setConfirmDialog({
      title: 'Eliminar Categoría',
      message: `¿Confirmas eliminar la categoría "${catName}"?`,
      confirmText: 'Eliminar Categoría',
      isDanger: true,
      onConfirm: () => {
        setCategories((prev) => prev.filter((c) => c.id !== catId));
        showToast(`Categoría "${catName}" eliminada.`, 'danger');
        setFormModal(null);
      },
    });
  };

  // 4. DEPÓSITOS
  const handleOpenWarehouseForm = (warehouse?: Warehouse) => {
    if (warehouse) {
      setFormModal({
        entity: 'deposito',
        isNew: false,
        data: {
          id: warehouse.id || '',
          code: warehouse.code || '',
          name: warehouse.name || '',
          type: warehouse.type || 'Seco',
          responsibleName: warehouse.responsibleName || '',
          active: warehouse.active ?? true,
        },
      });
    } else {
      setFormModal({
        entity: 'deposito',
        isNew: true,
        data: {
          id: 'wh-' + Date.now(),
          code: `DEP-0${warehouses.length + 1}`,
          name: '',
          type: 'Seco',
          responsibleName: '',
          active: true,
        },
      });
    }
  };

  const handleSaveWarehouse = (whData: Warehouse, isNew: boolean) => {
    if (!whData.name?.trim()) return;

    setConfirmDialog({
      title: isNew ? 'Confirmar Ubicación' : 'Modificar Ubicación',
      message: `¿Deseas guardar la ubicación "${whData.name}"?`,
      confirmText: isNew ? 'Crear Ubicación' : 'Guardar Cambios',
      onConfirm: () => {
        if (isNew) {
          setWarehouses((prev) => [whData, ...prev]);
          showToast(`Depósito "${whData.name}" registrado con éxito.`, 'success');
        } else {
          setWarehouses((prev) => prev.map((w) => (w.id === whData.id ? whData : w)));
          showToast(`Depósito "${whData.name}" actualizado correctamente.`, 'success');
        }
        setFormModal(null);
      },
    });
  };

  const handleDeleteWarehouse = (whId: string, whName: string) => {
    setConfirmDialog({
      title: 'Eliminar Ubicación',
      message: `¿Confirmas eliminar la ubicación "${whName}"?`,
      confirmText: 'Eliminar Ubicación',
      isDanger: true,
      onConfirm: () => {
        setWarehouses((prev) => prev.filter((w) => w.id !== whId));
        showToast(`Ubicación "${whName}" eliminada.`, 'danger');
        setFormModal(null);
      },
    });
  };

  const roleNames: Record<UserRole, string> = {
    admin: 'Administrador Total',
    compras: 'Encargado de Compras',
    recepcion: 'Recepcionista de Depósito',
    caja: 'Cajero / Tesorería',
  };

  const roleDescriptions: Record<UserRole, string> = {
    admin: 'Acceso total sin restricciones a compras, configuraciones, usuarios y auditoría.',
    compras: 'Gestión de órdenes de compra, creación de proveedores e insumos.',
    recepcion: 'Control físico de entrega de remitos y conteo de existencias.',
    caja: 'Registro de pagos a proveedores y liquidación de comprobantes.',
  };

  // --- TABLE COLUMNS ---
  const clientColumns: Column<Client>[] = [
    { key: 'code', header: 'Código', width: '12%', render: (c) => <span>{c?.code || '-'}</span> },
    { key: 'name', header: 'Cliente / Salón', render: (c) => <span className="font-bold text-slate-900">{c?.name || '-'}</span> },
    { key: 'clientType', header: 'Tipo', render: (c) => <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-[10px]">{c?.clientType || '-'}</span> },
    { key: 'cuit', header: 'CUIT', render: (c) => <span className="font-mono text-slate-600">{c?.cuit || '-'}</span> },
    { key: 'phone', header: 'Contacto', render: (c) => <span>{c?.phone || '-'}</span> },
    {
      key: 'actions',
      header: 'Acción',
      align: 'center',
      width: '10%',
      render: (c) => (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            if (c) handleOpenClientForm(c);
          }}
          variant="outline"
          size="sm"
          className="p-1.5 h-auto text-xs"
        >
          <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
        </Button>
      ),
    },
  ];

  const userColumns: Column<AppUser>[] = [
    { key: 'dni', header: 'DNI (Key)', render: (u) => <span className="font-mono font-bold text-indigo-700">{u?.dni || u?.id || '-'}</span> },
    { key: 'name', header: 'Nombre / Apellido', render: (u) => <span className="font-bold text-slate-900">{u?.name || '-'}</span> },
    { key: 'email', header: 'Email', render: (u) => <span>{u?.email || '-'}</span> },
    { key: 'phone', header: 'Teléfono', render: (u) => <span>{u?.phone || '-'}</span> },
    { key: 'address', header: 'Dirección', render: (u) => <span className="text-slate-500">{u?.address || '-'}</span> },
    { key: 'role', header: 'Rol', render: (u) => <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 font-bold uppercase text-[10px] rounded">{u?.role || 'admin'}</span> },
    { key: 'status', header: 'Estado', render: (u) => <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-semibold text-[10px] rounded">{u?.status || 'Activo'}</span> },
    {
      key: 'actions',
      header: 'Acción',
      align: 'center',
      width: '10%',
      render: (u) => (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            if (u) handleOpenUserForm(u);
          }}
          variant="outline"
          size="sm"
          className="p-1.5 h-auto text-xs"
        >
        </Button>
      ),
    },
  ];

  const categoryColumns: Column<Category>[] = [
    { key: 'name', header: 'Rubro / Categoría', render: (c) => <span className="font-bold text-slate-900">{c?.name || '-'}</span> },
    { key: 'description', header: 'Descripción', render: (c) => <span>{c?.description || '-'}</span> },
    { key: 'itemCount', header: 'Insumos', align: 'center', render: (c) => <span className="px-2 py-0.5 bg-purple-100 text-purple-800 font-bold text-[10px] rounded">{c?.itemCount || 0}</span> },
    {
      key: 'actions',
      header: 'Acción',
      align: 'center',
      width: '12%',
      render: (c) => (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            if (c) handleOpenCategoryForm(c);
          }}
          variant="outline"
          size="sm"
          className="p-1.5 h-auto text-xs"
        >
          <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
        </Button>
      ),
    },
  ];

  const warehouseColumns: Column<Warehouse>[] = [
    { key: 'code', header: 'Código', width: '15%', render: (w) => <span>{w?.code || '-'}</span> },
    { key: 'name', header: 'Ubicación', render: (w) => <span className="font-bold text-slate-900">{w?.name || '-'}</span> },
    { key: 'type', header: 'Tipo', render: (w) => <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-semibold text-[10px]">{w?.type || '-'}</span> },
    { key: 'responsibleName', header: 'Responsable', render: (w) => <span>{w?.responsibleName || '-'}</span> },
    {
      key: 'actions',
      header: 'Acción',
      align: 'center',
      width: '12%',
      render: (w) => (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            if (w) handleOpenWarehouseForm(w);
          }}
          variant="outline"
          size="sm"
          className="p-1.5 h-auto text-xs"
        >
          <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Toast Notification Component */}
      {toast && (
        <div className="fixed top-6 right-6 z-[100] animate-bounce-short">
          <div
            className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-semibold text-white ${
              toast.type === 'success'
                ? 'bg-emerald-900 border-emerald-700 text-emerald-100'
                : toast.type === 'danger'
                ? 'bg-rose-900 border-rose-700 text-rose-100'
                : 'bg-slate-900 border-slate-700 text-slate-100'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 text-amber-400" />
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 text-white/70 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog Modal */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[90] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div
                className={`p-2.5 rounded-xl ${
                  confirmDialog.isDanger ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-700'
                }`}
              >
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">{confirmDialog.title}</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{confirmDialog.message}</p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setConfirmDialog(null)}>
                Cancelar
              </Button>
              <Button
                variant={confirmDialog.isDanger ? 'danger' : 'primary'}
                size="sm"
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog(null);
                }}
              >
                {confirmDialog.confirmText}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD CENTRAL DE MAESTROS (grid de tarjetas) */}
      {activeSubView === null && (
        <div className="space-y-8 animate-fadeIn">
          {/* View Header */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-xl border border-slate-800">
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Centro de Administración de Maestros
              </h1>
              <p className="text-sm text-slate-300 max-w-2xl">
                Gestiona de forma centralizada las tablas maestras, parámetros, usuarios y catálogos de <strong className="text-amber-400">PLEGMA Gatro</strong>.
              </p>
            </div>
          </div>

          {/* SECTION 1: CADENA DE SUMINISTRO & PROCESOS OPERATIVOS */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-lg border-b border-slate-200 pb-2">
              <Store className="w-5 h-5 text-indigo-600" />
              <h2>Procesos Operativos & Cadena de Suministro</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* CARD 1: MATERIALES E INSUMOS */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition group flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl group-hover:scale-105 transition">
                      <Package className="w-6 h-6" />
                    </div>
                    <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full">
                      {items.length} Insumos
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-amber-600 transition">
                      Maestro Materiales e Insumos
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Catálogo unificado de materias primas, unidades de compra, categorías y stocks mínimos.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={onNavigateToItems}
                  variant="outline"
                  size="sm"
                  className="mt-6 w-full justify-between"
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Ver Tabla de Insumos
                </Button>
              </div>

              {/* CARD 2: PROVEEDORES */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition group flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl group-hover:scale-105 transition">
                      <Store className="w-6 h-6" />
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full">
                      {providers.length} Proveedores
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition">
                      Maestro de Proveedores
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Padrón de proveedores habituales, días de pedido, contactos y condiciones de pago.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={onOpenNewProvider}
                  variant="outline"
                  size="sm"
                  className="mt-6 w-full justify-between"
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Registrar Proveedor
                </Button>
              </div>

              {/* CARD 3: CLIENTES */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition group flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl group-hover:scale-105 transition">
                      <Users className="w-6 h-6" />
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">
                      {clients.length} Clientes
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-600 transition">
                      Maestro de Clientes
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Listado de salones, barras, eventos y clientes corporativos con rubros asociados.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setActiveSubView('clientes')}
                  variant="outline"
                  size="sm"
                  className="mt-6 w-full justify-between"
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Ver Tabla Clientes
                </Button>
              </div>

              {/* CARD 4: CATEGORÍAS & RUBROS */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition group flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xl group-hover:scale-105 transition">
                      <Tag className="w-6 h-6" />
                    </div>
                    <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-1 rounded-full">
                      {categories.length} Rubros
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-purple-600 transition">
                      Categorías & Rubros
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Clasificación de familias de insumos (Carnes, Lácteos, Bebidas, Almacén, etc.).
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setActiveSubView('categorias')}
                  variant="outline"
                  size="sm"
                  className="mt-6 w-full justify-between"
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Ver Categorías
                </Button>
              </div>

              {/* CARD 5: DEPÓSITOS Y UBICACIONES */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition group flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xl group-hover:scale-105 transition">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-1 rounded-full">
                      {warehouses.length} Depósitos
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-rose-600 transition">
                      Depósitos & Ubicaciones
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Almacenes de recepción (Cámara Frío, Depósito Secos, Barra Principal).
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setActiveSubView('depositos')}
                  variant="outline"
                  size="sm"
                  className="mt-6 w-full justify-between"
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Ver Ubicaciones
                </Button>
              </div>

              {/* CARD 6: RECETAS / ESCANDALLOS */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition group flex flex-col justify-between opacity-80">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xl">
                      <Utensils className="w-6 h-6" />
                    </div>
                    <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full">
                      Próximamente
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      Recetas & Escandallos
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Composición de platos y cocktails para explosión técnica de insumos y costos.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => alert('Próximamente: Módulo de Recetas y Escandallos.')}
                  variant="outline"
                  size="sm"
                  className="mt-6 w-full justify-between"
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Explorar Escandallos
                </Button>
              </div>
            </div>
          </section>

          {/* SECTION 2: ADMINISTRACIÓN DE USUARIOS & SEGURIDAD */}
          <section className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-lg border-b border-slate-200 pb-2">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              <h2>Administración de Usuarios & Seguridad</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* CARD 7: USUARIOS DEL SISTEMA */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition group flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl group-hover:scale-105 transition">
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-1 rounded-full">
                      {users.length} Activos
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition">
                      Maestro de Usuarios
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Altas de personal con DNI (Key DB), roles operativos y permisos individuales por usuario.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setActiveSubView('usuarios')}
                  variant="outline"
                  size="sm"
                  className="mt-6 w-full justify-between"
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Ver Tabla Usuarios
                </Button>
              </div>

              {/* CARD 8: PERFILES & PERMISOS (RBAC) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition group flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold text-xl group-hover:scale-105 transition">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <span className="bg-cyan-100 text-cyan-800 text-xs font-bold px-2.5 py-1 rounded-full">
                      4 Perfiles
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-cyan-600 transition">
                      Perfiles & Permisos (RBAC)
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Configuración de visibilidad de botones (+) y permisos globales por rol.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setActiveSubView('perfiles')}
                  variant="outline"
                  size="sm"
                  className="mt-6 w-full justify-between"
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Ver Matriz RBAC
                </Button>
              </div>

              {/* CARD 9: SUCURSALES & CENTROS DE COSTO */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition group flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xl group-hover:scale-105 transition">
                      <Building className="w-6 h-6" />
                    </div>
                    <span className="bg-teal-100 text-teal-700 text-xs font-bold px-2.5 py-1 rounded-full">
                      Centros de Costo
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-teal-600 transition">
                      Sucursales & Centros de Costo
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Imputación presupuestaria por local, barra o punto de venta de la marca.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => alert('Módulo de Centros de Costo listo para vinculación contable.')}
                  variant="outline"
                  size="sm"
                  className="mt-6 w-full justify-between"
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Configurar Sucursales
                </Button>
              </div>

              {/* CARD 10: BRANDING & IDENTIDAD VISUAL */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition group flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center font-bold text-xl group-hover:scale-105 transition">
                      <Palette className="w-6 h-6" />
                    </div>
                    <span className="bg-pink-100 text-pink-800 text-xs font-bold px-2.5 py-1 rounded-full">
                      Personalización
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-pink-600 transition">
                      Branding & Identidad Visual
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Configuración de menú (superior/lateral), estilos de botones, colores y tipografía de la app.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setActiveSubView('branding')}
                  variant="outline"
                  size="sm"
                  className="mt-6 w-full justify-between"
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Configurar Branding
                </Button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* --- VISTAS INTEGRADAS A PANTALLA COMPLETA --- */}

      {/* VISTA 1: TABLA MAESTRO CLIENTES */}
      {activeSubView === 'clientes' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Sub-view con Botón Volver */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveSubView(null)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Volver a Maestros
              </Button>
              <div className="h-6 w-px bg-slate-200 hidden sm:block" />
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-600" />
                  <span>Maestro de Clientes</span>
                </h2>
                <p className="text-xs text-slate-500">Listado de salones y clientes registrados. Haz clic en una fila para editar o eliminar.</p>
              </div>
            </div>
            <Button
              onClick={() => handleOpenClientForm()}
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
              requiredPermission="canCreate"
              hideIfNoPermission={false}
            >
              + Nuevo Registro
            </Button>
          </div>

          <StandardDataTable
            data={clients}
            columns={clientColumns}
            keyExtractor={(c) => c?.id || c?.code || Math.random().toString()}
            searchFilterKey={(c) => `${c?.code || ''} ${c?.name || ''} ${c?.clientType || ''} ${c?.cuit || ''}`}
            searchPlaceholder="Buscar cliente por nombre, código o CUIT..."
            title="Clientes Registrados"
            onRowClick={(c) => handleOpenClientForm(c)}
          />
        </div>
      )}

      {/* VISTA 2: TABLA MAESTRO USUARIOS */}
      {activeSubView === 'usuarios' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Sub-view con Botón Volver */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveSubView(null)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Volver a Maestros
              </Button>
              <div className="h-6 w-px bg-slate-200 hidden sm:block" />
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-600" />
                  <span>Maestro de Usuarios</span>
                </h2>
                <p className="text-xs text-slate-500">Padrón de personal con DNI (Key DB). Haz clic en un usuario para editar sus datos o permisos.</p>
              </div>
            </div>
            <Button
              onClick={() => handleOpenUserForm()}
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
              requiredPermission="canCreate"
              hideIfNoPermission={false}
            >
              + Nuevo Registro
            </Button>
          </div>

          <StandardDataTable
            data={users}
            columns={userColumns}
            keyExtractor={(u) => u?.id || u?.dni || Math.random().toString()}
            searchFilterKey={(u) => `${u?.dni || u?.id || ''} ${u?.name || ''} ${u?.email || ''} ${u?.role || ''}`}
            searchPlaceholder="Buscar usuario por DNI, nombre o email..."
            title="Usuarios del Sistema"
            onRowClick={(u) => handleOpenUserForm(u)}
          />
        </div>
      )}

      {/* VISTA 3: PERFILES & PERMISOS (RBAC) */}
      {activeSubView === 'perfiles' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Sub-view con Botón Volver */}
          <div className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveSubView(null)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Volver a Maestros
            </Button>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-600" />
                <span>Matriz de Permisos Estandarizados (RBAC)</span>
              </h2>
              <p className="text-xs text-slate-500">Configura permisos especiales por rol para botones y creación inline dentro de desplegables.</p>
            </div>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600" />
              <span>Rol Actualmente Activo en Navbar: <strong className="uppercase font-bold text-amber-900">{userRole}</strong></span>
            </div>
            <span className="text-[11px] text-amber-700 font-medium">Los cambios aplicados abajo se reflejan inmediatamente</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(['admin', 'compras', 'recepcion', 'caja'] as UserRole[]).map((r) => {
              const perms = rolePermissions[r];
              return (
                <div key={r} className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{roleNames[r]}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{roleDescriptions[r]}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-800 font-mono text-xs rounded-full uppercase font-bold">{r}</span>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                    <label className="flex items-center justify-between cursor-pointer hover:bg-slate-50 p-2.5 rounded-xl border border-slate-100 transition">
                      <span className="text-slate-800 font-semibold">Boton (+) en Desplegables</span>
                      <input
                        type="checkbox"
                        checked={Boolean(perms?.canInlineCreate)}
                        onChange={(e) => {
                          updateRolePermissions(r, { canInlineCreate: e.target.checked });
                          showToast(`Permisos del rol ${roleNames[r]} actualizados.`, 'info');
                        }}
                        className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer hover:bg-slate-50 p-2.5 rounded-xl border border-slate-100 transition">
                      <span className="text-slate-800 font-semibold">Permiso para Crear</span>
                      <input
                        type="checkbox"
                        checked={Boolean(perms?.canCreate)}
                        onChange={(e) => {
                          updateRolePermissions(r, { canCreate: e.target.checked });
                          showToast(`Permisos del rol ${roleNames[r]} actualizados.`, 'info');
                        }}
                        className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer hover:bg-slate-50 p-2.5 rounded-xl border border-slate-100 transition">
                      <span className="text-slate-800 font-semibold">Permiso para Editar</span>
                      <input
                        type="checkbox"
                        checked={Boolean(perms?.canEdit)}
                        onChange={(e) => {
                          updateRolePermissions(r, { canEdit: e.target.checked });
                          showToast(`Permisos del rol ${roleNames[r]} actualizados.`, 'info');
                        }}
                        className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer hover:bg-slate-50 p-2.5 rounded-xl border border-slate-100 transition">
                      <span className="text-slate-800 font-semibold">Permiso para Eliminar</span>
                      <input
                        type="checkbox"
                        checked={Boolean(perms?.canDelete)}
                        onChange={(e) => {
                          updateRolePermissions(r, { canDelete: e.target.checked });
                          showToast(`Permisos del rol ${roleNames[r]} actualizados.`, 'info');
                        }}
                        className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
                      />
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VISTA 4: TABLA CATEGORÍAS */}
      {activeSubView === 'categorias' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Sub-view con Botón Volver */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveSubView(null)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Volver a Maestros
              </Button>
              <div className="h-6 w-px bg-slate-200 hidden sm:block" />
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-purple-600" />
                  <span>Maestro de Categorías & Rubros</span>
                </h2>
                <p className="text-xs text-slate-500">Haz clic en una fila para editar o eliminar la categoría.</p>
              </div>
            </div>
            <Button
              onClick={() => handleOpenCategoryForm()}
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
              requiredPermission="canCreate"
              hideIfNoPermission={false}
            >
              + Nuevo Registro
            </Button>
          </div>

          <StandardDataTable
            data={categories}
            columns={categoryColumns}
            keyExtractor={(c) => c?.id || Math.random().toString()}
            searchFilterKey={(c) => `${c?.name || ''} ${c?.description || ''}`}
            searchPlaceholder="Buscar rubro por nombre..."
            title="Rubros Registrados"
            onRowClick={(c) => handleOpenCategoryForm(c)}
          />
        </div>
      )}

      {/* VISTA 5: TABLA DEPÓSITOS */}
      {activeSubView === 'depositos' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Sub-view con Botón Volver */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveSubView(null)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Volver a Maestros
              </Button>
              <div className="h-6 w-px bg-slate-200 hidden sm:block" />
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-rose-600" />
                  <span>Maestro de Depósitos & Ubicaciones</span>
                </h2>
                <p className="text-xs text-slate-500">Haz clic en una fila para editar o eliminar la ubicación.</p>
              </div>
            </div>
            <Button
              onClick={() => handleOpenWarehouseForm()}
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
              requiredPermission="canCreate"
              hideIfNoPermission={false}
            >
              + Nuevo Registro
            </Button>
          </div>

          <StandardDataTable
            data={warehouses}
            columns={warehouseColumns}
            keyExtractor={(w) => w?.id || Math.random().toString()}
            searchFilterKey={(w) => `${w?.code || ''} ${w?.name || ''} ${w?.type || ''} ${w?.responsibleName || ''}`}
            searchPlaceholder="Buscar ubicación por código o nombre..."
            title="Depósitos Registrados"
            onRowClick={(w) => handleOpenWarehouseForm(w)}
          />
        </div>
      )}

      {/* VISTA 6: BRANDING & IDENTIDAD VISUAL */}
      {activeSubView === 'branding' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Sub-view con Botón Volver */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveSubView(null)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Volver a Maestros
              </Button>
              <div className="h-6 w-px bg-slate-200 hidden sm:block" />
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-pink-600" />
                  <span>Branding, Colores & Estudio de Diseño UI</span>
                </h2>
                <p className="text-xs text-slate-500">Configura la paleta hexadecimal por componente, estilos de botones, toggles y tipografías en tiempo real.</p>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
              onClick={() => {
                showToast('Configuración de branding guardada exitosamente.', 'success');
              }}
            >
              Guardar Configuración
            </Button>
          </div>

          {/* Grid Principal de Configuración */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Panel de Opciones (2 Columnas) */}
            <div className="lg:col-span-2 space-y-6">

              {/* SECCIÓN 1: CONFIGURACIÓN EXCLUSIVA DEL MENÚ DE NAVEGACIÓN */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Layout className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Configuración Individual del Menú de Navegación</h3>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Estilo de Disposición (Superior vs Lateral) */}
                  <div className="space-y-2">
                    <label className="font-semibold text-slate-800 block">Disposición de Navegación</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          updateBranding({ navigationStyle: 'top' });
                          showToast('Navegación en Barra Superior aplicada.', 'info');
                        }}
                        className={`p-3 rounded-xl border text-left flex items-center gap-3 transition ${
                          branding.navigationStyle === 'top'
                            ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/20 font-bold'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Layout className="w-4 h-4 text-indigo-600 shrink-0" />
                        <div>
                          <span className="block text-xs text-slate-900">Menú Superior (Barra Horizontal)</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          updateBranding({ navigationStyle: 'sidebar' });
                          showToast('Navegación en Menú Lateral aplicada.', 'info');
                        }}
                        className={`p-3 rounded-xl border text-left flex items-center gap-3 transition ${
                          branding.navigationStyle === 'sidebar'
                            ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/20 font-bold'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Layout className="w-4 h-4 text-indigo-600 rotate-90 shrink-0" />
                        <div>
                          <span className="block text-xs text-slate-900">Menú Lateral (Sidebar Vertical)</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Colores Hex Exclusivos del Menú */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <label className="font-semibold text-slate-800 block">Fondo del Menú (#HEX)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={branding.menuBgHex || '#0f172a'}
                          onChange={(e) => updateBranding({ menuBgHex: e.target.value })}
                          className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                        />
                        <input
                          type="text"
                          value={branding.menuBgHex || '#0f172a'}
                          onChange={(e) => updateBranding({ menuBgHex: e.target.value })}
                          className="flex-1 uppercase font-mono px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-bold text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <label className="font-semibold text-slate-800 block">Texto Inactivo de Menú (#HEX)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={branding.menuTextHex || '#94a3b8'}
                          onChange={(e) => updateBranding({ menuTextHex: e.target.value })}
                          className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                        />
                        <input
                          type="text"
                          value={branding.menuTextHex || '#94a3b8'}
                          onChange={(e) => updateBranding({ menuTextHex: e.target.value })}
                          className="flex-1 uppercase font-mono px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-bold text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <label className="font-semibold text-slate-800 block">Fondo Ítem Activo (#HEX)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={branding.menuActiveBgHex || '#f59e0b'}
                          onChange={(e) => updateBranding({ menuActiveBgHex: e.target.value })}
                          className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                        />
                        <input
                          type="text"
                          value={branding.menuActiveBgHex || '#f59e0b'}
                          onChange={(e) => updateBranding({ menuActiveBgHex: e.target.value })}
                          className="flex-1 uppercase font-mono px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-bold text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <label className="font-semibold text-slate-800 block">Texto Ítem Activo (#HEX)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={branding.menuActiveTextHex || '#0f172a'}
                          onChange={(e) => updateBranding({ menuActiveTextHex: e.target.value })}
                          className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                        />
                        <input
                          type="text"
                          value={branding.menuActiveTextHex || '#0f172a'}
                          onChange={(e) => updateBranding({ menuActiveTextHex: e.target.value })}
                          className="flex-1 uppercase font-mono px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-bold text-slate-900"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Fuente Exclusiva del Menú */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <label className="font-semibold text-slate-800 block">Fuente Exclusiva para el Menú</label>
                    <select
                      value={branding.menuFontFamily || 'Inter'}
                      onChange={(e) => updateBranding({ menuFontFamily: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                    >
                      <option value="Inter">Inter (Modern UI)</option>
                      <option value="Outfit">Outfit (Gastronómico)</option>
                      <option value="Roboto">Roboto (Google Tech)</option>
                      <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                      <option value="Poppins">Poppins (Redondeada)</option>
                      <option value="Space Grotesk">Space Grotesk (Futurista)</option>
                      <option value="Montserrat">Montserrat (Elegante)</option>
                      <option value="Playfair Display">Playfair Display (Gourmet)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 2: PALETA DE COLORES GENERALES (#HEX) */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Palette className="w-4 h-4 text-amber-500" />
                  <h3 className="font-bold text-slate-900 text-sm">Paleta de Colores Generales (#HEX)</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Color Primario Marca */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <label className="font-semibold text-slate-800 block">Color Acento Primario</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={branding.primaryHex || '#f59e0b'}
                        onChange={(e) => updateBranding({ primaryHex: e.target.value })}
                        className="w-9 h-9 rounded-lg cursor-pointer border-0 p-0"
                      />
                      <input
                        type="text"
                        value={branding.primaryHex || '#f59e0b'}
                        onChange={(e) => updateBranding({ primaryHex: e.target.value })}
                        className="flex-1 uppercase font-mono px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Color Fondo App */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <label className="font-semibold text-slate-800 block">Color Fondo App (Body)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={branding.appBgHex || '#f8fafc'}
                        onChange={(e) => updateBranding({ appBgHex: e.target.value })}
                        className="w-9 h-9 rounded-lg cursor-pointer border-0 p-0"
                      />
                      <input
                        type="text"
                        value={branding.appBgHex || '#f8fafc'}
                        onChange={(e) => updateBranding({ appBgHex: e.target.value })}
                        className="flex-1 uppercase font-mono px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Color Fondo Menú */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <label className="font-semibold text-slate-800 block">Fondo de Menú / Navbar</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={branding.menuBgHex || '#0f172a'}
                        onChange={(e) => updateBranding({ menuBgHex: e.target.value })}
                        className="w-9 h-9 rounded-lg cursor-pointer border-0 p-0"
                      />
                      <input
                        type="text"
                        value={branding.menuBgHex || '#0f172a'}
                        onChange={(e) => updateBranding({ menuBgHex: e.target.value })}
                        className="flex-1 uppercase font-mono px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Color Texto Menú */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <label className="font-semibold text-slate-800 block">Texto de Menú</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={branding.menuTextHex || '#f8fafc'}
                        onChange={(e) => updateBranding({ menuTextHex: e.target.value })}
                        className="w-9 h-9 rounded-lg cursor-pointer border-0 p-0"
                      />
                      <input
                        type="text"
                        value={branding.menuTextHex || '#f8fafc'}
                        onChange={(e) => updateBranding({ menuTextHex: e.target.value })}
                        className="flex-1 uppercase font-mono px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Color Botones */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <label className="font-semibold text-slate-800 block">Color Principal de Botones</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={branding.buttonBgHex || '#f59e0b'}
                        onChange={(e) => updateBranding({ buttonBgHex: e.target.value })}
                        className="w-9 h-9 rounded-lg cursor-pointer border-0 p-0"
                      />
                      <input
                        type="text"
                        value={branding.buttonBgHex || '#f59e0b'}
                        onChange={(e) => updateBranding({ buttonBgHex: e.target.value })}
                        className="flex-1 uppercase font-mono px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Color Texto Botones */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <label className="font-semibold text-slate-800 block">Texto de Botones</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={branding.buttonTextHex || '#0f172a'}
                        onChange={(e) => updateBranding({ buttonTextHex: e.target.value })}
                        className="w-9 h-9 rounded-lg cursor-pointer border-0 p-0"
                      />
                      <input
                        type="text"
                        value={branding.buttonTextHex || '#0f172a'}
                        onChange={(e) => updateBranding({ buttonTextHex: e.target.value })}
                        className="flex-1 uppercase font-mono px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 2: PROPIEDADES AVANZADAS DE BOTONES */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Paintbrush className="w-4 h-4 text-emerald-500" />
                  <h3 className="font-bold text-slate-900 text-sm">Configuración Extendida de Botones</h3>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Redondeo de Botones */}
                  <div className="space-y-2">
                    <label className="font-semibold text-slate-800 block">Redondeo (Border Radius)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {[
                        { id: 'rounded-full', label: 'Cápsula Full' },
                        { id: 'rounded-2xl', label: 'Extra XL' },
                        { id: 'rounded-xl', label: 'Suave XL' },
                        { id: 'rounded-lg', label: 'Estándar LG' },
                        { id: 'rounded-none', label: 'Recto 90°' },
                      ].map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => updateBranding({ buttonRadius: r.id as any })}
                          className={`p-2.5 rounded-xl border text-center transition ${
                            branding.buttonRadius === r.id
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-500/20'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sombreado de Botones */}
                  <div className="space-y-2">
                    <label className="font-semibold text-slate-800 block">Sombreado (Box Shadow)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'none', label: 'Sin Sombra' },
                        { id: 'sm', label: 'Sombra Suave' },
                        { id: 'md', label: 'Elevada MD' },
                        { id: 'xl', label: 'Profunda 3D' },
                      ].map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => updateBranding({ buttonShadowStyle: s.id as any })}
                          className={`p-2.5 rounded-xl border text-center transition ${
                            branding.buttonShadowStyle === s.id
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-500/20'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Peso de Fuente y Efecto Hover */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="font-semibold text-slate-800 block">Peso Tipográfico del Botón</label>
                      <select
                        value={branding.buttonFontWeight || 'font-bold'}
                        onChange={(e) => updateBranding({ buttonFontWeight: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                      >
                        <option value="font-normal">Normal (400)</option>
                        <option value="font-medium">Medium (500)</option>
                        <option value="font-semibold">SemiBold (600)</option>
                        <option value="font-bold">Bold (700)</option>
                        <option value="font-extrabold">ExtraBold (800)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="font-semibold text-slate-800 block">Efecto Hover (Al Pasar Mouse)</label>
                      <select
                        value={branding.buttonHoverEffect || 'scale'}
                        onChange={(e) => updateBranding({ buttonHoverEffect: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                      >
                        <option value="none">Sin efecto especial</option>
                        <option value="scale">Micro-escalado (Scale 1.02)</option>
                        <option value="lift">Elevación (Translate Y)</option>
                        <option value="glow">Brillo Neón (Glow)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 3: PROPIEDADES DE TOGGLES / SWITCHES */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Lock className="w-4 h-4 text-indigo-500" />
                  <h3 className="font-bold text-slate-900 text-sm">Configuración de Toggles & Switches</h3>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Estilo del Switch */}
                    <div className="space-y-2 sm:col-span-1">
                      <label className="font-semibold text-slate-800 block">Diseño del Toggle</label>
                      <div className="flex flex-col gap-1.5">
                        {[
                          { id: 'pill', label: 'Cápsula (Pill)' },
                          { id: 'square', label: 'Cuadrado Minimal' },
                          { id: 'ios', label: 'Estilo iOS' },
                        ].map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => updateBranding({ toggleStyle: t.id as any })}
                            className={`p-2 rounded-lg border text-left font-medium transition ${
                              branding.toggleStyle === t.id
                                ? 'border-indigo-500 bg-indigo-50 text-indigo-900 font-bold'
                                : 'border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Colores Hex del Toggle */}
                    <div className="space-y-3 sm:col-span-2">
                      <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <label className="font-semibold text-slate-800 block">Color Activo (#HEX)</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={branding.toggleActiveHex || '#f59e0b'}
                            onChange={(e) => updateBranding({ toggleActiveHex: e.target.value })}
                            className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                          />
                          <input
                            type="text"
                            value={branding.toggleActiveHex || '#f59e0b'}
                            onChange={(e) => updateBranding({ toggleActiveHex: e.target.value })}
                            className="flex-1 uppercase font-mono px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <label className="font-semibold text-slate-800 block">Color Inactivo (#HEX)</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={branding.toggleInactiveHex || '#cbd5e1'}
                            onChange={(e) => updateBranding({ toggleInactiveHex: e.target.value })}
                            className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                          />
                          <input
                            type="text"
                            value={branding.toggleInactiveHex || '#cbd5e1'}
                            onChange={(e) => updateBranding({ toggleInactiveHex: e.target.value })}
                            className="flex-1 uppercase font-mono px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 4: OPCIONES AMPLIADAS DE TIPOGRAFÍAS */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Type className="w-4 h-4 text-purple-500" />
                  <h3 className="font-bold text-slate-900 text-sm">Catálogo Ampliado de Google Fonts</h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {[
                    { id: 'Inter', name: 'Inter (Modern UI)' },
                    { id: 'Outfit', name: 'Outfit (Gastronómico)' },
                    { id: 'Roboto', name: 'Roboto (Google Tech)' },
                    { id: 'Plus Jakarta Sans', name: 'Jakarta (Minimalist)' },
                    { id: 'Poppins', name: 'Poppins (Redondeada)' },
                    { id: 'Space Grotesk', name: 'Space Grotesk (Futurist)' },
                    { id: 'Montserrat', name: 'Montserrat (Elegante)' },
                    { id: 'Playfair Display', name: 'Playfair (Alta Cocina)' },
                  ].map((font) => (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => {
                        updateBranding({ fontFamily: font.id as any });
                        showToast(`Fuente ${font.id} cargada exitosamente.`, 'info');
                      }}
                      className={`p-3 rounded-xl border text-center transition ${
                        branding.fontFamily === font.id
                          ? 'border-purple-500 bg-purple-50 text-purple-900 font-bold ring-2 ring-purple-500/20'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="block text-xs font-bold" style={{ fontFamily: font.id }}>{font.id}</span>
                      <span className="text-[10px] text-slate-500 mt-1 block">{font.name}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Panel Lateral: PREVISUALIZACIÓN EN VIVO (LIVE SANDBOX) */}
            <div className="space-y-6">
              <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-6 shadow-xl border border-slate-800 sticky top-20">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                  <Palette className="w-5 h-5 text-amber-400" />
                  <div>
                    <h3 className="font-bold text-base">Live UI Sandbox</h3>
                    <p className="text-[11px] text-slate-400">Previsualización inmediata de componentes.</p>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Muestra 0: Menú de Navegación Configurado */}
                  <div className="p-4 rounded-xl space-y-2 border border-slate-700/60 transition-all" style={{ backgroundColor: branding.menuBgHex || '#0f172a', fontFamily: branding.menuFontFamily || 'Inter' }}>
                    <span className="text-[10px] uppercase font-bold tracking-wider block" style={{ color: branding.menuTextHex || '#94a3b8' }}>Menú Personalizado (#HEX)</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm"
                        style={{ backgroundColor: branding.menuActiveBgHex || '#f59e0b', color: branding.menuActiveTextHex || '#0f172a' }}
                      >
                        Tab Activa
                      </div>
                      <div
                        className="px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{ color: branding.menuTextHex || '#94a3b8' }}
                      >
                        Tab Inactiva
                      </div>
                    </div>
                  </div>

                  {/* Muestra 1: Botón Principal Configurado */}
                  <div className="p-4 bg-slate-800/90 rounded-xl space-y-2 border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Botón Principal Custom #HEX</span>
                    <button
                      style={{
                        backgroundColor: branding.buttonBgHex || '#f59e0b',
                        color: branding.buttonTextHex || '#0f172a',
                        fontFamily: branding.fontFamily || 'Inter',
                      }}
                      className={`w-full py-2.5 px-4 ${branding.buttonFontWeight || 'font-bold'} ${branding.buttonRadius || 'rounded-xl'} transition shadow-md`}
                    >
                      Ejemplo Botón Activo
                    </button>
                  </div>

                  {/* Muestra 2: Toggle Switch Configurado */}
                  <div className="p-4 bg-slate-800/90 rounded-xl space-y-3 border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Toggles Configurados</span>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Switch Activo</span>
                      <div
                        style={{ backgroundColor: branding.toggleActiveHex || '#f59e0b' }}
                        className={`w-12 h-6.5 p-1 ${branding.toggleStyle === 'square' ? 'rounded-md' : 'rounded-full'} flex items-center justify-end transition`}
                      >
                        <div className={`w-4.5 h-4.5 bg-white ${branding.toggleStyle === 'square' ? 'rounded-sm' : 'rounded-full'} shadow-md`} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-700/50">
                      <span className="text-slate-400">Switch Inactivo</span>
                      <div
                        style={{ backgroundColor: branding.toggleInactiveHex || '#cbd5e1' }}
                        className={`w-12 h-6.5 p-1 ${branding.toggleStyle === 'square' ? 'rounded-md' : 'rounded-full'} flex items-center justify-start transition`}
                      >
                        <div className={`w-4.5 h-4.5 bg-white ${branding.toggleStyle === 'square' ? 'rounded-sm' : 'rounded-full'} shadow-md`} />
                      </div>
                    </div>
                  </div>

                  {/* Muestra 3: Tipografía Muestra */}
                  <div className="p-4 bg-slate-800/90 rounded-xl space-y-1.5 border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Tipografía Activa</span>
                    <h4 className="text-base font-extrabold text-white" style={{ fontFamily: branding.fontFamily }}>
                      PLEGMA Gastronomía
                    </h4>
                    <p className="text-[11px] text-slate-300" style={{ fontFamily: branding.fontFamily }}>
                      Gestión avanzada de insumos, proveedores y centros de costo.
                    </p>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  className="w-full justify-center mt-4"
                  onClick={() => {
                    showToast('Branding y Estudio de Diseño guardados.', 'success');
                  }}
                >
                  Guardar Todo
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- FORMULARIO SEPARADO EN MODAL INDEPENDIENTE PARA CREAR O EDITAR / ELIMINAR --- */}
      {formModal && (
        <div className="fixed inset-0 z-[80] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            style={{ fontFamily: branding.fontFamily ? `'${branding.fontFamily}', sans-serif` : 'inherit' }}
            className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto no-scrollbar p-6 space-y-6 shadow-2xl border border-slate-200"
          >
            {/* Header del Formulario */}
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${formModal.isNew ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
                  {formModal.isNew ? <Plus className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    {formModal.isNew ? `+ Nuevo ${formModal.entity.toUpperCase()}` : `Editar ${formModal.entity.toUpperCase()}`}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {formModal.isNew ? 'Ingresa los datos para dar de alta un nuevo registro.' : 'Modifica los campos del registro o elimina el elemento.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFormModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* FORMULARIO CLIENTE */}
            {formModal.entity === 'cliente' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveClient(formModal.data, formModal.isNew);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <FormField label="Código de Cliente">
                    <TextInput
                      type="text"
                      value={formModal.data.code || ''}
                      onChange={(e) => setFormModal({ ...formModal, data: { ...formModal.data, code: e.target.value } })}
                    />
                  </FormField>

                  <FormField label="Tipo de Cliente">
                    <SelectInput
                      options={[
                        { value: 'Salon', label: 'Salón Principal' },
                        { value: 'Barra', label: 'Barra / Cocktails' },
                        { value: 'Eventos', label: 'Eventos / Catering' },
                        { value: 'Delivery', label: 'Delivery / Takeaway' },
                        { value: 'Corporativo', label: 'Cliente Corporativo' },
                      ]}
                      value={formModal.data.clientType || 'Salon'}
                      onChange={(e) => setFormModal({ ...formModal, data: { ...formModal.data, clientType: e.target.value } })}
                    />
                  </FormField>

                  <FormField label="Nombre del Cliente / Salón" required>
                    <TextInput
                      type="text"
                      placeholder="Ej. Salón Palermo Soho"
                      value={formModal.data.name || ''}
                      onChange={(e) => setFormModal({ ...formModal, data: { ...formModal.data, name: e.target.value } })}
                      required
                    />
                  </FormField>

                  <FormField label="CUIT / Identificación Fiscal">
                    <TextInput
                      type="text"
                      placeholder="30-70000000-8"
                      value={formModal.data.cuit || ''}
                      onChange={(e) => setFormModal({ ...formModal, data: { ...formModal.data, cuit: e.target.value } })}
                    />
                  </FormField>

                  <FormField label="Teléfono de Contacto">
                    <TextInput
                      type="text"
                      placeholder="+54 11 4444-5555"
                      value={formModal.data.phone || ''}
                      onChange={(e) => setFormModal({ ...formModal, data: { ...formModal.data, phone: e.target.value } })}
                    />
                  </FormField>

                  <FormField label="Email de Contacto">
                    <TextInput
                      type="email"
                      placeholder="contacto@salon.com"
                      value={formModal.data.email || ''}
                      onChange={(e) => setFormModal({ ...formModal, data: { ...formModal.data, email: e.target.value } })}
                    />
                  </FormField>

                  <div className="sm:col-span-2">
                    <FormField label="Dirección Física">
                      <TextInput
                        type="text"
                        placeholder="Honduras 4800, CABA"
                        value={formModal.data.address || ''}
                        onChange={(e) => setFormModal({ ...formModal, data: { ...formModal.data, address: e.target.value } })}
                      />
                    </FormField>
                  </div>

                  <div className="sm:col-span-2">
                    <FormField
                      label="Rubro / Categoría de Venta"
                      hint={
                        hasPermission('canInlineCreate')
                          ? '✓ Puedes hacer clic en el botón + para agregar un nuevo rubro en vivo'
                          : '🔒 Tu rol actual no tiene permiso para agregar rubros desde el desplegable'
                      }
                    >
                      <SelectWithInlineAdd
                        options={categories.map((c) => ({ value: c.id, label: c.name }))}
                        value={formModal.data.categoryId || ''}
                        onChange={(e) => setFormModal({ ...formModal, data: { ...formModal.data, categoryId: e.target.value } })}
                        placeholder="Seleccionar Rubro..."
                        onInlineAdd={(newCatName) => handleAddInlineCategory(newCatName)}
                        inlineAddTitle="Crear Rubro Rápido"
                        inlineAddPlaceholder="Ej. Coctelería VIP"
                        requiredPermission="canInlineCreate"
                      />
                    </FormField>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 gap-3">
                  {!formModal.isNew ? (
                    <Button
                      type="button"
                      variant="danger"
                      size="md"
                      leftIcon={<Trash2 className="w-4 h-4" />}
                      onClick={() => handleDeleteClient(formModal.data.id, formModal.data.name)}
                      requiredPermission="canDelete" hideIfNoPermission={false}
                    >
                      Eliminar Registro
                    </Button>
                  ) : (
                    <div />
                  )}
                  <div className="flex items-center gap-3">
                    <Button type="button" variant="outline" size="md" onClick={() => setFormModal(null)}>
                      Cancelar
                    </Button>
                    <Button type="submit" variant="primary" size="md" requiredPermission={formModal.isNew ? 'canCreate' : 'canEdit'} hideIfNoPermission={false}>
                      {formModal.isNew ? 'Guardar Cliente' : 'Guardar Modificaciones'}
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {/* FORMULARIO USUARIO */}
            {formModal.entity === 'usuario' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveUser(formModal.data, formModal.isNew);
                }}
                className="space-y-4 text-xs"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField label="DNI (Key DB)" required hint="Identificador único">
                    <TextInput
                      type="text"
                      placeholder="Ej. 35123456"
                      value={formModal.data.dni || ''}
                      onChange={(e) => setFormModal({ ...formModal, data: { ...formModal.data, dni: e.target.value } })}
                      disabled={!formModal.isNew}
                      required
                    />
                  </FormField>

                  <FormField label="Nombre y Apellido" required>
                    <TextInput
                      type="text"
                      placeholder="Ej. Juan Pérez"
                      value={formModal.data.name || ''}
                      onChange={(e) => setFormModal({ ...formModal, data: { ...formModal.data, name: e.target.value } })}
                      required
                    />
                  </FormField>

                  <FormField label="Email" required>
                    <TextInput
                      type="email"
                      placeholder="juan@plegma.com"
                      value={formModal.data.email || ''}
                      onChange={(e) => setFormModal({ ...formModal, data: { ...formModal.data, email: e.target.value } })}
                      required
                    />
                  </FormField>

                  <FormField label="Teléfono">
                    <TextInput
                      type="text"
                      placeholder="+54 11 4000-0000"
                      value={formModal.data.phone || ''}
                      onChange={(e) => setFormModal({ ...formModal, data: { ...formModal.data, phone: e.target.value } })}
                    />
                  </FormField>

                  <FormField label="Dirección">
                    <TextInput
                      type="text"
                      placeholder="Av. Corrientes 1234"
                      value={formModal.data.address || ''}
                      onChange={(e) => setFormModal({ ...formModal, data: { ...formModal.data, address: e.target.value } })}
                    />
                  </FormField>

                  <FormField label="Rol Base">
                    <SelectInput
                      options={[
                        { value: 'admin', label: 'Administrador Total' },
                        { value: 'compras', label: 'Encargado Compras' },
                        { value: 'recepcion', label: 'Recepcionista' },
                        { value: 'caja', label: 'Caja / Tesorería' },
                      ]}
                      value={formModal.data.role || 'compras'}
                      onChange={(e) => setFormModal({ ...formModal, data: { ...formModal.data, role: e.target.value } })}
                    />
                  </FormField>
                </div>

                {/* Permisos Especiales Checkboxes */}
                <div className="pt-3 border-t border-slate-200 space-y-2">
                  <h5 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <span>Permisos Especiales del Usuario:</span>
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border hover:bg-slate-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(formModal.data.canInlineCreate)}
                        onChange={(e) => setFormModal({ ...formModal, data: { ...formModal.data, canInlineCreate: e.target.checked } })}
                        className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
                      />
                      <span className="font-semibold text-slate-700">Ver Botón "+" en Desplegables</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border hover:bg-slate-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(formModal.data.canCreate)}
                        onChange={(e) => setFormModal({ ...formModal, data: { ...formModal.data, canCreate: e.target.checked } })}
                        className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
                      />
                      <span className="font-semibold text-slate-700">Alta de Registros (+ Crear)</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border hover:bg-slate-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(formModal.data.canEdit)}
                        onChange={(e) => setFormModal({ ...formModal, data: { ...formModal.data, canEdit: e.target.checked } })}
                        className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
                      />
                      <span className="font-semibold text-slate-700">Permiso para Editar</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border hover:bg-slate-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(formModal.data.canDelete)}
                        onChange={(e) => setFormModal({ ...formModal, data: { ...formModal.data, canDelete: e.target.checked } })}
                        className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
                      />
                      <span className="font-semibold text-slate-700">Permiso para Eliminar</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 gap-3">
                  {!formModal.isNew ? (
                    <Button
                      type="button"
                      variant="danger"
                      size="md"
                      leftIcon={<Trash2 className="w-4 h-4" />}
                      onClick={() => handleDeleteUser(formModal.data.id, formModal.data.name)}
                      requiredPermission="canDelete" hideIfNoPermission={false}
                    >
                      Eliminar Usuario
                    </Button>
                  ) : (
                    <div />
                  )}
                  <div className="flex items-center gap-3">
                    <Button type="button" variant="outline" size="md" onClick={() => setFormModal(null)}>
                      Cancelar
                    </Button>
                    <Button type="submit" variant="primary" size="md" requiredPermission={formModal.isNew ? 'canCreate' : 'canEdit'} hideIfNoPermission={false}>
                      {formModal.isNew ? 'Dar de Alta Usuario' : 'Guardar Modificaciones'}
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {/* FORMULARIO CATEGORÍA */}
            {formModal.entity === 'categoria' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveCategory(formModal.data, formModal.isNew);
                }}
                className="space-y-4 text-xs"
              >
                <FormField label="Nombre del Rubro / Categoría" required>
                  <TextInput
                    type="text"
                    placeholder="Ej. Congelados, Panadería"
                    value={formModal.data.name || ''}
                    onChange={(e) => setFormModal({ ...formModal, data: { ...formModal.data, name: e.target.value } })}
                    required
                  />
                </FormField>

                <FormField label="Descripción">
                  <TextInput
                    type="text"
                    placeholder="Breve detalle de insumos asociados..."
                    value={formModal.data.description || ''}
                    onChange={(e) => setFormModal({ ...formModal, data: { ...formModal.data, description: e.target.value } })}
                  />
                </FormField>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 gap-3">
                  {!formModal.isNew ? (
                    <Button
                      type="button"
                      variant="danger"
                      size="md"
                      leftIcon={<Trash2 className="w-4 h-4" />}
                      onClick={() => handleDeleteCategory(formModal.data.id, formModal.data.name)}
                      requiredPermission="canDelete" hideIfNoPermission={false}
                    >
                      Eliminar Categoría
                    </Button>
                  ) : (
                    <div />
                  )}
                  <div className="flex items-center gap-3">
                    <Button type="button" variant="outline" size="md" onClick={() => setFormModal(null)}>
                      Cancelar
                    </Button>
                    <Button type="submit" variant="primary" size="md" requiredPermission={formModal.isNew ? 'canCreate' : 'canEdit'} hideIfNoPermission={false}>
                      {formModal.isNew ? 'Guardar Categoría' : 'Guardar Modificaciones'}
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {/* FORMULARIO DEPÓSITO */}
            {formModal.entity === 'deposito' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveWarehouse(formModal.data, formModal.isNew);
                }}
                className="space-y-4 text-xs"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField label="Código de Depósito">
                    <TextInput
                      type="text"
                      value={formModal.data.code || ''}
                      onChange={(e) => setFormModal({ ...formModal, data: { ...formModal.data, code: e.target.value } })}
                    />
                  </FormField>

                  <FormField label="Tipo de Almacén">
                    <SelectInput
                      options={[
                        { value: 'Seco', label: 'Depósito Seco' },
                        { value: 'Frío', label: 'Cámara de Frío' },
                        { value: 'Congelados', label: 'Cámara Congelados' },
                        { value: 'Cava', label: 'Cava de Vinos' },
                        { value: 'Barra', label: 'Barra & Salón' },
                      ]}
                      value={formModal.data.type || 'Seco'}
                      onChange={(e) => setFormModal({ ...formModal, data: { ...formModal.data, type: e.target.value } })}
                    />
                  </FormField>

                  <FormField label="Nombre de la Ubicación" required>
                    <TextInput
                      type="text"
                      placeholder="Ej. Depósito Central Secos"
                      value={formModal.data.name || ''}
                      onChange={(e) => setFormModal({ ...formModal, data: { ...formModal.data, name: e.target.value } })}
                      required
                    />
                  </FormField>

                  <FormField label="Nombre del Responsable">
                    <TextInput
                      type="text"
                      placeholder="Ej. Jorge López"
                      value={formModal.data.responsibleName || ''}
                      onChange={(e) => setFormModal({ ...formModal, data: { ...formModal.data, responsibleName: e.target.value } })}
                    />
                  </FormField>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 gap-3">
                  {!formModal.isNew ? (
                    <Button
                      type="button"
                      variant="danger"
                      size="md"
                      leftIcon={<Trash2 className="w-4 h-4" />}
                      onClick={() => handleDeleteWarehouse(formModal.data.id, formModal.data.name)}
                      requiredPermission="canDelete" hideIfNoPermission={false}
                    >
                      Eliminar Ubicación
                    </Button>
                  ) : (
                    <div />
                  )}
                  <div className="flex items-center gap-3">
                    <Button type="button" variant="outline" size="md" onClick={() => setFormModal(null)}>
                      Cancelar
                    </Button>
                    <Button type="submit" variant="primary" size="md" requiredPermission={formModal.isNew ? 'canCreate' : 'canEdit'} hideIfNoPermission={false}>
                      {formModal.isNew ? 'Guardar Ubicación' : 'Guardar Modificaciones'}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
