/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Ocorrencia } from './types';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { OcorrenciaForm } from './components/OcorrenciaForm';
import { OcorrenciasList } from './components/OcorrenciasList';
import { fetchAllOcorrencias } from './services/supabase';

export default function App() {
  // Estado do usuário autenticado (inicia deslogado conforme a Tela 1)
  const [user, setUser] = useState<User | null>(null);

  // Aba ativa: 'novo' (Abrir Ocorrência) ou 'lista' (Histórico de Registros)
  const [activeTab, setActiveTab] = useState<'novo' | 'lista'>('novo');

  // Ocorrências registradas
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Carrega ocorrências no carregamento inicial
  const loadData = async () => {
    try {
      const data = await fetchAllOcorrencias();
      setOcorrencias(data);
    } catch (err) {
      console.warn('Erro ao carregar dados:', err);
    } finally {
      setIsDataLoaded(true);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogin = (loggedUser: User) => {
    setUser(loggedUser);
    setActiveTab('novo');
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC] text-[rgba(0,0,0,0.87)] font-sans antialiased">
      {/* Header com Topbar */}
      <Header
        user={user}
        onLogout={handleLogout}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        ocorrenciasCount={ocorrencias.length}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col">
        {!user ? (
          // Tela 1: Acesso Restrito (Login)
          <LoginScreen onLogin={handleLogin} />
        ) : activeTab === 'novo' ? (
          // Tela 2: Abrir Nova Ocorrência
          <OcorrenciaForm
            user={user}
            onSuccessCreated={async () => {
              await loadData();
              // Pequeno delay e depois pode visualizar ou continuar
            }}
          />
        ) : (
          // Visão de Registros / Histórico
          <OcorrenciasList
            ocorrencias={ocorrencias}
            onNewOcorrenciaClick={() => setActiveTab('novo')}
          />
        )}
      </main>

      {/* Rodapé institucional */}
      <footer className="py-4 px-6 border-t border-[rgba(0,0,0,0.12)] bg-white text-center text-xs text-[rgba(0,0,0,0.54)] flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-medium">
          <span>🐿️ ONG Caxinguêle</span>
          <span>•</span>
          <span>Mairiporã - SP</span>
          <span>•</span>
          <span>Sistema de Fiscalização & Proteção Ambiental</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span>Mairiporã, Serra da Cantareira e Bacia da Paiva Castro</span>
        </div>
      </footer>
    </div>
  );
}
