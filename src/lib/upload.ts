import { supabase } from '@/lib/supabase';

export async function uploadFile(file: File, folder: string): Promise<string | null> {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from('media')
    .upload(fileName, file, { cacheControl: '3600', upsert: false });

  if (error) return null;

  const { data } = supabase.storage.from('media').getPublicUrl(fileName);
  return data.publicUrl;
}
