"use server";

import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth";

export async function getAlbums() {
  const { orgId } = await requirePermission("photos");
  const supabase = await createClient();
  const { data } = await supabase
    .from("photo_albums")
    .select("*, album_photos(count)")
    .eq("org_id", orgId)
    .order("date", { ascending: false });
  return data ?? [];
}

export async function createAlbum(formData: FormData) {
  const { orgId, memberId } = await requirePermission("photos");
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const date = (formData.get("date") as string) || new Date().toISOString().split("T")[0];
  const eventId = (formData.get("event_id") as string) || null;

  const { data, error } = await supabase
    .from("photo_albums")
    .insert({
      org_id: orgId,
      title,
      description,
      date,
      event_id: eventId || null,
      created_by: memberId,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteAlbum(albumId: string) {
  await requirePermission("photos");
  const supabase = await createClient();
  const { error } = await supabase
    .from("photo_albums")
    .delete()
    .eq("id", albumId);
  if (error) throw new Error(error.message);
}

export async function addPhotoToAlbum(albumId: string, url: string, caption?: string) {
  const { memberId } = await requirePermission("photos");
  const supabase = await createClient();
  const { error } = await supabase
    .from("album_photos")
    .insert({
      album_id: albumId,
      url,
      caption: caption || null,
      uploaded_by: memberId,
    });
  if (error) throw new Error(error.message);
}

export async function deletePhoto(photoId: string) {
  await requirePermission("photos");
  const supabase = await createClient();
  const { error } = await supabase
    .from("album_photos")
    .delete()
    .eq("id", photoId);
  if (error) throw new Error(error.message);
}

export async function setAlbumCover(albumId: string, coverUrl: string) {
  await requirePermission("photos");
  const supabase = await createClient();
  const { error } = await supabase
    .from("photo_albums")
    .update({ cover_url: coverUrl })
    .eq("id", albumId);
  if (error) throw new Error(error.message);
}
