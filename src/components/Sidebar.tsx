import { Armchair, LayoutDashboard, Layers, History, BarChart3, Settings, Mail } from 'lucide-react';
import { useStore } from '@nanostores/react';
import NavItem from './ui/NavItem';
import LogoutButton from './LogoutButton';
import { $currentUser } from '../stores/authStore';
import type { TabType } from '../types';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const currentUser = useStore($currentUser);

  return (
    <nav className="fixed left-0 top-0 h-full w-20 md:w-64 bg-white border-r border-[#141414] flex flex-col z-40">
      <div className="p-6 border-b border-[#141414] flex items-center gap-3">
        <div className="w-10 h-10 bg-[#141414] flex items-center justify-center">
          <Armchair className="text-white w-6 h-6" />
        </div>
        <span className="hidden md:block font-bold text-xl tracking-tight italic font-serif">Sistema de Inventario</span>
      </div>

      <div className="flex-1 py-6 flex flex-col gap-2">
        <NavItem
          active={activeTab === 'dashboard'}
          onClick={() => onTabChange('dashboard')}
          icon={<LayoutDashboard size={20} />}
          label="Dashboard"
        />
        <NavItem
          active={activeTab === 'products'}
          onClick={() => onTabChange('products')}
          icon={<Layers size={20} />}
          label="Productos"
        />
        <NavItem
          active={activeTab === 'movements'}
          onClick={() => onTabChange('movements')}
          icon={<History size={20} />}
          label="Movimientos"
        />
        <NavItem
          active={activeTab === 'reports'}
          onClick={() => onTabChange('reports')}
          icon={<BarChart3 size={20} />}
          label="Reportes"
        />
      </div>

      <div className="p-6 border-t border-[#141414] flex flex-col gap-4">
        {currentUser && (
          <div className="hidden md:block text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="font-semibold text-[#141414] truncate mb-1">
              {currentUser.username || 'Usuario'}
            </div>
            <div className="flex items-start gap-1 text-slate-600 min-w-0">
              <Mail size={12} className="flex-shrink-0 mt-0.5" />
              <span className="truncate text-xs">{currentUser.email}</span>
            </div>
          </div>
        )}

        <NavItem
          active={activeTab === 'settings'}
          onClick={() => onTabChange('settings')}
          icon={<Settings size={20} />}
          label="Configuración"
        />

        <LogoutButton />
      </div>
    </nav>
  );
}
