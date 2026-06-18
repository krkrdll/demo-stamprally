import { promises as fs } from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads/checkpoints');
const ALLOWED_EXTS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif']);

function getExt(file: File): string {
  const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase();
  return ALLOWED_EXTS.has(ext) ? ext : 'jpg';
}

// ---- Local filesystem ----

const LOCAL_BUCKET = 'checkpoints';

async function saveImageLocal(file: File, checkpointId: string): Promise<string> {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const ext = getExt(file);
  const filename = `${checkpointId}.${ext}`;
  const bytes = await file.arrayBuffer();
  await fs.writeFile(path.join(UPLOAD_DIR, filename), Buffer.from(bytes));
  return `/api/storage/${LOCAL_BUCKET}/${filename}`;
}

async function deleteImageLocal(imageUrl: string): Promise<void> {
  try {
    let localPath: string;
    if (imageUrl.startsWith('/api/storage/')) {
      // /api/storage/{bucket}/{file} → public/uploads/{bucket}/{file}
      const storagePath = imageUrl.slice('/api/storage/'.length);
      localPath = path.join(process.cwd(), 'public/uploads', storagePath);
    } else {
      // Legacy format: /uploads/checkpoints/{filename}
      localPath = path.join(process.cwd(), 'public', imageUrl);
    }
    await fs.unlink(localPath);
  } catch {
    // Ignore if file doesn't exist
  }
}

// ---- Supabase Storage ----

function getSupabaseStorageClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      'IMAGE_STORAGE=supabase には SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY の設定が必要です',
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

function getStorageBucket(): string {
  return process.env.SUPABASE_STORAGE_BUCKET ?? 'checkpoints';
}

async function saveImageSupabase(file: File, checkpointId: string): Promise<string> {
  const supabase = getSupabaseStorageClient();
  const bucket = getStorageBucket();
  const ext = getExt(file);
  const filename = `${checkpointId}.${ext}`;
  const bytes = await file.arrayBuffer();

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filename, bytes, { contentType: file.type || 'image/jpeg', upsert: true });

  if (error) throw new Error(`Supabase Storageへのアップロードに失敗しました: ${error.message}`);

  // Return our own proxy route so private buckets work (signed URL generated on demand)
  return `/api/storage/${bucket}/${filename}`;
}

async function deleteImageSupabase(imageUrl: string): Promise<void> {
  try {
    const supabase = getSupabaseStorageClient();

    let bucket: string;
    let filePath: string;

    if (imageUrl.startsWith('/api/storage/')) {
      // New format: /api/storage/{bucket}/{file}
      const parts = imageUrl.slice('/api/storage/'.length).split('/');
      if (parts.length < 2) return;
      bucket = parts[0];
      filePath = parts.slice(1).join('/');
    } else {
      // Legacy format: https://<project>.supabase.co/storage/v1/object/public/{bucket}/{file}
      const storedBucket = getStorageBucket();
      const bucketPrefix = `/storage/v1/object/public/${storedBucket}/`;
      const parsed = new URL(imageUrl);
      const idx = parsed.pathname.indexOf(bucketPrefix);
      if (idx === -1) return;
      bucket = storedBucket;
      filePath = parsed.pathname.slice(idx + bucketPrefix.length);
    }

    await supabase.storage.from(bucket).remove([filePath]);
  } catch {
    // Ignore errors (file may not exist)
  }
}

// ---- Public API ----
// deleteImage auto-detects the backend from the stored URL format:
//   full URL (https://…) → Supabase Storage
//   relative path (/uploads/…) → local filesystem

export async function saveImage(file: File, checkpointId: string): Promise<string> {
  if (process.env.IMAGE_STORAGE === 'supabase') {
    return saveImageSupabase(file, checkpointId);
  }
  return saveImageLocal(file, checkpointId);
}

export async function deleteImage(imageUrl: string): Promise<void> {
  // Legacy full public URL → always Supabase
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return deleteImageSupabase(imageUrl);
  }
  if (process.env.IMAGE_STORAGE === 'supabase') {
    return deleteImageSupabase(imageUrl);
  }
  return deleteImageLocal(imageUrl);
}
