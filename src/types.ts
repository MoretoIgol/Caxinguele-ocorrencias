export interface User {
  email: string;
  name?: string;
  role?: string;
}

export interface PhotoItem {
  id: string;
  url: string; // Blob URL, Direct Web URL, or Data URL
  source: 'upload' | 'direct_link' | 'sample';
  title?: string;
}

export interface Ocorrencia {
  id: string;
  created_at: string;
  endereco: string;
  numero?: string;
  referencia?: string;
  descricao: string;
  latitude?: number | null;
  longitude?: number | null;
  fotos: string[]; // List of image URLs
  status: 'Pendente' | 'Em Análise' | 'Em Atendimento' | 'Resolvido';
  agente_email: string;
}

export interface AddressSearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
}
