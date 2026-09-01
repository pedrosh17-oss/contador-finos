'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

// ==========================================
// ⚙️ CONFIGURAÇÃO RÁPIDA
// ==========================================
const TOTAL_GIFS = 1;                     
const META_FESTA_DIARIA = 20;             
const DATA_INICIO_PROJETO = '2026-08-05';   

// 🏷️ TÍTULOS OFICIAIS DO RANKING
const TITULOS_RANKING = [
  '👑 Campeão dos Finos',
  '🐂 Matulão',
  '⚠️ Atenção ao Bicho',
  '🤝 "Se beberes também bebo"',
  '🍻 Eu vou ao meu ritmo mas vou',
  '😐 Nhé..',
  '🤷‍♂️ Não é terrível, mas crl...',
  '📉 Metade inferior. É curto...',
  '🎈 Só bebes em festas?',
  '🫣 Não fossem os outros eras uma vergonha',
  '🧪 Tubo',
  '🧼 Conas de sabão, faz-te homem!'
];

// 🍻 TIPOS DE BEBIDA E EQUIVALÊNCIAS
const TIPOS_BEBIDA = {
  fino: { label: '🥂 Fino / Mini', equivalencia: 1.0, emoji: '🥂' },
  principe: { label: '🥃 Príncipe / Garrafa', equivalencia: 1.5, emoji: '🥃' },
  caneca: { label: '🍺 Caneca', equivalencia: 2.5, emoji: '🍺' },
  pint: { label: '🖌️ Pint', equivalencia: 2.8, emoji: '🖌️' }
} as const;

type TipoBebidaKey = keyof typeof TIPOS_BEBIDA;

const MENSAGENS_DIVERTIDAS = [
  'Mais próximo da cirrose! 🚑',
  'Lá se vai a dieta... 🥗📉',
  'O teu fígado mandou-te para o caralho! 🏳️',
  'O grupo agradece o teu esforço! 🇵🇹🍻',
  'Amanhã vai doer🧟‍♂️',
  'O rim está aqui é para trabalhar. Por isso tenho 2 💛',
];

const MENSAGENS_FESTA = [
  'JÁ NÃO HÁ REGRAS! 🚀',
  'VAI COM O CARALHO FÍGADO! 🪩',
  'NINGUÉM DORME HOJE! 🍻',
  'CHAMA A GNR! 🚓',
  'ESTAMOS A DESTRUIR TUDO! 💥',
  'HOJE É ATÉ DE MANHÃ! 🧛‍♂️',
  'BEBE ATÉ ESQUECERES A PASSWORD MBWAY! 💳'
];

const MARCOS_GRUPO = [
  { meta: 50, texto: "Fodemos o volume exato de 20 pacotes de leite de meio litro. Dá para encher um garrafão de água grande até ao topo... duas vezes seguidas." },
  { meta: 100, texto: "Bebeu-se o equivalente a descarregar 4 autoclismos de casa de banho cheios até cima só com cerveja de pressão. Parabéns a todos!" },
  { meta: 150, texto: "Com o guito já pagávamos uma botija de gás e um cabaz de compras quinzenal no Pingo Doce, mas preferimos foder as beiças a uns finos." },
  { meta: 200, texto: "Bebemos o volume exato do depósito de combustível de um Fiat Punto de 2003 atestado até estalar a pistola da bomba." },
  { meta: 250, texto: "Gastamos em cerveja o guito que custa uma PlayStation 5 em promoção. Que orgulho." },
  { meta: 300, texto: "Rebentamos o peso exato de uma máquina de lavar roupa 8kg. É parabéns." },
  { meta: 350, texto: "Em cerveja ocupamos o volume de 140 pacotes de Compal de pêssego. Se metêssemos esta cerveja toda em garrafas de 1,5L, enchíamos 46 garrafas." },
  { meta: 400, texto: "80 Litros ou algo assim. Um depósito cheio de combustível de um SUV grande ou camioneta. Sim senhora..." },
  { meta: 450, texto: "O peso em líquido que bebemos equivale a empilhar 180 pacotes de arroz num carrinho de compras." },
  { meta: 500, texto: "300 latas de 33cl empilhadas. Se alinhássemos tudo o que bebemos na estrada, fazíamos uma fila de 35 metros de vidro." },
  { meta: 550, texto: "Dá para encher a capacidade do depósito de água limpa de uma autocaravana de férias inteira. Cum crl… Relembro que começamos a 5 de Agosto..." },
  { meta: 600, texto: "Fodemos as trombas ao equivalente a 240 garrafas de vinho de mesa. O dinheiro gasto já dava para pagar o seguro contra todos os riscos de um carro novo. E isto só em cerveja." },
  { meta: 650, texto: "Rebentou-se o peso líquido de um porco bísaro adulto 130kg. Tivessemos esta disciplina no ginásio e estavamos impecáveis." },
  { meta: 700, texto: "Ultrapassámos a fasquia do Ordenado Mínimo Nacional em cerveja. A Autoridade Tributária deve estar prestes a ligar." },
  { meta: 750, texto: "Bebemos um bilhete de avião de ida e volta ao Vietname." },
  { meta: 800, texto: "O guito acumulado é o valor comercial de um iPhone 15 Pro de 256GB. O telemóvel tira fotos em 4K, mas tambem… que se foda." },
  { meta: 850, texto: "O peso total da cerveja é superior ao de duas motas scooter de 125cc juntas. RESPECT!" },
  { meta: 900, texto: "180 Litros OU CRL... O guito daria para pagar a renda de um T1 fora do centro durante 2 meses." },
  { meta: 950, texto: "O volume enchia o estômago de camelo adulto até ele não ter mais sede. QUE CAMPEÕES!" },
  { meta: 1000, texto: "1.000 FINOS! 200 LITROS DE CERVEJA! O volume total enchia rigorosamente a bagageira de um Volkswagen Golf de 2020 até ao teto! Somos grandes!" },
  { meta: 1100, texto: "220 Litros no bucho. O peso em cerveja é superior ao de um leão adulto macho. Que equipa!" },
  { meta: 1200, texto: "240 Litros de cerveja. O guito gasto daria para pagar um ano inteiro de propinas da faculdade a pronto pagamento. Mas também é mais fixe um gajo gabar-se destes números." },
  { meta: 1300, texto: "O volume de cevada já enchia o depósito de água de um camião de bombeiros pequeno. Cá puta." },
  { meta: 1400, texto: "Mais ou menos 2.100€ que já fodemos que na verdade são mais devido as pints. Dava para uma viagem ao Japão." },
  { meta: 1500, texto: "300 Litros. O volume daria para encher a capacidade total do porta-bagagens de um Renault Clio de 2023." },
  { meta: 1600, texto: "Quase 3 salários mínimos nacionais líquidos: O equivalente a mais de dois meses e meio de trabalho a tempo inteiro de um trabalhador em Portugal." },
  { meta: 1700, texto: "O peso líquido em cerveja é superior ao de dois ursos-pandas gordinhos juntos." },
  { meta: 1800, texto: "1080 idas à casa de banho: Assumindo a regra matemática de que 'tudo o que entra tem de sair', este volume traduz-se em cerca de 360 a 400 litros de urina expelidos." },
  { meta: 1900, texto: "Atingimos a fasquia do volume exato da bagageira de um Volkswagen Golf cheia de cerveja pura até transbordar pelas portas!" },
  { meta: 2000, texto: "2.000 FINOS! 400 LITROS DE CERVEJA E 3.000€ EM COPOS! Sugiro uma jantarada só com coca-cola e agua das pedras. Para cortar." }
];


const SONS_CELEBRACAO = [
  'https://assets.mixkit.co/active_storage/sfx/2070/2070-preview.mp3', 
  'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3', 
  'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3', 
  'https://assets.mixkit.co/active_storage/sfx/131.mp3',                 
];

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function enviarNotificacao(title: string, body: string) {
  try {
    await fetch('/api/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body })
    });
  } catch (e) {
    console.error('Erro push:', e);
  }
}

async function ativarNotificacoesPush(perfilId: string) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    alert("O teu navegador não suporta notificações.");
    return false;
  }
  
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return false;

  const registration = await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;

  const pubKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BCYisANNmub1PBy-VT3OWqn33kZUFR6e74dtCi_xxNtMZV37EI12QDtxNUOHjQYQGlTAHGcTCTKVNW_IaAF5Znc';
  const applicationServerKey = urlBase64ToUint8Array(pubKey);

  let subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    await subscription.unsubscribe();
  }

  subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey
  });

  await supabase.from('push_subscriptions').upsert([
    { perfil_id: perfilId, subscription: subscription.toJSON() }
  ], { onConflict: 'perfil_id' });

  return true;
}

async function comprimirImagem(file: File, maxDimensao = 400, qualidade = 0.6): Promise<File> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimensao) { height = Math.round((height * maxDimensao) / width); width = maxDimensao; }
        } else {
          if (height > maxDimensao) { width = Math.round((width * maxDimensao) / height); height = maxDimensao; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const fotoComprimida = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", { type: 'image/webp', lastModified: Date.now() });
              resolve(fotoComprimida);
            } else { resolve(file); }
          },
          'image/webp', qualidade
        );
      };
    };
  });
}

async function obterLocalizacaoGPS(): Promise<{ lat: number | null; lng: number | null }> {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) {
      resolve({ lat: null, lng: null });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        resolve({ lat: null, lng: null });
      },
      { timeout: 5000, enableHighAccuracy: true }
    );
  });
}

function formatarFinos(val: number): string {
  const num = Number(val) || 0;
  return num % 1 === 0 ? num.toString() : num.toFixed(1);
}

function obterAnoSemana(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1));
  const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
  return `${date.getUTCFullYear()}-W${weekNo}`;
}

