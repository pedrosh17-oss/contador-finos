import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json({ city: 'Zona GPS' });
  }

  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=pt`,
      { headers: { 'User-Agent': 'ContadorFinos/1.0' } }
    );

    if (res.ok) {
      const data = await res.json();
      const city = data.city || data.locality || data.principalSubdivision || data.countryName;
      if (city) return NextResponse.json({ city });
    }
  } catch {
    // Retorna fallback silencioso em caso de falha de rede externa
  }

  return NextResponse.json({ city: `Zona (${Number(lat).toFixed(2)}, ${Number(lng).toFixed(2)})` });
}