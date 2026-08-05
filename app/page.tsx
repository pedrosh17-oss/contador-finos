'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// CONFIGURAÇÃO DOS TIPOS DE BEBIDA E EQUIVALÊNCIAS EM FINOS
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

// LISTA DE SONS VARIADOS
const SONS_CELEBRACAO = [
  'https://assets.mixkit.co/active_storage/sfx/2070/2070-preview.mp3', // Pop de Garrafa
  'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3', // Brinde
  'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3', // Buzina / Festejo
  'https://assets.mixkit.co/active_storage/sfx/131.mp3',               // Arroto
];

// ⚡ HELPER PARA COMPRIMIR E REDIMENSIONAR FOTOS NO NAVEGADOR (3 MB -> ~80 KB)
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
          if (width > maxDimensao) {
            height = Math.round((height * maxDimensao) / width);
            width = maxDimensao;
          }
        } else {
          if (height > maxDimensao) {
            width = Math.round((width * maxDimensao) / height);
            height = maxDimensao;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const fotoComprimida = new File(
                [blob], 
                file.name.replace(/\.[^/.]+$/, "") + ".webp", 
                { type: 'image/webp', lastModified: Date.now() }
              );
              resolve(fotoComprimida);
            } else {
              resolve(file);
            }
          },
          'image/webp',
          qualidade
        );
      };
    };
  });
}

// Helper para formatar o valor de finos (ex: 1.5 finos, 2 finos)
function formatarFinos(val: number): string {
  const num = Number(val) || 0;
  return num % 1 === 0 ? num.toString() : num.toFixed(1);
}

