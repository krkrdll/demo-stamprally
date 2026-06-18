import type { NextRequest } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const CONTENT_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  if (!segments || segments.length < 2) {
    return new Response('Not found', { status: 404 });
  }

  const [bucket, ...rest] = segments;
  const filePath = rest.join('/');

  if (process.env.IMAGE_STORAGE !== 'supabase') {
    // Serve from local filesystem: public/uploads/{bucket}/{filePath}
    const localPath = path.join(process.cwd(), 'public/uploads', bucket, filePath);
    try {
      const bytes = await fs.readFile(localPath);
      const ext = filePath.split('.').pop()?.toLowerCase() ?? 'jpg';
      return new Response(bytes, {
        headers: {
          'Content-Type': CONTENT_TYPES[ext] ?? 'image/jpeg',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    } catch {
      return new Response('Not found', { status: 404 });
    }
  }

  // Supabase Storage: generate a signed URL and redirect
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return new Response('Storage not configured', { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filePath, 3600);

  if (error || !data?.signedUrl) {
    return new Response('Not found', { status: 404 });
  }

  return Response.redirect(data.signedUrl, 307);
}
