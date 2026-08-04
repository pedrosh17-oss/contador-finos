'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [perfis, setPerfis] = useState<any[]>([]);
  const [finos, setFinos] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [novoNome, setNovoNome] = useState('');
  const [loading, setLoading] = useState(false);

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
    if (dataFinos) setFinos(dataFinos);
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

      alert('🍺 Fino registado com sucesso!');
      fetchDados();
    } catch (err) {
      console.error(err);
      alert('Erro ao guardar o fino.');
    } finally {
      setLoading(false);
    }
  }

  const totalFinos = finos.length;
  const contagemPorPessoa = perfis
    .map((p) => {
      const count = finos.filter((f) => f.perfil_id === p.id).length;
      return { ...p, count };
    })
    .sort((a, b) => b.count - a.count);

  const maxFinos = contagemPorPessoa[0]?.count || 0;
  const reiDoFino = contagemPorPessoa[0];
  const media = perfis.length > 0 ? (totalFinos / perfis.length).toFixed(1) : 0;

  return (
    <main className="min-h-screen bg-amber-50 text-slate-900 p-4 max-w-md mx-auto font-sans pb-12">
      <h1 className="text-3xl font-extrabold text-center text-amber-900 mb-2">
        🍻 Contador de Finos
      </h1>

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

      <div className="text-center mb-8">
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

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white p-3 rounded-xl shadow text-center">
          <p className="text-xs text-slate-500 uppercase font-bold">
            Total do Grupo
          </p>
          <p className="text-3xl font-black text-amber-600">{totalFinos}</p>
        </div>
        <div className="bg-white p-3 rounded-xl shadow text-center">
          <p className="text-xs text-slate-500 uppercase font-bold">
            Bêbedo 🍾
          </p>
          <p className="text-lg font-bold text-slate-800 truncate">
            {reiDoFino && reiDoFino.count > 0 ? reiDoFino.nome : '-'}
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="font-bold text-lg mb-3 text-slate-800 border-b pb-1">
          📊 Ranking do Grupo (Média: {media})
        </h2>
        <div className="space-y-3">
          {contagemPorPessoa.map((p, idx) => {
            let badge = '';
            if (p.count > 0 && p.count === maxFinos) {
              badge = '🍾 Bêbedo';
            } else if (Number(p.count) < Number(media) * 0.5) {
              badge = '🕺 conas';
            } else {
              badge = '🍺 A acompanhar';
            }

            return (
              <div
                key={p.id}
                className="flex justify-between items-center text-sm"
              >
                <span className="font-semibold text-slate-700">
                  {idx + 1}. {p.nome}{' '}
                  <span className="text-xs text-slate-400 font-normal">{badge}</span>
                </span>
                <span className="font-black bg-amber-100 text-amber-900 px-2 py-1 rounded-full">
                  {p.count} finos
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="font-bold text-lg mb-3 text-slate-800 border-b pb-1">
          📸 Últimos Finos
        </h2>
        <div className="space-y-4">
          {finos.slice(0, 5).map((f) => (
            <div key={f.id} className="border-b pb-3 last:border-0">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span className="font-bold text-slate-800">
                  {f.perfis?.nome}
                </span>
                <span>
                  {new Date(f.data_hora).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              {f.foto_url && (
                <img
                  src={f.foto_url}
                  alt="Fino"
                  className="w-full h-48 object-cover rounded-lg shadow-sm mt-1"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}