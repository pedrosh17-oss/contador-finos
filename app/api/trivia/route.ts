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

    const temaFinal = tema && tema.trim() !== '' ? tema.trim() : 'Cultura Geral e Cerveja';

    const prompt = `Gera exatamente 10 perguntas cómicas e desafiantes de escolha múltipla em Português de Portugal sobre o tema: "${temaFinal}".
Cada pergunta deve ter rigorosamente 4 opções de resposta, o índice numérico (0 a 3) da resposta correta e, se o tema/pergunta envolver identificação visual (animais, monumentos, logótipos, personalidades, etc.), inclui um URL de imagem no campo "imagemUrl" (usa o serviço LoremFlickr no formato "https://loremflickr.com/500/350/<palavra_chave_em_ingles>"). Se não necessitar de imagem, define "imagemUrl" como null.

Responde APENAS no seguinte formato JSON sem qualquer texto adicional:
[
  {
    "pergunta": "Texto da pergunta?",
    "opcoes": ["Opção A", "Opção B", "Opção C", "Opção D"],
    "correta": 0,
    "imagemUrl": "https://loremflickr.com/500/350/dog"
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

    const perguntas = JSON.parse(textResponse);
    return NextResponse.json({ perguntas });
  } catch (err: any) {
    console.error('Erro na Rota de Trivia:', err);
    return NextResponse.json(
      { error: err.message || 'Erro ao gerar perguntas com IA' },
      { status: 500 }
    );
  }
}