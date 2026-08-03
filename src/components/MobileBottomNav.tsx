import React from 'react';
import { Home, FileText, Kanban, BarChart3, Menu } from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: string;
  onNavigateTab: (tabId: string) => void;
  onToggleMobileMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onNavigateTab,
  onToggleMobileMenu,
}) => {
  const isInicioActive = currentTab === 'mobile_home';
  const isPedidosActive = currentTab === 'inbox';
  const isComprasActive = currentTab === 'kanban';
  const isControlActive = currentTab === 'dashboard' || currentTab === 'audit';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800/90 text-white flex items-center justify-around py-1.5 px-2 shadow-2xl md:hidden">
      {/* 1. Inicio */}
      <button
        type="button"
        onClick={() => onNavigateTab('mobile_home')}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
          isInicioActive ? 'text-amber-400 font-extrabold scale-105' : 'text-slate-400 font-medium hover:text-white'
        }`}
      >
        <Home className={`w-5 h-5 mb-0.5 ${isInicioActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span className="text-[10px] tracking-tight">Inicio</span>
      </button>

      {/* 2. Ingreso Pedidos */}
      <button
        type="button"
        onClick={() => onNavigateTab('inbox')}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
          isPedidosActive ? 'text-amber-400 font-extrabold scale-105' : 'text-slate-400 font-medium hover:text-white'
        }`}
      >
        <FileText className={`w-5 h-5 mb-0.5 ${isPedidosActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span className="text-[10px] tracking-tight whitespace-nowrap">Ingreso Pedidos</span>
      </button>

      {/* 3. Tablero Compras */}
      <button
        type="button"
        onClick={() => onNavigateTab('kanban')}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
          isComprasActive ? 'text-amber-400 font-extrabold scale-105' : 'text-slate-400 font-medium hover:text-white'
        }`}
      >
        <Kanban className={`w-5 h-5 mb-0.5 ${isComprasActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span className="text-[10px] tracking-tight whitespace-nowrap">Tablero Compras</span>
      </button>

      {/* 4. Control */}
      <button
        type="button"
        onClick={() => onNavigateTab('dashboard')}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
          isControlActive ? 'text-amber-400 font-extrabold scale-105' : 'text-slate-400 font-medium hover:text-white'
        }`}
      >
        <BarChart3 className={`w-5 h-5 mb-0.5 ${isControlActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span className="text-[10px] tracking-tight">Control</span>
      </button>

      {/* 5. Más / Menú */}
      <button
        type="button"
        onClick={onToggleMobileMenu}
        className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-400 font-medium hover:text-white transition-all"
      >
        <Menu className="w-5 h-5 mb-0.5 stroke-2" />
        <span className="text-[10px] tracking-tight">Más</span>
      </button>
    </nav>
  );
};