function obterAnoMes(d: Date) {
  return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}`;
}

function calcularCampeoesHistoricos(finosList: any[]) {
  const hoje = new Date();
  const semanaAtual = obterAnoSemana(hoje);
  const mesAtual = obterAnoMes(hoje);

  const semanas: Record<string, { [id: string]: number }> = {};
  const meses: Record<string, { [id: string]: number }> = {};

  finosList.forEach(f => {
    if (f.tipo_bebida === 'gregorio') return;
    const d = new Date(f.data_hora);
    const wk = obterAnoSemana(d);
    const ms = obterAnoMes(d);
    const val = f.quantidade_equivalente ?? 1;
    
    if (wk !== semanaAtual) {
      if (!semanas[wk]) semanas[wk] = {};
      semanas[wk][f.perfil_id] = (semanas[wk][f.perfil_id] || 0) + val;
    }
    if (ms !== mesAtual) {
      if (!meses[ms]) meses[ms] = {};
      meses[ms][f.perfil_id] = (meses[ms][f.perfil_id] || 0) + val;
    }
  });

  const vitoriasSemana: Record<string, number> = {};
  const vitoriasMes: Record<string, number> = {};

  Object.values(semanas).forEach(contagens => {
    let max = 0; let vencedores: string[] = [];
    for (const [id, count] of Object.entries(contagens)) {
      if (count > max) { max = count; vencedores = [id]; }
      else if (count === max && count > 0) vencedores.push(id);
    }
    if (max > 0) vencedores.forEach(id => { vitoriasSemana[id] = (vitoriasSemana[id] || 0) + 1; });
  });

  Object.values(meses).forEach(contagens => {
    let max = 0; let vencedores: string[] = [];
    for (const [id, count] of Object.entries(contagens)) {
      if (count > max) { max = count; vencedores = [id]; }
      else if (count === max && count > 0) vencedores.push(id);
    }
    if (max > 0) vencedores.forEach(id => { vitoriasMes[id] = (vitoriasMes[id] || 0) + 1; });
  });

  return { vitoriasSemana, vitoriasMes };
}

export default function Home() {
  const [abaAtiva, setAbaAtiva] = useState<'inicio' | 'ranking' | 'perfil' | 'rodada' | 'mapa' | 'feitos' | 'historico'>('inicio');
  const [toast, setToast] = useState<{msg: string, tipo: 'erro' | 'sucesso'} | null>(null);

  const [modalGregorioOpen, setModalGregorioOpen] = useState(false);
  const [usersExpandidos, setUsersExpandidos] = useState<{ [key: string]: boolean }>({});

  const [perfis, setPerfis] = useState<any[]>([]);
  const [finos, setFinos] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [novoNome, setNovoNome] = useState('');
  const [loading, setLoading] = useState(false);

  const [modoRegisto, setModoRegisto] = useState<'individual' | 'rodada'>('individual');
  const [bebedoresRodada, setBebedoresRodada] = useState<string[]>([]);

  const [darkMode, setDarkMode] = useState(false);
  const [tipoBebidaSelecionado, setTipoBebidaSelecionado] = useState<TipoBebidaKey>('fino');
  
  const [abaRanking, setAbaRanking] = useState<'semanal' | 'geral'>('semanal');
  const [mensagemModal, setMensagemModal] = useState<{ texto: string; gifUrl: string | null } | null>(null);
  
  const [fotoExpandida, setFotoExpandida] = useState<string | null>(null);
  const [diasAbertos, setDiasAbertos] = useState<{ [key: string]: boolean }>({});

  const [fighter1, setFighter1] = useState<string>('');
  const [fighter2, setFighter2] = useState<string>('');

  // 🎲 ABA RODADA & MINI-JOGOS
  const [modoDecisaoRodada, setModoDecisaoRodada] = useState<'roleta' | 'cronometro' | 'copo' | 'reacao'>('roleta');
  const [presentesMesa, setPresentesMesa] = useState<string[]>([]);
  const [seletorTelemovelAberto, setSeletorTelemovelAberto] = useState(false);

  // 🎰 ROLETA (3 ROLOS COM ANIMAÇÃO VERTICAL DE CASINO)
  const [slotSpinning, setSlotSpinning] = useState(false);
  const [reel1Spinning, setReel1Spinning] = useState(false);
  const [reel2Spinning, setReel2Spinning] = useState(false);
  const [reel3Spinning, setReel3Spinning] = useState(false);
  const [reel1, setReel1] = useState('❓');
  const [reel2, setReel2] = useState('❓');
  const [reel3, setReel3] = useState('❓');
  const [vitimaRodada, setVitimaRodada] = useState<any | null>(null);

  // ⏱️ JOGO CRONÓMETRO CEGO MULTIPLAYER
  const [cronoAlvo, setCronoAlvo] = useState<number>(5.0);
  const [cronoEmCurso, setCronoEmCurso] = useState(false);
  const [cronoDisplay, setCronoDisplay] = useState('0.00');
  const [cronoEscondido, setCronoEscondido] = useState(false);
  const [cronoResultados, setCronoResultados] = useState<{ id: string; nome: string; tempo: number; erro: number }[]>([]);
  const [cronoPerdedor, setCronoPerdedor] = useState<any | null>(null);

  // 💣 JOGO COPO DA MORTE MULTIPLAYER
  const [coposJogo, setCoposJogo] = useState<{ id: number; revelado: boolean; eBomba: boolean; dono?: string }[]>([]);
  const [copoJogadorAtualIdx, setCpoJogadorAtualIdx] = useState(0);
  const [copoPerdedor, setCpoPerdedor] = useState<any | null>(null);

  // ⚡ JOGO TESTE DE SOBRIEDADE (REAÇÃO RÁPIDA)
  const [reacaoEstado, setReacaoEstado] = useState<'espera' | 'preparar' | 'verde' | 'concluido'>('espera');
  const [reacaoStartTime, setReacaoStartTime] = useState<number | null>(null);
  const [reacaoResultados, setReacaoResultados] = useState<{ id: string; nome: string; tempoMs: number | null; falsaPartida: boolean }[]>([]);
  const [reacaoPerdedor, setReacaoPerdedor] = useState<any | null>(null);


  // ABA PERFIL
  const [perfilSelecionadoId, setPerfilSelecionadoId] = useState<string>('');
  const [seletorPerfilAberto, setSeletorPerfilAberto] = useState(false);

  const mapRef = useRef<any>(null);
  const clusterGroupRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);
  const channelRef = useRef<any>(null);
  const reacaoTimerRef = useRef<any>(null);

  useEffect(() => {
    fetchDados();

    const themeGuardado = localStorage.getItem('finos_theme');
    if (themeGuardado === 'dark') setDarkMode(true);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }

    // 🔄 DETETAR QUANDO A APP VOLTA DO SEGUNDO PLANO OU CLIQUE EM NOTIFICAÇÃO
    const handleReabertura = () => {
      if (document.visibilityState === 'visible') {
        fetchDados();
      }
    };

    window.addEventListener('focus', fetchDados);
    document.addEventListener('visibilitychange', handleReabertura);

    const canalRealtime = supabase
      .channel('tempo-real-finos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'finos' }, () => { fetchDados(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'perfis' }, () => { fetchDados(); })
      .subscribe();

    // 📡 CANAL BROADCAST MULTIPLAYER
    const canalJogos = supabase.channel('sala-jogos-rodada');
    channelRef.current = canalJogos;

    canalJogos
      .on('broadcast', { event: 'INICIAR_CRONO' }, ({ payload }) => {
        setCronoAlvo(payload.alvo);
        setPresentesMesa(payload.jogadores);
        setCronoResultados([]);
        setCronoPerdedor(null);
        setCronoEmCurso(false);
        setCronoDisplay('0.00');
        setCronoEscondido(false);
        setModoDecisaoRodada('cronometro');
      })
      .on('broadcast', { event: 'REGISTO_CRONO' }, ({ payload }) => {
        setCronoResultados(prev => {
          const filtrado = prev.filter(p => p.id !== payload.id);
          return [...filtrado, payload];
        });
      })
      .on('broadcast', { event: 'INICIAR_COPO' }, ({ payload }) => {
        setCoposJogo(payload.copos);
        setPresentesMesa(payload.jogadores);
        setCpoJogadorAtualIdx(0);
        setCpoPerdedor(null);
        setModoDecisaoRodada('copo');
      })
      .on('broadcast', { event: 'VIRAR_COPO' }, ({ payload }) => {
        setCoposJogo(prev => prev.map(c => c.id === payload.copoId ? { ...c, revelado: true, dono: payload.nomeJogador } : c));
        if (payload.eBomba) {
          setCpoPerdedor({ id: payload.jogadorId, nome: payload.nomeJogador });
          dispararCelebracao();
        } else {
          setCpoJogadorAtualIdx(prev => (prev + 1) % payload.totalJogadores);
        }
      })
      .on('broadcast', { event: 'INICIAR_REACAO' }, ({ payload }) => {
        setPresentesMesa(payload.jogadores);
        setReacaoResultados([]);
        setReacaoPerdedor(null);
        setReacaoEstado('preparar');
        setModoDecisaoRodada('reacao');

        if (reacaoTimerRef.current) clearTimeout(reacaoTimerRef.current);
        reacaoTimerRef.current = setTimeout(() => {
          setReacaoEstado('verde');
          setReacaoStartTime(Date.now());
        }, payload.delay);
      })
      .on('broadcast', { event: 'REGISTO_REACAO' }, ({ payload }) => {
        setReacaoResultados(prev => {
          const filtrado = prev.filter(p => p.id !== payload.id);
          return [...filtrado, payload];
        });
      })
      .subscribe();

    return () => {
      window.removeEventListener('focus', fetchDados);
      document.removeEventListener('visibilitychange', handleReabertura);
      supabase.removeChannel(canalRealtime);
      supabase.removeChannel(canalJogos);
      if (reacaoTimerRef.current) clearTimeout(reacaoTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (selectedUser && !perfilSelecionadoId) {
      setPerfilSelecionadoId(selectedUser);
    }
  }, [selectedUser]);

  // 🏁 VERIFICAR FIM DO CRONÓMETRO MULTIPLAYER
  useEffect(() => {
    if (presentesMesa.length > 0 && cronoResultados.length >= presentesMesa.length && !cronoPerdedor) {
      const pior = [...cronoResultados].sort((a, b) => b.erro - a.erro)[0];
      setCronoPerdedor(pior);
      dispararCelebracao();
    }
  }, [cronoResultados, presentesMesa]);

  // ⚡ VERIFICAR FIM DO TESTE DE REAÇÃO MULTIPLAYER
  useEffect(() => {
    if (presentesMesa.length > 0 && reacaoResultados.length >= presentesMesa.length && !reacaoPerdedor) {
      const falsas = reacaoResultados.filter(r => r.falsaPartida);
      let pior: any = null;
      if (falsas.length > 0) {
        pior = falsas[0];
      } else {
        pior = [...reacaoResultados].sort((a, b) => (b.tempoMs || 0) - (a.tempoMs || 0))[0];
      }
      setReacaoPerdedor(pior);
      dispararCelebracao();
    }
  }, [reacaoResultados, presentesMesa]);

 

  // 🗺️ MAPA DE CLUSTERS E LISTA DE CONCELHOS
  const [cidadesStats, setCidadesStats] = useState<{ cidade: string; total: number; pessoas: string[] }[]>([]);

  useEffect(() => {
    if (abaAtiva !== 'mapa' || typeof window === 'undefined') return;

    let intervalId: any = null;

    const inicializarMapa = () => {
      const L = (window as any).L;
      if (!L || !L.markerClusterGroup) return false;

      if (!mapRef.current) {
        const map = L.map('mapa-calor-container').setView([41.1579, -8.6291], 6);
        mapRef.current = map;

        // 🛠️ TILE LAYER LIMPO (SEM MARCA D'ÁGUA)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);

        clusterGroupRef.current = L.markerClusterGroup({
          iconCreateFunction: function(cluster: any) {
            const count = cluster.getChildCount();
            let dim = 'w-11 h-11';
            let numSize = 'text-xs';
            if (count > 10) { dim = 'w-12 h-12'; numSize = 'text-sm'; }
            if (count > 50) { dim = 'w-14 h-14 shadow-[0_0_20px_rgba(245,158,11,0.9)]'; numSize = 'text-base'; }

            const html = `
              <div class="${dim} bg-amber-500 rounded-full border-2 border-white flex flex-col items-center justify-center font-black text-slate-950 shadow-lg">
                <span class="${numSize} leading-none mb-0.5">${count}</span>
                <span class="text-[10px] leading-none">🍺</span>
              </div>
            `;

            return L.divIcon({ html: html, className: 'bg-transparent border-0', iconSize: [48, 48], iconAnchor: [24, 24] });
          }
        });

        map.addLayer(clusterGroupRef.current);
      }

      clusterGroupRef.current.clearLayers();

      const pontosValidos = finos.filter(f => f.lat && f.lng && f.tipo_bebida !== 'gregorio');
      
      pontosValidos.forEach(f => {
        const customIcon = L.divIcon({
          html: `<div class="text-2xl drop-shadow-md">🍺</div>`,
          className: 'bg-transparent border-0',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });
        
        const marker = L.marker([f.lat, f.lng], { icon: customIcon });
        marker.bindPopup(`<b>${f.perfis?.nome || 'Alguém'}</b> bebeu aqui!`);
        clusterGroupRef.current.addLayer(marker);
      });

      if (pontosValidos.length > 0) {
        const bounds = L.latLngBounds(pontosValidos.map((p: any) => [p.lat, p.lng]));
        mapRef.current.fitBounds(bounds, { padding: [30, 30], maxZoom: 16 });
      }

      setTimeout(() => { mapRef.current?.invalidateSize(); }, 200);
      return true;
    };

    if (!inicializarMapa()) {
      intervalId = setInterval(() => {
        if (inicializarMapa()) clearInterval(intervalId);
      }, 150);
    }

    // 🏙️ CÁLCULO DOS CONCELHOS (VERSÃO LIMPA V6 SEM ERROS DE FETCH)
    const processarCidades = async () => {
      try {
        const pontos = finos.filter(f => f.lat && f.lng && f.tipo_bebida !== 'gregorio');
        if (!pontos || pontos.length === 0) {
          setCidadesStats([]);
          return;
        }

        // 1. Agrupar por coordenadas aproximadas (~2km)
        const pontosPorCoordenada: Record<string, { lat: number; lng: number; total: number; pessoas: Set<string> }> = {};

        pontos.forEach(p => {
          if (p.lat == null || p.lng == null) return;
          const key = `${Number(p.lat).toFixed(2)},${Number(p.lng).toFixed(2)}`;
          if (!pontosPorCoordenada[key]) {
            pontosPorCoordenada[key] = { lat: p.lat, lng: p.lng, total: 0, pessoas: new Set() };
          }
          pontosPorCoordenada[key].total += (p.quantidade_equivalente ?? 1);
          if (p.perfis?.nome) pontosPorCoordenada[key].pessoas.add(p.perfis.nome);
        });

        // 2. Chamar a API local com tratamento direto de erros
        const mapaAgrupadoConcelhos: Record<string, { total: number; pessoas: Set<string> }> = {};

        for (const [key, dados] of Object.entries(pontosPorCoordenada)) {
          const cacheKey = `geo_concelho_v6_${key}`;
          let nomeConcelho = localStorage.getItem(cacheKey);

          if (!nomeConcelho) {
            try {
              const res = await fetch(`/api/geocode?lat=${dados.lat}&lng=${dados.lng}`);
              if (res.ok) {
                const data = await res.json();
                if (data?.city) {
                  nomeConcelho = data.city;
                  localStorage.setItem(cacheKey, nomeConcelho);
                }
              }
            } catch {
              // Se a rota falhar no browser, define o nome local diretamente
            }
          }

          const concelhoFinal = nomeConcelho || `Zona (${key})`;

          if (!mapaAgrupadoConcelhos[concelhoFinal]) {
            mapaAgrupadoConcelhos[concelhoFinal] = { total: 0, pessoas: new Set() };
          }

          mapaAgrupadoConcelhos[concelhoFinal].total += dados.total;
          dados.pessoas.forEach(p => mapaAgrupadoConcelhos[concelhoFinal].pessoas.add(p));
        }

        const resultadoFinal = Object.entries(mapaAgrupadoConcelhos).map(([cidade, dados]) => ({
          cidade,
          total: dados.total,
          pessoas: Array.from(dados.pessoas)
        })).sort((a, b) => b.total - a.total);

        setCidadesStats(resultadoFinal);
      } catch (err) {
        console.error('Erro silencioso em processarCidades:', err);
      }
    };

    processarCidades();

    return () => { if (intervalId) clearInterval(intervalId); };
  }, [abaAtiva, finos]);

  const handleAtivarNotificacoes = async () => {
    if (!selectedUser) {
      mostrarToast('Seleciona primeiro o teu nome para ativar as notificações!', 'erro');
      return;
    }
    const sucesso = await ativarNotificacoesPush(selectedUser);
    if (sucesso) {
      mostrarToast('Notificações ativadas com sucesso! 🔔', 'sucesso');
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const novo = !prev;
      localStorage.setItem('finos_theme', novo ? 'dark' : 'light');
      return novo;
    });
  };

  const toggleUserExpandido = (id: string) => {
    setUsersExpandidos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  function mostrarToast(msg: string, tipo: 'erro' | 'sucesso' = 'erro') {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3500);
  }

  async function fetchDados() {
    const { data: dataPerfis } = await supabase.from('perfis').select('*');
    const { data: dataFinos } = await supabase.from('finos').select('*, perfis(nome)').order('data_hora', { ascending: false });

    if (dataPerfis) setPerfis(dataPerfis);
    if (dataFinos) setFinos(dataFinos);
  }

  function tocarSomEVibrar() {
    if (typeof window !== 'undefined') {
      if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
      const audio = new Audio(SONS_CELEBRACAO[Math.floor(Math.random() * SONS_CELEBRACAO.length)]);
      audio.volume = 0.8;
      audio.play().catch(() => {});
    }
  }

  const finosValidos = finos.filter(f => f.tipo_bebida !== 'gregorio');

  const hoje = new Date();
  const hojeMs = new Date().setHours(0, 0, 0, 0);
  const ontemMs = hojeMs - 86400000;

  const dataArranque = new Date(DATA_INICIO_PROJETO + 'T00:00:00');
  const diaDoProjeto = Math.max(1, Math.floor((hojeMs - dataArranque.getTime()) / 86400000) + 1);

  const diasComFinosGrupo = Array.from(new Set(finosValidos.map(f => new Date(f.data_hora).setHours(0, 0, 0, 0)))).sort((a, b) => a - b);
  let streakGrupo = 0;
  if (diasComFinosGrupo.length > 0) {
    let tempMs = hojeMs;
    if (!diasComFinosGrupo.includes(tempMs)) {
      tempMs = ontemMs;
    }
    while (diasComFinosGrupo.includes(tempMs)) {
      streakGrupo++;
      tempMs -= 86400000;
    }
  }

  const inicioSemana = new Date();
  const diaSemana = inicioSemana.getDay() || 7;
  inicioSemana.setHours(0, 0, 0, 0);
  inicioSemana.setDate(inicioSemana.getDate() - diaSemana + 1);

  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

  const finosSemana = finosValidos.filter(f => new Date(f.data_hora) >= inicioSemana);
  const finosMes = finosValidos.filter(f => new Date(f.data_hora) >= inicioMes);

  const finosExibidos = abaRanking === 'semanal' ? finosSemana : finosValidos;
  const totalFinosEq = finosExibidos.reduce((acc, f) => acc + (f.quantidade_equivalente ?? 1), 0);
  const totalFinosGeralEq = finosValidos.reduce((acc, f) => acc + (f.quantidade_equivalente ?? 1), 0);
  const totalLitrosGrupo = (totalFinosGeralEq * 0.2).toFixed(1);
  const proximoMarco = MARCOS_GRUPO.find(m => m.meta > totalFinosGeralEq);

  const finosPorDataStr: { [key: string]: any[] } = {};
  finosValidos.forEach(f => {
    const dStr = new Date(f.data_hora).toLocaleDateString('pt-PT');
    if (!finosPorDataStr[dStr]) finosPorDataStr[dStr] = [];
    finosPorDataStr[dStr].push(f);
  });

  const hojeStrLocal = new Date().toLocaleDateString('pt-PT');
  const finosBebidosHoje = (finosPorDataStr[hojeStrLocal] || []).reduce((acc, f) => acc + (f.quantidade_equivalente ?? 1), 0);
  const isModoFesta = finosBebidosHoje >= META_FESTA_DIARIA;

  function dispararCelebracao() {
    tocarSomEVibrar();
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js';
      script.onload = () => {
        const confetti = (window as any).confetti;
        if (!confetti) return;
        const particleCount = isModoFesta ? 200 : 80;
        const spread = isModoFesta ? 180 : 100;
        confetti({ particleCount, spread, origin: { y: 0.6 }, colors: ['#ff0055', '#00e5ff', '#ffaa00', '#ffffff', '#b45309'] });
        const scalar = 2;
        const beerEmoji = confetti.shapeFromText({ text: '🍺', scalar });
        const bombEmoji = confetti.shapeFromText({ text: '💣', scalar });
        const shapes = isModoFesta ? [beerEmoji, bombEmoji] : [beerEmoji];
        confetti({ shapes, particleCount: isModoFesta ? 30 : 15, scalar, spread: 70, origin: { y: 0.7 } });
      };
      document.body.appendChild(script);
    }
  }

  async function registarFino(e: React.ChangeEvent<HTMLInputElement>) {
    if (!selectedUser) { mostrarToast('Seleciona o teu nome na lista primeiro! 🍺', 'erro'); return; }
    if (modoRegisto === 'rodada' && bebedoresRodada.length === 0) { mostrarToast('Seleciona pelo menos 1 amigo que bebeu na rodada!', 'erro'); return; }

    try {
      setLoading(true);
      const file = e.target.files?.[0];
      let photoUrl: string | null = null;
      const coords = await obterLocalizacaoGPS();

      if (file) {
        const fotoComprimida = await comprimirImagem(file);
        const fileName = `${Date.now()}-${fotoComprimida.name}`;
        const { error: uploadError } = await supabase.storage.from('fotos-finos').upload(fileName, fotoComprimida);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('fotos-finos').getPublicUrl(fileName);
        photoUrl = data.publicUrl;
      }

      const bebidaInfo = TIPOS_BEBIDA[tipoBebidaSelecionado];

      // 🚨 CÁLCULO DE MILESTONES ANTES E DEPOIS DO REGISTO
      const totalAntes = totalFinosGeralEq;
      const qtdAdicionada = bebidaInfo.equivalencia * (modoRegisto === 'rodada' ? bebedoresRodada.length : 1);
      const totalDepois = totalAntes + qtdAdicionada;

      if (modoRegisto === 'individual') {
        await supabase.from('finos').insert([{ 
          perfil_id: selectedUser, foto_url: photoUrl, tipo_bebida: tipoBebidaSelecionado, quantidade_equivalente: bebidaInfo.equivalencia, lat: coords.lat, lng: coords.lng
        }]);
      } else {
        const listaInserir = bebedoresRodada.map(pId => ({
          perfil_id: pId, foto_url: photoUrl, tipo_bebida: tipoBebidaSelecionado, quantidade_equivalente: bebidaInfo.equivalencia, pagador_id: selectedUser, lat: coords.lat, lng: coords.lng
        }));
        await supabase.from('finos').insert(listaInserir);
      }
      
      const nomeUser = perfis.find(p => p.id === selectedUser)?.nome || 'Alguém';
      const agoraHora = new Date().getHours();

      // 🏆 VERIFICAR SE CRUZOU ALGUMA MILESTONE DO GRUPO
      const marcoUltrapassado = MARCOS_GRUPO.find(m => totalAntes < m.meta && totalDepois >= m.meta);

      if (marcoUltrapassado) {
        enviarNotificacao(
          `🎉 NOVO MARCO: ${marcoUltrapassado.meta} FINOS!`,
          `${nomeUser} acabou de desbloquear o marco dos ${marcoUltrapassado.meta} finos! "${marcoUltrapassado.texto}"`
        );
      } else if (modoRegisto === 'rodada') {
        enviarNotificacao('💳 O CHEFE PAGOU UMA RODADA!', `${nomeUser} pagou uma rodada para ${bebedoresRodada.length} amigos! Paga o que deves!`);
      } else {
        if (agoraHora >= 3 && agoraHora < 6) {
          enviarNotificacao('🎂 É PARABÉNS:', `${nomeUser} recusa-se a ir dormir e acabou de registar mais uma bebida. Já passa das 3 da manhã…`);
        } else {
          const finosHojeUser = (finosPorDataStr[hojeStrLocal] || []).filter(f => f.perfil_id === selectedUser).reduce((acc, f) => acc + (f.quantidade_equivalente ?? 1), 0) + bebidaInfo.equivalencia;
          if (finosHojeUser >= 5) enviarNotificacao('🔥 EM CHAMA!', `${nomeUser} vai no equivalente a ${formatarFinos(finosHojeUser)} finos hoje. Já deve tar meio pêssego`);
          else enviarNotificacao('🍺 LÁ VAI ELE!', `${nomeUser} fodeu as beiças a mais uma bebida!`);
        }
      }

      dispararCelebracao();
      const frasesRandom = isModoFesta ? MENSAGENS_FESTA : MENSAGENS_DIVERTIDAS;
      const textoSorteado = frasesRandom[Math.floor(Math.random() * frasesRandom.length)];
      
      let gifSorteado: string | null = null;
      if (TOTAL_GIFS > 0) gifSorteado = `/gifs/${Math.floor(Math.random() * TOTAL_GIFS) + 1}.webp`;

      setMensagemModal({ texto: modoRegisto === 'rodada' ? `💳 Rodada registada! Pagante: ${perfis.find(p=>p.id===selectedUser)?.nome}` : textoSorteado, gifUrl: gifSorteado });
      setBebedoresRodada([]);
      fetchDados();
    } catch (err) {
      mostrarToast('Erro ao guardar. Verifica a net.', 'erro');
    } finally {
      setLoading(false);
    }
  }
  async function criarPerfil() {
    if (!novoNome) { mostrarToast('Escreve o teu nome primeiro!', 'erro'); return; }
    await supabase.from('perfis').insert([{ nome: novoNome }]);
    setNovoNome('');
    mostrarToast('Bem-vindo à equipa!', 'sucesso');
    fetchDados();
  }

  async function confirmarGregorio() {
    setModalGregorioOpen(false);
    try {
      setLoading(true);
      await supabase.from('finos').insert([{ perfil_id: selectedUser, tipo_bebida: 'gregorio', quantidade_equivalente: 0 }]);
      const nomeVomitador = perfis.find(p => p.id === selectedUser)?.nome || 'Alguém';
      enviarNotificacao('🤮 TEMOS HOMEM AO MAR!', `${nomeVomitador} gregou-se todo! A reputação desceu!`);
      mostrarToast('Fizeste mau registado! A tua reputação desceu! 🤮', 'sucesso');
      fetchDados();
    } catch (err) { mostrarToast('Erro ao registar.', 'erro'); } finally { setLoading(false); }
  }

  function abrirModalGregorio() {
    if (!selectedUser) { mostrarToast('Seleciona o teu nome na lista primeiro! 🤮', 'erro'); return; }
    setModalGregorioOpen(true);
  }

  const historicoCampeoes = calcularCampeoesHistoricos(finos);

  function calcularConquistas(userFinosValidos: any[], userId: string) {
    const list: string[] = [];
    const vitsSemana = historicoCampeoes.vitoriasSemana[userId] || 0;
    const vitsMes = historicoCampeoes.vitoriasMes[userId] || 0;
    
    if (vitsSemana > 0) list.push(`👑 Campeão da Semana (x${vitsSemana})`);
    if (vitsMes > 0) list.push(`🏆 Campeão do Mês (x${vitsMes})`);
  
    const rodadasPagas = finos.filter(f => f.pagador_id === userId).length;
    if (rodadasPagas > 0) {
      const rodadasUnicas = new Set(finos.filter(f => f.pagador_id === userId).map(f => f.data_hora)).size;
      list.push(`💸 Paga-Rodadas (${rodadasUnicas}x)`);
    }
  
    if (!userFinosValidos || userFinosValidos.length === 0) return list;
  
    // 🐪 MEDALHA DE DIAS A SECO
    const ultFinoMs = Math.max(...userFinosValidos.map(f => new Date(f.data_hora).getTime()));
    const diasSemBeber = Math.floor((Date.now() - ultFinoMs) / 86400000);
    if (diasSemBeber >= 5) {
      list.push(`🐪 ${diasSemBeber} Dias a Seco`);
    }
  
    // 🦉 HORÁRIOS
    if (userFinosValidos.some((f) => { const h = new Date(f.data_hora).getHours(); return h >= 6 && h < 13; })) list.push('🌅 Madrugador');
    if (userFinosValidos.some((f) => { const h = new Date(f.data_hora).getHours(); return h >= 3 && h < 6; })) list.push('🦉 Coruja');
    
    // ⚡ RITMO
    const ord = [...userFinosValidos].sort((a, b) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime());
    for (let i = 0; i < ord.length; i++) {
      let soma = 0;
      const t0 = new Date(ord[i].data_hora).getTime();
      for (let j = i; j < ord.length; j++) {
        const tj = new Date(ord[j].data_hora).getTime();
        if (tj - t0 <= 7200000) { soma += (ord[j].quantidade_equivalente ?? 1); } else break;
      }
      if (soma >= 3.0) { list.push('⚡ Acelerado'); break; }
    }
  
    // 🔥 MAIOR STREAK DE SEMPRE DO GRUPO (LONGEST STREAK EVER)
    const userStreakObj = statsStreaks.find(s => s.id === userId);
    const userMaxStreak = userStreakObj?.maxStreak || 0;
    const recordeAbsolutoGrupo = Math.max(...statsStreaks.map(s => s.maxStreak), 0);
    
    if (userMaxStreak > 0 && userMaxStreak === recordeAbsolutoGrupo) {
      list.push(`🔥 Longest Streak Ever (${userMaxStreak}d)`);
    }
    
    // 🍺 VOLUMES INDIVIDUAIS
    const totalEq = userFinosValidos.reduce((acc, f) => acc + (f.quantidade_equivalente ?? 1), 0);
    if (totalEq >= 1) list.push('🌱 Primeira Bebida');
    if (totalEq >= 10) list.push('🥉 10 Finos');
    if (totalEq >= 25) list.push('🥈 25 Finos');
    if (totalEq >= 50) list.push('🥇 50 Finos');
    if (totalEq >= 100) list.push('💯 100 Finos');
    if (totalEq >= 150) list.push('💥 150 Finos');
    if (totalEq >= 200) list.push('💣 200 Finos');
    if (totalEq >= 250) list.push('🚀 250 Finos');
    if (totalEq >= 300) list.push('⚡ 300 Finos');
    if (totalEq >= 350) list.push('🌋 350 Finos');
    if (totalEq >= 400) list.push('👑 400 Finos');
    if (totalEq >= 450) list.push('☣️ 450 Finos');
    if (totalEq >= 500) list.push('🪐 500 Finos (Lenda)');

    // 🌍 MEDALHAS DE EXPLORAÇÃO DE CONCELHOS
  const zonasUnicas = new Set(
    userFinosValidos
      .filter(f => f.lat && f.lng)
      .map(f => `${f.lat.toFixed(2)},${f.lng.toFixed(2)}`)
  ).size;

  if (zonasUnicas >= 2) list.push('🚗 Turista de Tascos (2+ concelhos)');
  if (zonasUnicas >= 5) list.push('✈️ Trotamundos (5+ concelhos)');
  if (zonasUnicas >= 10) list.push('🗺️ Colombo dos Finos (10+ concelhos)');
  
    return list;
  }

  const rankingAbsoluto = perfis
    .map((p) => {
      const countGeral = finosValidos.filter((f) => f.perfil_id === p.id).reduce((acc, f) => acc + (f.quantidade_equivalente ?? 1), 0);
      return { ...p, countGeral };
    })
    .sort((a, b) => b.countGeral - a.countGeral);

  const reiDoFinoAbsoluto = rankingAbsoluto[0];
  
// 👇 COLA EXATAMENTE AQUI O CÓDIGO ABAIXO 👇
const statsStreaks = perfis.map(p => {
  const pFinos = finosValidos.filter(f => f.perfil_id === p.id);
  const diasUnicosMs = Array.from(new Set(pFinos.map(f => new Date(f.data_hora).setHours(0, 0, 0, 0)))).sort((a, b) => a - b);
  let maxS = 0, curS = 0, tempS = 0, lastMs: number | null = null;
  
  diasUnicosMs.forEach(diaMs => {
    if (lastMs === null) { tempS = 1; } else {
      const diffDays = Math.round((diaMs - lastMs) / 86400000);
      if (diffDays === 1) tempS++; else if (diffDays > 1) tempS = 1;
    }
    if (tempS > maxS) maxS = tempS;
    lastMs = diaMs;
  });

  if (diasUnicosMs.length > 0) {
    const lastDayMs = diasUnicosMs[diasUnicosMs.length - 1];
    if (lastDayMs === hojeMs || lastDayMs === ontemMs) curS = tempS; 
    else curS = 0;
  }
  return { id: p.id, nome: p.nome, maxStreak: maxS, currentStreak: curS };
});
  const contagemPorPessoa = perfis
    .map((p) => {
      const userFinosGeral = finos.filter((f) => f.perfil_id === p.id);
      const userFinosValidos = finosValidos.filter((f) => f.perfil_id === p.id);
      const userFinosFiltrados = finosExibidos.filter((f) => f.perfil_id === p.id);
      const count = userFinosFiltrados.reduce((acc, f) => acc + (f.quantidade_equivalente ?? 1), 0);
      const gregorios = userFinosGeral.filter(f => f.tipo_bebida === 'gregorio').length;
      const conquistas = calcularConquistas(userFinosValidos, p.id);

      const periodos = { 'Madrugada': 0, 'Manhã': 0, 'Tarde': 0, 'Noite': 0 };
      userFinosValidos.forEach(f => {
        const h = new Date(f.data_hora).getHours();
        const val = f.quantidade_equivalente ?? 1;
        if (h >= 0 && h < 6) periodos['Madrugada'] += val;
        else if (h >= 6 && h < 12) periodos['Manhã'] += val;
        else if (h >= 12 && h < 18) periodos['Tarde'] += val;
        else periodos['Noite'] += val;
      });
      let periodoForte = ''; let maxP = 0;
      for (const [k, v] of Object.entries(periodos)) {
        if (v > maxP && v > 0) { maxP = v; periodoForte = k; }
      }

      return { ...p, count, conquistas, gregorios, userFinosValidos, periodoForte };
    })
    .sort((a, b) => b.count - a.count);


  const horasCount = { 'Madrugada': 0, 'Manhã': 0, 'Tarde': 0, 'Noite': 0 };
  const diasSemanaCount = [0, 0, 0, 0, 0, 0, 0];
  const nomesDias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  finosValidos.forEach(f => {
    const data = new Date(f.data_hora);
    const h = data.getHours();
    const val = f.quantidade_equivalente ?? 1;
    if (h >= 0 && h < 6) horasCount['Madrugada'] += val;
    else if (h >= 6 && h < 12) horasCount['Manhã'] += val;
    else if (h >= 12 && h < 18) horasCount['Tarde'] += val;
    else horasCount['Noite'] += val;
    diasSemanaCount[data.getDay()] += val;
  });
  
  const maxHoraCount = Math.max(...Object.values(horasCount), 1);
  const maxDiaCount = Math.max(...diasSemanaCount, 1);

  const ritmoUsers: { id: string, nome: string, paceMin: number }[] = [];
  perfis.forEach(p => {
    const pFinos = finosValidos.filter(f => f.perfil_id === p.id).sort((a, b) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime());
    let totalDiff = 0, countDiff = 0;
    const finosPorDia: { [key: string]: any[] } = {};
    pFinos.forEach(f => {
      const d = new Date(f.data_hora).toLocaleDateString('pt-PT');
      if (!finosPorDia[d]) finosPorDia[d] = [];
      finosPorDia[d].push(f);
    });
    Object.values(finosPorDia).forEach(listaDia => {
      for (let i = 0; i < listaDia.length - 1; i++) {
        const diffMs = new Date(listaDia[i + 1].data_hora).getTime() - new Date(listaDia[i].data_hora).getTime();
        if (diffMs < 6 * 3600000) { totalDiff += diffMs; countDiff++; }
      }
    });
    if (countDiff > 0) ritmoUsers.push({ id: p.id, nome: p.nome, paceMin: Math.round((totalDiff / countDiff) / 60000) });
  });

  function getFighterStats(id: string) {
    const pCount = contagemPorPessoa.find(p => p.id === id)?.count || 0;
    const pStreak = statsStreaks.find(s => s.id === id)?.maxStreak || 0;
    const pRitmo = ritmoUsers.find(r => r.id === id)?.paceMin || Infinity;
    return { count: pCount, streak: pStreak, ritmo: pRitmo };
  }

  const f1Stats = fighter1 ? getFighterStats(fighter1) : null;
  const f2Stats = fighter2 ? getFighterStats(fighter2) : null;

  // LÓGICA DO SORTEADOR DA RODADA
  const toggleMesa = (id: string) => { setPresentesMesa(prev => prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]); };
  const toggleBebedorRodada = (id: string) => { setBebedoresRodada(prev => prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]); };
  const selecionarTodosMesa = () => setPresentesMesa(perfis.map(p => p.id));
  const limparMesa = () => setPresentesMesa([]);

  // 🎰 LÓGICA DA ROLETA
  function girarSlotMachine() {
    if (presentesMesa.length < 2) {
      mostrarToast('Seleciona pelo menos 2 pessoas na mesa! 🍻', 'erro');
      return;
    }

    const nomesNaMesa = presentesMesa
      .map(id => perfis.find(p => p.id === id)?.nome)
      .filter((nome): nome is string => Boolean(nome));

    if (nomesNaMesa.length < 2) return;

    setSlotSpinning(true);
    setReel1Spinning(true);
    setReel2Spinning(true);
    setReel3Spinning(true);
    setVitimaRodada(null);

    const getRandomName = () => nomesNaMesa[Math.floor(Math.random() * nomesNaMesa.length)];

    const eMatch = Math.random() < 0.70;
    const vitimaSort = perfis.find(p => p.id === presentesMesa[Math.floor(Math.random() * presentesMesa.length)]);
    const nomeVencedor = vitimaSort?.nome || nomesNaMesa[0];

    let finalR1 = nomeVencedor;
    let finalR2 = nomeVencedor;
    let finalR3 = nomeVencedor;

    if (!eMatch) {
      finalR1 = nomesNaMesa[0];
      finalR2 = nomesNaMesa[1 % nomesNaMesa.length];
      finalR3 = nomesNaMesa.length > 2 ? nomesNaMesa[2] : nomesNaMesa[0];
      if (finalR1 === finalR2 && finalR2 === finalR3) {
        finalR3 = nomesNaMesa[1 % nomesNaMesa.length];
      }
    }

    let delay1 = 40;
    const spinR1 = (elapsed: number) => {
      if (elapsed < 1400) {
        setReel1(getRandomName());
        delay1 = Math.min(220, delay1 * 1.08);
        setTimeout(() => spinR1(elapsed + delay1), delay1);
      } else {
        setReel1(finalR1);
        setReel1Spinning(false);
      }
    };

    let delay2 = 40;
    const spinR2 = (elapsed: number) => {
      if (elapsed < 2400) {
        setReel2(getRandomName());
        delay2 = Math.min(280, delay2 * 1.08);
        setTimeout(() => spinR2(elapsed + delay2), delay2);
      } else {
        setReel2(finalR2);
        setReel2Spinning(false);
      }
    };

    let delay3 = 40;
    const spinR3 = (elapsed: number) => {
      if (elapsed < 3600) {
        setReel3(getRandomName());
        delay3 = Math.min(450, delay3 * 1.10);
        setTimeout(() => spinR3(elapsed + delay3), delay3);
      } else {
        setReel3(finalR3);
        setReel3Spinning(false);
        setSlotSpinning(false);

        setTimeout(() => {
          if (eMatch && vitimaSort) {
            setVitimaRodada(vitimaSort);
          } else {
            setVitimaRodada({ id: 'ninguem', nome: 'NINGUÉM PAGA!' });
          }
          dispararCelebracao();
        }, 800);
      }
    };

    spinR1(0);
    spinR2(0);
    spinR3(0);
  }

  // ==========================================
  // ⏱️ LÓGICA DO JOGO 1: CRONÓMETRO MULTIPLAYER
  // ==========================================
  function iniciarJogoCronometroMultiplayer() {
    if (presentesMesa.length < 2) { mostrarToast('Seleciona pelo menos 2 pessoas na mesa!', 'erro'); return; }
    const alvoAcaso = parseFloat((Math.random() * 5 + 3.5).toFixed(2));

    setCronoAlvo(alvoAcaso);
    setCronoResultados([]);
    setCronoPerdedor(null);
    setCronoEmCurso(false);
    setCronoDisplay('0.00');
    setCronoEscondido(false);

    channelRef.current?.send({
      type: 'broadcast',
      event: 'INICIAR_CRONO',
      payload: { alvo: alvoAcaso, jogadores: presentesMesa }
    });
  }

  function handleBotaoCronometroMultiplayer() {
    if (!selectedUser) {
      mostrarToast('Seleciona quem és tu no telemóvel primeiro!', 'erro');
      return;
    }

    if (!cronoEmCurso) {
      setCronoEmCurso(true);
      setCronoEscondido(false);
      const agora = Date.now();

      timerIntervalRef.current = setInterval(() => {
        const decorrido = (Date.now() - agora) / 1000;
        if (decorrido > 1.2) {
          setCronoEscondido(true);
        }
        setCronoDisplay(decorrido.toFixed(2));
      }, 30);
    } else {
      clearInterval(timerIntervalRef.current);
      setCronoEmCurso(false);
      setCronoEscondido(false);
      
      const tempoFinal = parseFloat(cronoDisplay);
      const erro = Math.abs(tempoFinal - cronoAlvo);
      const nomeJogador = perfis.find(p => p.id === selectedUser)?.nome || 'Jogador';

      const meuResultado = { id: selectedUser, nome: nomeJogador, tempo: tempoFinal, erro };

      setCronoResultados(prev => {
        const filtrado = prev.filter(p => p.id !== selectedUser);
        return [...filtrado, meuResultado];
      });

      channelRef.current?.send({
        type: 'broadcast',
        event: 'REGISTO_CRONO',
        payload: meuResultado
      });
    }
  }

  // ==========================================
  // 💣 LÓGICA DO JOGO 2: COPO DA MORTE MULTIPLAYER
  // ==========================================
  function iniciarJogoCopoMultiplayer() {
    if (presentesMesa.length < 2) { mostrarToast('Seleciona pelo menos 2 pessoas na mesa!', 'erro'); return; }
    
    const numCopos = Math.max(presentesMesa.length + 2, 6);
    const bombaIdx = Math.floor(Math.random() * numCopos);
    
    const novosCopos = Array.from({ length: numCopos }, (_, i) => ({
      id: i,
      revelado: false,
      eBomba: i === bombaIdx
    }));

    setCoposJogo(novosCopos);
    setCpoJogadorAtualIdx(0);
    setCpoPerdedor(null);

    channelRef.current?.send({
      type: 'broadcast',
      event: 'INICIAR_COPO',
      payload: { copos: novosCopos, jogadores: presentesMesa }
    });
  }

  function virarCopoMultiplayer(copoId: number) {
    if (copoPerdedor || !selectedUser) return;
    
    const jogadorVezId = presentesMesa[copoJogadorAtualIdx];
    if (selectedUser !== jogadorVezId) {
      const nomeVez = perfis.find(p => p.id === jogadorVezId)?.nome;
      mostrarToast(`Ainda não é a tua vez! É a vez do ${nomeVez}.`, 'erro');
      return;
    }

    const copo = coposJogo.find(c => c.id === copoId);
    if (!copo || copo.revelado) return;

    const nomeJogador = perfis.find(p => p.id === selectedUser)?.nome || 'Jogador';

    setCoposJogo(prev => prev.map(c => c.id === copoId ? { ...c, revelado: true, dono: nomeJogador } : c));
    if (copo.eBomba) {
      setCpoPerdedor({ id: selectedUser, nome: nomeJogador });
      dispararCelebracao();
    } else {
      setCpoJogadorAtualIdx(prev => (prev + 1) % presentesMesa.length);
    }

    channelRef.current?.send({
      type: 'broadcast',
      event: 'VIRAR_COPO',
      payload: {
        copoId,
        jogadorId: selectedUser,
        nomeJogador,
        eBomba: copo.eBomba,
        totalJogadores: presentesMesa.length
      }
    });
  }

  // ==========================================
  // ⚡ LÓGICA DO JOGO 3: TESTE DE REAÇÃO MULTIPLAYER
  // ==========================================
  function iniciarJogoReacaoMultiplayer() {
    if (presentesMesa.length < 2) { mostrarToast('Seleciona pelo menos 2 pessoas na mesa!', 'erro'); return; }
    const delayAcaso = Math.floor(Math.random() * 3500) + 2000;

    setReacaoResultados([]);
    setReacaoPerdedor(null);
    setReacaoEstado('preparar');

    if (reacaoTimerRef.current) clearTimeout(reacaoTimerRef.current);
    reacaoTimerRef.current = setTimeout(() => {
      setReacaoEstado('verde');
      setReacaoStartTime(Date.now());
    }, delayAcaso);

    channelRef.current?.send({
      type: 'broadcast',
      event: 'INICIAR_REACAO',
      payload: { delay: delayAcaso, jogadores: presentesMesa }
    });
  }

  function handleToqueReacao() {
    if (!selectedUser) {
      mostrarToast('Seleciona quem és tu no telemóvel primeiro!', 'erro');
      return;
    }
    const nomeJogador = perfis.find(p => p.id === selectedUser)?.nome || 'Jogador';

    if (reacaoEstado === 'preparar') {
      const meuResultado = { id: selectedUser, nome: nomeJogador, tempoMs: null, falsaPartida: true };
      setReacaoResultados(prev => [...prev.filter(p => p.id !== selectedUser), meuResultado]);
      setReacaoEstado('concluido');

      channelRef.current?.send({
        type: 'broadcast',
        event: 'REGISTO_REACAO',
        payload: meuResultado
      });
    } else if (reacaoEstado === 'verde' && reacaoStartTime) {
      const tempoMs = Date.now() - reacaoStartTime;
      const meuResultado = { id: selectedUser, nome: nomeJogador, tempoMs, falsaPartida: false };
      setReacaoResultados(prev => [...prev.filter(p => p.id !== selectedUser), meuResultado]);
      setReacaoEstado('concluido');

      channelRef.current?.send({
        type: 'broadcast',
        event: 'REGISTO_REACAO',
        payload: meuResultado
      });
    }
  }

  const toggleDia = (dia: string) => setDiasAbertos((prev) => ({ ...prev, [dia]: !prev[dia] }));
  const finosPorDiaParaLista = finos.reduce((acc: { [key: string]: any[] }, fino) => {
    const dataStr = new Date(fino.data_hora).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    if (!acc[dataStr]) acc[dataStr] = [];
    acc[dataStr].push(fino);
    return acc;
  }, {});

  // CÁLCULOS DA ABA DE PERFIL
  const perfilAtualObj = perfis.find(p => p.id === perfilSelecionadoId);
  const userFinosValidosAtual = finosValidos.filter(f => f.perfil_id === perfilSelecionadoId);
  const totalUserEqAtual = userFinosValidosAtual.reduce((acc, f) => acc + (f.quantidade_equivalente ?? 1), 0);
  const litrosNoSangueAtual = (totalUserEqAtual * 0.20).toFixed(1);
  const percentualColoGrupo = totalFinosGeralEq > 0 ? ((totalUserEqAtual / totalFinosGeralEq) * 100).toFixed(1) : '0.0';
  
  const statsUser = statsStreaks.find(s => s.id === perfilSelecionadoId);
  const melhorStreakAtual = statsUser?.maxStreak || 0;
  const streakVivoAtual = statsUser?.currentStreak || 0;
  const mediaFinosPorDia = (totalUserEqAtual / diaDoProjeto).toFixed(1);

  const conquistasAtual = perfilSelecionadoId ? calcularConquistas(userFinosValidosAtual, perfilSelecionadoId) : [];
  const posGeralIndex = rankingAbsoluto.findIndex(p => p.id === perfilSelecionadoId);
  const tituloOficialAtual = posGeralIndex !== -1 ? (TITULOS_RANKING[posGeralIndex] || TITULOS_RANKING[TITULOS_RANKING.length - 1]) : '-';

  const userFinosGeralTodos = finos.filter((f) => f.perfil_id === perfilSelecionadoId);
  const totalVomitosUser = userFinosGeralTodos.filter(f => f.tipo_bebida === 'gregorio').length;
  const paceCardiacoUser = ritmoUsers.find(r => r.id === perfilSelecionadoId)?.paceMin || 0;

  const userPeriodos = { 'Madrugada 🧛‍♂️': 0, 'Manhã 🍳': 0, 'Tarde 🌇': 0, 'Noite 🌃': 0 };
  userFinosValidosAtual.forEach(f => {
    const h = new Date(f.data_hora).getHours();
    const val = f.quantidade_equivalente ?? 1;
    if (h >= 0 && h < 6) userPeriodos['Madrugada 🧛‍♂️'] += val;
    else if (h >= 6 && h < 12) userPeriodos['Manhã 🍳'] += val;
    else if (h >= 12 && h < 18) userPeriodos['Tarde 🌇'] += val;
    else userPeriodos['Noite 🌃'] += val;
  });
  let horarioCriticoUser = 'Sem dados'; let maxPUser = 0;
  for (const [k, v] of Object.entries(userPeriodos)) {
    if (v > maxPUser && v > 0) { maxPUser = v; horarioCriticoUser = k; }
  }

  const navItems = [
    { id: 'inicio', label: 'Início', icon: '🏠' },
    { id: 'ranking', label: 'Ranking', icon: '📊' },
    { id: 'perfil', label: 'Perfil', icon: '🪪' },
    { id: 'rodada', label: 'Rodada', icon: '🎲' },
    { id: 'mapa', label: 'Mapa', icon: '🗺️' },
    { id: 'feitos', label: 'Feitos', icon: '🎯' },
    { id: 'historico', label: 'Galeria', icon: '📸' }
  ] as const;

  const mainWrapperClasses = isModoFesta ? 'brutal-bg text-white' : darkMode ? 'bg-slate-950 text-slate-100' : 'bg-amber-50 text-slate-900';
  const cardClasses = isModoFesta ? 'bg-black/60 border border-white/10 backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.1)] text-white' : darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';

  const meuResultadoCrono = cronoResultados.find(r => r.id === selectedUser);
  const meuResultadoReacao = reacaoResultados.find(r => r.id === selectedUser);

  return (
    <>
      <style>{`
        @keyframes marqueeScroll { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
        .animate-marquee { display: inline-block; white-space: nowrap; animation: marqueeScroll 8s linear infinite; }
        .custom-cluster-icon { background: transparent; border: none; }

        @keyframes slotVerticalSpin {
          0% { transform: translateY(-50%); filter: blur(2px); }
          50% { transform: translateY(0%); filter: blur(3px); }
          100% { transform: translateY(50%); filter: blur(2px); }
        }
        .animate-slot-vertical {
          animation: slotVerticalSpin 0.12s linear infinite;
        }

        ${isModoFesta ? `
          @keyframes discoBg { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
          @keyframes shakeBrutal { 0% { transform: translate(1px, 1px) rotate(0deg); } 25% { transform: translate(-2px, -2px) rotate(-1deg); } 50% { transform: translate(2px, 2px) rotate(1deg); } 75% { transform: translate(-2px, 1px) rotate(0deg); } 100% { transform: translate(1px, -1px) rotate(-1deg); } }
          .brutal-bg { background: linear-gradient(-45deg, #180030, #ff0044, #000000, #00e5ff, #3a0088); background-size: 400% 400%; animation: discoBg 2s ease infinite; }
          .brutal-shake { animation: shakeBrutal 0.15s infinite; }
        ` : ''}
      `}</style>

      <main className={`min-h-screen p-4 max-w-md mx-auto font-sans pb-24 relative transition-all duration-1000 ${mainWrapperClasses}`}>

        {toast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex justify-center px-4 duration-300 w-full max-w-sm">
            <div className={`px-4 py-3 rounded-2xl shadow-2xl font-black text-sm flex items-center gap-2 w-full justify-center transition-all ${
              toast.tipo === 'erro' ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-emerald-500 text-white shadow-emerald-500/20'
            }`}>
              <span className="text-lg">{toast.tipo === 'erro' ? '⚠️' : '✅'}</span>
              {toast.msg}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-2 pt-2">
          <h1 className={`text-2xl font-extrabold flex items-center gap-2 transition-all ${isModoFesta ? 'text-white drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]' : darkMode ? 'text-amber-400' : 'text-amber-900'}`}>
            {isModoFesta ? 'É SEMPRE A VIRÁ-LOS' : '🍻 Contador'}
          </h1>
          <div className="flex gap-2">
            <button onClick={handleAtivarNotificacoes} className="px-3 py-1.5 rounded-full font-black text-xs transition border flex items-center gap-1.5 shadow-sm bg-blue-600 hover:bg-blue-500 text-white border-blue-500 active:scale-95">🔔 Alertas</button>
            <button onClick={toggleDarkMode} className={`px-3 py-1.5 rounded-full font-black text-xs transition border flex items-center gap-1.5 shadow-sm ${isModoFesta ? 'bg-black/50 text-white border-white/20' : darkMode ? 'bg-slate-900 text-amber-400 border-slate-800' : 'bg-white text-slate-700 border-slate-200'}`}>{darkMode ? '☀️' : '🌙'}</button>
          </div>
        </div>

        {isModoFesta && abaAtiva === 'inicio' && (
          <div className="mb-4 rounded-lg overflow-hidden border-2 border-yellow-400 shadow-[0_0_15px_red] bg-red-600 py-1.5">
            <div className="animate-marquee text-lg font-black text-yellow-300 uppercase tracking-widest leading-none">
              🚨 O FÍGADO QUE SE FODA! 🚨 MODO DESTRUIÇÃO ATIVADO 🚨 MANDA VIR CRL! 🚨
            </div>
          </div>
        )}

        {/* INÍCIO */}
        {abaAtiva === 'inicio' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 ${cardClasses}`}>
                <span className="text-xl">📅</span>
                <div className="text-left">
                  <p className="text-[9px] uppercase font-bold text-slate-400 leading-none">Tempo de jogo</p>
                  <p className="text-sm font-black text-amber-500 mt-0.5">Dia {diaDoProjeto}</p>
                </div>
              </div>
              <div className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 ${cardClasses}`}>
                <span className="text-xl">🔥</span>
                <div className="text-left">
                  <p className="text-[9px] uppercase font-bold text-slate-400 leading-none">Streak Grupo</p>
                  <p className="text-sm font-black text-orange-500 mt-0.5">{streakGrupo} {streakGrupo === 1 ? 'Dia' : 'Dias'}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className={`p-3 rounded-2xl shadow text-center flex flex-col justify-center border transition-colors ${cardClasses}`}>
                <p className={`text-[9px] uppercase font-extrabold tracking-wider ${isModoFesta ? 'text-white/60' : 'text-slate-400'}`}>Total Finos</p>
                <p className={`text-xl font-black leading-tight mt-1 ${isModoFesta ? 'text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]' : 'text-amber-500'}`}>{formatarFinos(totalFinosGeralEq)}</p>
              </div>
              <div className={`p-3 rounded-2xl shadow text-center flex flex-col justify-center border transition-colors ${cardClasses}`}>
                <p className={`text-[9px] uppercase font-extrabold tracking-wider ${isModoFesta ? 'text-white/60' : 'text-slate-400'}`}>Litros Grupo 🩸</p>
                <p className={`text-xl font-black leading-tight mt-1 ${isModoFesta ? 'text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]' : 'text-red-400'}`}>{totalLitrosGrupo}L</p>
              </div>
              <div className={`p-3 rounded-2xl shadow text-center flex flex-col justify-center border transition-colors ${cardClasses}`}>
                <p className={`text-[9px] uppercase font-extrabold tracking-wider ${isModoFesta ? 'text-white/60' : 'text-slate-400'}`}>Líder 🍾</p>
                <p className="text-sm font-black truncate mt-1 text-inherit">{reiDoFinoAbsoluto && reiDoFinoAbsoluto.countGeral > 0 ? reiDoFinoAbsoluto.nome : '-'}</p>
              </div>
            </div>

            <div className={`p-1.5 rounded-2xl border flex gap-1 ${cardClasses}`}>
              <button onClick={() => setModoRegisto('individual')} className={`flex-1 py-2.5 rounded-xl font-black text-xs transition ${modoRegisto === 'individual' ? (isModoFesta ? 'bg-white text-black' : 'bg-amber-500 text-slate-950') : 'text-slate-400 hover:text-slate-200'}`}>🥂 Registo Individual</button>
              <button onClick={() => setModoRegisto('rodada')} className={`flex-1 py-2.5 rounded-xl font-black text-xs transition ${modoRegisto === 'rodada' ? (isModoFesta ? 'bg-white text-black' : 'bg-amber-500 text-slate-950') : 'text-slate-400 hover:text-slate-200'}`}>💳 Pagar Rodada</button>
            </div>

            <div className={`p-4 rounded-2xl shadow border transition-colors ${cardClasses}`}>
              <label className={`block font-bold mb-2 text-sm ${isModoFesta ? 'text-white' : darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{modoRegisto === 'rodada' ? 'Quem vai PAGAR a rodada? 💳' : 'Quem és tu?'}</label>
              <select className={`w-full p-2.5 border rounded-xl font-bold mb-3 outline-none text-sm ${isModoFesta ? 'bg-black/50 border-white/20 text-white' : darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`} value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                <option value="">-- Seleciona o teu nome --</option>
                {perfis.map((p) => (<option key={p.id} value={p.id}>{p.nome}</option>))}
              </select>

              {modoRegisto === 'rodada' && (
                <div className="mt-3 pt-3 border-t border-slate-800/50">
                  <label className="block font-extrabold text-xs uppercase tracking-wider mb-2 text-amber-500">Quem BEBEU na rodada? ({bebedoresRodada.length})</label>
                  <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {perfis.map(p => {
                      const isSelected = bebedoresRodada.includes(p.id);
                      return (
                        <button key={p.id} type="button" onClick={() => toggleBebedorRodada(p.id)} className={`p-2 rounded-lg border font-bold text-[11px] text-left transition flex justify-between items-center ${isSelected ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-black/20 border-slate-800 text-slate-500'}`}>
                          <span className="truncate">{p.nome}</span><span>{isSelected ? '✅' : '⚪'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-3">
                <input type="text" placeholder="Novo amigo..." className={`flex-1 p-2 border rounded-xl text-sm outline-none font-bold ${isModoFesta ? 'bg-black/50 border-white/20 text-white placeholder-white/40' : darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'}`} value={novoNome} onChange={(e) => setNovoNome(e.target.value)} />
                <button onClick={criarPerfil} className={`${isModoFesta ? 'bg-white text-black hover:bg-slate-200' : 'bg-amber-600 hover:bg-amber-500'} px-4 py-2 rounded-xl text-sm font-black transition`}>+ Criar</button>
              </div>
            </div>

            <div>
              <label className={`block font-extrabold text-xs uppercase tracking-wider mb-2 ${isModoFesta ? 'text-white/70' : darkMode ? 'text-slate-400' : 'text-slate-600'}`}>O que estão a beber?</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(TIPOS_BEBIDA) as TipoBebidaKey[]).map((key) => {
                  const item = TIPOS_BEBIDA[key];
                  const isSelected = tipoBebidaSelecionado === key;
                  return (
                    <button key={key} onClick={() => setTipoBebidaSelecionado(key)} className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${isSelected ? (isModoFesta ? 'bg-white text-black border-transparent font-black shadow-[0_0_15px_rgba(255,255,255,0.8)] scale-105' : 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-lg scale-105') : (isModoFesta ? 'bg-black/40 border-white/10 text-white/70' : darkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600')}`}>
                      <span className="text-xl">{item.emoji}</span><span className="text-[10px] uppercase font-bold leading-tight">{item.label.split(' ')[1]}</span><span className="text-[9px] opacity-80">({item.equivalencia}x finos)</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="text-center relative">
              <label className={`inline-block w-full py-6 rounded-2xl font-black text-2xl shadow-xl cursor-pointer transition transform active:scale-95 ${selectedUser ? (isModoFesta ? 'brutal-shake bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 text-white border-4 border-yellow-400 shadow-[0_0_40px_rgba(255,0,0,0.8)]' : 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/20 text-slate-950') : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}>
                {loading ? 'A guardar... 🍻' : modoRegisto === 'rodada' ? '💳 CONFIRMAR RODADA PAGA!' : isModoFesta ? 'MANDA VIR CRL! 🚀' : `${TIPOS_BEBIDA[tipoBebidaSelecionado].emoji} +1 ${tipoBebidaSelecionado.toUpperCase()}`}
                <input type="file" accept="image/*" capture="environment" className="hidden" disabled={!selectedUser || loading} onChange={registarFino} />
              </label>
            </div>

            <div className="text-center mt-6">
              <button onClick={abrirModalGregorio} disabled={!selectedUser || loading} className={`px-4 py-2.5 rounded-xl text-xs font-black transition ${selectedUser ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 active:scale-95' : (isModoFesta ? 'bg-black/50 border border-red-900/50 text-red-900/50' : darkMode ? 'bg-slate-900 border border-slate-800 text-slate-700' : 'bg-slate-100 border border-slate-200 text-slate-400')}`}>🤮 Fiz mau</button>
            </div>
          </div>
        )}

        {/* RANKING */}
        {abaAtiva === 'ranking' && (
          <div className="space-y-6">
            <div className={`p-4 rounded-2xl shadow border transition-colors ${cardClasses}`}>
              <div className="flex justify-between items-center mb-3 border-b pb-2 border-slate-800/50">
                <h2 className="font-bold text-lg flex items-center gap-2">📊 Tabela Geral</h2>
                <div className={`flex p-1 rounded-xl text-xs font-bold ${isModoFesta ? 'bg-black/50' : darkMode ? 'bg-slate-950' : 'bg-slate-100'}`}>
                  <button onClick={() => setAbaRanking('semanal')} className={`px-2.5 py-1 rounded-lg transition ${abaRanking === 'semanal' ? (isModoFesta ? 'bg-white text-black' : 'bg-amber-500 text-slate-950') : 'text-slate-400'}`}>Semanal</button>
                  <button onClick={() => setAbaRanking('geral')} className={`px-2.5 py-1 rounded-lg transition ${abaRanking === 'geral' ? (isModoFesta ? 'bg-white text-black' : 'bg-amber-500 text-slate-950') : 'text-slate-400'}`}>Geral</button>
                </div>
              </div>
              
              <div className="space-y-2">
                {contagemPorPessoa.map((p, idx) => {
                  const statusBadge = TITULOS_RANKING[idx] || TITULOS_RANKING[TITULOS_RANKING.length - 1];
                  const estaExpandido = !!usersExpandidos[p.id];

                  return (
                    <div key={p.id} onClick={() => toggleUserExpandido(p.id)} className={`p-3 rounded-xl border cursor-pointer transition ${isModoFesta ? 'bg-black/30 border-white/10 hover:bg-white/10' : darkMode ? 'bg-slate-950/50 border-slate-800 hover:bg-slate-800' : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100'}`}>
                      <div className="flex justify-between items-center text-sm">
                        <div className="truncate pr-2">
                          <span className="font-bold">{idx + 1}. {p.nome}</span>
                          <span className="text-[10px] text-amber-500 font-semibold block mt-0.5">{statusBadge}</span>
                        </div>
                        <div className="text-right flex items-center gap-2 shrink-0">
                          <span className={`font-black px-3 py-1 rounded-full text-xs border ${isModoFesta ? 'bg-white/20 text-white border-white/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>{formatarFinos(p.count)} finos</span>
                          <span className="text-xs opacity-60">{estaExpandido ? '▲' : '▼'}</span>
                        </div>
                      </div>

                      {(p.conquistas.length > 0 || p.gregorios > 0 || p.periodoForte) && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {p.gregorios > 0 && <span className="bg-red-500/10 text-red-400 border border-red-500/30 text-[10px] px-1.5 py-0.5 rounded-md font-bold">🤮 {p.gregorios}x Vómitos</span>}
                          {p.periodoForte && <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold border ${isModoFesta ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30'}`}>🕒 Forte: {p.periodoForte.split(' ')[0]}</span>}
                          {p.conquistas.map((badgeText: string, i: number) => (
                            <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold border ${badgeText.includes('🌵') ? 'bg-yellow-900/30 text-yellow-500 border-yellow-700/50' : badgeText.includes('💸') ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-black' : badgeText.includes('👑') || badgeText.includes('🏆') ? 'bg-amber-500 text-black border-amber-300 font-black shadow-sm' : isModoFesta ? 'bg-white/10 text-white border-white/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>{badgeText}</span>
                          ))}
                        </div>
                      )}

                      {estaExpandido && (
                        <div className="mt-3 pt-3 border-t border-slate-800/50 space-y-3 cursor-default" onClick={(e) => e.stopPropagation()}>
                          <div className="text-xs">
                            <p className={`font-bold mb-2 ${isModoFesta ? 'text-fuchsia-300' : 'text-amber-500'}`}>📸 Galeria Pessoal de {p.nome}</p>
                            {(() => {
                              const fotosUser = finosValidos.filter(f => f.perfil_id === p.id && f.foto_url);
                              if (fotosUser.length === 0) return <p className="text-[11px] text-slate-500 py-1">Sem fotos registadas.</p>;
                              return (
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                  {fotosUser.map(f => (
                                    <div key={f.id} className="relative group cursor-pointer" onClick={() => setFotoExpandida(f.foto_url)}>
                                      <img src={f.foto_url} loading="lazy" className="w-full h-28 object-cover rounded-lg shadow-sm hover:opacity-90 transition" alt="Fino"/>
                                      <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[8px] px-1.5 py-0.5 rounded font-bold backdrop-blur-sm tracking-wide">{new Date(f.data_hora).toLocaleDateString('pt-PT', {day:'2-digit', month:'2-digit', year:'2-digit'})} {new Date(f.data_hora).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</div>
                                      {f.pagador_id && <div className="absolute top-1 left-1 bg-emerald-600/90 text-white text-[7px] px-1 py-0.5 rounded font-black backdrop-blur-sm">💳 Rodada Paga</div>}
                                    </div>
                                  ))}
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={`p-4 rounded-2xl shadow border transition-colors ${cardClasses}`}>
              <h2 className="font-bold text-lg mb-3 border-b pb-2 border-slate-800/50 flex items-center gap-2">⚔️ Frente-a-Frente</h2>
              <div className="flex gap-2 items-center mb-4">
                <select className={`flex-1 p-2 border rounded-xl text-xs font-bold outline-none ${isModoFesta ? 'bg-black/50 border-white/20 text-white' : darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'}`} value={fighter1} onChange={(e) => setFighter1(e.target.value)}><option value="">Desafiante 1</option>{perfis.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}</select>
                <span className="font-black text-slate-500 text-sm">VS</span>
                <select className={`flex-1 p-2 border rounded-xl text-xs font-bold outline-none ${isModoFesta ? 'bg-black/50 border-white/20 text-white' : darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'}`} value={fighter2} onChange={(e) => setFighter2(e.target.value)}><option value="">Desafiante 2</option>{perfis.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}</select>
              </div>
              {fighter1 && fighter2 && fighter1 !== fighter2 && f1Stats && f2Stats && (
                <div className={`border rounded-xl p-3 space-y-3 ${isModoFesta ? 'bg-black/40 border-white/10' : darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex justify-between items-center border-b border-slate-800/50 pb-2">
                    <span className={`w-1/3 text-left font-black text-lg ${f1Stats.count > f2Stats.count ? (isModoFesta ? 'text-white' : 'text-amber-500') : 'text-slate-500'}`}>{formatarFinos(f1Stats.count)}</span>
                    <span className="w-1/3 text-center text-[9px] uppercase font-bold text-slate-500">Total</span>
                    <span className={`w-1/3 text-right font-black text-lg ${f2Stats.count > f1Stats.count ? (isModoFesta ? 'text-white' : 'text-amber-500') : 'text-slate-500'}`}>{formatarFinos(f2Stats.count)}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className={`p-4 rounded-2xl shadow border transition-colors ${cardClasses}`}>
              <h2 className="font-bold text-lg mb-4 border-b pb-2 border-slate-800/50">📈 Curiosidades</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${isModoFesta ? 'text-white/60' : 'text-slate-500'}`}>Dias mais fortes</h3>
                  <div className="space-y-1.5">
                    {diasSemanaCount.map((count, i) => (
                      <div key={i} className="flex items-center text-[9px]">
                        <span className={`w-5 font-bold ${isModoFesta ? 'text-white/60' : 'text-slate-500'}`}>{nomesDias[i]}</span>
                        <div className={`flex-1 h-2.5 rounded-full ml-1 overflow-hidden ${isModoFesta ? 'bg-black' : darkMode ? 'bg-slate-950' : 'bg-slate-100'}`}>
                          <div className={`h-full rounded-full ${isModoFesta ? 'bg-fuchsia-500' : 'bg-amber-500'}`} style={{width: `${(count/maxDiaCount)*100}%`}}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${isModoFesta ? 'text-white/60' : 'text-slate-500'}`}>Horas de Ponta</h3>
                  <div className={`flex items-end h-28 gap-1.5 p-2 rounded-xl border ${isModoFesta ? 'bg-black/40 border-white/10' : darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    {Object.entries(horasCount).map(([label, count]) => {
                      const isZero = count === 0;
                      return (
                        <div key={label} className="flex-1 flex flex-col items-center justify-end h-full">
                          <span className={`text-[9px] font-bold mb-1 ${isZero ? '' : isModoFesta ? 'text-white' : 'text-amber-500'}`}>{isZero ? '' : formatarFinos(count)}</span>
                          <div className={`w-full rounded-t-sm transition-all ${isZero ? (isModoFesta ? 'bg-white/10' : 'bg-slate-800') : (isModoFesta ? 'bg-fuchsia-400' : 'bg-amber-400')}`} style={{height: isZero ? '2px' : `${(count/maxHoraCount)*100}%`, minHeight: '2px'}}></div>
                          <span className={`text-[8px] mt-1 truncate w-full text-center ${isModoFesta ? 'text-white/60' : 'text-slate-500'}`}>{label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🪪 FICHA MÉDICA */}
        {abaAtiva === 'perfil' && (
          <div className="space-y-6">
            <div className={`p-5 rounded-2xl shadow border transition-colors ${cardClasses}`}>
              <h2 className="font-black text-xl mb-4 flex items-center gap-2">🪪 Ficha Médica</h2>

              <div className="relative mb-6">
                <button 
                  onClick={() => setSeletorPerfilAberto(!seletorPerfilAberto)}
                  className={`w-full p-3 rounded-xl border font-black text-left flex justify-between items-center transition ${isModoFesta ? 'bg-black/50 border-white/20 text-white' : darkMode ? 'bg-slate-950 border-slate-700 text-white shadow-lg' : 'bg-white border-slate-300 text-slate-800 shadow-md'}`}
                >
                  <span className="truncate">{perfilAtualObj ? `${perfilAtualObj.nome} ${perfilAtualObj.nome_real ? `(${perfilAtualObj.nome_real})` : ''}` : '-- Escolhe o doente --'}</span>
                  <span className={`transform transition-transform ${seletorPerfilAberto ? 'rotate-180' : ''}`}>▼</span>
                </button>

                {seletorPerfilAberto && (
                  <div className={`absolute top-full left-0 right-0 mt-2 rounded-xl border shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto ${isModoFesta ? 'bg-black/90 border-white/20 backdrop-blur-md' : darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                    {perfis.map(p => (
                      <button
                        key={p.id}
                        onClick={() => { setPerfilSelecionadoId(p.id); setSeletorPerfilAberto(false); }}
                        className={`w-full p-3 text-left border-b font-bold text-sm transition hover:bg-amber-500/20 last:border-0 ${perfilSelecionadoId === p.id ? 'bg-amber-500/10 text-amber-500 border-slate-800/50' : isModoFesta ? 'text-white border-white/10' : darkMode ? 'text-slate-300 border-slate-800' : 'text-slate-700 border-slate-100'}`}
                      >
                        {p.nome} {p.nome_real && <span className="opacity-60 text-xs font-normal">({p.nome_real})</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {perfilAtualObj && (
                <div className="space-y-4 pt-2 border-t border-slate-800/50">
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className={`p-3 rounded-xl border ${isModoFesta ? 'bg-black/30 border-white/10' : darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                      <p className="text-[9px] font-bold uppercase text-slate-400">🤠 Nome de Código</p>
                      <p className="text-base font-black mt-0.5 text-amber-500 truncate">{perfilAtualObj.nome}</p>
                    </div>
                    <div className={`p-3 rounded-xl border ${isModoFesta ? 'bg-black/30 border-white/10' : darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                      <p className="text-[9px] font-bold uppercase text-slate-400">🎖️ Estatuto Oficial</p>
                      <p className="text-xs font-black mt-1 text-orange-400 truncate">{tituloOficialAtual}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className={`p-3 rounded-xl border ${isModoFesta ? 'bg-black/30 border-white/10' : darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                      <p className="text-[9px] font-bold uppercase text-slate-400">🍺 Medicação Ingerida</p>
                      <p className="text-lg font-black mt-0.5 text-amber-500">{formatarFinos(totalUserEqAtual)} <span className="text-xs font-semibold text-slate-400">finos</span></p>
                    </div>

                    <div className={`p-3 rounded-xl border ${isModoFesta ? 'bg-black/30 border-white/10' : darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                      <p className="text-[9px] font-bold uppercase text-slate-400">🩸 Litros no Sangue</p>
                      <p className="text-lg font-black mt-0.5 text-red-400">{litrosNoSangueAtual} <span className="text-xs font-semibold text-slate-400">L</span></p>
                    </div>

                    <div className={`p-3 rounded-xl border ${isModoFesta ? 'bg-black/30 border-white/10' : darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                      <p className="text-[9px] font-bold uppercase text-slate-400">📊 Média Diária</p>
                      <p className="text-lg font-black mt-0.5 text-blue-400">{mediaFinosPorDia} <span className="text-xs font-semibold text-slate-400">p/ dia</span></p>
                    </div>

                    <div className={`p-3 rounded-xl border ${isModoFesta ? 'bg-black/30 border-white/10' : darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                      <p className="text-[9px] font-bold uppercase text-slate-400">📊 Carga no Grupo</p>
                      <p className="text-lg font-black mt-0.5 text-cyan-400">{percentualColoGrupo}% <span className="text-xs font-normal opacity-70">do total</span></p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className={`p-3 rounded-xl border ${isModoFesta ? 'bg-black/30 border-white/10' : darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                      <p className="text-[9px] font-bold uppercase text-slate-400">🔥 Streak Atual</p>
                      <p className="text-lg font-black mt-0.5 text-orange-500">{streakVivoAtual} <span className="text-xs font-semibold text-slate-400">dias</span></p>
                    </div>

                    <div className={`p-3 rounded-xl border ${isModoFesta ? 'bg-black/30 border-white/10' : darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                      <p className="text-[9px] font-bold uppercase text-slate-400">🧨 Melhor Streak</p>
                      <p className="text-lg font-black mt-0.5 text-orange-600">{melhorStreakAtual} <span className="text-xs font-semibold text-slate-400">dias</span></p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className={`p-3 rounded-xl border flex flex-col justify-center items-center text-center ${isModoFesta ? 'bg-black/30 border-white/10' : darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                      <p className="text-[9px] font-bold uppercase text-slate-400 w-full">📈 Pace Cardíaco</p>
                      <p className="text-sm font-black mt-1 text-fuchsia-400">{paceCardiacoUser > 0 ? `1 copo a cada ${paceCardiacoUser} min` : 'Sem dados suficientes'}</p>
                    </div>

                    <div className={`p-3 rounded-xl border flex flex-col justify-center items-center text-center ${isModoFesta ? 'bg-black/30 border-white/10' : darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                      <p className="text-[9px] font-bold uppercase text-slate-400 w-full">⏰ Horário Crítico</p>
                      <p className="text-sm font-black mt-1 text-yellow-400">{horarioCriticoUser}</p>
                    </div>

                    <div className={`p-3 rounded-xl border flex flex-col justify-center items-center text-center ${totalVomitosUser > 0 ? 'bg-red-500/10 border-red-500/30' : isModoFesta ? 'bg-black/30 border-white/10' : darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                      <p className="text-[9px] font-bold uppercase text-slate-400 w-full">🤢 Nível de Risco</p>
                      <p className={`text-sm font-black mt-1 ${totalVomitosUser > 0 ? 'text-red-500' : 'text-emerald-500'}`}>{totalVomitosUser === 0 ? 'Fígado de Ferro 🛡️' : `Risco Elevado ☣️ (${totalVomitosUser}x)`}</p>
                    </div>
                  </div>

                  <div className="pt-3">
                    <p className="text-xs font-black uppercase text-amber-500 mb-2 tracking-wider flex items-center gap-1.5"><span>🏆 Cabine de Troféus</span><span className="text-[10px] text-slate-500 font-semibold">({conquistasAtual.length})</span></p>
                    {conquistasAtual.length === 0 ? (
                      <p className="text-xs text-slate-500 py-2 italic text-center">Ainda sem troféus desbloqueados. É preciso dar mais uso ao copo!</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {conquistasAtual.map((badge, idx) => (
                          <div key={idx} className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black border shadow-sm flex items-center gap-1 ${badge.includes('👑') || badge.includes('🏆') ? 'bg-amber-500 text-slate-950 border-amber-300' : badge.includes('💸') ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                            <span>{badge}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          </div>
        )}

        {/* 🎲 ABA RODADA & MINI-JOGOS MULTIPLAYER */}
        {abaAtiva === 'rodada' && (
          <div className="space-y-6">
            <div className={`p-5 rounded-2xl shadow border transition-colors ${cardClasses}`}>
              
              {/* SELETOR DE IDENTIDADE CUSTOMIZADO (GLASSMORPHISM) */}
              {modoDecisaoRodada !== 'roleta' && (
                <div className="relative mb-4">
                  <label className="block text-[10px] font-black uppercase text-amber-500 mb-1 flex items-center gap-1">
                    📱 Quem está a segurar ESTE telemóvel?
                  </label>
                  <button
                    onClick={() => setSeletorTelemovelAberto(!seletorTelemovelAberto)}
                    className="w-full p-3 rounded-2xl border border-amber-500/30 bg-slate-900/90 text-white font-black text-xs flex justify-between items-center shadow-lg hover:border-amber-400 transition"
                  >
                    <span>{selectedUser ? perfis.find(p => p.id === selectedUser)?.nome : '-- Escolhe o teu nome --'}</span>
                    <span className="text-amber-500 text-xs">▼</span>
                  </button>

                  {seletorTelemovelAberto && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 border border-amber-500/40 rounded-2xl shadow-2xl z-50 max-h-52 overflow-y-auto backdrop-blur-xl p-1 space-y-1">
                      {perfis.map(p => (
                        <button
                          key={p.id}
                          onClick={() => { setSelectedUser(p.id); setSeletorTelemovelAberto(false); }}
                          className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition flex justify-between items-center ${selectedUser === p.id ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-200 hover:bg-slate-800'}`}
                        >
                          <span>{p.nome}</span>
                          {selectedUser === p.id && <span>✅</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SUB-NAVEGAÇÃO DE MODO DE DECISÃO */}
              <div className={`p-1 rounded-xl border flex gap-1 mb-4 overflow-x-auto ${isModoFesta ? 'bg-black/50 border-white/10' : darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                <button onClick={() => setModoDecisaoRodada('roleta')} className={`flex-1 py-2 px-1 rounded-lg font-black text-[9px] uppercase transition truncate ${modoDecisaoRodada === 'roleta' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}>🎰 Roleta</button>
                <button onClick={() => setModoDecisaoRodada('cronometro')} className={`flex-1 py-2 px-1 rounded-lg font-black text-[9px] uppercase transition truncate ${modoDecisaoRodada === 'cronometro' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}>⏱️ Cronómetro</button>
                <button onClick={() => setModoDecisaoRodada('copo')} className={`flex-1 py-2 px-1 rounded-lg font-black text-[9px] uppercase transition truncate ${modoDecisaoRodada === 'copo' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}>💣 Copo Morte</button>
                <button onClick={() => setModoDecisaoRodada('reacao')} className={`flex-1 py-2 px-1 rounded-lg font-black text-[9px] uppercase transition truncate ${modoDecisaoRodada === 'reacao' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}>⚡ Reação</button>
              </div>

              {/* SELEÇÃO DA MESA (COMUM A TODOS OS JOGOS) */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                    Quem está na mesa? ({presentesMesa.length})
                  </span>
                  <div className="flex gap-2 text-[10px] font-bold">
                    <button onClick={selecionarTodosMesa} className="text-amber-500 hover:underline">Todos</button>
                    <span className="text-slate-600">|</span>
                    <button onClick={limparMesa} className="text-slate-400 hover:underline">Limpar</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {perfis.map(p => {
                    const isPresente = presentesMesa.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() => toggleMesa(p.id)}
                        className={`p-2.5 rounded-xl border font-bold text-xs transition flex items-center justify-between ${
                          isPresente
                            ? (isModoFesta ? 'bg-white/20 border-white/40 text-white' : 'bg-amber-500/10 border-amber-500/40 text-amber-400')
                            : (isModoFesta ? 'bg-black/40 border-white/5 text-white/40' : darkMode ? 'bg-slate-950/40 border-slate-800 text-slate-600' : 'bg-slate-100 border-slate-200 text-slate-400')
                        }`}
                      >
                        <span className="truncate">{p.nome}</span>
                        <span>{isPresente ? '✅' : '⚪'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* OPÇÃO 1: ROLETA COM 3 ROLOS VERTICAIS 🎰 */}
              {modoDecisaoRodada === 'roleta' && (
                <div className="mt-4 pt-4 border-t border-slate-800/50 space-y-4">
                  <div className={`p-4 rounded-2xl border shadow-2xl ${darkMode ? 'bg-black/80 border-slate-800' : 'bg-amber-100/50 border-amber-200'}`}>
                    <p className="text-[10px] font-black uppercase text-amber-500 tracking-widest text-center mb-3">
                      🎰 ROLETA
                    </p>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="h-20 bg-slate-900 border-2 border-amber-500/50 rounded-xl flex items-center justify-center p-1 shadow-inner overflow-hidden relative">
                        <span className={`text-xs font-black text-amber-400 truncate w-full ${reel1Spinning ? 'animate-slot-vertical' : ''}`}>
                          {reel1}
                        </span>
                      </div>
                      <div className="h-20 bg-slate-900 border-2 border-amber-500/50 rounded-xl flex items-center justify-center p-1 shadow-inner overflow-hidden relative">
                        <span className={`text-xs font-black text-amber-400 truncate w-full ${reel2Spinning ? 'animate-slot-vertical' : ''}`}>
                          {reel2}
                        </span>
                      </div>
                      <div className="h-20 bg-slate-900 border-2 border-amber-500/50 rounded-xl flex items-center justify-center p-1 shadow-inner overflow-hidden relative">
                        <span className={`text-xs font-black text-amber-400 truncate w-full ${reel3Spinning ? 'animate-slot-vertical' : ''}`}>
                          {reel3}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={girarSlotMachine}
                    disabled={slotSpinning || presentesMesa.length < 2}
                    className={`w-full py-4 rounded-2xl font-black text-lg shadow-xl transition transform active:scale-95 ${
                      slotSpinning 
                        ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                        : presentesMesa.length >= 2
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                          : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    {slotSpinning ? 'A girar a roleta... 🎰' : '🎰 RODAR'}
                  </button>

                  {vitimaRodada && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[80] animate-fadeIn">
                      <div className={`w-full max-w-xs rounded-3xl p-6 text-center border-2 shadow-2xl transform transition-all scale-105 ${
                        vitimaRodada.id === 'ninguem' 
                          ? 'bg-slate-950 border-emerald-500 text-white shadow-emerald-500/20' 
                          : 'bg-slate-950 border-amber-500 text-white shadow-amber-500/30'
                      }`}>
                        <div className="text-5xl mb-3 animate-bounce">
                          {vitimaRodada.id === 'ninguem' ? '🍀' : '💳'}
                        </div>
                        
                        {vitimaRodada.id === 'ninguem' ? (
                          <>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                              SAFARAM-SE TODOS!
                            </p>
                            <h3 className="text-2xl font-black mt-2 text-white">
                              NINGUÉM PAGA!
                            </h3>
                          </>
                        ) : (
                          <h3 className="text-3xl font-black mt-2 text-white">
                            {vitimaRodada.nome}
                          </h3>
                        )}

                        <button 
                          onClick={() => setVitimaRodada(null)} 
                          className="mt-6 w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-lg transition active:scale-95"
                        >
                          {vitimaRodada.id === 'ninguem' ? 'Tenta outra vez' : 'Ai que sede!'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* OPÇÃO 2: CRONÓMETRO CEGO MULTIPLAYER */}
              {modoDecisaoRodada === 'cronometro' && (
                <div className="mt-4 pt-4 border-t border-slate-800/50 text-center space-y-4">
                  <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <p className="text-[10px] font-black uppercase text-amber-500 tracking-wider">🎯 Tempo Alvo Sincronizado</p>
                    <p className="text-3xl font-black mt-1 text-white">{cronoAlvo.toFixed(2)}s</p>
                    <p className="text-[10px] text-amber-400/90 font-bold mt-1">Ai que sede!!</p>
                  </div>

                  {presentesMesa.length >= 2 ? (
                    <>
                      <button
                        onClick={iniciarJogoCronometroMultiplayer}
                        className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg transition active:scale-95"
                      >
                        🚀 Iniciar Novo Jogo para Todos os Telemóveis
                      </button>

                      {!cronoPerdedor && (
                        <div className="space-y-3 pt-2">
                          <div className="h-20 flex items-center justify-center bg-black/40 rounded-2xl border border-slate-800">
                            <span className="text-4xl font-black tracking-widest text-amber-500">
                              {cronoEscondido ? '??:??' : `${cronoDisplay}s`}
                            </span>
                          </div>

                          {!meuResultadoCrono ? (
                            <button
                              onClick={handleBotaoCronometroMultiplayer}
                              disabled={!selectedUser}
                              className={`w-full py-4 rounded-xl font-black text-xl shadow-xl transition transform active:scale-95 ${
                                !selectedUser 
                                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                  : cronoEmCurso 
                                    ? 'bg-red-600 hover:bg-red-500 text-white' 
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                              }`}
                            >
                              {!selectedUser 
                                ? '⚠️ Seleciona o teu nome acima' 
                                : cronoEmCurso 
                                  ? '🛑 PARAR!' 
                                  : '▶️ O MEU CRONÓMETRO'}
                            </button>
                          ) : (
                            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs">
                              ✅ Paraste aos {meuResultadoCrono.tempo.toFixed(2)}s (Erro: {meuResultadoCrono.erro.toFixed(2)}s).<br/>
                              <span className="text-[10px] opacity-80 text-white">A aguardar pelos restantes jogadores...</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="space-y-1.5 text-left pt-2">
                        <p className="text-[10px] font-bold uppercase text-slate-400">Estado da Mesa ({cronoResultados.length}/{presentesMesa.length}):</p>
                        {presentesMesa.map(pId => {
                          const pNome = perfis.find(p => p.id === pId)?.nome || 'Jogador';
                          const res = cronoResultados.find(r => r.id === pId);
                          return (
                            <div key={pId} className="flex justify-between items-center text-xs p-2 rounded-lg bg-black/30 border border-slate-800">
                              <span className="font-bold">{pNome}</span>
                              {res ? (
                                <span className="text-emerald-400 font-bold">✅ Concluído ({res.tempo.toFixed(2)}s)</span>
                              ) : (
                                <span className="text-amber-500/70 font-semibold italic animate-pulse">⏳ A jogar...</span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {cronoPerdedor && (
                        <div className="mt-4 p-5 rounded-2xl border text-center shadow-2xl bg-red-600 border-yellow-400 text-white animate-bounce">
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-80">💸 Perdeu o Jogo!</p>
                          <h3 className="text-2xl font-black mt-1">🍺 {cronoPerdedor.nome} PAGA A RODADA!</h3>
                          <p className="text-xs font-bold mt-1 opacity-90">Errou por {cronoPerdedor.erro.toFixed(2)} segundos!</p>
                          <button onClick={iniciarJogoCronometroMultiplayer} className="mt-3 px-4 py-2 rounded-xl bg-black/30 hover:bg-black/50 font-black text-xs transition">🔄 Jogar Outra Vez</button>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-slate-500 py-2">Seleciona pelo menos 2 pessoas na mesa para jogar!</p>
                  )}
                </div>
              )}

              {/* OPÇÃO 3: COPO DA MORTE MULTIPLAYER */}
              {modoDecisaoRodada === 'copo' && (
                <div className="mt-4 pt-4 border-t border-slate-800/50 text-center space-y-4">
                  {presentesMesa.length >= 2 ? (
                    <>
                      <button
                        onClick={iniciarJogoCopoMultiplayer}
                        className="w-full py-4 rounded-xl font-black text-lg shadow-xl transition transform active:scale-95 bg-amber-500 text-slate-950 hover:bg-amber-400"
                      >
                        💣 PREPARAR E SINCRONIZAR COPOS
                      </button>

                      {coposJogo.length > 0 && (
                        <>
                          {!copoPerdedor && (
                            <p className="text-xs font-bold text-amber-400">
                              Vez de escolher: <span className="text-white text-sm font-black">{perfis.find(p => p.id === presentesMesa[copoJogadorAtualIdx])?.nome}</span>
                            </p>
                          )}

                          <div className="grid grid-cols-3 gap-3 my-4">
                            {coposJogo.map(c => {
                              const eMinhaVez = selectedUser === presentesMesa[copoJogadorAtualIdx];
                              return (
                                <button
                                  key={c.id}
                                  onClick={() => virarCopoMultiplayer(c.id)}
                                  disabled={c.revelado || !!copoPerdedor || !eMinhaVez}
                                  className={`h-24 rounded-2xl border-2 font-black text-3xl transition flex flex-col items-center justify-center gap-1 shadow-md ${
                                    c.revelado
                                      ? c.eBomba
                                        ? 'bg-red-600 border-yellow-400 text-white animate-ping'
                                        : 'bg-emerald-950/40 border-emerald-600 text-emerald-400 opacity-60'
                                      : eMinhaVez 
                                        ? 'bg-slate-900 border-amber-500 hover:scale-105 active:scale-95' 
                                        : 'bg-slate-950 border-slate-800 opacity-50 cursor-not-allowed'
                                  }`}
                                >
                                  <span>{c.revelado ? (c.eBomba ? '💣' : '🍺') : '🥃'}</span>
                                  {c.dono && <span className="text-[8px] truncate max-w-[60px] font-bold text-slate-300">{c.dono}</span>}
                                </button>
                              );
                            })}
                          </div>

                          {copoPerdedor && (
                            <div className="mt-4 p-5 rounded-2xl border text-center shadow-2xl bg-red-600 border-yellow-400 text-white animate-bounce">
                              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">💣 BOOM! Encontrou o Copo com Bomba!</p>
                              <h3 className="text-2xl font-black mt-1">🍻 {copoPerdedor.nome} PAGA A RODADA!</h3>
                              <button onClick={iniciarJogoCopoMultiplayer} className="mt-3 px-4 py-2 rounded-xl bg-black/30 hover:bg-black/50 font-black text-xs transition">🔄 Jogar Outra Vez</button>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-slate-500 py-2">Seleciona pelo menos 2 pessoas na mesa para jogar!</p>
                  )}
                </div>
              )}

              {/* OPÇÃO 4: TESTE DE REAÇÃO MULTIPLAYER ⚡ */}
              {modoDecisaoRodada === 'reacao' && (
                <div className="mt-4 pt-4 border-t border-slate-800/50 text-center space-y-4">
                  {presentesMesa.length >= 2 ? (
                    <>
                      <button
                        onClick={iniciarJogoReacaoMultiplayer}
                        className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg transition active:scale-95"
                      >
                        ⚡ Iniciar Teste de Reação para Todos
                      </button>

                      {!reacaoPerdedor && (
                        <div className="space-y-3 pt-2">
                          {reacaoEstado === 'espera' && (
                            <p className="text-xs text-slate-400 py-2">Clica em iniciar acima quando todos estiverem com o telemóvel na mão!</p>
                          )}

                          {(reacaoEstado === 'preparar' || reacaoEstado === 'verde') && (
                            <button
                              onClick={handleToqueReacao}
                              className={`w-full h-44 rounded-3xl font-black text-2xl shadow-2xl transition-colors duration-100 transform active:scale-95 flex flex-col items-center justify-center p-4 ${
                                reacaoEstado === 'preparar'
                                  ? 'bg-red-600 text-white border-4 border-red-400 animate-pulse'
                                  : 'bg-emerald-500 text-slate-950 border-4 border-emerald-300 shadow-[0_0_40px_rgba(16,185,129,0.8)]'
                              }`}
                            >
                              <span>{reacaoEstado === 'preparar' ? '🛑 PREPARAR...' : '⚡ TOCA AGORA!!!'}</span>
                              <span className="text-xs font-semibold mt-2 opacity-80">
                                {reacaoEstado === 'preparar' ? 'NÃO TOCAR AINDA!' : 'Manda o dedo!'}
                              </span>
                            </button>
                          )}

                          {meuResultadoReacao && (
                            <div className={`p-3 rounded-xl border text-xs font-bold ${
                              meuResultadoReacao.falsaPartida 
                                ? 'bg-red-500/20 border-red-500/40 text-red-400' 
                                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            }`}>
                              {meuResultadoReacao.falsaPartida ? (
                                <span>❌ Falsa partida! Tocaste antes de ficar verde!</span>
                              ) : (
                                <span>⚡ Reagiste em {meuResultadoReacao.tempoMs} ms!</span>
                              )}
                              <br/>
                              <span className="text-[10px] opacity-80 text-white">A aguardar pelos restantes...</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="space-y-1.5 text-left pt-2">
                        <p className="text-[10px] font-bold uppercase text-slate-400">Estado da Mesa ({reacaoResultados.length}/{presentesMesa.length}):</p>
                        {presentesMesa.map(pId => {
                          const pNome = perfis.find(p => p.id === pId)?.nome || 'Jogador';
                          const res = reacaoResultados.find(r => r.id === pId);
                          return (
                            <div key={pId} className="flex justify-between items-center text-xs p-2 rounded-lg bg-black/30 border border-slate-800">
                              <span className="font-bold">{pNome}</span>
                              {res ? (
                                res.falsaPartida ? (
                                  <span className="text-red-400 font-bold">❌ Falsa Partida</span>
                                ) : (
                                  <span className="text-emerald-400 font-bold">✅ {res.tempoMs} ms</span>
                                )
                              ) : (
                                <span className="text-amber-500/70 font-semibold italic animate-pulse">⏳ A reagir...</span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {reacaoPerdedor && (
                        <div className="mt-4 p-5 rounded-2xl border text-center shadow-2xl bg-red-600 border-yellow-400 text-white animate-bounce">
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-80">
                            {reacaoPerdedor.falsaPartida ? '❌ FALSA PARTIDA!' : '🐢 REFLEXOS DE TARTARUGA!'}
                          </p>
                          <h3 className="text-2xl font-black mt-1">🍺 {reacaoPerdedor.nome} PAGA A RODADA!</h3>
                          <p className="text-xs font-bold mt-1 opacity-90">
                            {reacaoPerdedor.falsaPartida 
                              ? 'Tocou antes do ecrã ficar verde!' 
                              : `Foi o mais lento com ${reacaoPerdedor.tempoMs} ms!`}
                          </p>
                          <button onClick={iniciarJogoReacaoMultiplayer} className="mt-3 px-4 py-2 rounded-xl bg-black/30 hover:bg-black/50 font-black text-xs transition">🔄 Jogar Outra Vez</button>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-slate-500 py-2">Seleciona pelo menos 2 pessoas na mesa para jogar!</p>
                  )}
                </div>
              )}

            </div>
          </div>
        )}

        {/* MAPA MUNDIAL DE CLUSTERS */}
       {/* MAPA MUNDIAL DE CLUSTERS & LISTA DE CONCELHOS */}
       {abaAtiva === 'mapa' && (
          <div className="space-y-6">
            <div className={`p-4 rounded-2xl shadow border transition-colors ${cardClasses}`}>
              <h2 className="font-bold text-lg mb-1 flex items-center gap-2">🗺️ Onde Bebe O Grupo?</h2>
              <p className="text-xs text-slate-400 mb-4">Mapeamento em tempo real com GPS. Foca o mapa para veres em que tascos as bebidas se dividem!</p>
              
              <div className="w-full h-80 rounded-2xl overflow-hidden border border-slate-700/50 shadow-inner relative z-10 mb-6">
                <div id="mapa-calor-container" className="w-full h-full bg-slate-900"></div>
              </div>

              {/* 🏙️ LISTA DE CONCELHOS REGISTADOS */}
              <div className="pt-2 border-t border-slate-800/50">
                <h3 className="font-black text-sm text-amber-500 uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>📍 Concelhos Conquistados</span>
                  <span className="text-xs text-slate-400 font-semibold">{cidadesStats.length} locais</span>
                </h3>

                {cidadesStats.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center py-2">Nenhum fino registado com GPS ainda.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {cidadesStats.map((item, idx) => (
                      <div key={idx} className={`p-3 rounded-xl border flex justify-between items-center text-xs ${darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                        <div>
                          <p className="font-extrabold text-white text-sm">📍 {item.cidade}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[180px]">
                            Bebedores: {item.pessoas.join(', ')}
                          </p>
                        </div>
                        <span className="font-black px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs shrink-0">
                          {formatarFinos(item.total)} finos
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* GRANDES FEITOS */}
        {abaAtiva === 'feitos' && (
          <div className="space-y-6">
            <div className={`p-4 rounded-2xl shadow border transition-colors ${cardClasses}`}>
              <h2 className="font-bold text-lg mb-3 border-b pb-2 border-slate-800/50 flex items-center gap-2">🎯 Grandes Feitos</h2>
              {proximoMarco && (
                <div className="mb-4">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1 text-slate-500">
                    <span>Progresso (Próximo: {proximoMarco.meta})</span>
                    <span>{formatarFinos(totalFinosGeralEq)} / {proximoMarco.meta}</span>
                  </div>
                  <div className={`h-2.5 rounded-full overflow-hidden ${isModoFesta ? 'bg-black' : darkMode ? 'bg-slate-950' : 'bg-slate-100'}`}>
                    <div className={`h-full rounded-full transition-all duration-1000 ease-out ${isModoFesta ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(100, (totalFinosGeralEq / proximoMarco.meta) * 100)}%` }}></div>
                  </div>
                </div>
              )}
              <div className="space-y-3">
                {MARCOS_GRUPO.map((marco) => {
                  const alcancado = totalFinosGeralEq >= marco.meta;
                  if (alcancado) {
                    return (
                      <div key={marco.meta} className={`p-3 rounded-xl border ${isModoFesta ? 'bg-white/10 border-white/30 text-white' : darkMode ? 'bg-amber-500/10 border-amber-500/30 text-amber-50' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                        <div className={`font-black text-sm mb-1 ${isModoFesta ? 'text-red-400' : 'text-amber-500'}`}>🏆 Equivalente a {marco.meta} Finos</div>
                        <p className="text-xs font-medium leading-relaxed opacity-90">{marco.texto}</p>
                      </div>
                    );
                  }
                  const faltam = marco.meta - totalFinosGeralEq;
                  return (
                    <div key={marco.meta} className={`p-3 rounded-xl border relative overflow-hidden ${isModoFesta ? 'bg-black/50 border-white/10' : darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                      <div className={`font-black text-sm mb-1 ${isModoFesta ? 'text-white/40' : darkMode ? 'text-slate-600' : 'text-slate-400'}`}>🔒 {marco.meta} Finos</div>
                      <p className={`text-xs leading-relaxed blur-[5px] select-none ${isModoFesta ? 'text-white/20' : darkMode ? 'text-slate-600' : 'text-slate-300'}`}>{marco.texto}</p>
                      <div className="absolute inset-0 flex items-center justify-center z-10"><span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-md border ${isModoFesta ? 'bg-black text-white border-white/30' : darkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-white text-slate-500 border-slate-200'}`}>Faltam {formatarFinos(faltam)}</span></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* GALERIA */}
        {abaAtiva === 'historico' && (
          <div className="space-y-6">
            <div className={`p-4 rounded-2xl shadow border transition-colors ${cardClasses}`}>
              <h2 className="font-bold text-lg mb-3 border-b pb-2 border-slate-800/50">📅 Fotos e Histórico</h2>
              {Object.keys(finosPorDiaParaLista).length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">Ainda não há bebidas registadas.</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(finosPorDiaParaLista).map(([dia, listaFinos]) => {
                    const estaAberto = !!diasAbertos[dia];
                    const totalDiaEq = listaFinos.filter(f => f.tipo_bebida !== 'gregorio').reduce((acc, f) => acc + (f.quantidade_equivalente ?? 1), 0);
                    return (
                      <div key={dia} className={`border rounded-2xl overflow-hidden ${isModoFesta ? 'border-white/20 bg-black/40' : darkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'}`}>
                        <button onClick={() => toggleDia(dia)} className={`w-full p-3 flex justify-between items-center text-left transition ${isModoFesta ? 'bg-white/5 hover:bg-white/10' : darkMode ? 'bg-slate-900 hover:bg-slate-800' : 'bg-slate-100 hover:bg-slate-200'}`}>
                          <span className="font-bold text-xs capitalize">{dia}</span>
                          <span className={`text-xs border font-black px-2.5 py-0.5 rounded-full ${isModoFesta ? 'bg-white/20 text-white border-white/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>{formatarFinos(totalDiaEq)} eqv {estaAberto ? '▲' : '▼'}</span>
                        </button>
                        {estaAberto && (
                          <div className={`p-3 space-y-3 ${isModoFesta ? 'bg-black/20' : darkMode ? 'bg-slate-950' : 'bg-white'}`}>
                            {listaFinos.map((f) => {
                              const isGregorio = f.tipo_bebida === 'gregorio';
                              const bebidaKey = (f.tipo_bebida as TipoBebidaKey) || 'fino';
                              const emojiBebida = isGregorio ? '🤮' : (TIPOS_BEBIDA[bebidaKey]?.emoji || '🥂');
                              return (
                                <div key={f.id} className="border-b border-slate-800/50 pb-2 last:border-0">
                                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                                    <span>
                                      {emojiBebida} <strong className={isModoFesta ? 'text-white' : darkMode ? 'text-slate-200' : 'text-slate-800'}>{f.perfis?.nome || 'Desconhecido'}</strong>
                                      {!isGregorio && <span className="text-[10px] ml-1 opacity-70">({f.quantidade_equivalente ?? 1}x)</span>}
                                      {isGregorio && <span className="text-[10px] ml-1 text-red-400 font-bold opacity-90">(Vomitou)</span>}
                                      {f.pagador_id && <span className="text-[9px] ml-1 text-emerald-400 font-bold">(💳 Paga por {perfis.find(p=>p.id===f.pagador_id)?.nome})</span>}
                                    </span>
                                    <span className="text-slate-500">{new Date(f.data_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                  {f.foto_url && <img src={f.foto_url} alt="Bebida" loading="lazy" onClick={() => setFotoExpandida(f.foto_url)} className="w-full h-40 object-cover rounded-xl shadow-sm mt-1 cursor-pointer hover:opacity-90 transition" />}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        <nav className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto border-t z-40 transition-colors ${isModoFesta ? 'bg-black/90 border-white/10' : darkMode ? 'bg-slate-950/90 border-slate-800' : 'bg-white/95 border-slate-200'} backdrop-blur-md pb-safe`}>
          <ul className="flex justify-around items-center p-2">
            {navItems.map(item => {
              const isActive = abaAtiva === item.id;
              return (
                <li key={item.id} className="w-full">
                  <button onClick={() => setAbaAtiva(item.id)} className={`w-full flex flex-col items-center justify-center py-2 transition-all rounded-xl ${isActive ? (isModoFesta ? 'text-black bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]' : darkMode ? 'text-amber-400 bg-slate-900' : 'text-amber-600 bg-amber-50') : (isModoFesta ? 'text-white/50 hover:text-white' : darkMode ? 'text-slate-500 hover:text-slate-400' : 'text-slate-400 hover:text-slate-600')}`}>
                    <span className={`text-xl mb-1 ${isActive ? 'scale-110' : 'scale-100'} transition-transform duration-200`}>{item.icon}</span><span className={`text-[9px] font-bold ${isActive ? 'opacity-100' : 'opacity-70'}`}>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {modalGregorioOpen && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className={`rounded-3xl p-6 text-center max-w-xs shadow-2xl border transform transition-all ${isModoFesta ? 'bg-black border-red-600 text-white' : darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'}`}>
              <div className="text-4xl mb-3">🤮</div><h3 className="font-black text-red-500 text-lg mb-2">Assumir?</h3><p className="text-xs font-semibold mb-6 text-slate-400 leading-relaxed">Isto vai adicionar uma mancha permanente no teu perfil do Ranking! Tem a certeza?</p>
              <div className="flex gap-2"><button onClick={() => setModalGregorioOpen(false)} className={`flex-1 py-3 rounded-xl font-bold text-xs border transition ${isModoFesta ? 'border-white/20 text-white/50 hover:bg-white/10' : darkMode ? 'border-slate-800 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'}`}>Cancelar</button><button onClick={confirmarGregorio} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-black py-3 rounded-xl text-xs shadow transition active:scale-95">Sim, fui moleque 🤮</button></div>
            </div>
          </div>
        )}

        {mensagemModal && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
            <div className={`rounded-3xl p-5 text-center max-w-xs w-full shadow-2xl transform transition-all border overflow-hidden ${isModoFesta ? 'bg-black border-white text-white shadow-[0_0_50px_rgba(255,255,255,0.8)]' : darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'}`}>
              <div className="text-3xl mb-1">{TIPOS_BEBIDA[tipoBebidaSelecionado].emoji}</div><h3 className={`font-black text-lg mb-1 ${isModoFesta ? 'text-white' : 'text-amber-500'}`}>{isModoFesta ? 'BOOOM!!! 🚀' : 'Registado!'}</h3>
              {mensagemModal.gifUrl && <div className="my-3 rounded-2xl overflow-hidden shadow-md max-h-48 border border-slate-700/30 flex items-center justify-center bg-black/20"><img src={mensagemModal.gifUrl} alt="Sticker do grupo" className="w-full h-full object-cover max-h-48" /></div>}
              <p className="text-xs font-semibold mb-4 text-slate-400">{mensagemModal.texto}</p><button onClick={() => setMensagemModal(null)} className={`w-full font-black py-3 rounded-xl shadow transition active:scale-95 ${isModoFesta ? 'bg-white text-black' : 'bg-amber-500 hover:bg-amber-400 text-slate-950'}`}>Siga fiii! 🍻</button>
            </div>
          </div>
        )}
        
        {fotoExpandida && (
          <div onClick={() => setFotoExpandida(null)} className="fixed inset-0 bg-black/90 flex items-center justify-center p-2 z-[70] cursor-pointer">
            <img src={fotoExpandida} alt="Foto em destaque" className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain" />
          </div>
        )}
      </main>
    </>
  );
}