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

    const temaFinal = tema && tema.trim() !== '' ? tema.trim() : 'Cultura Geral e Futebol';

    // Pedimos à IA uma "keyword_imagem" exata em inglês para usar no Unsplash
    const prompt = `Gera exatamente 10 perguntas cómicas e desafiantes de escolha múltipla em Português de Portugal sobre o tema: "${temaFinal}".
Podes incluir perguntas em que a imagem é a peça central (ex: "Que animal é este?", "De que jogador/equipa é esta carreira?", "Que monumento ou lugar é este?").

Para cada pergunta, fornece rigorosamente:
1. "pergunta": Texto da pergunta.
2. "opcoes": Array com 4 opções de resposta.
3. "correta": Índice numérico (0 a 3) da resposta correta.
4. "keyword_imagem": 1 ou 2 palavras-chave muito específicas em INGLÊS que identifiquem a imagem exata da pergunta (ex: "cristiano ronaldo", "golden retriever", "eiffel tower", "beer pint", "fc porto"). Se a pergunta for abstrata, dá uma keyword que combine.

Responde APENAS no seguinte formato JSON, sem crases, sem texto adicional:
[
  {
    "pergunta": "Que jogador corresponde a esta carreira?",
    "opcoes": ["Sporting CP", "SL Benfica", "FC Porto", "SC Braga"],
    "correta": 0,
    "keyword_imagem": "sporting cp"
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
    const seedJogo = Date.now(); // Semente única para esta rodada de 10 perguntas

    // Mapear perguntas e injetar o link fixo do Unsplash
    const perguntas = rawPerguntas.map((p: any, idx: number) => {
      const kw = p.keyword_imagem ? encodeURIComponent(p.keyword_imagem.trim().toLowerCase()) : 'question';
      // Unsplash usa o parâmetro sig para garantir a mesma imagem para a mesma keyword no mesmo momento
      const fotoUrl = `https://source.unsplash.com/800x600/?${kw}&sig=${seedJogo + idx}`;

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