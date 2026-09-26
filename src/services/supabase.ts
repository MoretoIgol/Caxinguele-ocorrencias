import { Ocorrencia } from '../types';

const SUPABASE_REST_URL = 'https://prmavenrtlgxahooreut.supabase.co/rest/v1/';
const SUPABASE_KEY = 'sb_publishable_GoldEoNsDGPjtIS6GGaEmA__tQ0wiiz';
const LOCAL_STORAGE_KEY = 'ong_caxinguele_ocorrencias_v2';

// Exemplos iniciais com imagens diretas da região de Mairiporã e Serra da Cantareira
const INITIAL_DEMO_OCORRENCIAS: Ocorrencia[] = [
  {
    id: 'oco-demo-01',
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    endereco: 'Estrada do Rio Acima, Km 14, Mairiporã - SP',
    numero: 'S/N',
    referencia: 'Próximo à entrada do Parque Estadual da Cantareira (Núcleo Águas Claras)',
    descricao: 'Descarte clandestino de entulhos de construção e restos de poda em Área de Preservação Permanente (APP), próximo ao leito do córrego.',
    latitude: -23.3341,
    longitude: -46.5789,
    fotos: [
      'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80'
    ],
    status: 'Em Análise',
    agente_email: 'agente@caxinguele.org'
  },
  {
    id: 'oco-demo-02',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    endereco: 'Avenida Tabelião Passarella, Mairiporã - SP',
    numero: '450',
    referencia: 'Em frente ao Parque Linear / Margem da Represa Paiva Castro',
    descricao: 'Avistamento e resgate preventivo de sagui (Callithrix) ferido próximo à fiação elétrica. Animal foi recolhido temporariamente pela equipe voluntária.',
    latitude: -23.3204,
    longitude: -46.5892,
    fotos: [
      'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?auto=format&fit=crop&w=800&q=80'
    ],
    status: 'Em Atendimento',
    agente_email: 'agente@caxinguele.org'
  }
];

export async function saveOcorrenciaToSupabase(payload: {
  endereco: string;
  numero?: string;
  referencia?: string;
  descricao: string;
  latitude?: number | null;
  longitude?: number | null;
  fotos: string[];
  agente_email: string;
}): Promise<{ success: boolean; data: Ocorrencia; savedRemotely: boolean; error?: string }> {
  const newOcorrencia: Ocorrencia = {
    id: 'oco_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    created_at: new Date().toISOString(),
    endereco: payload.endereco,
    numero: payload.numero || '',
    referencia: payload.referencia || '',
    descricao: payload.descricao,
    latitude: payload.latitude ?? null,
    longitude: payload.longitude ?? null,
    fotos: payload.fotos,
    status: 'Pendente',
    agente_email: payload.agente_email,
  };

  let savedRemotely = false;
  let remoteError = '';

  // 1. Tentar salvar no Supabase REST
  try {
    const response = await fetch(`${SUPABASE_REST_URL}ocorrencias`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        endereco: payload.endereco,
        numero: payload.numero || null,
        referencia: payload.referencia || null,
        descricao: payload.descricao,
        latitude: payload.latitude !== null && payload.latitude !== undefined ? payload.latitude.toString() : null,
        longitude: payload.longitude !== null && payload.longitude !== undefined ? payload.longitude.toString() : null,
        fotos: payload.fotos.length > 0 ? JSON.stringify(payload.fotos) : null,
        agente_email: payload.agente_email,
      }),
    });

    if (response.ok) {
      savedRemotely = true;
      const resData = await response.json();
      if (Array.isArray(resData) && resData[0]?.id) {
        newOcorrencia.id = resData[0].id.toString();
      }
    } else {
      const errJson = await response.json().catch(() => ({}));
      remoteError = errJson.message || `Status HTTP ${response.status}`;
      console.warn('Aviso Supabase:', remoteError);
    }
  } catch (err: any) {
    remoteError = err?.message || 'Falha na conexão de rede';
    console.warn('Erro ao conectar ao Supabase:', remoteError);
  }

  // 2. Sempre armazenar cópia segura local (Local Storage)
  try {
    const existing = getLocalOcorrencias();
    const updated = [newOcorrencia, ...existing];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (storageErr) {
    console.error('Falha ao persistir no localStorage:', storageErr);
  }

  return {
    success: true,
    data: newOcorrencia,
    savedRemotely,
    error: savedRemotely ? undefined : remoteError,
  };
}

export function getLocalOcorrencias(): Ocorrencia[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_OCORRENCIAS));
      return INITIAL_DEMO_OCORRENCIAS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_DEMO_OCORRENCIAS;
  } catch {
    return INITIAL_DEMO_OCORRENCIAS;
  }
}

export async function fetchAllOcorrencias(): Promise<Ocorrencia[]> {
  try {
    const response = await fetch(`${SUPABASE_REST_URL}ocorrencias?order=id.desc`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
    });

    if (response.ok) {
      const remoteData = await response.json();
      if (Array.isArray(remoteData) && remoteData.length > 0) {
        const mappedRemote: Ocorrencia[] = remoteData.map((item: any) => ({
          id: item.id?.toString() || String(Math.random()),
          created_at: item.created_at || new Date().toISOString(),
          endereco: item.endereco || 'Endereço não informado',
          numero: item.numero || '',
          referencia: item.referencia || '',
          descricao: item.descricao || '',
          latitude: item.latitude ? parseFloat(item.latitude) : null,
          longitude: item.longitude ? parseFloat(item.longitude) : null,
          fotos: parseFotos(item.fotos),
          status: (item.status as any) || 'Pendente',
          agente_email: item.agente_email || 'agente@caxinguele.org',
        }));

        // Merge com itens locais para não perder registros salvos
        const local = getLocalOcorrencias();
        const ids = new Set(mappedRemote.map(r => r.id));
        const combined = [...mappedRemote, ...local.filter(l => !ids.has(l.id))];
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(combined));
        return combined;
      }
    }
  } catch (err) {
    console.warn('Erro ao buscar ocorrências do Supabase, usando local:', err);
  }

  return getLocalOcorrencias();
}

function parseFotos(fotosRaw: any): string[] {
  if (!fotosRaw) return [];
  if (Array.isArray(fotosRaw)) return fotosRaw;
  if (typeof fotosRaw === 'string') {
    try {
      const parsed = JSON.parse(fotosRaw);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [fotosRaw];
    }
  }
  return [];
}
