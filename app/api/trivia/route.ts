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
    const eModoCarreira = temaFinal.toLowerCase().includes('carreira') || temaFinal.toLowerCase().includes('jogador');

    const prompt = `Gera exatamente 10 perguntas de escolha múltipla em Português de Portugal sobre o tema: "${temaFinal}".

${eModoCarreira ? `
MODO CARREIRA DE JOGADORES:
- Todas as perguntas devem ser para adivinhar o jogador através da sua lista de clubes.
- A "pergunta" deve ser simplesmente "A que jogador pertence esta carreira de clubes?".
- Fornece no campo "carreira" um array de strings com o histórico ordenado por épocas (ex: ["2001–2003: Sporting CP", "2003–2009: Manchester United", "2009–2018: Real Madrid"]).
- O campo "termo_wikipedia" pode ir vazio/null.
` : `
REGRAS GERAIS:
- Cria um MISTO entre perguntas normais, de imagem e de carreira.
- Se a pergunta for de carreira, mete a pergunta curta "A que jogador pertence esta carreira?", fornece a lista no array "carreira" e mete "termo_wikipedia": null.
- Se for uma pergunta normal/visual, o campo "carreira" deve ser null.
`}

Para cada pergunta, fornece OBRIGATORIAMENTE:
1. "pergunta": Texto da pergunta.
2. "carreira": Array de strings com a carreira do jogador (ou null se for pergunta normal).
3. "opcoes": Array com 4 opções de resposta.
4. "correta": Índice numérico (0 a 3) da resposta correta.
5. "termo_wikipedia": Termo da Wikipédia para foto (ou null se for de carreira).

Responde APENAS no seguinte formato JSON, sem crases markdown, sem texto adicional:
[
  {
    "pergunta": "A que jogador pertence esta carreira?",
    "carreira": [
      "2001–2003: Sporting CP",
      "2003–2004: Barcelona",
      "2004–2007: FC Porto"
    ],
    "opcoes": ["Ricardo Quaresma", "Cristiano Ronaldo", "Luís Figo", "Simão Sabrosa"],
    "correta": 0,
    "termo_wikipedia": null
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
        let fotoUrl = null;
        if (p.termo_wikipedia) {
          fotoUrl = await obterFotoWikipedia(p.termo_wikipedia);
          if (!fotoUrl) {
            const kw = encodeURIComponent(p.termo_wikipedia.split(' ')[0].toLowerCase());
            fotoUrl = `https://loremflickr.com/800/600/${kw}?lock=${seedJogo + idx}`;
          }
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