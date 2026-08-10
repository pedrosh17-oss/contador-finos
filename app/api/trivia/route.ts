import { NextResponse } from 'next/server';

async function obterFotoWikipedia(termoWiki: string): Promise<string | null> {
  try {
    if (!termoWiki) return null;
    const termoFormatado = encodeURIComponent(termoWiki.trim().replace(/ /g, '_'));
    const url = `https://pt.wikipedia.org/api/rest_v1/page/summary/${termoFormatado}`;
    
    const res = await fetch(url, { headers: { 'User-Agent': 'ContadorFinosApp/1.0' } });
    if (!res.ok) return null;

    const data = await res.json();
    return data.thumbnail?.source || data.originalimage?.source || null;
  } catch (e) {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { tema } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave GEMINI_API_KEY não encontrada nas variáveis de ambiente' },
        { status: 500 }
      );
    }

    const temaFinal = tema && tema.trim() !== '' ? tema.trim() : 'Cultura Geral, Futebol e Cerveja';

    const prompt = `Gera exatamente 10 perguntas cómicas e desafiantes de escolha múltipla em Português de Portugal sobre o tema: "${temaFinal}".

Cria um MISTO entre dois tipos de perguntas:
1. PERGUNTAS DE RECONHECIMENTO VISUAL: ex: "Que estádio/lugar/pessoa é este na imagem?". Neste caso, o "termo_wikipedia" é o próprio objeto a adivinhar.
2. PERGUNTAS DE CONTEXTO: ex: "Qual o doce típico de Aveiro?". NESTE CASO, O "termo_wikipedia" DEVE SER O CONTEXTO/CIDADE (ex: "Aveiro" ou "Estádio Municipal de Aveiro") E NUNCA A RESPOSTA CORRETA ("Ovos Moles"), PARA NÃO DAR SPOILER DAS OPÇÕES!

Para cada pergunta, fornece OBRIGATORIAMENTE:
1. "pergunta": Texto da pergunta.
2. "opcoes": Array com 4 opções de resposta.
3. "correta": Índice numérico (0 a 3) da resposta correta.
4. "termo_wikipedia": O termo exato em Português para buscar na Wikipédia.

Responde APENAS no seguinte formato JSON, sem crases markdown, sem texto adicional:
[
  {
    "pergunta": "Se fores ao Estádio Municipal de Aveiro, qual é a iguaria doce local para afogar as mágoas?",
    "opcoes": ["Ovos moles de Aveiro", "Torta de Azeitão", "Queijada de Sintra", "Pastel de Nata"],
    "correta": 0,
    "termo_wikipedia": "Estádio Municipal de Aveiro"
  }
]`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Erro direto do Google Gemini:', data);
      return NextResponse.json(
        { error: data.error?.message || 'Erro na API do Gemini' },
        { status: res.status }
      );
    }

    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse) {
      throw new Error('Resposta vazia da IA');
    }

    const rawPerguntas = JSON.parse(textResponse);
    const seedJogo = Math.floor(Math.random() * 10000);

    const perguntas = await Promise.all(
      rawPerguntas.map(async (p: any, idx: number) => {
        let fotoUrl = await obterFotoWikipedia(p.termo_wikipedia);

        if (!fotoUrl) {
          const kw = p.termo_wikipedia ? encodeURIComponent(p.termo_wikipedia.split(' ')[0].toLowerCase()) : 'food';
          fotoUrl = `https://loremflickr.com/800/600/${kw}?lock=${seedJogo + idx}`;
        }

        return {
          ...p,
          fotoUrl
        };
      })
    );

    return NextResponse.json({ perguntas });
  } catch (err: any) {
    console.error('Erro na Rota de Trivia:', err);
    return NextResponse.json(
      { error: err.message || 'Erro ao gerar perguntas com IA' },
      { status: 500 }
    );
  }
}