export default function Home() {
  const [perfis, setPerfis] = useState<any[]>([]);
  const [finos, setFinos] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [novoNome, setNovoNome] = useState('');
  const [loading, setLoading] = useState(false);

  // Estado do Modo Escuro (Dark Mode)
  const [darkMode, setDarkMode] = useState(false);

  // Estado do Tipo de Bebida Selecionado
  const [tipoBebidaSelecionado, setTipoBebidaSelecionado] = useState<TipoBebidaKey>('fino');
  
  // Estados de UI e Modais
  const [abaRanking, setAbaRanking] = useState<'semanal' | 'geral'>('semanal');
  const [mensagemModal, setMensagemModal] = useState<string | null>(null);
  const [fotoExpandida, setFotoExpandida] = useState<string | null>(null);
  const [diasAbertos, setDiasAbertos] = useState<{ [key: string]: boolean }>({});

  // Estados do 1 v 1 (Comparador)
  const [fighter1, setFighter1] = useState<string>('');
  const [fighter2, setFighter2] = useState<string>('');

  useEffect(() => {
    fetchDados();
    
    // Ler preferência de Dark Mode guardada
    const themeGuardado = localStorage.getItem('finos_theme');
    if (themeGuardado === 'dark') {
      setDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const novo = !prev;
      localStorage.setItem('finos_theme', novo ? 'dark' : 'light');
      return novo;
    });
  };

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
      const somUrl = SONS_CELEBRACAO[Math.floor(Math.random() * SONS_CELEBRACAO.length)];
      const audio = new Audio(somUrl);
      audio.volume = 0.8;
      audio.play().catch((err) => console.log('Áudio bloqueado:', err));
    }
  }

  function dispararCelebracao() {
    tocarSomEVibrar();
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js';
      script.onload = () => {
        const confetti = (window as any).confetti;
        if (!confetti) return;
        confetti({ particleCount: 80, spread: 100, origin: { y: 0.6 }, colors: ['#f59e0b', '#d97706', '#b45309', '#ffffff'] });
        const scalar = 2;
        const beerEmoji = confetti.shapeFromText({ text: '🍺', scalar });
        const bottleEmoji = confetti.shapeFromText({ text: '🍾', scalar });
        confetti({ shapes: [beerEmoji, bottleEmoji], particleCount: 15, scalar, spread: 70, origin: { y: 0.7 } });
      };
      document.body.appendChild(script);
    }
  }

  async function criarPerfil() {
    if (!novoNome) return;
    await supabase.from('perfis').insert([{ nome: novoNome }]);
    setNovoNome('');
    fetchDados();
  }

  async function registarFino(e: React.ChangeEvent<HTMLInputElement>) {
    if (!selectedUser) { alert('Seleciona primeiro quem és!'); return; }
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
      const frase = MENSAGENS_DIVERTIDAS[Math.floor(Math.random() * MENSAGENS_DIVERTIDAS.length)];
      setMensagemModal(frase);
      fetchDados();
    } catch (err) {
      console.error(err);
      alert('Erro ao guardar.');
    } finally {
      setLoading(false);
    }
  }

  function calcularConquistas(userFinos: any[]) {
    const list: string[] = [];
    if (!userFinos || userFinos.length === 0) return list;
    
    if (userFinos.some((f) => { const h = new Date(f.data_hora).getHours(); return h >= 6 && h < 13; })) list.push('🌅 Madrugador');
    if (userFinos.some((f) => { const h = new Date(f.data_hora).getHours(); return h >= 3 && h < 6; })) list.push('🦉 Coruja');
    
    // Regra do Acelerado: soma >= 3.0 finos equivalentes numa janela de 2 horas
    const ord = [...userFinos].sort((a, b) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime());
    for (let i = 0; i < ord.length; i++) {
      let soma = 0;
      const t0 = new Date(ord[i].data_hora).getTime();
      for (let j = i; j < ord.length; j++) {
        const tj = new Date(ord[j].data_hora).getTime();
        if (tj - t0 <= 7200000) { // 2 Horas
          soma += (ord[j].quantidade_equivalente || 1);
        } else {
          break;
        }
      }
      if (soma >= 3.0) {
        list.push('⚡ Acelerado');
        break;
      }
    }

    const totalEq = userFinos.reduce((acc, f) => acc + (f.quantidade_equivalente || 1), 0);
    if (totalEq >= 1) list.push('🌱 Primeiro Fino');
    if (totalEq >= 10) list.push('🥉 10 Finos');
    if (totalEq >= 25) list.push('🥈 25 Finos');
    if (totalEq >= 50) list.push('🥇 50 Finos');
    return list;
  }

  const inicioSemana = new Date();
  const diaSemana = inicioSemana.getDay() || 7;
  inicioSemana.setHours(0, 0, 0, 0);
  inicioSemana.setDate(inicioSemana.getDate() - diaSemana + 1);

  const finosExibidos = abaRanking === 'semanal'
    ? finos.filter((f) => new Date(f.data_hora) >= inicioSemana)
    : finos;

  const totalFinosEq = finosExibidos.reduce((acc, f) => acc + (f.quantidade_equivalente || 1), 0);

  const contagemPorPessoa = perfis
    .map((p) => {
      const userFinosGeral = finos.filter((f) => f.perfil_id === p.id);
      const userFinosFiltrados = finosExibidos.filter((f) => f.perfil_id === p.id);
      const count = userFinosFiltrados.reduce((acc, f) => acc + (f.quantidade_equivalente || 1), 0);
      const conquistas = calcularConquistas(userFinosGeral);
      return { ...p, count, conquistas };
    })
    .sort((a, b) => b.count - a.count);

  const maxFinos = contagemPorPessoa[0]?.count || 0;
  const reiDoFino = contagemPorPessoa[0];
  const media = perfis.length > 0 ? (totalFinosEq / perfis.length).toFixed(1) : '0';

  // --- LÓGICA DE RECORDES DO GRUPO ---
  let maxFinosDay = { dataPt: '-', total: 0, topUsers: [] as string[], topCount: 0 };
  const finosPorDataStr: { [key: string]: any[] } = {};
  finos.forEach(f => {
    const dStr = new Date(f.data_hora).toLocaleDateString('pt-PT');
    if (!finosPorDataStr[dStr]) finosPorDataStr[dStr] = [];
    finosPorDataStr[dStr].push(f);
  });
  for (const [dataPt, lista] of Object.entries(finosPorDataStr)) {
    const totalDia = lista.reduce((acc, f) => acc + (f.quantidade_equivalente || 1), 0);
    if (totalDia > maxFinosDay.total) {
      const contagemDia: { [key: string]: number } = {};
      lista.forEach(f => {
        const nome = f.perfis?.nome || 'Desconhecido';
        contagemDia[nome] = (contagemDia[nome] || 0) + (f.quantidade_equivalente || 1);
      });
      let dayMax = 0, topNames: string[] = [];
      for (const [n, c] of Object.entries(contagemDia)) {
        if (c > dayMax) { dayMax = c; topNames = [n]; }
        else if (c === dayMax) topNames.push(n);
      }
      maxFinosDay = { dataPt, total: totalDia, topUsers: topNames, topCount: dayMax };
    }
  }

  // STREAKS
  const hojeMs = new Date().setHours(0, 0, 0, 0);
  const ontemMs = hojeMs - 86400000;

  const statsStreaks = perfis.map(p => {
    const userFinos = finos.filter(f => f.perfil_id === p.id);
    const diasUnicosMs = Array.from(new Set(userFinos.map(f => new Date(f.data_hora).setHours(0, 0, 0, 0)))).sort((a, b) => a - b);

    let maxS = 0, curS = 0, tempS = 0;
    let lastMs: number | null = null;

    diasUnicosMs.forEach(diaMs => {
      if (lastMs === null) {
        tempS = 1;
      } else {
        const diffDays = Math.round((diaMs - lastMs) / 86400000);
        if (diffDays === 1) tempS++;
        else if (diffDays > 1) tempS = 1;
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

  const overallMaxStreakVal = statsStreaks.length > 0 ? Math.max(...statsStreaks.map(s => s.maxStreak), 0) : 0;
  const overallCurrentStreakVal = statsStreaks.length > 0 ? Math.max(...statsStreaks.map(s => s.currentStreak), 0) : 0;

  const topMaxStreakUsers = statsStreaks.filter(s => s.maxStreak === overallMaxStreakVal && overallMaxStreakVal > 1).map(s => s.nome);
  const topCurrentStreakUsers = statsStreaks.filter(s => s.currentStreak === overallCurrentStreakVal && overallCurrentStreakVal > 1).map(s => s.nome);

  // --- ESTATÍSTICAS AVANÇADAS (GRÁFICOS E RITMO) ---
  const horasCount = { 'Madrugada': 0, 'Manhã': 0, 'Tarde': 0, 'Noite': 0 };
  const diasSemanaCount = [0, 0, 0, 0, 0, 0, 0];
  const nomesDias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  finos.forEach(f => {
    const data = new Date(f.data_hora);
    const h = data.getHours();
    const val = f.quantidade_equivalente || 1;

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
    const pFinos = finos.filter(f => f.perfil_id === p.id).sort((a, b) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime());
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
        if (diffMs < 6 * 3600000) {
          totalDiff += diffMs; countDiff++;
        }
      }
    });
    if (countDiff > 0) ritmoUsers.push({ id: p.id, nome: p.nome, paceMin: Math.round((totalDiff / countDiff) / 60000) });
  });
  ritmoUsers.sort((a, b) => a.paceMin - b.paceMin);
  const fastestUser = ritmoUsers.length > 0 ? ritmoUsers[0] : null;

  // --- LÓGICA DO 1 V 1 (FRENTE-A-FRENTE) ---
  function getFighterStats(id: string) {
    const pCount = contagemPorPessoa.find(p => p.id === id)?.count || 0;
    const pStreak = statsStreaks.find(s => s.id === id)?.maxStreak || 0;
    const pRitmo = ritmoUsers.find(r => r.id === id)?.paceMin || Infinity;
    return { count: pCount, streak: pStreak, ritmo: pRitmo };
  }

  const f1Stats = fighter1 ? getFighterStats(fighter1) : null;
  const f2Stats = fighter2 ? getFighterStats(fighter2) : null;

  // AGRUPAMENTO PARA HISTÓRICO
  const toggleDia = (dia: string) => setDiasAbertos((prev) => ({ ...prev, [dia]: !prev[dia] }));
  const finosPorDiaParaLista = finos.reduce((acc: { [key: string]: any[] }, fino) => {
    const dataStr = new Date(fino.data_hora).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    if (!acc[dataStr]) acc[dataStr] = [];
    acc[dataStr].push(fino);
    return acc;
  }, {});

  return (
    <main className={`min-h-screen p-4 max-w-md mx-auto font-sans pb-12 relative transition-colors ${
      darkMode ? 'bg-slate-950 text-slate-100' : 'bg-amber-50 text-slate-900'
    }`}>
      
      {/* BOTÃO MODO ESCURO (TOP BAR) */}
      <div className="flex justify-between items-center mb-2 pt-2">
        <div></div>
        <button
          onClick={toggleDarkMode}
          className={`px-3 py-1.5 rounded-full font-black text-xs transition border flex items-center gap-1.5 shadow-sm ${
            darkMode 
              ? 'bg-slate-900 text-amber-400 border-slate-800 hover:bg-slate-800' 
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          {darkMode ? '☀️ Modo Claro' : '🌙 Modo Escuro'}
        </button>
      </div>

      <h1 className={`text-3xl font-extrabold text-center mb-4 ${
        darkMode ? 'text-amber-400' : 'text-amber-900'
      }`}>
        🍻 Contador de Finos
      </h1>

      {/* REGISTO / PERFIL */}
      <div className={`p-4 rounded-2xl shadow mb-6 border transition-colors ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
      }`}>
        <label className={`block font-bold mb-2 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Quem és tu?</label>
        <select
          className={`w-full p-2.5 border rounded-xl font-bold mb-3 outline-none text-sm ${
            darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
        >
          <option value="">-- Seleciona o teu nome --</option>
          {perfis.map((p) => (<option key={p.id} value={p.id}>{p.nome}</option>))}
        </select>

        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Novo amigo..." 
            className={`flex-1 p-2 border rounded-xl text-sm outline-none font-bold ${
              darkMode ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600' : 'bg-white border-slate-200 text-slate-800'
            }`} 
            value={novoNome} 
            onChange={(e) => setNovoNome(e.target.value)} 
          />
          <button onClick={criarPerfil} className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-xl text-sm font-black transition">+ Criar</button>
        </div>
      </div>

      {/* SELEÇÃO DO TIPO DE BEBIDA */}
      <div className="mb-4">
        <label className={`block font-extrabold text-xs uppercase tracking-wider mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          O que estás a beber?
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(TIPOS_BEBIDA) as TipoBebidaKey[]).map((key) => {
            const item = TIPOS_BEBIDA[key];
            const isSelected = tipoBebidaSelecionado === key;

            return (
              <button
                key={key}
                onClick={() => setTipoBebidaSelecionado(key)}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-lg scale-105'
                    : darkMode
                      ? 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
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

      {/* BOTÃO PRINCIPAL +1 BEBIDA */}
      <div className="text-center mb-6">
        <label className={`inline-block w-full py-6 rounded-2xl font-black text-2xl text-slate-950 shadow-xl cursor-pointer transition transform active:scale-95 ${
          selectedUser ? 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/20' : 'bg-slate-700 text-slate-500 cursor-not-allowed'
        }`}>
          {loading ? 'A comprimir & guardar... 🍺' : `${TIPOS_BEBIDA[tipoBebidaSelecionado].emoji} +1 ${tipoBebidaSelecionado.toUpperCase()}`}
          <input type="file" accept="image/*" capture="environment" className="hidden" disabled={!selectedUser || loading} onChange={registarFino} />
        </label>
        {!selectedUser && <p className="text-xs text-red-500 mt-2 font-semibold">Seleciona o teu nome acima para poder registar.</p>}
      </div>

      {/* PAINEL DE CONTAS & TOTAIS */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className={`p-4 rounded-2xl shadow text-center flex flex-col justify-center border transition-colors ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
        }`}>
          <p className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Total do Grupo</p>
          <p className="text-2xl font-black text-amber-500 leading-tight mt-1">{formatarFinos(totalFinosEq)}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">finos equivalentes</p>
        </div>
        <div className={`p-4 rounded-2xl shadow text-center flex flex-col justify-center border transition-colors ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
        }`}>
          <p className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Líder 🍾</p>
          <p className="text-lg font-black text-slate-200 truncate mt-1">
            {reiDoFino && reiDoFino.count > 0 ? reiDoFino.nome : '-'}
          </p>
          <p className="text-xs font-bold text-amber-500 mt-0.5">
            {reiDoFino && reiDoFino.count > 0 ? `${formatarFinos(reiDoFino.count)} finos` : '0 finos'}
          </p>
        </div>
      </div>

      {/* RECORDES DO GRUPO */}
      {maxFinosDay.total > 0 && (
        <div className={`p-4 rounded-2xl shadow mb-6 border transition-colors ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
        }`}>
          <h2 className="font-bold text-lg mb-3 border-b pb-2 border-slate-800/50">🏆 Recordes</h2>
          <div className="space-y-3">
            {overallCurrentStreakVal > 1 && (
              <div className={`flex items-center text-sm p-3 rounded-xl border ${
                darkMode ? 'bg-amber-950/30 border-amber-500/30 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <div className="text-3xl mr-3">🔥</div>
                <div>
                  <p className="font-black">Streak Atual</p>
                  <p className="text-xs leading-tight opacity-90">
                    <strong>{topCurrentStreakUsers.join(', ')}</strong> {topCurrentStreakUsers.length > 1 ? 'estão' : 'está'} a beber há <span className="font-black">{overallCurrentStreakVal} dias</span> seguidos!
                  </p>
                </div>
              </div>
            )}
            {overallMaxStreakVal > 1 && (
              <div className={`flex items-center text-sm p-3 rounded-xl border ${
                darkMode ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                <div className="text-3xl mr-3">👑</div>
                <div>
                  <p className="font-bold">Maior Streak</p>
                  <p className="text-xs leading-tight opacity-80 mt-0.5">
                    O recorde de <span className="font-black text-amber-500">{overallMaxStreakVal} dias</span> seguidos a beber é mantido por <strong>{topMaxStreakUsers.join(', ')}</strong>.
                  </p>
                </div>
              </div>
            )}
            <div className={`flex items-center text-sm p-3 rounded-xl border ${
              darkMode ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}>
              <div className="text-3xl mr-3">📅</div>
              <div>
                <p className="font-bold">O dia {maxFinosDay.dataPt} foi uma putaria</p>
                <p className="text-xs leading-tight opacity-80 mt-1">
                  Beberam-se <span className="font-black text-amber-500">{formatarFinos(maxFinosDay.total)} finos</span> no total.<br/>
                  <span className="text-[10px] uppercase font-bold text-slate-500 mt-1 block">Culpados: {maxFinosDay.topUsers.join(', ')} ({formatarFinos(maxFinosDay.topCount)} finos)</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECÇÃO: ESTATÍSTICAS AVANÇADAS */}
      {finos.length > 0 && (
        <div className={`p-4 rounded-2xl shadow mb-6 border transition-colors ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
        }`}>
          <h2 className="font-bold text-lg mb-4 border-b pb-2 border-slate-800/50">📈 Estatísticas</h2>
          
          {/* Ritmo Médio */}
          {fastestUser && (
            <div className={`mb-5 flex items-center p-3 rounded-xl border ${
              darkMode ? 'bg-sky-950/30 border-sky-500/30 text-sky-300' : 'bg-blue-50 border-blue-100 text-blue-900'
            }`}>
              <div className="text-2xl mr-3">⏱️</div>
              <div>
                <p className="font-bold text-sm">O mais acelerado</p>
                <p className="text-xs opacity-90 mt-0.5">
                  <strong className="font-black">{fastestUser.nome}</strong> bebe, em média, 1 fino a cada <strong className="font-black">{fastestUser.paceMin} minutos</strong>.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Gráfico Dias da Semana */}
            <div>
               <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Dias mais fortes</h3>
               <div className="space-y-1.5">
                  {diasSemanaCount.map((count, i) => (
                      <div key={i} className="flex items-center text-[9px]">
                          <span className="w-5 font-bold text-slate-500">{nomesDias[i]}</span>
                          <div className={`flex-1 h-2.5 rounded-full ml-1 overflow-hidden ${darkMode ? 'bg-slate-950' : 'bg-slate-100'}`}>
                              <div className="h-full bg-amber-500 rounded-full" style={{width: `${(count/maxDiaCount)*100}%`}}></div>
                          </div>
                          <span className="w-4 text-right font-bold ml-1">{formatarFinos(count)}</span>
                      </div>
                  ))}
              </div>
            </div>

            {/* Gráfico Horas de Ponta */}
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Horas de Ponta</h3>
              <div className={`flex items-end h-28 gap-1.5 p-2 rounded-xl border ${
                darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                  {Object.entries(horasCount).map(([label, count]) => {
                      const isZero = count === 0;
                      return (
                          <div key={label} className="flex-1 flex flex-col items-center justify-end h-full">
                              <span className="text-[9px] font-bold text-amber-500 mb-1">{isZero ? '' : formatarFinos(count)}</span>
                              <div className={`w-full ${isZero ? 'bg-slate-800' : 'bg-amber-400'} rounded-t-sm transition-all`} style={{height: isZero ? '2px' : `${(count/maxHoraCount)*100}%`, minHeight: '2px'}}></div>
                              <span className="text-[8px] text-slate-500 mt-1 truncate w-full text-center">{label}</span>
                          </div>
                      );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ⚔️ FRENTE-A-FRENTE (1v1) ⚔️ */}
      {perfis.length >= 2 && finos.length > 0 && (
        <div className={`p-4 rounded-2xl shadow mb-6 border transition-colors ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
        }`}>
          <h2 className="font-bold text-lg mb-3 border-b pb-2 border-slate-800/50 flex items-center gap-2">
            ⚔️ Frente-a-Frente
          </h2>
          
          <div className="flex gap-2 items-center mb-4">
            <select 
              className={`flex-1 p-2 border rounded-xl text-xs font-bold outline-none ${
                darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`} 
              value={fighter1} 
              onChange={(e) => setFighter1(e.target.value)}
            >
              <option value="">Desafiante 1</option>
              {perfis.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
            <span className="font-black text-slate-500 text-sm">VS</span>
            <select 
              className={`flex-1 p-2 border rounded-xl text-xs font-bold outline-none ${
                darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`} 
              value={fighter2} 
              onChange={(e) => setFighter2(e.target.value)}
            >
              <option value="">Desafiante 2</option>
              {perfis.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </div>

          {fighter1 && fighter2 && fighter1 !== fighter2 && f1Stats && f2Stats ? (
            <div className={`border rounded-xl p-3 space-y-3 ${
              darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              
              {/* Finos */}
              <div className="flex justify-between items-center border-b border-slate-800/50 pb-2">
                <span className={`w-1/3 text-left font-black text-lg ${f1Stats.count > f2Stats.count ? 'text-amber-500' : 'text-slate-500'}`}>{formatarFinos(f1Stats.count)}</span>
                <span className="w-1/3 text-center text-[9px] uppercase font-bold text-slate-500">Total Finos</span>
                <span className={`w-1/3 text-right font-black text-lg ${f2Stats.count > f1Stats.count ? 'text-amber-500' : 'text-slate-500'}`}>{formatarFinos(f2Stats.count)}</span>
              </div>

              {/* Maior Streak */}
              <div className="flex justify-between items-center border-b border-slate-800/50 pb-2">
                <span className={`w-1/3 text-left font-bold text-sm ${f1Stats.streak > f2Stats.streak ? 'text-amber-500' : 'text-slate-500'}`}>{f1Stats.streak} dias</span>
                <span className="w-1/3 text-center text-[9px] uppercase font-bold text-slate-500">Maior Streak</span>
                <span className={`w-1/3 text-right font-bold text-sm ${f2Stats.streak > f1Stats.streak ? 'text-amber-500' : 'text-slate-500'}`}>{f2Stats.streak} dias</span>
              </div>

              {/* Ritmo */}
              <div className="flex justify-between items-center">
                <span className={`w-1/3 text-left font-bold text-sm ${f1Stats.ritmo < f2Stats.ritmo ? 'text-sky-400' : 'text-slate-500'}`}>
                  {f1Stats.ritmo === Infinity ? '-' : `${f1Stats.ritmo} min`}
                </span>
                <span className="w-1/3 text-center text-[9px] uppercase font-bold text-slate-500">Ritmo (T/Fino)</span>
                <span className={`w-1/3 text-right font-bold text-sm ${f2Stats.ritmo < f1Stats.ritmo ? 'text-sky-400' : 'text-slate-500'}`}>
                  {f2Stats.ritmo === Infinity ? '-' : `${f2Stats.ritmo} min`}
                </span>
              </div>

            </div>
          ) : (
            fighter1 === fighter2 && fighter1 !== '' && (
              <p className="text-xs text-center font-bold text-red-400 bg-red-500/10 p-2 rounded-xl border border-red-500/20">
                Escolhe duas pessoas diferentes para a batalha!
              </p>
            )
          )}
        </div>
      )}

      {/* RANKING */}
      <div className={`p-4 rounded-2xl shadow mb-6 border transition-colors ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
      }`}>
        <div className="flex justify-between items-center mb-3 border-b pb-2 border-slate-800/50">
          <h2 className="font-bold text-lg">📊 Ranking</h2>
          <div className={`flex p-1 rounded-xl text-xs font-bold ${darkMode ? 'bg-slate-950' : 'bg-slate-100'}`}>
            <button onClick={() => setAbaRanking('semanal')} className={`px-2.5 py-1 rounded-lg transition ${abaRanking === 'semanal' ? 'bg-amber-500 text-slate-950 font-black shadow' : 'text-slate-400'}`}>Semanal</button>
            <button onClick={() => setAbaRanking('geral')} className={`px-2.5 py-1 rounded-lg transition ${abaRanking === 'geral' ? 'bg-amber-500 text-slate-950 font-black shadow' : 'text-slate-400'}`}>Geral</button>
          </div>
        </div>
        <p className="text-xs text-slate-400 mb-3">Média do grupo: <span className="font-bold text-amber-500">{media} finos</span></p>

        <div className="space-y-4">
          {contagemPorPessoa.map((p, idx) => {
            let statusBadge = '';
            if (p.count > 0 && p.count === maxFinos) statusBadge = '🍾 Bêbedo';
            else if (Number(p.count) < Number(media) * 0.5) statusBadge = '🕺 conas';
            else statusBadge = '🍺 A acompanhar';

            const streakData = statsStreaks.find(s => s.id === p.id);
            const userCurrentStreak = streakData?.currentStreak || 0;

            return (
              <div key={p.id} className="border-b pb-2 border-slate-800/50 last:border-0">
                <div className="flex justify-between items-center text-sm">
                  <div>
                    <span className="font-bold">{idx + 1}. {p.nome}</span>
                    <span className="text-xs text-slate-500 font-normal ml-2">{statusBadge}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-xs">
                      {formatarFinos(p.count)} finos
                    </span>
                  </div>
                </div>

                {(p.conquistas.length > 0 || userCurrentStreak > 1) && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {userCurrentStreak > 1 && (
                      <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] px-1.5 py-0.5 rounded-md font-bold">
                        🔥 {userCurrentStreak} Dias Seguidos
                      </span>
                    )}
                    {p.conquistas.map((badgeText: string, i: number) => (
                      <span key={i} className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] px-1.5 py-0.5 rounded-md font-bold">
                        {badgeText}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* HISTÓRICO E GALERIA */}
      <div className={`p-4 rounded-2xl shadow border transition-colors ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
      }`}>
        <h2 className="font-bold text-lg mb-3 border-b pb-2 border-slate-800/50">📅 Histórico & Fotos por Dia</h2>
        {Object.keys(finosPorDiaParaLista).length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">Ainda não há finos registados.</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(finosPorDiaParaLista).map(([dia, listaFinos]) => {
              const estaAberto = !!diasAbertos[dia];
              const totalDiaEq = listaFinos.reduce((acc, f) => acc + (f.quantidade_equivalente || 1), 0);

              return (
                <div key={dia} className={`border rounded-2xl overflow-hidden ${
                  darkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'
                }`}>
                  <button onClick={() => toggleDia(dia)} className={`w-full p-3 flex justify-between items-center text-left transition ${
                    darkMode ? 'bg-slate-900 hover:bg-slate-800' : 'bg-slate-100 hover:bg-slate-200'
                  }`}>
                    <span className="font-bold text-xs capitalize">{dia}</span>
                    <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 font-black px-2.5 py-0.5 rounded-full">
                      {formatarFinos(totalDiaEq)} finos {estaAberto ? '▲' : '▼'}
                    </span>
                  </button>
                  {estaAberto && (
                    <div className={`p-3 space-y-3 ${darkMode ? 'bg-slate-950' : 'bg-white'}`}>
                      {listaFinos.map((f) => {
                        const bebidaKey = (f.tipo_bebida as TipoBebidaKey) || 'fino';
                        const emojiBebida = TIPOS_BEBIDA[bebidaKey]?.emoji || '🍺';

                        return (
                          <div key={f.id} className="border-b border-slate-800/50 pb-2 last:border-0">
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                              <span>
                                {emojiBebida} <strong className={darkMode ? 'text-slate-200' : 'text-slate-800'}>{f.perfis?.nome || 'Desconhecido'}</strong>
                                <span className="text-[10px] ml-1 opacity-70">({f.quantidade_equivalente || 1}x)</span>
                              </span>
                              <span className="text-slate-500">{new Date(f.data_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            {f.foto_url && (
                              <img src={f.foto_url} alt="Fino" onClick={() => setFotoExpandida(f.foto_url)} className="w-full h-40 object-cover rounded-xl shadow-sm mt-1 cursor-pointer hover:opacity-90 transition" />
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

      {/* MODAL MENSAGEM */}
      {mensagemModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`rounded-3xl p-6 text-center max-w-xs shadow-2xl transform transition-all border ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
          }`}>
            <div className="text-4xl mb-2">{TIPOS_BEBIDA[tipoBebidaSelecionado].emoji}</div>
            <h3 className="font-black text-amber-500 text-lg mb-2">Registado!</h3>
            <p className="text-sm font-semibold mb-6 text-slate-400">{mensagemModal}</p>
            <button onClick={() => setMensagemModal(null)} className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl shadow transition active:scale-95">
              Siga fiii! 🍻
            </button>
          </div>
        </div>
      )}

      {/* MODAL FOTO ECRÃ INTEIRO */}
      {fotoExpandida && (
        <div onClick={() => setFotoExpandida(null)} className="fixed inset-0 bg-black/90 flex items-center justify-center p-2 z-50 cursor-pointer">
          <img src={fotoExpandida} alt="Foto em destaque" className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain" />
        </div>
      )}
    </main>
  );
}