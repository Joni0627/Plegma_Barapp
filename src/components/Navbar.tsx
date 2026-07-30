import React from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  Kanban,
  Package,
  FileText,
  TrendingUp,
  Clock,
  ShieldCheck,
  RotateCcw,
  Store,
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'kanban' | 'inbox' | 'items' | 'dashboard' | 'audit';
  setCurrentTab: (tab: 'kanban' | 'inbox' | 'items' | 'dashboard' | 'audit') => void;
  onOpenSettings: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenSettings,
  searchQuery,
  setSearchQuery,
}) => {
  const { userRole, setUserRole, receptionHours, resetToDefaults } = useApp();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUserRole(e.target.value as UserRole);
  };

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & System Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-bold text-white shadow-lg shadow-orange-500/20">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg tracking-tight text-white leading-none">
                  GastroSupply ERP
                </h1>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-500/30">
                  v2.4 Gastronomía
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Abastecimiento, Compras & Stock
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setCurrentTab('kanban')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'kanban'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Kanban className="w-4 h-4" />
              <span>Tablero Semanal</span>
            </button>

            <button
              onClick={() => setCurrentTab('inbox')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'inbox'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Pedidos & Pagos</span>
            </button>

            <button
              onClick={() => setCurrentTab('items')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'items'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Maestro Insumos</span>
            </button>

            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Dashboard Compras</span>
            </button>

            <button
              onClick={() => setCurrentTab('audit')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'audit'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Auditoría</span>
            </button>
          </nav>

          {/* Search, Reception Hours Badge & User Role Selector */}
          <div className="flex items-center gap-2.5">
            {/* Reception Hours Pill */}
            <button
              onClick={onOpenSettings}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-xs text-slate-300 border border-slate-700 hover:border-slate-600 transition"
              title="Configurar horarios de recepción de proveedores"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {receptionHours.morningStart}-{receptionHours.morningEnd} / {receptionHours.afternoonStart}-{receptionHours.afternoonEnd}
              </span>
            </button>

            {/* Role Selector */}
            <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
              <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                Rol:
              </span>
              <select
                value={userRole}
                onChange={handleRoleChange}
                className="bg-transparent text-xs text-amber-300 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="admin" className="bg-slate-800 text-white">
                  👑 Administrador
                </option>
                <option value="compras" className="bg-slate-800 text-white">
                  🛒 Usu. Compras
                </option>
                <option value="recepcion" className="bg-slate-800 text-white">
                  📦 Usu. Recepción
                </option>
                <option value="caja" className="bg-slate-800 text-white">
                  💵 Usu. Caja / Pagos
                </option>
              </select>
            </div>

            {/* Reset Button */}
            <button
              onClick={() => {
                if (window.confirm('¿Reiniciar todos los datos a la configuración inicial del sistema?')) {
                  resetToDefaults();
                }
              }}
              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
              title="Restablecer datos de prueba"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex md:hidden overflow-x-auto gap-2 py-2 border-t border-slate-800 scrollbar-none">
          <button
            onClick={() => setCurrentTab('kanban')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
              currentTab === 'kanban' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Tablero Semanal
          </button>
          <button
            onClick={() => setCurrentTab('inbox')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
              currentTab === 'inbox' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Pedidos & Pagos
          </button>
          <button
            onClick={() => setCurrentTab('items')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
              currentTab === 'items' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Insumos
          </button>
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
              currentTab === 'dashboard' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentTab('audit')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
              currentTab === 'audit' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Auditoría
          </button>
        </div>
      </div>
    </header>
  );
};
