import { NextResponse } from 'next/server';

// Função para procurar a foto principal oficial na Wikipédia em Português
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
Podes fazer perguntas sobre pessoas famosas, futebol, estádios, monumentos, animais, comida portuguesa, cervejas ou cultura geral.

Para cada pergunta, fornece OBRIGATORIAMENTE:
1. "pergunta": Texto da pergunta.
2. "opcoes": Array com 4 opções de resposta.
3. "correta": Índice numérico (0 a 3) da resposta correta.
4. "termo_wikipedia": O nome exato em PORTUGUÊS do artigo principal da Wikipédia sobre o assunto/tema da pergunta (ex: "Estádio Municipal de Braga", "Cristiano Ronaldo", "Francesinha", "Elefante", "Super Bock", "Torre de Belém").

Responde APENAS no seguinte formato JSON, sem crases markdown, sem texto adicional:
[
  {
    "pergunta": "No Estádio Municipal de Braga, se quiseres comprar bilhete para a bancada atrás da baliza, o que acontece?",
    "opcoes": ["Cadeira VIP", "Descobres que não há bancada, apenas uma pedreira", "És obrigado a escalar a rocha", "Vês a partir do restaurante"],
    "correta": 1,
    "termo_wikipedia": "Estádio Municipal de Braga"
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

    // Buscar as imagens reais da Wikipédia em Português
    const perguntas = await Promise.all(
      rawPerguntas.map(async (p: any, idx: number) => {
        let fotoUrl = await obterFotoWikipedia(p.termo_wikipedia);

        // Fallback para banco de imagens caso a Wikipédia não tenha foto
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