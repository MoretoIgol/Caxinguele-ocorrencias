import React from 'react';
import { User } from '../types';
import { LogOut, PlusCircle, ListChecks, MapPin } from 'lucide-react';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  activeTab: 'novo' | 'lista';
  onTabChange: (tab: 'novo' | 'lista') => void;
  ocorrenciasCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  activeTab,
  onTabChange,
  ocorrenciasCount,
}) => {
  return (
    <header className="bg-white border-b-2 border-[rgba(0,0,0,0.87)] px-6 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
      {/* Brand logo & title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#0F2C4D] text-white flex items-center justify-center rounded-[4px] text-xl shadow-xs select-none">
          🐿️
        </div>
        <div>
          <div className="text-xl font-bold text-[rgba(0,0,0,0.87)] tracking-tight leading-tight">
            ONG Caxinguêle
          </div>
          <div className="text-[13px] text-[rgba(0,0,0,0.54)] font-medium flex items-center gap-1.5">
            <span>Proteção Ambiental e Comunitária</span>
            <span>•</span>
            <span className="inline-flex items-center gap-0.5 text-[#0F2C4D] font-semibold">
              <MapPin className="w-3.5 h-3.5" /> Mairiporã - SP
            </span>
          </div>
        </div>
      </div>

      {/* User Status and Navigation */}
      {user && (
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Tabs for Nova Ocorrência / Lista */}
          <div className="flex items-center bg-[#F1F5F9] p-1 rounded-[4px] border border-[rgba(0,0,0,0.16)]">
            <button
              type="button"
              onClick={() => onTabChange('novo')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-[3px] transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'novo'
                  ? 'bg-white text-[#0F2C4D] shadow-xs'
                  : 'text-[rgba(0,0,0,0.65)] hover:text-black'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Abrir Ocorrência</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('lista')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-[3px] transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'lista'
                  ? 'bg-white text-[#0F2C4D] shadow-xs'
                  : 'text-[rgba(0,0,0,0.65)] hover:text-black'
              }`}
            >
              <ListChecks className="w-4 h-4" />
              <span>Registros</span>
              {ocorrenciasCount > 0 && (
                <span className="bg-[#0F2C4D] text-white text-[11px] px-1.5 py-0.2 rounded-full font-bold">
                  {ocorrenciasCount}
                </span>
              )}
            </button>
          </div>

          {/* User pill as shown in screenshot */}
          <div className="flex items-center text-sm font-medium text-[rgba(0,0,0,0.87)] bg-[#EDF2F7] py-1.5 px-3 rounded-[4px] border border-[rgba(0,0,0,0.20)]">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-[#0F2C4D] text-white px-1.5 py-0.5 rounded-[2px] mr-2">
              AGENTE
            </span>
            <span className="font-mono text-xs sm:text-sm text-[rgba(0,0,0,0.8)] truncate max-w-[190px]">
              {user.email}
            </span>
            <button
              type="button"
              onClick={onLogout}
              className="text-[#D32F2F] hover:text-[#9A1B1B] font-semibold text-xs ml-3 pl-2 border-l border-[rgba(0,0,0,0.15)] flex items-center gap-1 cursor-pointer transition-colors"
              title="Sair do sistema"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
