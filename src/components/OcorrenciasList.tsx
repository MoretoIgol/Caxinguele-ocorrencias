import React, { useState } from 'react';
import { Ocorrencia } from '../types';
import {
  MapPin,
  Calendar,
  Image as ImageIcon,
  ExternalLink,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  PlusCircle,
} from 'lucide-react';
import { ImageLightboxModal } from './ImageLightboxModal';

interface OcorrenciasListProps {
  ocorrencias: Ocorrencia[];
  onNewOcorrenciaClick: () => void;
}

export const OcorrenciasList: React.FC<OcorrenciasListProps> = ({
  ocorrencias,
  onNewOcorrenciaClick,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const filtered = ocorrencias.filter((item) => {
    const matchesSearch =
      item.endereco.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.referencia && item.referencia.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'Todos' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Ocorrencia['status']) => {
    switch (status) {
      case 'Resolvido':
        return (
          <span className="inline-flex items-center gap-1 bg-[#D1E7DD] text-[#0F5132] px-2.5 py-0.5 rounded-[3px] text-xs font-bold border border-[#BADBCC]">
            <CheckCircle className="w-3.5 h-3.5" /> Resolvido
          </span>
        );
      case 'Em Atendimento':
        return (
          <span className="inline-flex items-center gap-1 bg-[#CFF4FC] text-[#055160] px-2.5 py-0.5 rounded-[3px] text-xs font-bold border border-[#B6EFFB]">
            <Clock className="w-3.5 h-3.5" /> Em Atendimento
          </span>
        );
      case 'Em Análise':
        return (
          <span className="inline-flex items-center gap-1 bg-[#FFF3CD] text-[#664D03] px-2.5 py-0.5 rounded-[3px] text-xs font-bold border border-[#FFECB5]">
            <AlertTriangle className="w-3.5 h-3.5" /> Em Análise
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-[#E2E8F0] text-[#1E293B] px-2.5 py-0.5 rounded-[3px] text-xs font-bold border border-[#CBD5E1]">
            Pendente
          </span>
        );
    }
  };

  return (
    <div className="w-full max-w-[900px] mx-auto py-6 sm:py-8 px-4">
      {/* List Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-[24px] font-bold text-[rgba(0,0,0,0.87)] tracking-tight">
            Ocorrências Registradas
          </h2>
          <p className="text-[13px] text-[rgba(0,0,0,0.54)]">
            Acompanhamento das ocorrências ambientais mapeadas em Mairiporã - SP.
          </p>
        </div>

        <button
          type="button"
          onClick={onNewOcorrenciaClick}
          className="bg-[#0F2C4D] hover:bg-[#0c2440] text-white text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded-[4px] cursor-pointer flex items-center justify-center gap-1.5 transition-colors self-start sm:self-auto shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Abrir Nova Ocorrência</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-[4px] border-[1.5px] border-[rgba(0,0,0,0.87)] shadow-xs mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[rgba(0,0,0,0.4)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por logradouro, referência ou relato..."
            className="w-full pl-9 pr-3 py-2 border border-[rgba(0,0,0,0.25)] rounded-[4px] text-xs text-[rgba(0,0,0,0.87)] focus:outline-none focus:border-black"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[rgba(0,0,0,0.4)] shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-[rgba(0,0,0,0.25)] rounded-[4px] px-3 py-2 text-xs text-[rgba(0,0,0,0.87)] bg-white focus:outline-none focus:border-black cursor-pointer"
          >
            <option value="Todos">Todos os Status</option>
            <option value="Pendente">Pendente</option>
            <option value="Em Análise">Em Análise</option>
            <option value="Em Atendimento">Em Atendimento</option>
            <option value="Resolvido">Resolvido</option>
          </select>
        </div>
      </div>

      {/* List Content */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-[4px] border-[1.5px] border-dashed border-[rgba(0,0,0,0.25)] p-12 text-center">
          <MapPin className="w-10 h-10 text-[rgba(0,0,0,0.25)] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[rgba(0,0,0,0.8)] mb-1">
            Nenhuma ocorrência encontrada
          </h3>
          <p className="text-xs text-[rgba(0,0,0,0.54)] max-w-md mx-auto mb-4">
            Não há registros correspondentes aos filtros selecionados ou nenhuma ocorrência cadastrada.
          </p>
          <button
            type="button"
            onClick={onNewOcorrenciaClick}
            className="inline-flex items-center gap-2 bg-[#0F2C4D] text-white text-xs font-bold uppercase tracking-wider py-2 px-4 rounded-[4px] cursor-pointer hover:bg-black transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Cadastrar Ocorrência Agora</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-[4px] border-[1.5px] border-[rgba(0,0,0,0.87)] p-5 shadow-xs hover:border-black transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 pb-3 border-b border-[rgba(0,0,0,0.08)]">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-[#0F2C4D] uppercase tracking-wider">
                      Protocolo #{item.id.replace('oco_', '').substring(0, 8)}
                    </span>
                    <span className="text-[rgba(0,0,0,0.3)]">•</span>
                    <span className="text-xs text-[rgba(0,0,0,0.54)] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(item.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[rgba(0,0,0,0.87)] mt-1 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#0F2C4D] shrink-0" />
                    <span>
                      {item.endereco}
                      {item.numero ? `, Nº ${item.numero}` : ''}
                    </span>
                  </h3>

                  {item.referencia && (
                    <p className="text-xs text-[rgba(0,0,0,0.6)] mt-0.5 ml-5">
                      <strong>Ref:</strong> {item.referencia}
                    </p>
                  )}
                </div>

                <div className="shrink-0">{getStatusBadge(item.status)}</div>
              </div>

              {/* Description */}
              <div className="py-3">
                <p className="text-[14px] text-[rgba(0,0,0,0.8)] leading-relaxed whitespace-pre-line">
                  {item.descricao}
                </p>
              </div>

              {/* Coordinates & Photos */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-t border-[rgba(0,0,0,0.06)]">
                {/* Coordinates */}
                <div>
                  {item.latitude && item.longitude ? (
                    <div className="inline-flex items-center gap-2 text-[11px] font-mono text-[#0F5132] bg-[#D1E7DD] px-2 py-0.5 rounded-[3px]">
                      <span>
                        Lat: {item.latitude.toFixed(5)}, Long: {item.longitude.toFixed(5)}
                      </span>
                      <a
                        href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0F5132] hover:text-black font-sans font-bold flex items-center gap-0.5"
                        title="Ver no Google Maps"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ) : (
                    <span className="text-[11px] text-[rgba(0,0,0,0.4)]">
                      Sem coordenadas geográficas marcadas
                    </span>
                  )}
                  <span className="block text-[11px] text-[rgba(0,0,0,0.5)] mt-1">
                    Registrado por: {item.agente_email}
                  </span>
                </div>

                {/* Photos Grid 80x80px */}
                {item.fotos && item.fotos.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold text-[rgba(0,0,0,0.54)] uppercase tracking-wider mr-1 flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      {item.fotos.length} foto(s):
                    </span>
                    {item.fotos.map((photoUrl, pIdx) => (
                      <div
                        key={pIdx}
                        onClick={() => setLightboxImg(photoUrl)}
                        className="w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] rounded-[3px] border-[1.5px] border-[rgba(0,0,0,0.87)] bg-black overflow-hidden cursor-pointer shadow-xs hover:opacity-90 transition-opacity"
                        title="Clique para ampliar evidência"
                      >
                        <img
                          src={photoUrl}
                          alt={`Evidência ${pIdx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://placehold.co/70x70/222/fff?text=Link';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <ImageLightboxModal imageUrl={lightboxImg} onClose={() => setLightboxImg(null)} />
    </div>
  );
};
