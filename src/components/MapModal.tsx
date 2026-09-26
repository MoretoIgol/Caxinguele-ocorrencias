import React, { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import { X, Check, MapPin, Navigation, Compass } from 'lucide-react';

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLat?: number | null;
  initialLng?: number | null;
  onConfirm: (lat: number, lng: number, addressText?: string) => void;
}

const MAIRIPORA_CENTER: [number, number] = [-23.3186, -46.5867];

// Presets estratégicos de Mairiporã
const MAIRIPORA_PRESETS = [
  { name: 'Centro de Mairiporã', coords: [-23.3186, -46.5867] as [number, number] },
  { name: 'Represa Paiva Castro', coords: [-23.3228, -46.5925] as [number, number] },
  { name: 'Estrada do Rio Acima', coords: [-23.3341, -46.5789] as [number, number] },
  { name: 'Terra Preta', coords: [-23.2575, -46.5781] as [number, number] },
  { name: 'Cantareira (Águas Claras)', coords: [-23.3850, -46.6020] as [number, number] },
];

export const MapModal: React.FC<MapModalProps> = ({
  isOpen,
  onClose,
  initialLat,
  initialLng,
  onConfirm,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [addressPreview, setAddressPreview] = useState<string>('');
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Criar SVG Icon para o Marker de forma robusta e sem dependência de assets remotos
  const createCustomIcon = () => {
    return L.divIcon({
      className: 'custom-leaflet-pin',
      html: `
        <div style="transform: translate(-50%, -100%);">
          <svg width="34" height="42" viewBox="0 0 34 42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 0C7.61116 0 0 7.61116 0 17C0 29.75 17 42 17 42C17 42 34 29.75 34 17C34 7.61116 26.3888 0 17 0Z" fill="#0F2C4D"/>
            <circle cx="17" cy="17" r="8" fill="white"/>
            <circle cx="17" cy="17" r="4" fill="#0F2C4D"/>
          </svg>
        </div>
      `,
      iconSize: [34, 42],
      iconAnchor: [17, 42],
      popupAnchor: [0, -38],
    });
  };

  // Inicialização e atualização do mapa
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      const startingLat = initialLat ?? MAIRIPORA_CENTER[0];
      const startingLng = initialLng ?? MAIRIPORA_CENTER[1];

      if (!mapRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [startingLat, startingLng],
          zoom: 14,
          maxZoom: 19,
          minZoom: 11,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors | Mairiporã-SP',
        }).addTo(map);

        map.on('click', async (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          placeMarker(lat, lng, map);
          await fetchReverseGeocode(lat, lng);
        });

        mapRef.current = map;
      } else {
        mapRef.current.invalidateSize();
        mapRef.current.setView([startingLat, startingLng], 14);
      }

      if (initialLat && initialLng) {
        placeMarker(initialLat, initialLng, mapRef.current);
        fetchReverseGeocode(initialLat, initialLng);
      } else {
        setSelectedCoords(null);
        setAddressPreview('Clique no mapa para marcar a localização exata da ocorrência.');
      }
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [isOpen, initialLat, initialLng]);

  // Limpeza no unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const placeMarker = (lat: number, lng: number, mapInstance: L.Map) => {
    setSelectedCoords({ lat, lng });

    if (!markerRef.current) {
      const marker = L.marker([lat, lng], {
        icon: createCustomIcon(),
        draggable: true,
      }).addTo(mapInstance);

      marker.on('dragend', async () => {
        const pos = marker.getLatLng();
        setSelectedCoords({ lat: pos.lat, lng: pos.lng });
        await fetchReverseGeocode(pos.lat, pos.lng);
      });

      markerRef.current = marker;
    } else {
      markerRef.current.setLatLng([lat, lng]);
    }
  };

  const fetchReverseGeocode = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    setAddressPreview(`Buscando endereço para Lat ${lat.toFixed(5)}, Long ${lng.toFixed(5)}...`);

    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;
      const response = await fetch(url, {
        headers: { 'Accept-Language': 'pt-BR,pt;q=0.9' },
      });
      const data = await response.json();

      if (data && data.display_name) {
        setAddressPreview(data.display_name);
      } else {
        setAddressPreview(`Localização em Mairiporã (Lat: ${lat.toFixed(5)}, Long: ${lng.toFixed(5)})`);
      }
    } catch {
      setAddressPreview(`Coordenadas: Lat ${lat.toFixed(5)}, Long ${lng.toFixed(5)}`);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSelectPreset = (coords: [number, number]) => {
    if (mapRef.current) {
      mapRef.current.flyTo(coords, 15);
      placeMarker(coords[0], coords[1], mapRef.current);
      fetchReverseGeocode(coords[0], coords[1]);
    }
  };

  const handleConfirm = () => {
    if (selectedCoords) {
      onConfirm(selectedCoords.lat, selectedCoords.lng, addressPreview);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-[4px] border-2 border-[rgba(0,0,0,0.87)] w-full max-w-[820px] shadow-[0_10px_30px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-white border-b-2 border-[rgba(0,0,0,0.87)] flex items-start justify-between gap-4">
          <div>
            <h3 className="text-[18px] font-bold text-[rgba(0,0,0,0.87)] leading-tight flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#0F2C4D]" />
              Selecionar Local no Mapa
            </h3>
            <span className="text-[12px] text-[rgba(0,0,0,0.54)] block mt-0.5">
              Mapeamento focado na região de Mairiporã - SP. Clique no mapa para posicionar ou arrastar o pin.
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[22px] text-[rgba(0,0,0,0.87)] hover:text-black leading-none p-1 cursor-pointer transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets Bar */}
        <div className="bg-[#F8FAFC] px-4 py-2 border-b border-[rgba(0,0,0,0.12)] flex items-center gap-1.5 overflow-x-auto text-xs whitespace-nowrap">
          <span className="text-[rgba(0,0,0,0.5)] font-semibold uppercase tracking-wider text-[11px] mr-1">
            Pontos Rápidos:
          </span>
          {MAIRIPORA_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleSelectPreset(preset.coords)}
              className="bg-white hover:bg-[#E2E8F0] text-[rgba(0,0,0,0.8)] px-2.5 py-1 rounded-[3px] border border-[rgba(0,0,0,0.18)] cursor-pointer font-medium transition-colors"
            >
              {preset.name}
            </button>
          ))}
        </div>

        {/* Map Container */}
        <div className="relative w-full h-[400px] sm:h-[460px] bg-[#E5E3DF]">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Floating hint */}
          <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-[4px] border border-[rgba(0,0,0,0.2)] text-xs text-[rgba(0,0,0,0.8)] shadow-sm pointer-events-none flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-[#0F2C4D]" />
            <span>Clique em qualquer via ou área verde para marcar</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 bg-[#F8F9FA] border-t-[1.5px] border-[rgba(0,0,0,0.16)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-[13px] text-[rgba(0,0,0,0.87)] font-medium max-w-full sm:max-w-[480px]">
            {isGeocoding ? (
              <span className="italic text-[rgba(0,0,0,0.6)] flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-[#0F2C4D]/30 border-t-[#0F2C4D] rounded-full animate-spin inline-block" />
                Obtendo logradouro exato...
              </span>
            ) : selectedCoords ? (
              <div className="truncate">
                <strong className="text-[#0F2C4D] font-bold">Local: </strong>
                <span title={addressPreview}>{addressPreview}</span>
                <span className="block text-[11px] text-[rgba(0,0,0,0.5)] font-mono mt-0.5">
                  Lat: {selectedCoords.lat.toFixed(5)}, Long: {selectedCoords.lng.toFixed(5)}
                </span>
              </div>
            ) : (
              <span className="text-[rgba(0,0,0,0.54)]">
                Clique no mapa para marcar a localização exata da ocorrência.
              </span>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="bg-white border-[1.5px] border-[rgba(0,0,0,0.87)] text-[rgba(0,0,0,0.87)] hover:bg-[#F5F5F5] text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded-[4px] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={!selectedCoords}
              onClick={handleConfirm}
              className="bg-[#0F2C4D] hover:bg-[#0c2440] text-white text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded-[4px] cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Confirmar Localização</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
