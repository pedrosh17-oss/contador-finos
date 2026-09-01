import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json({ country: 'Outro País', district: 'Outro Distrito', city: 'Zona GPS' });
  }

  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=pt`,
      {
        headers: { 'User-Agent': 'ContadorFinos/1.0' },
        cache: 'force-cache'
      }
    );

    if (res.ok) {
      const data = await res.json();
      const country = data.countryName || 'Outro País';
      
      let district = data.principalSubdivision || 'Outro Distrito';
      district = district.replace(/^(Distrito de|Distrito do|Distrito da|Região Autónoma da|Região Autónoma dos)\s+/i, '');

      let city = data.city || data.locality || data.municipality || 'Outro Concelho';
      city = city.replace(/^(Concelho de|Concelho do|Município de|Município do)\s+/i, '');

      return NextResponse.json({ country, district, city });
    }
  } catch {
    // Fallback silencioso
  }

  return NextResponse.json({ 
    country: 'Outro País', 
    district: 'Outro Distrito', 
    city: `Zona (${Number(lat).toFixed(2)}, ${Number(lng).toFixed(2)})` 
  });
}