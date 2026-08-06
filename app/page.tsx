'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

// ==========================================
// ⚙️ CONFIGURAÇÃO RÁPIDA
// ==========================================
const TOTAL_GIFS = 1;                     // 👈 Número total de stickers em public/gifs/
const META_FESTA_DIARIA = 20;              // 🎯 Aos 20 finos diários arranca o caos!
const DATA_INICIO_PROJETO = '2026-08-05';   // 📅 Data oficial de arranque do contador

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

// 🍻 NOVOS TIPOS DE BEBIDA E EQUIVALÊNCIAS
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
  { meta: 1000, texto: "1.000 FINOS! 200 LITROS DE CERVEJA! O volume total enchia rigorosamente a bagageira de um Volkswagen Golf de 2020 até ao teto! Somos grandes!" }
];

const SONS_CELEBRACAO = [
  'https://assets.mixkit.co/active_storage/sfx/2070/2070-preview.mp3', 
  'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3', 
  'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3', 
  'https://assets.mixkit.co/active_storage/sfx/131.mp3',                
];

// ==========================================
// 🔔 AUXILIARES DE NOTIFICAÇÃO PUSH
// ==========================================
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

async function comprimirImagem(file: File, maxDimensao = 600, qualidade = 0.8): Promise<File> {
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

// 📍 AUXILIAR PARA CAPTURAR COORDENADAS GPS
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

export default function Home() {
  const [abaAtiva, setAbaAtiva] = useState<'inicio' | 'ranking' | 'rodada' | 'mapa' | 'feitos' | 'historico'>('inicio');
  const [toast, setToast] = useState<{msg: string, tipo: 'erro' | 'sucesso'} | null>(null);

  const [modalGregorioOpen, setModalGregorioOpen] = useState(false);
  const [usersExpandidos, setUsersExpandidos] = useState<{ [key: string]: boolean }>({});

  const [perfis, setPerfis] = useState<any[]>([]);
  const [finos, setFinos] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [novoNome, setNovoNome] = useState('');
  const [loading, setLoading] = useState(false);

  // MODO DE REGISTO EM INÍCIO: INDIVIDUAL OU RODADA
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

  // SORTEADOR
  const [presentesMesa, setPresentesMesa] = useState<string[]>([]);
  const [isSorteandoRodada, setIsSorteandoRodada] = useState(false);
  const [roletaRodadaId, setRoletaRodadaId] = useState<string | null>(null);
  const [vitimaRodada, setVitimaRodada] = useState<any | null>(null);

  // REFERÊNCIA DO MAPA
  const mapRef = useRef<any>(null);

  useEffect(() => {
    fetchDados();

    const themeGuardado = localStorage.getItem('finos_theme');
    if (themeGuardado === 'dark') setDarkMode(true);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }

    const canalRealtime = supabase
      .channel('tempo-real-finos')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'finos' },
        () => { fetchDados(); }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'perfis' },
        () => { fetchDados(); }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canalRealtime);
    };
  }, []);

  // 🗺️ EFEITO DE CARREGAMENTO DO MAPA DE CALOR LEAFLET
  useEffect(() => {
    if (abaAtiva === 'mapa' && typeof window !== 'undefined') {
      const L = (window as any).L;
      if (!L) return;

      // Destrói instância anterior se existir
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      // Pontos com coordenadas válidas para o mapa de calor
      const pontosCoordenadas = finos
        .filter(f => f.lat && f.lng && f.tipo_bebida !== 'gregorio')
        .map(f => [Number(f.lat), Number(f.lng), (f.quantidade_equivalente ?? 1) * 0.5]);

      // Centro padrão (Porto/Lisboa se não houver pontos)
      const centroInicial = pontosCoordenadas.length > 0
        ? [pontosCoordenadas[0][0], pontosCoordenadas[0][1]]
        : [41.1579, -8.6291];

      const map = L.map('mapa-calor-container').setView(centroInicial, 12);
      mapRef.current = map;

      // Camada de mapa estilo escuro / elegante
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      // Renderiza mapa de calor se houver pontos
      if (pontosCoordenadas.length > 0 && L.heatLayer) {
        L.heatLayer(pontosCoordenadas, {
          radius: 25,
          blur: 15,
          maxZoom: 17,
          gradient: { 0.4: 'blue', 0.65: 'lime', 0.8: 'yellow', 1.0: 'red' }
        }).addTo(map);

        // Ajusta o zoom para enquadrar todos os pontos globais
        const bounds = L.latLngBounds(pontosCoordenadas.map((p: any) => [p[0], p[1]]));
        map.fitBounds(bounds, { padding: [30, 30] });
      }
    }
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
    const { data: dataFinos } = await supabase
      .from('finos')
      .select('*, perfis(nome)')
      .order('data_hora', { ascending: false });

    if (dataPerfis) setPerfis(dataPerfis);
    if (dataFinos) {
      setFinos(dataFinos);
      if (dataFinos.length > 0) {
        const primeiroDia = new Date(dataFinos[0].data_hora).toLocaleDateString('pt-PT');
        setDiasAbertos((prev) => ({ ...prev, [primeiroDia]: true }));
      }
      
      dataPerfis?.forEach(p => {
        const pFinos = dataFinos.filter(f => f.perfil_id === p.id && f.tipo_bebida !== 'gregorio');
        if (pFinos.length > 0) {
          const ultimoFinoMs = new Date(pFinos[0].data_hora).getTime();
          if (Date.now() - ultimoFinoMs >= 7 * 86400000 && Date.now() - ultimoFinoMs <= 7 * 86400000 + 60000) {
            enviarNotificacao('🧼 ALERTA CONAS DE SABÃO!', `${p.nome} está há 1 semana sem beber.`);
          }
        }
      });
    }
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
  const contagemSemana: { [key: string]: number } = {};
  finosSemana.forEach(f => {
    contagemSemana[f.perfil_id] = (contagemSemana[f.perfil_id] || 0) + (f.quantidade_equivalente ?? 1);
  });
  let campeaoSemanaId = '';
  let maxSemana = 0;
  for (const [id, count] of Object.entries(contagemSemana)) {
    if (count > maxSemana) { maxSemana = count; campeaoSemanaId = id; }
  }

  const finosMes = finosValidos.filter(f => new Date(f.data_hora) >= inicioMes);
  const contagemMes: { [key: string]: number } = {};
  finosMes.forEach(f => {
    contagemMes[f.perfil_id] = (contagemMes[f.perfil_id] || 0) + (f.quantidade_equivalente ?? 1);
  });
  let campeaoMesId = '';
  let maxMes = 0;
  for (const [id, count] of Object.entries(contagemMes)) {
    if (count > maxMes) { maxMes = count; campeaoMesId = id; }
  }

  const finosExibidos = abaRanking === 'semanal' ? finosSemana : finosValidos;
  const totalFinosEq = finosExibidos.reduce((acc, f) => acc + (f.quantidade_equivalente ?? 1), 0);
  const totalFinosGeralEq = finosValidos.reduce((acc, f) => acc + (f.quantidade_equivalente ?? 1), 0);
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

  // REGISTAR FINO INDIVIDUAL OU RODADA COMPLETA (COM GPS)
  async function registarFino(e: React.ChangeEvent<HTMLInputElement>) {
    if (!selectedUser) { mostrarToast('Seleciona o teu nome na lista primeiro! 🍺', 'erro'); return; }
    
    if (modoRegisto === 'rodada' && bebedoresRodada.length === 0) {
      mostrarToast('Seleciona pelo menos 1 amigo que bebeu na rodada!', 'erro');
      return;
    }

    try {
      setLoading(true);
      const file = e.target.files?.[0];
      let photoUrl: string | null = null;

      // 📍 APANHAR COORDENADAS GPS
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

      if (modoRegisto === 'individual') {
        await supabase.from('finos').insert([{ 
          perfil_id: selectedUser, 
          foto_url: photoUrl,
          tipo_bebida: tipoBebidaSelecionado,
          quantidade_equivalente: bebidaInfo.equivalencia,
          lat: coords.lat,
          lng: coords.lng
        }]);
      } else {
        const listaInserir = bebedoresRodada.map(pId => ({
          perfil_id: pId,
          foto_url: photoUrl,
          tipo_bebida: tipoBebidaSelecionado,
          quantidade_equivalente: bebidaInfo.equivalencia,
          pagador_id: selectedUser,
          lat: coords.lat,
          lng: coords.lng
        }));

        await supabase.from('finos').insert(listaInserir);
      }
      
      const nomeUser = perfis.find(p => p.id === selectedUser)?.nome || 'Alguém';
      const agoraHora = new Date().getHours();

      if (modoRegisto === 'rodada') {
         enviarNotificacao('💳 O CHEFE PAGOU UMA RODADA!', `${nomeUser} pagou uma rodada para ${bebedoresRodada.length} amigos! Paga o que deves!`);
      } else {
        if (agoraHora >= 3 && agoraHora < 6) {
          enviarNotificacao('🎂 É PARABÉNS:', `${nomeUser} recusa-se a ir dormir e acabou de registar mais uma bebida. Já passa das 3 da manhã…`);
        } else {
          const finosHojeUser = (finosPorDataStr[hojeStrLocal] || []).filter(f => f.perfil_id === selectedUser).reduce((acc, f) => acc + (f.quantidade_equivalente ?? 1), 0) + bebidaInfo.equivalencia;
          if (finosHojeUser >= 5) {
            enviarNotificacao('🔥 EM CHAMA!', `${nomeUser} vai no equivalente a ${formatarFinos(finosHojeUser)} finos hoje. Já deve tar meio pêssego`);
          } else {
            enviarNotificacao('🍺 LÁ VAI ELE!', `${nomeUser} fodeu as beiças a mais uma bebida!`);
          }
        }
      }

      if (contagemPorPessoa.length >= 2 && selectedUser !== contagemPorPessoa[0].id) {
        const minhaPosicaoAntes = contagemPorPessoa.findIndex(p => p.id === selectedUser);
        const meuTotalNovo = contagemPorPessoa[minhaPosicaoAntes].count + bebidaInfo.equivalencia;
        if (minhaPosicaoAntes > 0 && meuTotalNovo > contagemPorPessoa[minhaPosicaoAntes - 1].count) {
          const ultrapassado = contagemPorPessoa[minhaPosicaoAntes - 1].nome;
          enviarNotificacao('🚨 ALERTA DE GOLPE DE ESTADO!', `${nomeUser} subiu na tabela e fodeu o lugar ao ${ultrapassado}! Você é pika! Você é o cara!`);
        }
      }

      if (proximoMarco && (totalFinosGeralEq + bebidaInfo.equivalencia) >= proximoMarco.meta) {
        enviarNotificacao('🏆 GRANDE FEITO ALCANÇADO!', `O grupo atingiu a meta equivalente a ${proximoMarco.meta} finos!`);
      }
      
      dispararCelebracao();
      
      const frasesRandom = isModoFesta ? MENSAGENS_FESTA : MENSAGENS_DIVERTIDAS;
      const textoSorteado = frasesRandom[Math.floor(Math.random() * frasesRandom.length)];
      
      let gifSorteado: string | null = null;
      if (TOTAL_GIFS > 0) {
        const numRandom = Math.floor(Math.random() * TOTAL_GIFS) + 1;
        gifSorteado = `/gifs/${numRandom}.webp`;
      }

      setMensagemModal({ 
        texto: modoRegisto === 'rodada' 
          ? `💳 Rodada registada! Pagante: ${perfis.find(p=>p.id===selectedUser)?.nome}` 
          : textoSorteado, 
        gifUrl: gifSorteado 
      });

      setBebedoresRodada([]);
      fetchDados();
    } catch (err) {
      console.error(err);
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

  function calcularConquistas(userFinosValidos: any[], userId: string) {
    const list: string[] = [];
    
    if (userId === campeaoSemanaId && maxSemana > 0) list.push('👑 Campeão da Semana');
    if (userId === campeaoMesId && maxMes > 0) list.push('🏆 Campeão do Mês');

    const rodadasPagas = finos.filter(f => f.pagador_id === userId).length;
    if (rodadasPagas > 0) {
      const rodadasUnicas = new Set(finos.filter(f => f.pagador_id === userId).map(f => f.data_hora)).size;
      list.push(`💸 Paga-Rodadas (${rodadasUnicas}x)`);
    }

    const umaSemanaAtrasMs = Date.now() - 7 * 86400000;
    const bebeuNaUltimaSemana = userFinosValidos.some(f => new Date(f.data_hora).getTime() >= umaSemanaAtrasMs);
    if (!bebeuNaUltimaSemana && userFinosValidos.length > 0) {
      list.push('🌵 Deserto');
    }

    if (!userFinosValidos || userFinosValidos.length === 0) return list;
    if (userFinosValidos.some((f) => { const h = new Date(f.data_hora).getHours(); return h >= 6 && h < 13; })) list.push('🌅 Madrugador');
    if (userFinosValidos.some((f) => { const h = new Date(f.data_hora).getHours(); return h >= 3 && h < 6; })) list.push('🦉 Coruja');
    
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
    
    const totalEq = userFinosValidos.reduce((acc, f) => acc + (f.quantidade_equivalente ?? 1), 0);
    if (totalEq >= 1) list.push('🌱 Primeira Bebida');
    if (totalEq >= 10) list.push('🥉 Equivalente a 10 Finos');
    if (totalEq >= 25) list.push('🥈 Equivalente a 25 Finos');
    if (totalEq >= 50) list.push('🥇 Equivalente a 50 Finos');
    return list;
  }

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
      let periodoForte = '';
      let maxP = 0;
      for (const [k, v] of Object.entries(periodos)) {
        if (v > maxP && v > 0) { maxP = v; periodoForte = k; }
      }

      return { ...p, count, conquistas, gregorios, userFinosValidos, periodoForte };
    })
    .sort((a, b) => b.count - a.count);

  const maxFinos = contagemPorPessoa[0]?.count || 0;
  const reiDoFino = contagemPorPessoa[0];
  const media = perfis.length > 0 ? (totalFinosEq / perfis.length).toFixed(1) : '0';

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
      if (lastDayMs === hojeMs || lastDayMs === ontemMs) curS = tempS; else curS = 0;
    }
    return { id: p.id, nome: p.nome, maxStreak: maxS, currentStreak: curS };
  });

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
  ritmoUsers.sort((a, b) => a.paceMin - b.paceMin);

  function getFighterStats(id: string) {
    const pCount = contagemPorPessoa.find(p => p.id === id)?.count || 0;
    const pStreak = statsStreaks.find(s => s.id === id)?.maxStreak || 0;
    const pRitmo = ritmoUsers.find(r => r.id === id)?.paceMin || Infinity;
    return { count: pCount, streak: pStreak, ritmo: pRitmo };
  }
  
  const f1Stats = fighter1 ? getFighterStats(fighter1) : null;
  const f2Stats = fighter2 ? getFighterStats(fighter2) : null;

  // LÓGICA DO SORTEADOR DA RODADA
  const toggleMesa = (id: string) => {
    setPresentesMesa(prev => prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]);
  };

  const toggleBebedorRodada = (id: string) => {
    setBebedoresRodada(prev => prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]);
  };

  const selecionarTodosMesa = () => setPresentesMesa(perfis.map(p => p.id));
  const limparMesa = () => setPresentesMesa([]);

  function sortearQuemPaga() {
    if (presentesMesa.length < 2) {
      mostrarToast('Seleciona pelo menos 2 pessoas na mesa! 🍻', 'erro');
      return;
    }
    setIsSorteandoRodada(true);
    setVitimaRodada(null);
    
    let voltas = 0;
    const maxVoltas = 15 + Math.floor(Math.random() * 10);
    let currentIdx = 0;

    const tick = () => {
      const idAtual = presentesMesa[currentIdx];
      setRoletaRodadaId(idAtual);
      voltas++;

      if (voltas < maxVoltas) {
        currentIdx = (currentIdx + 1) % presentesMesa.length;
        const delay = 50 + (voltas * voltas * 0.8);
        setTimeout(tick, delay);
      } else {
        const perfilSorteado = perfis.find(p => p.id === idAtual);
        setVitimaRodada(perfilSorteado);
        setIsSorteandoRodada(false);
        dispararCelebracao();
      }
    };
    tick();
  }

  const toggleDia = (dia: string) => setDiasAbertos((prev) => ({ ...prev, [dia]: !prev[dia] }));
  const finosPorDiaParaLista = finos.reduce((acc: { [key: string]: any[] }, fino) => {
    const dataStr = new Date(fino.data_hora).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    if (!acc[dataStr]) acc[dataStr] = [];
    acc[dataStr].push(fino);
    return acc;
  }, {});

  // 🗺️ ITEM DO MAPA ADICIONADO AO MENU
  const navItems = [
    { id: 'inicio', label: 'Início', icon: '🏠' },
    { id: 'ranking', label: 'Ranking', icon: '📊' },
    { id: 'rodada', label: 'Rodada', icon: '🎲' },
    { id: 'mapa', label: 'Mapa', icon: '🗺️' },
    { id: 'feitos', label: 'Feitos', icon: '🎯' },
    { id: 'historico', label: 'Galeria', icon: '📸' }
  ] as const;

  const mainWrapperClasses = isModoFesta 
    ? 'brutal-bg text-white' 
    : darkMode ? 'bg-slate-950 text-slate-100' : 'bg-amber-50 text-slate-900';

  const cardClasses = isModoFesta
    ? 'bg-black/60 border border-white/10 backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.1)] text-white'
    : darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';

  return (
    <>
      <style>{`
        @keyframes marqueeScroll {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-block;
          white-space: nowrap;
          animation: marqueeScroll 8s linear infinite;
        }
        ${isModoFesta ? `
          @keyframes discoBg {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes shakeBrutal {
            0% { transform: translate(1px, 1px) rotate(0deg); }
            25% { transform: translate(-2px, -2px) rotate(-1deg); }
            50% { transform: translate(2px, 2px) rotate(1deg); }
            75% { transform: translate(-2px, 1px) rotate(0deg); }
            100% { transform: translate(1px, -1px) rotate(-1deg); }
          }
          .brutal-bg {
            background: linear-gradient(-45deg, #180030, #ff0044, #000000, #00e5ff, #3a0088);
            background-size: 400% 400%;
            animation: discoBg 2s ease infinite;
          }
          .brutal-shake {
            animation: shakeBrutal 0.15s infinite;
          }
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

        {/* CABEÇALHO COM BOTÃO DE NOTIFICAÇÕES */}
        <div className="flex justify-between items-center mb-2 pt-2">
          <h1 className={`text-2xl font-extrabold flex items-center gap-2 transition-all ${isModoFesta ? 'text-white drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]' : darkMode ? 'text-amber-400' : 'text-amber-900'}`}>
            {isModoFesta ? 'É SEMPRE A VIRÁ-LOS' : '🍻 Contador'}
          </h1>
          <div className="flex gap-2">
            <button
              onClick={handleAtivarNotificacoes}
              className="px-3 py-1.5 rounded-full font-black text-xs transition border flex items-center gap-1.5 shadow-sm bg-blue-600 hover:bg-blue-500 text-white border-blue-500 active:scale-95"
              title="Ativar ou atualizar subscrição de Notificações"
            >
              🔔 Alertas
            </button>
            <button
              onClick={toggleDarkMode}
              className={`px-3 py-1.5 rounded-full font-black text-xs transition border flex items-center gap-1.5 shadow-sm ${
                isModoFesta ? 'bg-black/50 text-white border-white/20' 
                : darkMode ? 'bg-slate-900 text-amber-400 border-slate-800' : 'bg-white text-slate-700 border-slate-200'
              }`}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* FITA DE AVISO CSS */}
        {isModoFesta && abaAtiva === 'inicio' && (
          <div className="mb-4 rounded-lg overflow-hidden border-2 border-yellow-400 shadow-[0_0_15px_red] bg-red-600 py-1.5">
            <div className="animate-marquee text-lg font-black text-yellow-300 uppercase tracking-widest leading-none">
              🚨 O FÍGADO QUE SE FODA! 🚨 MODO DESTRUIÇÃO ATIVADO 🚨 MANDA VIR CRL! 🚨
            </div>
          </div>
        )}

        {/* SEPARADOR 1: INÍCIO */}
        {abaAtiva === 'inicio' && (
          <div className="space-y-6">
            
            {/* CONTAGEM DE DIAS DO PROJETO + STREAK DO GRUPO */}
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

            <div className="grid grid-cols-2 gap-3">
              <div className={`p-4 rounded-2xl shadow text-center flex flex-col justify-center border transition-colors ${cardClasses}`}>
                <p className={`text-[10px] uppercase font-extrabold tracking-wider ${isModoFesta ? 'text-white/60' : 'text-slate-400'}`}>Total Equivalente</p>
                <p className={`text-3xl font-black leading-tight mt-1 ${isModoFesta ? 'text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]' : 'text-amber-500'}`}>{formatarFinos(totalFinosGeralEq)}</p>
              </div>
              <div className={`p-4 rounded-2xl shadow text-center flex flex-col justify-center border transition-colors ${cardClasses}`}>
                <p className={`text-[10px] uppercase font-extrabold tracking-wider ${isModoFesta ? 'text-white/60' : 'text-slate-400'}`}>Líder 🍾</p>
                <p className="text-xl font-black truncate mt-1 text-inherit">
                  {reiDoFino && reiDoFino.count > 0 ? reiDoFino.nome : '-'}
                </p>
              </div>
            </div>

            {/* SELETOR DE MODO: INDIVIDUAL OU REGISTAR RODADA */}
            <div className={`p-1.5 rounded-2xl border flex gap-1 ${cardClasses}`}>
              <button
                onClick={() => setModoRegisto('individual')}
                className={`flex-1 py-2.5 rounded-xl font-black text-xs transition ${
                  modoRegisto === 'individual'
                    ? (isModoFesta ? 'bg-white text-black' : 'bg-amber-500 text-slate-950')
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🥂 Registo Individual
              </button>
              <button
                onClick={() => setModoRegisto('rodada')}
                className={`flex-1 py-2.5 rounded-xl font-black text-xs transition ${
                  modoRegisto === 'rodada'
                    ? (isModoFesta ? 'bg-white text-black' : 'bg-amber-500 text-slate-950')
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                💳 Pagar Rodada
              </button>
            </div>

            <div className={`p-4 rounded-2xl shadow border transition-colors ${cardClasses}`}>
              <label className={`block font-bold mb-2 text-sm ${isModoFesta ? 'text-white' : darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {modoRegisto === 'rodada' ? 'Quem vai PAGAR a rodada? 💳' : 'Quem és tu?'}
              </label>
              <select
                className={`w-full p-2.5 border rounded-xl font-bold mb-3 outline-none text-sm ${
                  isModoFesta ? 'bg-black/50 border-white/20 text-white' : darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
                value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">-- Seleciona o pagador --</option>
                {perfis.map((p) => (<option key={p.id} value={p.id}>{p.nome}</option>))}
              </select>

              {/* SE MODO RODADA ATIVO: MARCAR AMIGOS QUE BEBERAM */}
              {modoRegisto === 'rodada' && (
                <div className="mt-3 pt-3 border-t border-slate-800/50">
                  <label className="block font-extrabold text-xs uppercase tracking-wider mb-2 text-amber-500">
                    Quem BEBEU na rodada? ({bebedoresRodada.length})
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {perfis.map(p => {
                      const isSelected = bebedoresRodada.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => toggleBebedorRodada(p.id)}
                          className={`p-2 rounded-lg border font-bold text-[11px] text-left transition flex justify-between items-center ${
                            isSelected 
                              ? 'bg-amber-500/20 border-amber-500 text-amber-400' 
                              : 'bg-black/20 border-slate-800 text-slate-500'
                          }`}
                        >
                          <span className="truncate">{p.nome}</span>
                          <span>{isSelected ? '✅' : '⚪'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-3">
                <input 
                  type="text" placeholder="Novo amigo..." 
                  className={`flex-1 p-2 border rounded-xl text-sm outline-none font-bold ${
                    isModoFesta ? 'bg-black/50 border-white/20 text-white placeholder-white/40' : darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
                  }`} 
                  value={novoNome} onChange={(e) => setNovoNome(e.target.value)} 
                />
                <button onClick={criarPerfil} className={`${isModoFesta ? 'bg-white text-black hover:bg-slate-200' : 'bg-amber-600 hover:bg-amber-500'} px-4 py-2 rounded-xl text-sm font-black transition`}>+ Criar</button>
              </div>
            </div>

            <div>
              <label className={`block font-extrabold text-xs uppercase tracking-wider mb-2 ${isModoFesta ? 'text-white/70' : darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                O que estão a beber?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(TIPOS_BEBIDA) as TipoBebidaKey[]).map((key) => {
                  const item = TIPOS_BEBIDA[key];
                  const isSelected = tipoBebidaSelecionado === key;
                  return (
                    <button
                      key={key} onClick={() => setTipoBebidaSelecionado(key)}
                      className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                        isSelected 
                          ? (isModoFesta ? 'bg-white text-black border-transparent font-black shadow-[0_0_15px_rgba(255,255,255,0.8)] scale-105' : 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-lg scale-105')
                          : (isModoFesta ? 'bg-black/40 border-white/10 text-white/70' : darkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600')
                      }`}
                    >
                      <span className="text-xl">{item.emoji}</span>
                      <span className="text-[10px] uppercase font-bold leading-tight">{item.label.split(' ')[1]}</span>
                      <span className="text-[9px] opacity-80">({item.equivalencia}x finos)</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="text-center relative">
              <label className={`inline-block w-full py-6 rounded-2xl font-black text-2xl shadow-xl cursor-pointer transition transform active:scale-95 ${
                selectedUser 
                  ? (isModoFesta 
                      ? 'brutal-shake bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 text-white border-4 border-yellow-400 shadow-[0_0_40px_rgba(255,0,0,0.8)]' 
                      : 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/20 text-slate-950') 
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}>
                {loading 
                  ? 'A guardar... 🍻' 
                  : modoRegisto === 'rodada'
                    ? '💳 CONFIRMAR RODADA PAGA!'
                    : isModoFesta 
                      ? 'MANDA VIR CRL! 🚀' 
                      : `${TIPOS_BEBIDA[tipoBebidaSelecionado].emoji} +1 ${tipoBebidaSelecionado.toUpperCase()}`
                }
                <input type="file" accept="image/*" capture="environment" className="hidden" disabled={!selectedUser || loading} onChange={registarFino} />
              </label>
            </div>

            <div className="text-center mt-6">
              <button 
                onClick={abrirModalGregorio}
                disabled={!selectedUser || loading}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition ${
                  selectedUser 
                    ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 active:scale-95' 
                    : (isModoFesta ? 'bg-black/50 border border-red-900/50 text-red-900/50' : darkMode ? 'bg-slate-900 border border-slate-800 text-slate-700' : 'bg-slate-100 border border-slate-200 text-slate-400')
                }`}
              >
                🤮 Fiz mau
              </button>
            </div>
          </div>
        )}

        {/* SEPARADOR 2: RANKING E ESTATÍSTICAS COMPLETAS */}
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
                  
                  const userCurrentStreak = statsStreaks.find(s => s.id === p.id)?.currentStreak || 0;
                  const estaExpandido = !!usersExpandidos[p.id];

                  return (
                    <div 
                      key={p.id} 
                      onClick={() => toggleUserExpandido(p.id)} 
                      className={`p-3 rounded-xl border cursor-pointer transition ${
                        isModoFesta ? 'bg-black/30 border-white/10 hover:bg-white/10' : darkMode ? 'bg-slate-950/50 border-slate-800 hover:bg-slate-800' : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex justify-between items-center text-sm">
                        <div className="truncate pr-2">
                          <span className="font-bold">{idx + 1}. {p.nome}</span>
                          <span className="text-[10px] text-amber-500 font-semibold block mt-0.5">{statusBadge}</span>
                        </div>
                        <div className="text-right flex items-center gap-2 shrink-0">
                          <span className={`font-black px-3 py-1 rounded-full text-xs border ${isModoFesta ? 'bg-white/20 text-white border-white/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>
                            {formatarFinos(p.count)} finos
                          </span>
                          <span className="text-xs opacity-60">{estaExpandido ? '▲' : '▼'}</span>
                        </div>
                      </div>

                      {/* CRACHÁS */}
                      {(p.conquistas.length > 0 || userCurrentStreak > 1 || p.gregorios > 0 || p.periodoForte) && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {p.gregorios > 0 && (
                            <span className="bg-red-500/10 text-red-400 border border-red-500/30 text-[10px] px-1.5 py-0.5 rounded-md font-bold">
                              🤮 {p.gregorios}x Vómitos
                            </span>
                          )}
                          {userCurrentStreak > 1 && (
                            <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] px-1.5 py-0.5 rounded-md font-bold">
                              🔥 {userCurrentStreak} Dias
                            </span>
                          )}
                          {p.periodoForte && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold border ${isModoFesta ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30'}`}>
                              🕒 Forte: {p.periodoForte}
                            </span>
                          )}
                          {p.conquistas.map((badgeText: string, i: number) => (
                            <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold border ${
                              badgeText.includes('🌵')
                                ? 'bg-yellow-900/30 text-yellow-500 border-yellow-700/50'
                                : badgeText.includes('💸')
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-black'
                                  : badgeText.includes('👑') || badgeText.includes('🏆') 
                                    ? 'bg-amber-500 text-black border-amber-300 font-black shadow-sm' 
                                    : isModoFesta ? 'bg-white/10 text-white border-white/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}>
                              {badgeText}
                            </span>
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
                                      <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[8px] px-1.5 py-0.5 rounded font-bold backdrop-blur-sm tracking-wide">
                                        {new Date(f.data_hora).toLocaleDateString('pt-PT', {day:'2-digit', month:'2-digit', year:'2-digit'})} {new Date(f.data_hora).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                                      </div>
                                      {f.pagador_id && (
                                        <div className="absolute top-1 left-1 bg-emerald-600/90 text-white text-[7px] px-1 py-0.5 rounded font-black backdrop-blur-sm">
                                          💳 Rodada Paga
                                        </div>
                                      )}
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

            {/* FRENTE A FRENTE 1V1 */}
            {perfis.length >= 2 && finosValidos.length > 0 && (
              <div className={`p-4 rounded-2xl shadow border transition-colors ${cardClasses}`}>
                <h2 className="font-bold text-lg mb-3 border-b pb-2 border-slate-800/50 flex items-center gap-2">⚔️ Frente-a-Frente</h2>
                <div className="flex gap-2 items-center mb-4">
                  <select className={`flex-1 p-2 border rounded-xl text-xs font-bold outline-none ${isModoFesta ? 'bg-black/50 border-white/20 text-white' : darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'}`} value={fighter1} onChange={(e) => setFighter1(e.target.value)}>
                    <option value="">Desafiante 1</option>{perfis.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select>
                  <span className="font-black text-slate-500 text-sm">VS</span>
                  <select className={`flex-1 p-2 border rounded-xl text-xs font-bold outline-none ${isModoFesta ? 'bg-black/50 border-white/20 text-white' : darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'}`} value={fighter2} onChange={(e) => setFighter2(e.target.value)}>
                    <option value="">Desafiante 2</option>{perfis.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select>
                </div>
                {fighter1 && fighter2 && fighter1 !== fighter2 && f1Stats && f2Stats && (
                  <div className={`border rounded-xl p-3 space-y-3 ${isModoFesta ? 'bg-black/40 border-white/10' : darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex justify-between items-center border-b border-slate-800/50 pb-2">
                      <span className={`w-1/3 text-left font-black text-lg ${f1Stats.count > f2Stats.count ? (isModoFesta ? 'text-white' : 'text-amber-500') : 'text-slate-500'}`}>{formatarFinos(f1Stats.count)}</span>
                      <span className="w-1/3 text-center text-[9px] uppercase font-bold text-slate-500">Total Equivalente</span>
                      <span className={`w-1/3 text-right font-black text-lg ${f2Stats.count > f1Stats.count ? (isModoFesta ? 'text-white' : 'text-amber-500') : 'text-slate-500'}`}>{formatarFinos(f2Stats.count)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ESTATÍSTICAS E RECORDES */}
            {finosValidos.length > 0 && (
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
            )}

          </div>
        )}

        {/* SEPARADOR: SORTEADOR DA PRÓXIMA RODADA */}
        {abaAtiva === 'rodada' && (
          <div className="space-y-6">
            <div className={`p-5 rounded-2xl shadow border transition-colors ${cardClasses}`}>
              <h2 className="font-black text-xl mb-1 flex items-center gap-2">🎲 Sorteador da Rodada</h2>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Seleciona quem está presente na mesa para sortear quem paga a próxima rodada de bebidas!
              </p>

              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                  Quem está na mesa? ({presentesMesa.length})
                </span>
                <div className="flex gap-2 text-[10px] font-bold">
                  <button onClick={selecionarTodosMesa} className="text-amber-500 hover:underline">Todos</button>
                  <span className="text-slate-600">|</span>
                  <button onClick={limparMesa} className="text-slate-400 hover:underline">Limpar</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-6">
                {perfis.map(p => {
                  const isPresente = presentesMesa.includes(p.id);
                  const isOnRoleta = roletaRodadaId === p.id;

                  return (
                    <button
                      key={p.id}
                      onClick={() => toggleMesa(p.id)}
                      className={`p-3 rounded-xl border font-bold text-xs transition flex items-center justify-between ${
                        isOnRoleta
                          ? 'bg-amber-500 text-black border-amber-300 scale-105 shadow-lg'
                          : isPresente
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

              <button
                onClick={sortearQuemPaga}
                disabled={isSorteandoRodada || presentesMesa.length < 2}
                className={`w-full py-4 rounded-xl font-black text-lg shadow-xl transition transform active:scale-95 ${
                  isSorteandoRodada 
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : presentesMesa.length >= 2
                      ? (isModoFesta ? 'bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 text-white border-2 border-yellow-400' : 'bg-amber-500 hover:bg-amber-400 text-slate-950')
                      : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }`}
              >
                {isSorteandoRodada ? 'A rodar a roleta... 🍻' : '💸 QUEM PAGA A RODADA?'}
              </button>

              {vitimaRodada && (
                <div className={`mt-6 p-5 rounded-2xl border text-center relative shadow-2xl animate-bounce ${
                  isModoFesta ? 'bg-red-600 border-yellow-400 text-white' : 'bg-amber-500 text-slate-950 border-amber-300'
                }`}>
                  <button 
                    onClick={() => setVitimaRodada(null)}
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/20 hover:bg-black/40 font-black text-xs flex items-center justify-center transition"
                    title="Fechar resultado"
                  >
                    ✕
                  </button>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Parabéns!</p>
                  <h3 className="text-2xl font-black mt-1">🍻 {vitimaRodada.nome} PAGA A RODADA!</h3>
                  <p className="text-xs font-semibold mt-1 opacity-90">Oupas! 🍻</p>
                  <button
                    onClick={() => setVitimaRodada(null)}
                    className="mt-3 px-4 py-1.5 rounded-lg bg-black/20 hover:bg-black/30 font-black text-xs transition"
                  >
                    OK / Fechar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 🗺️ SEPARADOR NOVO: MAPA DE CALOR MUNDIAL 🔥 */}
        {abaAtiva === 'mapa' && (
          <div className="space-y-6">
            <div className={`p-4 rounded-2xl shadow border transition-colors ${cardClasses}`}>
              <h2 className="font-bold text-lg mb-1 flex items-center gap-2">🔥 Mapa de Calor das Bebidas</h2>
              <p className="text-xs text-slate-400 mb-4">
                As zonas mais "quentes" no mapa representam onde o grupo mais fodeu as beiças aos finos!
              </p>
              
              <div className="w-full h-96 rounded-2xl overflow-hidden border border-slate-700/50 shadow-inner relative z-10">
                <div id="mapa-calor-container" className="w-full h-full"></div>
              </div>
            </div>
          </div>
        )}

        {/* SEPARADOR 4: GRANDES FEITOS */}
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
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-md border ${isModoFesta ? 'bg-black text-white border-white/30' : darkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-white text-slate-500 border-slate-200'}`}>Faltam {formatarFinos(faltam)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SEPARADOR 5: HISTÓRICO E GALERIA */}
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
                                      {f.pagador_id && (
                                        <span className="text-[9px] ml-1 text-emerald-400 font-bold">
                                          (💳 Paga por {perfis.find(p=>p.id===f.pagador_id)?.nome})
                                        </span>
                                      )}
                                    </span>
                                    <span className="text-slate-500">{new Date(f.data_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                  {f.foto_url && (
                                    <img src={f.foto_url} alt="Bebida" loading="lazy" onClick={() => setFotoExpandida(f.foto_url)} className="w-full h-40 object-cover rounded-xl shadow-sm mt-1 cursor-pointer hover:opacity-90 transition" />
                                  )}
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

        {/* MENU INFERIOR NAVEGAÇÃO */}
        <nav className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto border-t z-40 transition-colors ${
          isModoFesta ? 'bg-black/90 border-white/10' : darkMode ? 'bg-slate-950/90 border-slate-800' : 'bg-white/95 border-slate-200'
        } backdrop-blur-md pb-safe`}>
          <ul className="flex justify-around items-center p-2">
            {navItems.map(item => {
              const isActive = abaAtiva === item.id;
              return (
                <li key={item.id} className="w-full">
                  <button
                    onClick={() => setAbaAtiva(item.id)}
                    className={`w-full flex flex-col items-center justify-center py-2 transition-all rounded-xl ${
                      isActive 
                        ? (isModoFesta ? 'text-black bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]' : darkMode ? 'text-amber-400 bg-slate-900' : 'text-amber-600 bg-amber-50') 
                        : (isModoFesta ? 'text-white/50 hover:text-white' : darkMode ? 'text-slate-500 hover:text-slate-400' : 'text-slate-400 hover:text-slate-600')
                    }`}
                  >
                    <span className={`text-xl mb-1 ${isActive ? 'scale-110' : 'scale-100'} transition-transform duration-200`}>{item.icon}</span>
                    <span className={`text-[9px] font-bold ${isActive ? 'opacity-100' : 'opacity-70'}`}>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* AVISO CONFIRMAÇÃO DO FIZ MAU */}
        {modalGregorioOpen && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className={`rounded-3xl p-6 text-center max-w-xs shadow-2xl border transform transition-all ${
              isModoFesta ? 'bg-black border-red-600 text-white' : darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
            }`}>
              <div className="text-4xl mb-3">🤮</div>
              <h3 className="font-black text-red-500 text-lg mb-2">Assumir?</h3>
              <p className="text-xs font-semibold mb-6 text-slate-400 leading-relaxed">
                Isto vai adicionar uma mancha permanente no teu perfil do Ranking! Tem a certeza?
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setModalGregorioOpen(false)}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs border transition ${
                    isModoFesta ? 'border-white/20 text-white/50 hover:bg-white/10' : darkMode ? 'border-slate-800 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Cancelar
                </button>
                <button onClick={confirmarGregorio} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-black py-3 rounded-xl text-xs shadow transition active:scale-95">
                  Sim, fui moleque 🤮
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL CELEBRAÇÃO */}
        {mensagemModal && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
            <div className={`rounded-3xl p-5 text-center max-w-xs w-full shadow-2xl transform transition-all border overflow-hidden ${
              isModoFesta ? 'bg-black border-white text-white shadow-[0_0_50px_rgba(255,255,255,0.8)]' : darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
            }`}>
              <div className="text-3xl mb-1">{TIPOS_BEBIDA[tipoBebidaSelecionado].emoji}</div>
              <h3 className={`font-black text-lg mb-1 ${isModoFesta ? 'text-white' : 'text-amber-500'}`}>{isModoFesta ? 'BOOOM!!! 🚀' : 'Registado!'}</h3>
              
              {mensagemModal.gifUrl && (
                <div className="my-3 rounded-2xl overflow-hidden shadow-md max-h-48 border border-slate-700/30 flex items-center justify-center bg-black/20">
                  <img src={mensagemModal.gifUrl} alt="Sticker do grupo" className="w-full h-full object-cover max-h-48" />
                </div>
              )}

              <p className="text-xs font-semibold mb-4 text-slate-400">{mensagemModal.texto}</p>
              <button onClick={() => setMensagemModal(null)} className={`w-full font-black py-3 rounded-xl shadow transition active:scale-95 ${isModoFesta ? 'bg-white text-black' : 'bg-amber-500 hover:bg-amber-400 text-slate-950'}`}>Siga fiii! 🍻</button>
            </div>
          </div>
        )}
        
        {/* MODAL FOTO EXPANDIDA */}
        {fotoExpandida && (
          <div onClick={() => setFotoExpandida(null)} className="fixed inset-0 bg-black/90 flex items-center justify-center p-2 z-[70] cursor-pointer">
            <img src={fotoExpandida} alt="Foto em destaque" className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain" />
          </div>
        )}
      </main>
    </>
  );
}