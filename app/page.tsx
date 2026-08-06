'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// ==========================================
// CONFIGURAÇÕES GERAIS E MODO FESTA
// ==========================================
const META_FESTA_DIARIA = 20; // 🎯 Aos 20 finos diários arranca o caos!

const TIPOS_BEBIDA = {
  fino: { label: '🍺 Fino / Mini', equivalencia: 1.0, emoji: '🍺' },
  principe: { label: '🍾 Garrafa / Príncipe', equivalencia: 1.5, emoji: '🍾' },
  caneca: { label: '🪨 Caneca', equivalencia: 2.0, emoji: '🪨' }
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
  'CHAMA A GNR! 传输',
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
  { meta: 950, texto: "O volume enchia o estômago de um camelo adulto até ele não ter mais sede. QUE CAMPEÕES!" },
  { meta: 1000, texto: "1.000 FINOS! 200 LITROS DE CERVEJA! O volume total enchia rigorosamente a bagageira de um Volkswagen Golf de 2020 até ao teto! Somos grandes!" }
];

const SONS_CELEBRACAO = [
  'https://assets.mixkit.co/active_storage/sfx/2070/2070-preview.mp3', 
  'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3', 
  'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3', 
  'https://assets.mixkit.co/active_storage/sfx/131.mp3',               
];

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

function formatarFinos(val: number): string {
  const num = Number(val) || 0;
  return num % 1 === 0 ? num.toString() : num.toFixed(1);
}

