import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimit';

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(`tts:${ip}`, 30, 60);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment.' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const tl = searchParams.get('tl') || 'en';

    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      return NextResponse.json({ error: 'Missing query parameter "q"' }, { status: 400 });
    }

    // Google Translate TTS accepts chunks up to 200 chars
    const sanitizedText = q.replace(/[#*`_~]/g, '').trim().slice(0, 200);

    const targetUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
      sanitizedText
    )}&tl=${encodeURIComponent(tl)}&client=tw-ob`;

    const upstreamResponse = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!upstreamResponse.ok) {
      return NextResponse.json(
        { error: `Upstream TTS service error: ${upstreamResponse.status}` },
        { status: upstreamResponse.status }
      );
    }

    const audioBuffer = await upstreamResponse.arrayBuffer();

    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal TTS Proxy Error' },
      { status: 500 }
    );
  }
}

