import React, { useState } from 'react';
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
  Layers,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'kanban' | 'inbox' | 'items' | 'dashboard' | 'audit' | 'maestros';
  setCurrentTab: (tab: 'kanban' | 'inbox' | 'items' | 'dashboard' | 'audit' | 'maestros') => void;
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
  const { userRole, setUserRole, receptionHours, resetToDefaults, branding } = useApp();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isTopNavCollapsed, setIsTopNavCollapsed] = useState(false);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUserRole(e.target.value as UserRole);
  };

  const isSidebar = branding?.navigationStyle === 'sidebar';

  const menuContainerStyle: React.CSSProperties = {
    backgroundColor: branding?.menuBgHex || '#0f172a',
    color: branding?.menuTextHex || '#94a3b8',
    fontFamily: branding?.menuFontFamily ? `'${branding.menuFontFamily}', sans-serif` : 'inherit',
  };

  const getNavItemStyle = (isActive: boolean): React.CSSProperties => {
    if (isActive) {
      return {
        backgroundColor: branding?.menuActiveBgHex || '#f59e0b',
        color: branding?.menuActiveTextHex || '#0f172a',
        fontWeight: 'bold',
      };
    }
    return {
      color: branding?.menuTextHex || '#94a3b8',
    };
  };

  if (isSidebar) {
    return (
      <aside
        style={menuContainerStyle}
        className={`w-full ${
          isSidebarCollapsed ? 'md:w-20' : 'md:w-64'
        } border-b md:border-b-0 md:border-r border-slate-800 md:min-h-screen p-3 md:p-4 flex flex-col justify-between shrink-0 shadow-xl z-40 transition-all duration-300 ease-in-out`}
      >
        <div className="space-y-6">
          {/* Header del Sidebar Limpio y Sin Superposiciones */}
          {!isSidebarCollapsed ? (
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800/80 transition-all duration-300">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-bold text-white shadow-lg shadow-orange-500/20 shrink-0">
                  <Store className="w-5 h-5" />
                </div>
                <div className="transition-opacity duration-300 whitespace-nowrap">
                  <h1 className="font-bold text-base tracking-tight leading-none" style={{ color: branding?.menuTextHex || '#ffffff' }}>
                    PLEGMA Gastro
                  </h1>
                  <p className="text-[11px] opacity-75 font-medium mt-1">
                    Abastecimiento & Stock
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsSidebarCollapsed(true)}
                className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-all duration-200 border border-slate-700/60 shrink-0"
                title="Colapsar menú lateral"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 pb-3 border-b border-slate-800/80 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-bold text-white shadow-lg shadow-orange-500/20 shrink-0">
                <Store className="w-5 h-5" />
              </div>
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                className="w-8 h-8 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-all duration-200 border border-slate-700/60 flex items-center justify-center shrink-0"
                title="Expandir menú lateral"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Navigation Items (Vertical con Transiciones Suaves) */}
          <nav className="flex flex-col gap-1.5 pt-2">
            {[
              { id: 'kanban', label: 'Tablero Semanal', icon: Kanban },
              { id: 'inbox', label: 'Pedidos & Pagos', icon: FileText },
              { id: 'items', label: 'Maestro Insumos', icon: Package },
              { id: 'dashboard', label: 'Dashboard Compras', icon: TrendingUp },
              { id: 'audit', label: 'Auditoría', icon: ShieldCheck },
              { id: 'maestros', label: 'Maestros', icon: Layers },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id as any)}
                  style={getNavItemStyle(isActive)}
                  title={tab.label}
                  className={`flex items-center gap-3 ${
                    isSidebarCollapsed ? 'justify-center px-2 py-3' : 'px-3.5 py-2.5'
                  } rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive ? 'shadow-md shadow-amber-500/20' : 'hover:opacity-100 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {!isSidebarCollapsed && (
                    <span className="whitespace-nowrap transition-opacity duration-200">{tab.label}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Footer Actions */}
        <div className="space-y-3 pt-4 border-t border-slate-800/80 mt-6">
          {/* Reception Hours Pill */}
          <button
            onClick={onOpenSettings}
            className={`w-full flex items-center ${
              isSidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
            } rounded-xl bg-slate-800/60 text-xs border border-slate-700/60 hover:border-slate-600 transition-all duration-200`}
            style={{ color: branding?.menuTextHex || '#94a3b8' }}
            title="Configurar horarios de recepción de proveedores"
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              {!isSidebarCollapsed && <span>Horarios Recepción</span>}
            </div>
            {!isSidebarCollapsed && (
              <span className="font-mono text-[10px] opacity-75">
                {receptionHours.morningStart}-{receptionHours.morningEnd}
              </span>
            )}
          </button>

          {/* Role Selector */}
          <div
            className={`flex items-center ${
              isSidebarCollapsed ? 'justify-center p-2' : 'justify-between px-3 py-2'
            } bg-slate-800/60 rounded-xl border border-slate-700/60 transition-all duration-200`}
          >
            {!isSidebarCollapsed && (
              <span className="text-xs font-medium" style={{ color: branding?.menuTextHex || '#94a3b8' }}>
                Rol:
              </span>
            )}
            <select
              value={userRole}
              onChange={handleRoleChange}
              className="bg-transparent text-xs text-amber-300 font-bold focus:outline-none cursor-pointer text-center"
            >
              <option value="admin" className="bg-slate-800 text-white">
                {isSidebarCollapsed ? '👑' : '👑 Admin'}
              </option>
              <option value="compras" className="bg-slate-800 text-white">
                {isSidebarCollapsed ? '🛒' : '🛒 Compras'}
              </option>
              <option value="recepcion" className="bg-slate-800 text-white">
                {isSidebarCollapsed ? '📦' : '📦 Recepción'}
              </option>
              <option value="caja" className="bg-slate-800 text-white">
                {isSidebarCollapsed ? '💵' : '💵 Caja'}
              </option>
            </select>
          </div>

          {/* Reset System Button */}
          <button
            onClick={() => {
              if (window.confirm('¿Reiniciar todos los datos a la configuración inicial del sistema?')) {
                resetToDefaults();
              }
            }}
            className={`w-full flex items-center justify-center gap-2 ${
              isSidebarCollapsed ? 'p-2.5' : 'py-2 px-3'
            } rounded-xl bg-slate-800/40 text-xs opacity-75 hover:opacity-100 hover:bg-slate-800 transition-all duration-200 border border-slate-800`}
            style={{ color: branding?.menuTextHex || '#94a3b8' }}
            title="Restablecer datos de prueba"
          >
            <RotateCcw className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span>Resetear Datos</span>}
          </button>
        </div>
      </aside>
    );
  }

  return (
    <header
      style={menuContainerStyle}
      className="border-b border-slate-800 sticky top-0 z-40 shadow-md transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo Limpio e Intacto a la Izquierda */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-bold text-white shadow-lg shadow-orange-500/20 shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg tracking-tight leading-none" style={{ color: branding?.menuTextHex || '#ffffff' }}>
                  PLEGMA Gastro
                </h1>
              </div>
              <p className="text-xs opacity-75 font-medium">
                Abastecimiento, Compras & Stock
              </p>
            </div>
          </div>

          {/* Flechita Central Discreta para Desplegar la Cuadrícula de Funcionalidades hacia abajo */}
          <div className="flex items-center justify-center">
            <button
              onClick={() => setIsTopNavCollapsed(!isTopNavCollapsed)}
              className="p-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700/90 text-amber-400 hover:text-white transition-all duration-300 border border-slate-700/60 shadow-md hover:scale-105 active:scale-95 group shrink-0"
              title={isTopNavCollapsed ? "Desplegar cuadrícula de módulos" : "Ocultar módulos"}
            >
              <ChevronDown
                className={`w-5 h-5 transition-transform duration-300 ${
                  !isTopNavCollapsed ? 'rotate-180 text-amber-300' : 'group-hover:translate-y-0.5'
                }`}
              />
            </button>
          </div>

          {/* Acciones a la Derecha (Horarios, Rol, Reset) Intactas */}
          <div className="flex items-center gap-2.5 shrink-0">
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
      </div>

      {/* SUB-PANEL DESPLEGABLE HACIA ABAJO CON LAS FUNCIONALIDADES */}
      {!isTopNavCollapsed && (
        <div
          style={{ backgroundColor: branding?.menuBgHex || '#0f172a' }}
          className="border-t border-slate-800/80 shadow-2xl py-3.5 px-4 sm:px-6 lg:px-8 transition-all duration-300 ease-in-out animate-fadeIn"
        >
          <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            {[
              { id: 'kanban', label: 'Tablero Semanal', icon: Kanban },
              { id: 'inbox', label: 'Pedidos & Pagos', icon: FileText },
              { id: 'items', label: 'Maestro Insumos', icon: Package },
              { id: 'dashboard', label: 'Dashboard Compras', icon: TrendingUp },
              { id: 'audit', label: 'Auditoría', icon: ShieldCheck },
              { id: 'maestros', label: 'Maestros', icon: Layers },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setCurrentTab(tab.id as any);
                  }}
                  style={getNavItemStyle(isActive)}
                  className={`flex flex-col items-center justify-center text-center p-3 rounded-xl text-xs font-bold transition-all duration-200 border ${
                    isActive
                      ? 'border-amber-500 shadow-lg shadow-amber-500/20 ring-1 ring-amber-500/30'
                      : 'border-slate-800/80 hover:bg-white/10 hover:border-slate-700'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-1.5 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
