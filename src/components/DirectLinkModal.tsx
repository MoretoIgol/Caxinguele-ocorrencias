import React, { useState } from 'react';
import { X, Link2, Check, Code, Sparkles, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { PhotoItem } from '../types';

interface DirectLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPhotos: (photos: PhotoItem[]) => void;
}

// Exemplos reais de imagens de preservação, fauna e fiscalização ambiental de Mairiporã
const SAMPLE_DIRECT_LINKS = [
  {
    title: 'Fauna Silvestre (Sagui / Caxinguêle)',
    url: 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?auto=format&fit=crop&w=600&q=80',
    category: 'Fauna',
  },
  {
    title: 'Mata Atlântica / Cantareira',
    url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=600&q=80',
    category: 'Mata',
  },
  {
    title: 'Descarte Irregular em APP',
    url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=600&q=80',
    category: 'Poluição',
  },
  {
    title: 'Margem da Represa Paiva Castro',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    category: 'Água',
  },
];

export const DirectLinkModal: React.FC<DirectLinkModalProps> = ({
  isOpen,
  onClose,
  onAddPhotos,
}) => {
  const [inputText, setInputText] = useState('');
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [parsingFeedback, setParsingFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  // Função inteligente que extrai URLs diretas ou tags <img src="...">
  const parseInputToUrls = (text: string): string[] => {
    if (!text.trim()) return [];

    const urls: string[] = [];

    // 1. Procurar por tags <img ... src="url" ...>
    const imgTagRegex = /<img[^>]+src=["']([^"']+)["']/gi;
    let match;
    let foundHtmlImg = false;
    while ((match = imgTagRegex.exec(text)) !== null) {
      if (match[1] && match[1].startsWith('http')) {
        urls.push(match[1]);
        foundHtmlImg = true;
      }
    }

    // 2. Se não encontrou tag HTML ou além das tags, procurar por URLs http/https por linha
    const lines = text.split(/\r?\n|,/);
    lines.forEach((line) => {
      const trimmed = line.trim();
      // Se já foi extraído como <img> pula
      if (trimmed.startsWith('<img')) return;

      const urlMatch = trimmed.match(/https?:\/\/[^\s"'<>]+/i);
      if (urlMatch && !urls.includes(urlMatch[0])) {
        urls.push(urlMatch[0]);
      }
    });

    if (foundHtmlImg) {
      setParsingFeedback(`Detectada tag <img> HTML! URL extraída com sucesso.`);
    } else if (urls.length > 0) {
      setParsingFeedback(`${urls.length} link(s) direto(s) identificado(s).`);
    } else {
      setParsingFeedback(null);
    }

    return urls;
  };

  const handleInputChange = (val: string) => {
    setInputText(val);
    const extracted = parseInputToUrls(val);
    setPreviewUrls(extracted);
  };

  const handleAddSample = (url: string) => {
    const combined = inputText ? `${inputText}\n${url}` : url;
    setInputText(combined);
    const extracted = parseInputToUrls(combined);
    setPreviewUrls(extracted);
  };

  const handleConfirm = () => {
    if (previewUrls.length === 0) return;

    const newItems: PhotoItem[] = previewUrls.map((url) => ({
      id: 'link_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
      url: url,
      source: 'direct_link',
      title: 'Link direto da imagem',
    }));

    onAddPhotos(newItems);
    setInputText('');
    setPreviewUrls([]);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-[4px] border-2 border-[rgba(0,0,0,0.87)] w-full max-w-[620px] shadow-[0_10px_30px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-white border-b-2 border-[rgba(0,0,0,0.87)] flex items-start justify-between gap-4">
          <div>
            <h3 className="text-[18px] font-bold text-[rgba(0,0,0,0.87)] leading-tight flex items-center gap-2">
              <Link2 className="w-5 h-5 text-[#0F2C4D]" />
              Adicionar Link Direto ou Imagem HTML
            </h3>
            <span className="text-[12px] text-[rgba(0,0,0,0.54)] block mt-0.5">
              Cole a URL direta da imagem (JPG, PNG, WEBP) ou a tag HTML completa contendo <code>&lt;img src="..."&gt;</code>.
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[22px] text-[rgba(0,0,0,0.87)] hover:text-black leading-none p-1 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Informative Callout */}
          <div className="bg-[#EDF4F9] border border-[#B3D2EB] rounded-[4px] p-3 text-xs text-[#0F2C4D]">
            <div className="font-semibold flex items-center gap-1.5 mb-1">
              <Code className="w-4 h-4 text-[#0F2C4D]" />
              <span>Suporte a links diretos e código HTML</span>
            </div>
            <p className="text-[rgba(0,0,0,0.7)] leading-relaxed">
              Você pode colar links diretos hospedados em qualquer servidor (como Imgur, Cloudinary, AWS S3, Unsplash) ou tags HTML como:
              <br />
              <code className="bg-white/80 px-1 py-0.5 rounded text-[11px] font-mono select-all inline-block mt-1">
                &lt;img src="https://exemplo.com/evidencia.jpg" /&gt;
              </code>
            </p>
          </div>

          {/* Textarea */}
          <div>
            <label className="block text-[13px] font-semibold text-[rgba(0,0,0,0.54)] mb-1.5 uppercase tracking-[0.03em]">
              Cole a URL ou código HTML:
            </label>
            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Exemplo 1: https://minha-hospedagem.com/foto1.jpg&#10;Exemplo 2: <img src=&quot;https://exemplo.com/ocorrencia.png&quot; />"
              className="w-full px-3.5 py-2.5 border-[1.5px] border-[rgba(0,0,0,0.87)] rounded-[4px] text-xs font-mono text-[rgba(0,0,0,0.87)] bg-white focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all resize-y"
            />
            {parsingFeedback && (
              <p className="text-xs text-[#0F5132] font-semibold mt-1 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                {parsingFeedback}
              </p>
            )}
          </div>

          {/* Sample quick buttons */}
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[rgba(0,0,0,0.6)] font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#0F2C4D]" />
              <span>Fotos de Exemplo para Teste (Mairiporã):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SAMPLE_DIRECT_LINKS.map((sample) => (
                <button
                  key={sample.title}
                  type="button"
                  onClick={() => handleAddSample(sample.url)}
                  className="text-left text-xs p-2 bg-[#F8FAFC] hover:bg-[#EDF2F7] border border-[rgba(0,0,0,0.15)] rounded-[3px] flex items-center gap-2 cursor-pointer transition-colors group"
                >
                  <img
                    src={sample.url}
                    alt={sample.title}
                    className="w-8 h-8 rounded-[2px] object-cover border border-[rgba(0,0,0,0.2)] shrink-0"
                    loading="lazy"
                  />
                  <div className="overflow-hidden">
                    <span className="font-semibold text-[rgba(0,0,0,0.85)] block truncate group-hover:text-[#0F2C4D]">
                      {sample.title}
                    </span>
                    <span className="text-[10px] text-[rgba(0,0,0,0.5)] block truncate">
                      + Inserir URL
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview Grid (80x80px) */}
          {previewUrls.length > 0 && (
            <div className="pt-2 border-t border-[rgba(0,0,0,0.12)]">
              <label className="block text-xs font-semibold text-[rgba(0,0,0,0.6)] uppercase tracking-wider mb-2">
                Pré-visualização dos links ({previewUrls.length}):
              </label>
              <div className="flex flex-wrap gap-2.5">
                {previewUrls.map((url, i) => (
                  <div
                    key={i}
                    className="w-[80px] h-[80px] rounded-[4px] border-[1.5px] border-[rgba(0,0,0,0.87)] bg-black overflow-hidden relative shadow-xs"
                  >
                    <img
                      src={url}
                      alt={`Preview ${i + 1}`}
                      className="w-full h-full object-cover block"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://placehold.co/80x80/222/fff?text=Link+Inv%C3%A1lido';
                      }}
                    />
                    <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1 rounded font-mono">
                      #{i + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-[#F8F9FA] border-t-[1.5px] border-[rgba(0,0,0,0.16)] flex items-center justify-between gap-3">
          <span className="text-xs text-[rgba(0,0,0,0.54)]">
            {previewUrls.length} imagem(ns) pronta(s) para vincular
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-white border-[1.5px] border-[rgba(0,0,0,0.87)] text-[rgba(0,0,0,0.87)] hover:bg-[#F5F5F5] text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded-[4px] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={previewUrls.length === 0}
              onClick={handleConfirm}
              className="bg-[#0F2C4D] hover:bg-[#0c2440] text-white text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded-[4px] cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Adicionar à Ocorrência</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
