import { supabase } from '@/lib/supabase';

async function optimizeImage(file: File): Promise<File> {
  // Compress raster images to WebP in-browser. Keep SVG/GIF/animated assets unchanged.
  if (!file.type.startsWith('image/') || ['image/svg+xml', 'image/gif'].includes(file.type)) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const maxEdge = 2200;
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) { bitmap.close(); return file; }
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/webp', 0.84));
    if (!blob) return file;
    const base = file.name.replace(/\.[^.]+$/, '') || 'image';
    return new File([blob], `${base}.webp`, { type: 'image/webp', lastModified: Date.now() });
  } catch {
    // If browser decoding or WebP encoding is unavailable, upload the original.
    return file;
  }
}

export async function uploadFile(file: File, folder: string): Promise<string | null> {
  const optimized = await optimizeImage(file);
  const ext = optimized.type === 'image/webp' ? 'webp' : (optimized.name.split('.').pop()?.toLowerCase() || 'bin');
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from('media').upload(fileName, optimized, {
    cacheControl: '31536000', upsert: false, contentType: optimized.type || undefined,
  });
  if (error) {
    console.error('Media upload failed:', error.message);
    return null;
  }
  const { data } = supabase.storage.from('media').getPublicUrl(fileName);
  return data.publicUrl;
}
