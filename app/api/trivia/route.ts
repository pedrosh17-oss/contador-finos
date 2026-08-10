import { NextResponse } from 'next/server';

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
Podes incluir perguntas em que a imagem é a peça central (ex: "Que animal é este?", "De que jogador/equipa é esta carreira?", "Que monumento ou lugar é este?").

Para cada pergunta, fornece rigorosamente:
1. "pergunta": Texto da pergunta.
2. "opcoes": Array com 4 opções de resposta.
3. "correta": Índice numérico (0 a 3) da resposta correta.
4. "keyword_imagem": 1 palavra-chave simples e direta em INGLÊS para procurar a imagem (ex: "food", "stadium", "dog", "beer", "soccer").

Responde APENAS no seguinte formato JSON, sem crases, sem texto adicional:
[
  {
    "pergunta": "Qual destas iguarias é devorada à porta dos estádios?",
    "opcoes": ["Francesinha", "Bifana em pão", "Bacalhau", "Pastel de Nata"],
    "correta": 1,
    "keyword_imagem": "food"
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

    // Mapear perguntas com LoremFlickr e semente bloqueada para ser igual em todos os telemóveis
    const perguntas = rawPerguntas.map((p: any, idx: number) => {
      const kw = p.keyword_imagem ? encodeURIComponent(p.keyword_imagem.trim().toLowerCase()) : 'food';
      const fotoUrl = `https://loremflickr.com/800/600/${kw}?lock=${seedJogo + idx}`;

      return {
        ...p,
        fotoUrl
      };
    });

    return NextResponse.json({ perguntas });
  } catch (err: any) {
    console.error('Erro na Rota de Trivia:', err);
    return NextResponse.json(
      { error: err.message || 'Erro ao gerar perguntas com IA' },
      { status: 500 }
    );
  }
}