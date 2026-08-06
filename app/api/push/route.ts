import { NextResponse } from 'next/server';
// @ts-ignore
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Chaves VAPID oficiais do projeto (com fallbacks corretos)
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

    // Buscar todas as subscrições registadas
    const { data: subs } = await supabase.from('push_subscriptions').select('*');

    if (!subs || subs.length === 0) {
      return NextResponse.json({ success: true, count: 0 });
    }

    // Enviar notificação para todos os telemóveis registados
    const envios = subs.map(async (item) => {
      try {
        await webpush.sendNotification(
          item.subscription,
          JSON.stringify({ title, body })
        );
      } catch (err) {
        // Se a subscrição expirou ou falhou, remove da BD
        await supabase.from('push_subscriptions').delete().eq('id', item.id);
      }
    });

    await Promise.all(envios);
    return NextResponse.json({ success: true, count: subs.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao enviar push' }, { status: 500 });
  }
}