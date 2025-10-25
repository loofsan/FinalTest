import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';

const TRANSCRIBE_ENABLED = process.env.TRANSCRIBE_ENABLED;
const TRANSCRIBE_PROVIDER = (process.env.TRANSCRIBE_PROVIDER || 'gemini').toLowerCase();
const MAX_MB = parseInt(process.env.TRANSCRIBE_MAX_MB || '25', 10);

async function transcribeWithOpenAI(file: File, filename: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const formData = new FormData();
  formData.append('file', file, filename);
  // Use Whisper for robust STT
  formData.append('model', 'whisper-1');
  formData.append('temperature', '0');
  formData.append('response_format', 'json');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.text().catch(() => '');
    throw new Error(`OpenAI transcription failed: ${response.status} ${response.statusText} ${err}`);
  }

  const data = (await response.json()) as { text?: string };
  if (!data.text) {
    throw new Error('OpenAI transcription returned no text');
  }
  return data.text;
}

async function transcribeWithGemini(file: File, mimeType: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  const base64Data = Buffer.from(bytes).toString('base64');

  const prompt = `Transcribe the given audio to plain text.
- Output only the verbatim transcript in the original language.
- Do not add timestamps or speaker labels.
- Do not summarize or comment.`;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        mimeType: mimeType || 'audio/webm',
        data: base64Data,
      },
    },
  ]);

  const response = await result.response;
  const text = response.text();
  if (!text || !text.trim()) {
    throw new Error('Gemini transcription returned empty text');
  }
  return text.trim();
}

export async function POST(request: NextRequest) {
  try {
    if (!TRANSCRIBE_ENABLED) {
      return NextResponse.json({ error: 'Transcription is disabled' }, { status: 500 });
    }

    const form = await request.formData();
    const file = form.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "A 'file' field is required" }, { status: 400 });
    }

    const filename = (file as File).name || 'audio.webm';
    const mimeType = (file as File).type || '';
    const sizeBytes = (file as File).size || 0;

    const allowedTypes = new Set([
      'audio/webm',
      'audio/ogg',
      'audio/mpeg',
      'audio/wav',
      'audio/mp4',
      'audio/x-m4a',
      'audio/aac',
      'audio/mp3',
    ]);

    if (sizeBytes > MAX_MB * 1024 * 1024) {
      return NextResponse.json({ error: `File too large. Max ${MAX_MB} MB` }, { status: 413 });
    }

    if (mimeType && !allowedTypes.has(mimeType)) {
      // Allow if empty mime type from some browsers
      return NextResponse.json({ error: `Unsupported audio type: ${mimeType}` }, { status: 415 });
    }

    let transcript: string;
    let providerUsed: 'openai' | 'gemini';

    if (TRANSCRIBE_PROVIDER === 'openai' && process.env.OPENAI_API_KEY) {
      transcript = await transcribeWithOpenAI(file as File, filename);
      providerUsed = 'openai';
    } else if (process.env.GEMINI_API_KEY) {
      transcript = await transcribeWithGemini(file as File, mimeType);
      providerUsed = 'gemini';
    } else if (process.env.OPENAI_API_KEY) {
      transcript = await transcribeWithOpenAI(file as File, filename);
      providerUsed = 'openai';
    } else {
      return NextResponse.json(
        { error: 'No transcription provider configured. Set OPENAI_API_KEY or GEMINI_API_KEY.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ transcript, provider: providerUsed, bytes: sizeBytes, mimeType });
  } catch (error: any) {
    console.error('Error in transcribe API:', error);
    return NextResponse.json({ error: error?.message || 'Failed to transcribe audio' }, { status: 500 });
  }
}
