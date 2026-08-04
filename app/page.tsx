'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const PRECO_FINO = 1.50; // Preço padrão por fino

const MENSAGENS_DIVERTIDAS = [
  'Mais próximo da cirrose! 🚑',
  'Tinhas comprado 10 pães com este fino! 🥖',
  'Lá se vai a dieta... 🥗📉',
  'O teu fígado mandou-te para o caralho! 🏳️',
  'O grupo agradece o teu esforço! 🇵🇹🍻',
  'Amanhã vai doer🧟‍♂️',
  'O rim está aqui é para trabalhar. Por isso tenho 2 💛',
];

export default function Home() {
  const [perfis, setPerfis] = useState<any[]>([]);
  const [finos, setFinos] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [novoNome, setNovoNome] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Novos Estados
  const [abaRanking, setAbaRanking] = useState<'semanal' | 'geral'>('semanal');
  const [mensagemModal, setMensagemModal] = useState<string | null>(null);
  const [fotoExpandida, setFotoExpandida] = useState<string | null>(null);
  const [diasAbertos, setDiasAbertos] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchDados();
  }, []);

  async function fetchDados() {
    const { data: dataPerfis } = await supabase.from('perfis').select('*');
    const { data: dataFinos } = await supabase
      .from('finos')
      .select('*, perfis(nome)')
      .order('data_hora', { ascending: false });

    if (dataPerfis) setPerfis(dataPerfis);
    if (dataFinos) {
      setFinos(dataFinos);
      // Abrir o dia mais recente por defeito
      if (dataFinos.length > 0) {
        const primeiroDia = new Date(dataFinos[0].data_hora).toLocaleDateString('pt-PT');
        setDiasAbertos((prev) => ({ ...prev, [primeiroDia]: true }));
      }
    }
  }

  function dispararConfeti() {
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js';
      script.onload = () => {
        (window as any).confetti?.({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
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
    if (!selectedUser) {
      alert('Seleciona primeiro quem és!');
      return;
    }

    try {
      setLoading(true);
      const file = e.target.files?.[0];
      let photoUrl = null;

      if (file) {
        const fileName = `${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('fotos-finos')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('fotos-finos')
          .getPublicUrl(fileName);
        photoUrl = data.publicUrl;
      }

      await supabase
        .from('finos')
        .insert([{ perfil_id: selectedUser, foto_url: photoUrl }]);

      // Celebração e Frase Aleatória
      dispararConfeti();
      const frase = MENSAGENS_DIVERTIDAS[Math.floor(Math.random() * MENSAGENS_DIVERTIDAS.length)];
      setMensagemModal(frase);

      fetchDados();
    } catch (err) {
      console.error(err);
      alert('Erro ao guardar o fino.');
    } finally {
      setLoading(false);
    }
  }

  // CÁLCULO DE BADGES CUMULATIVOS
  function calcularConquistas(userFinos: any[]) {
    const list: string[] = [];
    if (!userFinos || userFinos.length === 0) return list;

    // 🌅 Madrugador (06h - 13h)
    if (userFinos.some((f) => { const h = new Date(f.data_hora).getHours(); return h >= 6 && h < 13; })) {
      list.push('🌅 Madrugador');
    }
    // 🦉 Coruja (03h - 06h)
    if (userFinos.some((f) => { const h = new Date(f.data_hora).getHours(); return h >= 3 && h < 6; })) {
      list.push('🦉 Coruja');
    }
    // ⚡ Acelerado (3 finos em < 1h)
    const ord = [...userFinos].sort((a, b) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime());
    for (let i = 0; i < ord.length - 2; i++) {
      const t1 = new Date(ord[i].data_hora).getTime();
      const t3 = new Date(ord[i + 2].data_hora).getTime();
      if (t3 - t1 <= 60 * 60 * 1000) {
        list.push('⚡ Acelerado');
        break;
      }
    }
    // Níveis
    if (userFinos.length >= 1) list.push('🌱 Primeiro Fino');
    if (userFinos.length >= 10) list.push('🥉 10 Finos');
    if (userFinos.length >= 25) list.push('🥈 25 Finos');
    if (userFinos.length >= 50) list.push('🥇 50 Finos');

    return list;
  }

  // CÁLCULO DE DATAS E FILTROS
  const inicioSemana = new Date();
  const diaSemana = inicioSemana.getDay() || 7;
  inicioSemana.setHours(0, 0, 0, 0);
  inicioSemana.setDate(inicioSemana.getDate() - diaSemana + 1);

  const finosExibidos = abaRanking === 'semanal'
    ? finos.filter((f) => new Date(f.data_hora) >= inicioSemana)
    : finos;

  const totalFinos = finosExibidos.length;
  const gastoTotal = totalFinos * PRECO_FINO;

  const contagemPorPessoa = perfis
    .map((p) => {
      const userFinosGeral = finos.filter((f) => f.perfil_id === p.id);
      const userFinosFiltrados = finosExibidos.filter((f) => f.perfil_id === p.id);
      const count = userFinosFiltrados.length;
      const conquistas = calcularConquistas(userFinosGeral);

      return { ...p, count, conquistas };
    })
    .sort((a, b) => b.count - a.count);

  const maxFinos = contagemPorPessoa[0]?.count || 0;
  const reiDoFino = contagemPorPessoa[0];
  const media = perfis.length > 0 ? (totalFinos / perfis.length).toFixed(1) : '0';

  // --- LÓGICA DE RECORDES DO GRUPO ---
  
  // 1. O DIA MAIS ÉPICO / PUTARIA
  let maxFinosDay = { dataPt: '-', total: 0, topUsers: [] as string[], topCount: 0 };
  
  const finosPorDataStr: { [key: string]: any[] } = {};
  finos.forEach(f => {
    const dStr = new Date(f.data_hora).toLocaleDateString('pt-PT');
    if (!finosPorDataStr[dStr]) finosPorDataStr[dStr] = [];
    finosPorDataStr[dStr].push(f);
  });

  for (const [dataPt, lista] of Object.entries(finosPorDataStr)) {
    if (lista.length > maxFinosDay.total) {
      const contagemDia: { [key: string]: number } = {};
      lista.forEach(f => {
        const nome = f.perfis?.nome || 'Desconhecido';
        contagemDia[nome] = (contagemDia[nome] || 0) + 1;
      });
      let dayMax = 0;
      let topNames: string[] = [];
      for (const [n, c] of Object.entries(contagemDia)) {
        if (c > dayMax) { dayMax = c; topNames = [n]; }
        else if (c === dayMax) { topNames.push(n); }
      }
      maxFinosDay = { dataPt, total: lista.length, topUsers: topNames, topCount: dayMax };
    }
  }

  // 2. STREAKS
  const hojeMs = new Date().setHours(0, 0, 0, 0);
  const ontemMs = hojeMs - 86400000;

  const statsStreaks = perfis.map(p => {
    const userFinos = finos.filter(f => f.perfil_id === p.id);
    const diasUnicosMs = Array.from(new Set(userFinos.map(f => new Date(f.data_hora).setHours(0, 0, 0, 0)))).sort((a, b) => a - b);

    let maxS = 0;
    let curS = 0;
    let tempS = 0;
    let lastMs: number | null = null;

    diasUnicosMs.forEach(diaMs => {
      if (lastMs === null) {
        tempS = 1;
      } else {
        const diffDays = Math.round((diaMs - lastMs) / 86400000);
        if (diffDays === 1) {
          tempS++;
        } else if (diffDays > 1) {
          tempS = 1;
        }
      }
      if (tempS > maxS) maxS = tempS;
      lastMs = diaMs;
    });

    if (diasUnicosMs.length > 0) {
      const lastDayMs = diasUnicosMs[diasUnicosMs.length - 1];
      if (lastDayMs === hojeMs || lastDayMs === ontemMs) {
        curS = tempS;
      } else {
        curS = 0;
      }
    }

    return { id: p.id, nome: p.nome, maxStreak: maxS, currentStreak: curS };
  });

  const overallMaxStreakVal = statsStreaks.length > 0 ? Math.max(...statsStreaks.map(s => s.maxStreak), 0) : 0;
  const overallCurrentStreakVal = statsStreaks.length > 0 ? Math.max(...statsStreaks.map(s => s.currentStreak), 0) : 0;

  const topMaxStreakUsers = statsStreaks.filter(s => s.maxStreak === overallMaxStreakVal && overallMaxStreakVal > 1).map(s => s.nome);
  const topCurrentStreakUsers = statsStreaks.filter(s => s.currentStreak === overallCurrentStreakVal && overallCurrentStreakVal > 1).map(s => s.nome);

  // AGRUPAMENTO PARA HISTÓRICO DE DIAS
  const toggleDia = (dia: string) => {
    setDiasAbertos((prev) => ({ ...prev, [dia]: !prev[dia] }));
  };
  const finosPorDiaParaLista = finos.reduce((acc: { [key: string]: any[] }, fino) => {
    const dataStr = new Date(fino.data_hora).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    if (!acc[dataStr]) acc[dataStr] = [];
    acc[dataStr].push(fino);
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-amber-50 text-slate-900 p-4 max-w-md mx-auto font-sans pb-12 relative">
      <h1 className="text-3xl font-extrabold text-center text-amber-900 mb-2">
        🍻 Contador de Finos
      </h1>

      {/* REGISTO / PERFIL */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <label className="block font-bold mb-2 text-sm text-slate-700">
          Quem és tu?
        </label>
        <select
          className="w-full p-2 border rounded-lg bg-slate-50 mb-3"
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
        >
          <option value="">-- Seleciona o teu nome --</option>
          {perfis.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Novo amigo..."
            className="flex-1 p-2 border rounded-lg text-sm"
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
          />
          <button
            onClick={criarPerfil}
            className="bg-amber-800 text-white px-3 py-2 rounded-lg text-sm font-bold"
          >
            + Criar
          </button>
        </div>
      </div>

      {/* BOTÃO PRINCIPAL +1 FINO */}
      <div className="text-center mb-6">
        <label
          className={`inline-block w-full py-6 rounded-2xl font-black text-2xl text-white shadow-xl cursor-pointer transition transform active:scale-95 ${
            selectedUser
              ? 'bg-amber-500 hover:bg-amber-600'
              : 'bg-slate-400 cursor-not-allowed'
          }`}
        >
          {loading ? 'A guardar... 🍺' : '🍺 +1 FINO'}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            disabled={!selectedUser || loading}
            onChange={registarFino}
          />
        </label>
        {!selectedUser && (
          <p className="text-xs text-red-500 mt-2 font-semibold">
            Seleciona o teu nome acima para poder registar.
          </p>
        )}
      </div>

      {/* PAINEL DE CONTAS & TOTAIS */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white p-3 rounded-xl shadow text-center">
          <p className="text-xs text-slate-500 uppercase font-bold">
            Total do Grupo
          </p>
          <p className="text-2xl font-black text-amber-600">{totalFinos} finos</p>
          <p className="text-xs text-slate-400 mt-1">({gastoTotal.toFixed(2)}€ gasto)</p>
        </div>
        <div className="bg-white p-3 rounded-xl shadow text-center">
          <p className="text-xs text-slate-500 uppercase font-bold">
            Líder 🍾
          </p>
          <p className="text-lg font-bold text-slate-800 truncate">
            {reiDoFino && reiDoFino.count > 0 ? reiDoFino.nome : '-'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {reiDoFino && reiDoFino.count > 0 ? `${(reiDoFino.count * PRECO_FINO).toFixed(2)}€` : '0.00€'}
          </p>
        </div>
      </div>

      {/* RECORDES DO GRUPO (STREAKS E DIA ÉPICO) */}
      {maxFinosDay.total > 0 && (
        <div className="bg-white p-4 rounded-xl shadow mb-6">
          <h2 className="font-bold text-lg mb-3 text-slate-800 border-b pb-1">
            🏆 Recordes
          </h2>
          <div className="space-y-3">
            
            {/* Streak em Vigor */}
            {overallCurrentStreakVal > 1 && (
              <div className="flex items-center text-sm bg-amber-50 p-3 rounded-lg border border-amber-200">
                <div className="text-3xl mr-3">🔥</div>
                <div>
                  <p className="font-black text-amber-900">Streak Atual</p>
                  <p className="text-xs text-amber-800 leading-tight">
                    <strong className="text-amber-600">{topCurrentStreakUsers.join(', ')}</strong> {topCurrentStreakUsers.length > 1 ? 'estão' : 'está'} a beber há <span className="font-bold">{overallCurrentStreakVal} dias</span> seguidos!
                  </p>
                </div>
              </div>
            )}

            {/* Maior Streak All Time */}
            {overallMaxStreakVal > 1 && (
              <div className="flex items-center text-sm bg-slate-50 p-3 rounded-lg border">
                <div className="text-3xl mr-3">👑</div>
                <div>
                  <p className="font-bold text-slate-800">Maior Streak</p>
                  <p className="text-xs text-slate-500 leading-tight">
                    O recorde de <span className="font-bold text-amber-600">{overallMaxStreakVal} dias</span> seguidos a beber é mantido por <strong className="text-slate-700">{topMaxStreakUsers.join(', ')}</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* Dia Mais Épico - Reformulado */}
            <div className="flex items-center text-sm bg-slate-50 p-3 rounded-lg border">
              <div className="text-3xl mr-3">📅</div>
              <div>
                <p className="font-bold text-slate-800">O dia {maxFinosDay.dataPt} foi uma putaria</p>
                <p className="text-xs text-slate-500 leading-tight mt-1">
                  Beberam-se <span className="font-bold text-amber-600">{maxFinosDay.total} finos</span> no total.<br/>
                  <span className="text-[10px] uppercase font-bold text-slate-400 mt-1 block">
                    Culpados do dia: {maxFinosDay.topUsers.join(', ')} ({maxFinosDay.topCount} finos)
                  </span>
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SECTOR DE RANKING */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <div className="flex justify-between items-center mb-3 border-b pb-2">
          <h2 className="font-bold text-lg text-slate-800">📊 Ranking</h2>
          
          {/* TOGGLE SEMANAL / GERAL */}
          <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-bold">
            <button
              onClick={() => setAbaRanking('semanal')}
              className={`px-2 py-1 rounded-md transition ${
                abaRanking === 'semanal'
                  ? 'bg-amber-500 text-white shadow'
                  : 'text-slate-600'
              }`}
            >
              Semanal
            </button>
            <button
              onClick={() => setAbaRanking('geral')}
              className={`px-2 py-1 rounded-md transition ${
                abaRanking === 'geral'
                  ? 'bg-amber-500 text-white shadow'
                  : 'text-slate-600'
              }`}
            >
              Geral
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-3">
          Média do grupo: <span className="font-bold text-slate-700">{media} finos</span>
        </p>

        <div className="space-y-4">
          {contagemPorPessoa.map((p, idx) => {
            let statusBadge = '';
            if (p.count > 0 && p.count === maxFinos) {
              statusBadge = '🍾 Bêbedo';
            } else if (Number(p.count) < Number(media) * 0.5) {
              statusBadge = '🕺 conas';
            } else {
              statusBadge = '🍺 A acompanhar';
            }

            const streakData = statsStreaks.find(s => s.id === p.id);
            const userCurrentStreak = streakData?.currentStreak || 0;

            return (
              <div key={p.id} className="border-b pb-2 last:border-0">
                <div className="flex justify-between items-center text-sm">
                  <div>
                    <span className="font-bold text-slate-800">
                      {idx + 1}. {p.nome}
                    </span>
                    <span className="text-xs text-slate-400 font-normal ml-2">
                      {statusBadge}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-black bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full text-xs">
                      {p.count} finos
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {(p.count * PRECO_FINO).toFixed(2)}€
                    </p>
                  </div>
                </div>

                {/* BADGES CUMULATIVOS */}
                {(p.conquistas.length > 0 || userCurrentStreak > 1) && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {userCurrentStreak > 1 && (
                      <span className="bg-orange-100 text-orange-800 border border-orange-200 text-[10px] px-1.5 py-0.5 rounded-md font-medium">
                        🔥 {userCurrentStreak} Dias Seguidos
                      </span>
                    )}

                    {p.conquistas.map((badgeText: string, i: number) => (
                      <span
                        key={i}
                        className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] px-1.5 py-0.5 rounded-md font-medium"
                      >
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

      {/* HISTÓRICO E GALERIA AGRUPADA POR DIA */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="font-bold text-lg mb-3 text-slate-800 border-b pb-2">
          📅 Histórico & Fotos por Dia
        </h2>

        {Object.keys(finosPorDiaParaLista).length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">
            Ainda não há finos registados.
          </p>
        ) : (
          <div className="space-y-3">
            {Object.entries(finosPorDiaParaLista).map(([dia, listaFinos]) => {
              const estaAberto = !!diasAbertos[dia];
              return (
                <div key={dia} className="border rounded-xl overflow-hidden bg-slate-50">
                  {/* CABEÇALHO DO DIA (CLICÁVEL) */}
                  <button
                    onClick={() => toggleDia(dia)}
                    className="w-full p-3 flex justify-between items-center text-left bg-slate-100 hover:bg-slate-200 transition"
                  >
                    <span className="font-bold text-xs capitalize text-slate-700">
                      {dia}
                    </span>
                    <span className="text-xs bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                      {listaFinos.length} finos {estaAberto ? '▲' : '▼'}
                    </span>
                  </button>

                  {/* LISTA EXPANSÍVEL */}
                  {estaAberto && (
                    <div className="p-3 space-y-3 bg-white">
                      {listaFinos.map((f) => (
                        <div key={f.id} className="border-b pb-2 last:border-0">
                          <div className="flex justify-between text-xs text-slate-600 mb-1">
                            <span>
                              👤 Registado por: <strong className="text-slate-800">{f.perfis?.nome || 'Desconhecido'}</strong>
                            </span>
                            <span className="text-slate-400">
                              {new Date(f.data_hora).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          {/* FOTO COM CLIQUE PARA EXPANDIR */}
                          {f.foto_url && (
                            <img
                              src={f.foto_url}
                              alt="Fino"
                              onClick={() => setFotoExpandida(f.foto_url)}
                              className="w-full h-40 object-cover rounded-lg shadow-sm mt-1 cursor-pointer hover:opacity-90 transition"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL DE FRASES DIVERTIDAS / MENSAGEM */}
      {mensagemModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 text-center max-w-xs shadow-2xl transform transition-all scale-100">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="font-black text-amber-900 text-lg mb-2">Fino Registado!</h3>
            <p className="text-sm font-semibold text-slate-700 mb-6">
              "{mensagemModal}"
            </p>
            <button
              onClick={() => setMensagemModal(null)}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 rounded-xl shadow"
            >
              Bora para o próximo! 🍻
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE FOTO EM ECRÃ INTEIRO */}
      {fotoExpandida && (
        <div
          onClick={() => setFotoExpandida(null)}
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-2 z-50 cursor-pointer"
        >
          <img
            src={fotoExpandida}
            alt="Foto em destaque"
            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain"
          />
        </div>
      )}
    </main>
  );
}