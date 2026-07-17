import { createClient } from "@/lib/supabase/client";

type Bucket = "avatars" | "assets" | "events" | "documents";

export async function uploadFile(
  bucket: Bucket,
  path: string,
  file: File,
): Promise<string | null> {
  const supabase = createClient();

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true });

  if (error) {
    console.error(`[storage] Upload to ${bucket}/${path} failed:`, error);
    return null;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteFile(
  bucket: Bucket,
  paths: string[],
): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).remove(paths);
  if (error) {
    console.error(`[storage] Delete from ${bucket} failed:`, error);
    return false;
  }
  return true;
}

export function getPublicUrl(bucket: Bucket, path: string): string {
  const supabase = createClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export function buildPath(
  folder: string,
  file: File,
): string {
  const ext = file.name.split(".").pop() || "jpg";
  return `${folder}/${Date.now()}.${ext}`;
}
