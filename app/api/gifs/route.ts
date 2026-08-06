import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const gifsDirectory = path.join(process.cwd(), 'public', 'gifs');
    
    if (!fs.existsSync(gifsDirectory)) {
      return NextResponse.json([]);
    }

    const files = fs.readdirSync(gifsDirectory);
    
    // Filtra todos os ficheiros .webp e .gif
    const animacoes = files.filter(file => 
      file.toLowerCase().endsWith('.webp') || file.toLowerCase().endsWith('.gif')
    );

    return NextResponse.json(animacoes);
  } catch (error) {
    console.error('Erro ao ler a pasta de gifs:', error);
    return NextResponse.json([]);
  }
}