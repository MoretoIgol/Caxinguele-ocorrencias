import React from 'react';
import { X, ExternalLink, Download, Image as ImageIcon } from 'lucide-react';

interface ImageLightboxModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  imageUrl,
  onClose,
}) => {
  if (!imageUrl) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative max-w-4xl max-h-[90vh] bg-[#111] rounded-[6px] border border-white/20 overflow-hidden flex flex-col shadow-2xl">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-black/60 border-b border-white/10 text-white text-xs">
          <div className="flex items-center gap-2 truncate max-w-[70%]">
            <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate font-mono">{imageUrl}</span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white flex items-center gap-1 transition-colors"
              title="Abrir imagem original em nova aba"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir Link</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Display */}
        <div className="flex items-center justify-center p-2 bg-black min-h-[300px] max-h-[78vh] overflow-auto">
          <img
            src={imageUrl}
            alt="Evidência em tela cheia"
            className="max-w-full max-h-[75vh] object-contain rounded-[2px]"
          />
        </div>
      </div>
    </div>
  );
};