export default function Home() {
  const [abaAtiva, setAbaAtiva] = useState<'inicio' | 'ranking' | 'feitos' | 'historico'>('inicio');
  const [toast, setToast] = useState<{msg: string, tipo: 'erro' | 'sucesso'} | null>(null);

  const [modalGregorioOpen, setModalGregorioOpen] = useState(false);
  const [usersExpandidos, setUsersExpandidos] = useState<{ [key: string]: boolean }>({});

  const [perfis, setPerfis] = useState<any[]>([]);
  const [finos, setFinos] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [novoNome, setNovoNome] = useState('');
  const [loading, setLoading] = useState(false);

  const [darkMode, setDarkMode] = useState(false);
  const [tipoBebidaSelecionado, setTipoBebidaSelecionado] = useState<TipoBebidaKey>('fino');
  
  const [abaRanking, setAbaRanking] = useState<'semanal' | 'geral'>('semanal');
  const [mensagemModal, setMensagemModal] = useState<string | null>(null);
  const [fotoExpandida, setFotoExpandida] = useState<string | null>(null);
  const [diasAbertos, setDiasAbertos] = useState<{ [key: string]: boolean }>({});

  const [fighter1, setFighter1] = useState<string>('');
  const [fighter2, setFighter2] = useState<string>('');

  useEffect(() => {
    fetchDados();
    const themeGuardado = localStorage.getItem('finos_theme');
    if (themeGuardado === 'dark') setDarkMode(true);
  }, []);

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

  const inicioSemana = new Date();
  const diaSemana = inicioSemana.getDay() || 7;
  inicioSemana.setHours(0, 0, 0, 0);
  inicioSemana.setDate(inicioSemana.getDate() - diaSemana + 1);

  const finosExibidos = abaRanking === 'semanal' ? finosValidos.filter((f) => new Date(f.data_hora) >= inicioSemana) : finosValidos;
  const totalFinosEq = finosExibidos.reduce((acc, f) => acc + (f.quantidade_equivalente ?? 1), 0);
  const totalFinosGeralEq = finosValidos.reduce((acc, f) => acc + (f.quantidade_equivalente ?? 1), 0);
  const proximoMarco = MARCOS_GRUPO.find(m => m.meta > totalFinosGeralEq);

  let maxFinosDay = { dataPt: '-', total: 0, topUsers: [] as string[], topCount: 0 };
  const finosPorDataStr: { [key: string]: any[] } = {};
  finosValidos.forEach(f => {
    const dStr = new Date(f.data_hora).toLocaleDateString('pt-PT');
    if (!finosPorDataStr[dStr]) finosPorDataStr[dStr] = [];
    finosPorDataStr[dStr].push(f);
  });
  for (const [dataPt, lista] of Object.entries(finosPorDataStr)) {
    const totalDia = lista.reduce((acc, f) => acc + (f.quantidade_equivalente ?? 1), 0);
    if (totalDia > maxFinosDay.total) {
      const contagemDia: { [key: string]: number } = {};
      lista.forEach(f => {
        const nome = f.perfis?.nome || 'Desconhecido';
        contagemDia[nome] = (contagemDia[nome] || 0) + (f.quantidade_equivalente ?? 1);
      });
      let dayMax = 0, topNames: string[] = [];
      for (const [n, c] of Object.entries(contagemDia)) {
        if (c > dayMax) { dayMax = c; topNames = [n]; }
        else if (c === dayMax) topNames.push(n);
      }
      maxFinosDay = { dataPt, total: totalDia, topUsers: topNames, topCount: dayMax };
    }
  }

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
    try {
      setLoading(true);
      const file = e.target.files?.[0];
      let photoUrl = null;

      if (file) {
        const fotoComprimida = await comprimirImagem(file);
        const fileName = `${Date.now()}-${fotoComprimida.name}`;
        const { error: uploadError } = await supabase.storage.from('fotos-finos').upload(fileName, fotoComprimida);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('fotos-finos').getPublicUrl(fileName);
        photoUrl = data.publicUrl;
      }

      const bebidaInfo = TIPOS_BEBIDA[tipoBebidaSelecionado];

      await supabase.from('finos').insert([{ 
        perfil_id: selectedUser, 
        foto_url: photoUrl,
        tipo_bebida: tipoBebidaSelecionado,
        quantidade_equivalente: bebidaInfo.equivalencia
      }]);
      
      dispararCelebracao();
      
      const frasesRandom = isModoFesta ? MENSAGENS_FESTA : MENSAGENS_DIVERTIDAS;
      setMensagemModal(frasesRandom[Math.floor(Math.random() * frasesRandom.length)]);
      
      fetchDados();
    } catch (err) {
      console.error(err);
      mostrarToast('Erro ao guardar o fino. Verifica a net.', 'erro');
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
      mostrarToast('Fizeste mau registado! A tua reputação desceu! 🤮', 'sucesso');
      fetchDados();
    } catch (err) { mostrarToast('Erro ao registar.', 'erro'); } finally { setLoading(false); }
  }

  function abrirModalGregorio() {
    if (!selectedUser) { mostrarToast('Seleciona o teu nome na lista primeiro! 🤮', 'erro'); return; }
    setModalGregorioOpen(true);
  }

  function calcularConquistas(userFinosValidos: any[]) {
    const list: string[] = [];
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
    if (totalEq >= 1) list.push('🌱 Primeiro Fino');
    if (totalEq >= 10) list.push('🥉 10 Finos');
    if (totalEq >= 25) list.push('🥈 25 Finos');
    if (totalEq >= 50) list.push('🥇 50 Finos');
    return list;
  }

  const contagemPorPessoa = perfis
    .map((p) => {
      const userFinosGeral = finos.filter((f) => f.perfil_id === p.id);
      const userFinosValidos = finosValidos.filter((f) => f.perfil_id === p.id);
      const userFinosFiltrados = finosExibidos.filter((f) => f.perfil_id === p.id);
      
      const count = userFinosFiltrados.reduce((acc, f) => acc + (f.quantidade_equivalente ?? 1), 0);
      const gregorios = userFinosGeral.filter(f => f.tipo_bebida === 'gregorio').length;
      const conquistas = calcularConquistas(userFinosValidos);
      return { ...p, count, conquistas, gregorios, userFinosValidos };
    })
    .sort((a, b) => b.count - a.count);

  const maxFinos = contagemPorPessoa[0]?.count || 0;
  const reiDoFino = contagemPorPessoa[0];
  const media = perfis.length > 0 ? (totalFinosEq / perfis.length).toFixed(1) : '0';

  const hojeMs = new Date().setHours(0, 0, 0, 0);
  const ontemMs = hojeMs - 86400000;
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

  const toggleDia = (dia: string) => setDiasAbertos((prev) => ({ ...prev, [dia]: !prev[dia] }));
  const finosPorDiaParaLista = finos.reduce((acc: { [key: string]: any[] }, fino) => {
    const dataStr = new Date(fino.data_hora).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    if (!acc[dataStr]) acc[dataStr] = [];
    acc[dataStr].push(fino);
    return acc;
  }, {});

  const navItems = [
    { id: 'inicio', label: 'Início', icon: '🏠' },
    { id: 'ranking', label: 'Ranking', icon: '📊' },
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
      {/* ESTILOS DE ANIMAÇÃO COMPATÍVEIS COM REACT/NEXT */}
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

        {/* TOAST NOTIFICATIONS */}
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

        {/* CABEÇALHO */}
        <div className="flex justify-between items-center mb-2 pt-2">
          <h1 className={`text-2xl font-extrabold flex items-center gap-2 transition-all ${isModoFesta ? 'text-white drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]' : darkMode ? 'text-amber-400' : 'text-amber-900'}`}>
            {isModoFesta ? 'É SEMPRE A VIRÁ-LOS' : '🍻 Contador'}
          </h1>
          <button
            onClick={toggleDarkMode}
            className={`px-3 py-1.5 rounded-full font-black text-xs transition border flex items-center gap-1.5 shadow-sm ${
              isModoFesta ? 'bg-black/50 text-white border-white/20' 
              : darkMode ? 'bg-slate-900 text-amber-400 border-slate-800' : 'bg-white text-slate-700 border-slate-200'
            }`}
          >
            {darkMode ? '☀️ Claro' : '🌙 Escuro'}
          </button>
        </div>

        {/* FITA DE AVISO CSS (Sem tag marquee para não dar erro no Vercel) */}
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
            <div className="grid grid-cols-2 gap-3">
              <div className={`p-4 rounded-2xl shadow text-center flex flex-col justify-center border transition-colors ${cardClasses}`}>
                <p className={`text-[10px] uppercase font-extrabold tracking-wider ${isModoFesta ? 'text-white/60' : 'text-slate-400'}`}>Total do Grupo</p>
                <p className={`text-3xl font-black leading-tight mt-1 ${isModoFesta ? 'text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]' : 'text-amber-500'}`}>{formatarFinos(totalFinosGeralEq)}</p>
              </div>
              <div className={`p-4 rounded-2xl shadow text-center flex flex-col justify-center border transition-colors ${cardClasses}`}>
                <p className={`text-[10px] uppercase font-extrabold tracking-wider ${isModoFesta ? 'text-white/60' : 'text-slate-400'}`}>Líder 🍾</p>
                <p className="text-xl font-black truncate mt-1 text-inherit">
                  {reiDoFino && reiDoFino.count > 0 ? reiDoFino.nome : '-'}
                </p>
              </div>
            </div>

            <div className={`p-4 rounded-2xl shadow border transition-colors ${cardClasses}`}>
              <label className={`block font-bold mb-2 text-sm ${isModoFesta ? 'text-white' : darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Quem és tu?</label>
              <select
                className={`w-full p-2.5 border rounded-xl font-bold mb-3 outline-none text-sm ${
                  isModoFesta ? 'bg-black/50 border-white/20 text-white' : darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
                value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">-- Seleciona o teu nome --</option>
                {perfis.map((p) => (<option key={p.id} value={p.id}>{p.nome}</option>))}
              </select>
              <div className="flex gap-2">
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
                O que estás a beber?
              </label>
              <div className="grid grid-cols-3 gap-2">
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
                      <span className="text-[10px] uppercase font-bold leading-tight">{key}</span>
                      <span className="text-[9px] opacity-80">({item.equivalencia}x)</span>
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
                  ? 'A guardar... 🍺' 
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

        {/* SEPARADOR 2: RANKING */}
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
                  let statusBadge = '';
                  if (p.count > 0 && p.count === maxFinos) statusBadge = '🍾 Bêbedo';
                  else if (Number(p.count) < Number(media) * 0.5) statusBadge = '🕺 conas';
                  else statusBadge = '🍺 A acompanhar';
                  
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
                        <div>
                          <span className="font-bold">{idx + 1}. {p.nome}</span>
                          <span className="text-xs text-slate-500 font-normal ml-2">{statusBadge}</span>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <span className={`font-black px-3 py-1 rounded-full text-xs border ${isModoFesta ? 'bg-white/20 text-white border-white/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>
                            {formatarFinos(p.count)} finos
                          </span>
                          <span className="text-xs opacity-60">{estaExpandido ? '▲' : '▼'}</span>
                        </div>
                      </div>

                      {(p.conquistas.length > 0 || userCurrentStreak > 1 || p.gregorios > 0) && (
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
                          {p.conquistas.map((badgeText: string, i: number) => (
                            <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold border ${isModoFesta ? 'bg-white/10 text-white border-white/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                              {badgeText}
                            </span>
                          ))}
                        </div>
                      )}

                      {estaExpandido && (
                        <div className="mt-3 pt-3 border-t border-slate-800/50 space-y-3 cursor-default" onClick={(e) => e.stopPropagation()}>
                          <div className="text-xs">
                            <p className="font-bold mb-2 text-amber-500">📸 Galeria Pessoal de {p.nome}</p>
                            {(() => {
                              const fotosUser = finosValidos.filter(f => f.perfil_id === p.id && f.foto_url);
                              if (fotosUser.length === 0) return <p className="text-[11px] text-slate-500 py-1">Sem fotos registadas.</p>;
                              return (
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                  {fotosUser.map(f => (
                                    <div key={f.id} className="relative group cursor-pointer" onClick={() => setFotoExpandida(f.foto_url)}>
                                      <img src={f.foto_url} loading="lazy" className="w-full h-28 object-cover rounded-lg shadow-sm hover:opacity-90 transition" alt="Fino"/>
                                      <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[8px] px-1.5 py-0.5 rounded font-bold backdrop-blur-sm">
                                        {new Date(f.data_hora).toLocaleDateString('pt-PT')}
                                      </div>
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
          </div>
        )}

        {/* SEPARADOR 3: GRANDES FEITOS */}
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
                        <div className={`font-black text-sm mb-1 ${isModoFesta ? 'text-red-400' : 'text-amber-500'}`}>🏆 {marco.meta} Finos Alcançados</div>
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

        {/* SEPARADOR 4: HISTÓRICO E GALERIA */}
        {abaAtiva === 'historico' && (
          <div className="space-y-6">
            <div className={`p-4 rounded-2xl shadow border transition-colors ${cardClasses}`}>
              <h2 className="font-bold text-lg mb-3 border-b pb-2 border-slate-800/50">📅 Fotos e Histórico</h2>
              {Object.keys(finosPorDiaParaLista).length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">Ainda não há finos registados.</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(finosPorDiaParaLista).map(([dia, listaFinos]) => {
                    const estaAberto = !!diasAbertos[dia];
                    const totalDiaEq = listaFinos.filter(f => f.tipo_bebida !== 'gregorio').reduce((acc, f) => acc + (f.quantidade_equivalente ?? 1), 0);
                    
                    return (
                      <div key={dia} className={`border rounded-2xl overflow-hidden ${isModoFesta ? 'border-white/20 bg-black/40' : darkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'}`}>
                        <button onClick={() => toggleDia(dia)} className={`w-full p-3 flex justify-between items-center text-left transition ${isModoFesta ? 'bg-white/5 hover:bg-white/10' : darkMode ? 'bg-slate-900 hover:bg-slate-800' : 'bg-slate-100 hover:bg-slate-200'}`}>
                          <span className="font-bold text-xs capitalize">{dia}</span>
                          <span className={`text-xs border font-black px-2.5 py-0.5 rounded-full ${isModoFesta ? 'bg-white/20 text-white border-white/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>{formatarFinos(totalDiaEq)} finos {estaAberto ? '▲' : '▼'}</span>
                        </button>
                        {estaAberto && (
                          <div className={`p-3 space-y-3 ${isModoFesta ? 'bg-black/20' : darkMode ? 'bg-slate-950' : 'bg-white'}`}>
                            {listaFinos.map((f) => {
                              const isGregorio = f.tipo_bebida === 'gregorio';
                              const bebidaKey = (f.tipo_bebida as TipoBebidaKey) || 'fino';
                              const emojiBebida = isGregorio ? '🤮' : (TIPOS_BEBIDA[bebidaKey]?.emoji || '🍺');
                              
                              return (
                                <div key={f.id} className="border-b border-slate-800/50 pb-2 last:border-0">
                                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                                    <span>
                                      {emojiBebida} <strong className={isModoFesta ? 'text-white' : darkMode ? 'text-slate-200' : 'text-slate-800'}>{f.perfis?.nome || 'Desconhecido'}</strong>
                                      {!isGregorio && <span className="text-[10px] ml-1 opacity-70">({f.quantidade_equivalente ?? 1}x)</span>}
                                      {isGregorio && <span className="text-[10px] ml-1 text-red-400 font-bold opacity-90">(Vomitou)</span>}
                                    </span>
                                    <span className="text-slate-500">{new Date(f.data_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                  {f.foto_url && (
                                    <img src={f.foto_url} alt="Fino" loading="lazy" onClick={() => setFotoExpandida(f.foto_url)} className="w-full h-40 object-cover rounded-xl shadow-sm mt-1 cursor-pointer hover:opacity-90 transition" />
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

        {/* MENU INFERIOR */}
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
                    <span className={`text-[10px] font-bold ${isActive ? 'opacity-100' : 'opacity-70'}`}>{item.label}</span>
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
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
            <div className={`rounded-3xl p-6 text-center max-w-xs shadow-2xl transform transition-all border ${isModoFesta ? 'bg-black border-white text-white shadow-[0_0_50px_rgba(255,255,255,0.8)]' : darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'}`}>
              <div className="text-4xl mb-2">{TIPOS_BEBIDA[tipoBebidaSelecionado].emoji}</div>
              <h3 className={`font-black text-lg mb-2 ${isModoFesta ? 'text-white' : 'text-amber-500'}`}>{isModoFesta ? 'BOOOM!!! 🚀' : 'Registado!'}</h3>
              <p className="text-sm font-semibold mb-6 text-slate-400">{mensagemModal}</p>
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