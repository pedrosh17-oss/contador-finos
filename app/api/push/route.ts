import { NextResponse } from 'next/server';
// @ts-ignore
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BFLDnG2tikGutjEDfa5xyg4bGaJZ2wftHDiRvY-bPzttKqhjWwsH9VN2MkVfpHDqwEt7i8AZnZqdnUDQPGZBR08';
const privateKey = process.env.VAPID_PRIVATE_KEY || 'Ffn43KYGfSv1SQ0GPTlA4yAcTJ9TzscX26CrKeSCwkw';

webpush.setVapidDetails(
  'mailto:grupo@contadorfinos.com',
  publicKey,
  privateKey
);

export async function POST(req: Request) {
  try {
    const { title, body } = await req.json();

    const { data: subs, error: fetchError } = await supabase.from('push_subscriptions').select('*');

    if (fetchError) {
      console.error('Erro ao ler subscrições do Supabase:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!subs || subs.length === 0) {
      console.log('Aviso: Nenhuma subscrição encontrada na tabela push_subscriptions.');
      return NextResponse.json({ success: true, count: 0, message: 'Sem subscrições' });
    }

    const envios = subs.map(async (item) => {
      try {
        console.log(`A enviar push para o ID: ${item.id}`);
        await webpush.sendNotification(
          item.subscription,
          JSON.stringify({ title, body })
        );
        console.log(`✅ Push enviado com sucesso para o ID: ${item.id}`);
      } catch (err: any) {
        console.error(`❌ ERRO AO ENVIAR PUSH PARA O ID ${item.id}:`);
        console.error('Mensagem:', err?.message);
        console.error('StatusCode:', err?.statusCode);
        console.error('Body:', err?.body);
        
        // Deixamos de apagar automaticamente para podermos analisar o erro na BD
      }
    });

    await Promise.all(envios);
    return NextResponse.json({ success: true, count: subs.length });
  } catch (error: any) {
    console.error('Erro geral na API push:', error);
    return NextResponse.json({ error: error.message || 'Erro ao enviar push' }, { status: 500 });
  }
}