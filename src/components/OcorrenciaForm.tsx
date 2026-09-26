import React, { useState, useEffect, useRef } from 'react';
import { User, PhotoItem, AddressSearchResult } from '../types';
import { saveOcorrenciaToSupabase } from '../services/supabase';
import { MapModal } from './MapModal';
import { DirectLinkModal } from './DirectLinkModal';
import { ImageLightboxModal } from './ImageLightboxModal';
import {
  Map,
  Upload,
  Link2,
  X,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Maximize2,
  Sparkles,
} from 'lucide-react';

interface OcorrenciaFormProps {
  user: User;
  onSuccessCreated: () => void;
}

export const OcorrenciaForm: React.FC<OcorrenciaFormProps> = ({
  user,
  onSuccessCreated,
}) => {
  // Form fields
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [referencia, setReferencia] = useState('');
  const [descricao, setDescricao] = useState('');
  const [coords, setCoords] = useState<{ lat: number | null; lng: number | null }>({
    lat: null,
    lng: null,
  });

  // Photos state (supports both direct links and local file uploads)
  const [photos, setPhotos] = useState<PhotoItem[]>([]);

  // Autocomplete state
  const [autocompleteResults, setAutocompleteResults] = useState<AddressSearchResult[]>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Modals state
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isDirectLinkModalOpen, setIsDirectLinkModalOpen] = useState(false);
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
    details?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Autocomplete Nominatim search
  const handleEnderecoChange = (value: string) => {
    setEndereco(value);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (value.trim().length < 3) {
      setAutocompleteResults([]);
      setShowAutocomplete(false);
      return;
    }

    setIsSearchingAddress(true);
    setShowAutocomplete(true);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const query = `${value.trim()}, Mairiporã, SP, Brasil`;
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&addressdetails=1&limit=5&countrycodes=br`;

        const res = await fetch(url, {
          headers: { 'Accept-Language': 'pt-BR,pt;q=0.9' },
        });
        const data = await res.json();

        if (Array.isArray(data)) {
          setAutocompleteResults(data);
        } else {
          setAutocompleteResults([]);
        }
      } catch (err) {
        console.warn('Erro ao consultar Nominatim:', err);
        setAutocompleteResults([]);
      } finally {
        setIsSearchingAddress(false);
      }
    }, 350);
  };

  const handleSelectAutocomplete = (item: AddressSearchResult) => {
    setEndereco(item.display_name);
    setCoords({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    });
    setShowAutocomplete(false);
  };

  // Map confirmation handler
  const handleMapConfirm = (lat: number, lng: number, addressText?: string) => {
    setCoords({ lat, lng });
    if (addressText && (!endereco || endereco.length < 5)) {
      setEndereco(addressText);
    }
  };

  // Local file upload handling
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newPhotos: PhotoItem[] = files.map((file) => {
      return {
        id: 'file_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
        url: URL.createObjectURL(file),
        source: 'upload',
        title: file.name,
      };
    });

    setPhotos((prev) => [...prev, ...newPhotos]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Direct links handling from modal
  const handleAddDirectPhotos = (newItems: PhotoItem[]) => {
    setPhotos((prev) => [...prev, ...newItems]);
  };

  // Remove photo
  const handleRemovePhoto = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const trimmedEndereco = endereco.trim();
    const trimmedDescricao = descricao.trim();

    if (!trimmedEndereco) {
      setFeedback({
        type: 'error',
        message: 'Por favor, informe o endereço da ocorrência.',
      });
      return;
    }

    if (!trimmedDescricao) {
      setFeedback({
        type: 'error',
        message: 'Por favor, descreva em detalhes a ocorrência ambiental.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const fotosUrls = photos.map((p) => p.url);

      const result = await saveOcorrenciaToSupabase({
        endereco: trimmedEndereco,
        numero: numero.trim() || undefined,
        referencia: referencia.trim() || undefined,
        descricao: trimmedDescricao,
        latitude: coords.lat,
        longitude: coords.lng,
        fotos: fotosUrls,
        agente_email: user.email,
      });

      if (result.success) {
        setFeedback({
          type: 'success',
          message: 'Ocorrência registrada com sucesso!',
          details: result.savedRemotely
            ? 'O registro foi sincronizado no banco de dados e notificado à coordenação da ONG Caxinguêle.'
            : 'O registro foi salvo localmente no navegador e será sincronizado com o servidor.',
        });

        // Reset form
        setEndereco('');
        setNumero('');
        setReferencia('');
        setDescricao('');
        setCoords({ lat: null, lng: null });
        setPhotos([]);

        // Notify parent to refresh counts
        onSuccessCreated();
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: 'Falha ao gravar a ocorrência.',
        details: err?.message || 'Tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex justify-center py-6 sm:py-10 px-4">
      <div className="w-full max-w-[760px] bg-white rounded-[4px] border-[1.5px] border-[rgba(0,0,0,0.87)] shadow-[0_4px_14px_rgba(0,0,0,0.06)] p-6 sm:p-10">
        
        {/* Form Title & Subtitle - matching Image 3 exactly */}
        <h1 className="text-[28px] font-bold text-[rgba(0,0,0,0.87)] tracking-tight leading-tight mb-2">
          Abrir Ocorrência
        </h1>
        <p className="text-[14px] text-[rgba(0,0,0,0.54)] mb-7 leading-relaxed">
          Registre detalhadamente a ocorrência ambiental em Mairiporã - SP.
        </p>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mb-6 p-4 rounded-[4px] text-sm font-medium flex items-start gap-3 border-[1.5px] animate-in fade-in duration-200 ${
              feedback.type === 'success'
                ? 'bg-[#D1E7DD] text-[#0F5132] border-[#BADBCC]'
                : 'bg-[#F8D7DA] text-[#842029] border-[#F5C2C7]'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-[#0F5132] mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-[#842029] mt-0.5" />
            )}
            <div>
              <div className="font-bold">{feedback.message}</div>
              {feedback.details && <div className="text-xs mt-1">{feedback.details}</div>}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ENDEREÇO + BOTAO MAPA */}
          <div className="relative">
            <label
              htmlFor="inputEndereco"
              className="block text-[13px] font-semibold text-[rgba(0,0,0,0.54)] mb-2 uppercase tracking-[0.03em]"
            >
              Endereço (Mairiporã - SP) <span className="text-red-600">*</span>
            </label>

            <div className="flex gap-2 sm:gap-3 items-stretch">
              <div className="relative flex-1">
                <input
                  id="inputEndereco"
                  type="text"
                  required
                  value={endereco}
                  onChange={(e) => handleEnderecoChange(e.target.value)}
                  onFocus={() => {
                    if (autocompleteResults.length > 0) setShowAutocomplete(true);
                  }}
                  placeholder="Digite o logradouro, rua, praça ou bairro..."
                  autoComplete="off"
                  className="w-full h-[46px] px-3.5 py-2.5 border-[1.5px] border-[rgba(0,0,0,0.87)] rounded-[4px] text-[15px] text-[rgba(0,0,0,0.87)] bg-white focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
                />

                {/* Autocomplete Dropdown */}
                {showAutocomplete && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border-[1.5px] border-[rgba(0,0,0,0.87)] rounded-[4px] max-h-56 overflow-y-auto z-40 shadow-xl">
                    {isSearchingAddress ? (
                      <div className="p-3 text-xs italic text-[rgba(0,0,0,0.54)] flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-[#0F2C4D]/30 border-t-[#0F2C4D] rounded-full animate-spin" />
                        Buscando logradouros em Mairiporã...
                      </div>
                    ) : autocompleteResults.length > 0 ? (
                      autocompleteResults.map((item) => (
                        <div
                          key={item.place_id}
                          onClick={() => handleSelectAutocomplete(item)}
                          className="px-3.5 py-2.5 text-xs text-[rgba(0,0,0,0.87)] hover:bg-[#F0F4F8] border-b border-[#ECECEC] last:border-b-0 cursor-pointer transition-colors leading-relaxed"
                        >
                          <div className="font-semibold text-[#0F2C4D] flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#0F2C4D] shrink-0" />
                            <span>{item.display_name.split(',')[0]}</span>
                          </div>
                          <span className="text-[11px] text-[rgba(0,0,0,0.54)] block truncate">
                            {item.display_name}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-xs text-[rgba(0,0,0,0.54)] italic">
                        Nenhum logradouro encontrado. Use o botão <strong>MAPA</strong> ao lado para marcar no mapa.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Botão MAPA */}
              <button
                type="button"
                onClick={() => setIsMapModalOpen(true)}
                className="h-[46px] px-4 sm:px-6 bg-[#1E1E1E] hover:bg-black text-white text-xs font-bold uppercase tracking-[0.05em] rounded-[4px] cursor-pointer flex items-center justify-center gap-2 shrink-0 transition-colors shadow-xs active:translate-y-[1px]"
              >
                <Map className="w-4 h-4" />
                <span>MAPA</span>
              </button>
            </div>

            {/* Coordinates Badge */}
            {coords.lat && coords.lng && (
              <div className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-[#0F5132] bg-[#D1E7DD] px-2.5 py-1 rounded-[4px] border border-[#BADBCC]">
                <MapPin className="w-3.5 h-3.5" />
                <span>
                  Coordenadas: Lat {coords.lat.toFixed(5)}, Long {coords.lng.toFixed(5)} (Mairiporã)
                </span>
                <button
                  type="button"
                  onClick={() => setCoords({ lat: null, lng: null })}
                  className="text-[#0F5132] hover:text-black ml-1 text-sm font-bold cursor-pointer"
                  title="Remover coordenadas"
                >
                  &times;
                </button>
              </div>
            )}
          </div>

          {/* NÚMERO & PONTO DE REFERÊNCIA */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-4">
              <label
                htmlFor="inputNumero"
                className="block text-[13px] font-semibold text-[rgba(0,0,0,0.54)] mb-2 uppercase tracking-[0.03em]"
              >
                Número
              </label>
              <input
                id="inputNumero"
                type="text"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                placeholder="Ex: 120 ou S/N"
                className="w-full px-3.5 py-2.5 border-[1.5px] border-[rgba(0,0,0,0.87)] rounded-[4px] text-[15px] text-[rgba(0,0,0,0.87)] bg-white focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
              />
            </div>

            <div className="sm:col-span-8">
              <label
                htmlFor="inputReferencia"
                className="block text-[13px] font-semibold text-[rgba(0,0,0,0.54)] mb-2 uppercase tracking-[0.03em]"
              >
                Ponto de Referência
              </label>
              <input
                id="inputReferencia"
                type="text"
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                placeholder="Ex: Próximo à represa, km 42, perto da ponte"
                className="w-full px-3.5 py-2.5 border-[1.5px] border-[rgba(0,0,0,0.87)] rounded-[4px] text-[15px] text-[rgba(0,0,0,0.87)] bg-white focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all"
              />
            </div>
          </div>

          {/* DESCRIÇÃO DO OCORRIDO (6 linhas) */}
          <div>
            <label
              htmlFor="inputDescricao"
              className="block text-[13px] font-semibold text-[rgba(0,0,0,0.54)] mb-2 uppercase tracking-[0.03em]"
            >
              Descrição do Ocorrido <span className="text-red-600">*</span>
            </label>
            <textarea
              id="inputDescricao"
              rows={6}
              required
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Relate o que ocorreu em detalhes (desmatamento, invasão de APP, descarte irregular de resíduos, resgate ou ameaça à fauna, etc.)..."
              className="w-full px-3.5 py-3 border-[1.5px] border-[rgba(0,0,0,0.87)] rounded-[4px] text-[15px] text-[rgba(0,0,0,0.87)] bg-white focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all resize-y leading-relaxed"
            />
          </div>

          {/* FOTOS E EVIDÊNCIAS - Suporte a links diretos e upload */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[13px] font-semibold text-[rgba(0,0,0,0.54)] uppercase tracking-[0.03em]">
                Fotos e Evidências
              </label>
              <span className="text-[11px] font-semibold text-[#0F2C4D] bg-[#EAF0F6] px-2 py-0.5 rounded-[3px]">
                {photos.length} foto(s)
              </span>
            </div>

            <div className="border-2 border-dashed border-[rgba(0,0,0,0.25)] rounded-[4px] p-4 bg-[#FAFAFA]">
              {/* Header inside upload box with Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[rgba(0,0,0,0.08)]">
                <span className="text-[13px] text-[rgba(0,0,0,0.54)] font-medium">
                  Formatos JPG, PNG ou WEBP. Pré-visualização em 80×80px.
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Botão de Link Direto (Atendendo à pergunta do usuário!) */}
                  <button
                    type="button"
                    onClick={() => setIsDirectLinkModalOpen(true)}
                    className="bg-white hover:bg-[#F0F4F8] border-[1.5px] border-[#0F2C4D] text-[#0F2C4D] text-xs font-bold uppercase tracking-wider py-1.5 px-3 rounded-[4px] cursor-pointer flex items-center gap-1.5 transition-colors shadow-2xs"
                    title="Adicionar por URL de imagem ou tag HTML <img>"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span>Inserir Link Direto / HTML</span>
                  </button>

                  {/* Botão Adicionar Anexos (Arquivos locais) */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white hover:bg-[#F5F5F5] border-[1.5px] border-[rgba(0,0,0,0.87)] text-[rgba(0,0,0,0.87)] text-xs font-bold uppercase tracking-wider py-1.5 px-3 rounded-[4px] cursor-pointer flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Adicionar Anexos</span>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Galeria 80x80px */}
              <div className="mt-3">
                {photos.length === 0 ? (
                  <div className="py-4 text-center sm:text-left">
                    <p className="text-[13px] text-[rgba(0,0,0,0.54)] italic mb-2">
                      Nenhuma foto anexada até o momento.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[rgba(0,0,0,0.6)]">
                      <span className="font-medium">Dica rápida:</span>
                      <button
                        type="button"
                        onClick={() => {
                          // Adiciona foto de exemplo direto
                          setPhotos((prev) => [
                            ...prev,
                            {
                              id: 'sample_cax_' + Date.now(),
                              url: 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?auto=format&fit=crop&w=600&q=80',
                              source: 'sample',
                              title: 'Fauna Mairiporã',
                            },
                          ]);
                        }}
                        className="underline text-[#0F2C4D] hover:text-black font-semibold cursor-pointer"
                      >
                        + Adicionar imagem de teste via URL direta
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {photos.map((item, index) => (
                      <div
                        key={item.id}
                        onClick={() => setLightboxImageUrl(item.url)}
                        title="Clique para ampliar"
                        className="group relative w-[80px] h-[80px] rounded-[4px] border-[1.5px] border-[rgba(0,0,0,0.87)] bg-black overflow-hidden cursor-pointer shadow-xs"
                      >
                        <img
                          src={item.url}
                          alt={item.title || `Foto ${index + 1}`}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://placehold.co/80x80/222/fff?text=Erro';
                          }}
                        />

                        {/* Tag source (Link ou Arquivo) */}
                        <span className="absolute bottom-0 left-0 right-0 bg-black/75 text-[9px] text-white text-center font-mono py-0.5 truncate">
                          {item.source === 'direct_link' ? 'Link HTML' : 'Upload'}
                        </span>

                        {/* Botão Remover (x) no canto superior direito exatamente como no HTML */}
                        <button
                          type="button"
                          onClick={(e) => handleRemovePhoto(item.id, e)}
                          title="Remover foto"
                          className="absolute top-1 right-1 w-[20px] h-[20px] bg-black/80 hover:bg-[#D32F2F] text-white rounded-full flex items-center justify-center text-xs font-bold border border-white cursor-pointer transition-colors shadow-xs z-10"
                        >
                          &times;
                        </button>

                        {/* Hover zoom icon */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                          <Maximize2 className="w-3.5 h-3.5 text-white drop-shadow-md" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* BOTÃO ENVIAR OCORRÊNCIA */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-[52px] bg-[#0F2C4D] hover:bg-[#0c2440] text-white text-[16px] font-bold uppercase tracking-[0.05em] rounded-[4px] cursor-pointer transition-all hover:opacity-95 active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>ENVIANDO OCORRÊNCIA...</span>
                </>
              ) : (
                <span>ENVIAR OCORRÊNCIA</span>
              )}
            </button>
          </div>
        </form>

      </div>

      {/* Map Modal */}
      <MapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        initialLat={coords.lat}
        initialLng={coords.lng}
        onConfirm={handleMapConfirm}
      />

      {/* Direct Link & HTML Modal */}
      <DirectLinkModal
        isOpen={isDirectLinkModalOpen}
        onClose={() => setIsDirectLinkModalOpen(false)}
        onAddPhotos={handleAddDirectPhotos}
      />

      {/* Fullscreen Lightbox Modal */}
      <ImageLightboxModal
        imageUrl={lightboxImageUrl}
        onClose={() => setLightboxImageUrl(null)}
      />
    </div>
  );
};
