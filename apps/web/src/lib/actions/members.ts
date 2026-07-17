"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email";
import { buildInvitationEmail } from "@/lib/emails/invitation";

async function getCurrentMemberOrg() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { data: member } = await supabase
    .from("members")
    .select("org_id, organizations:org_id(name)")
    .eq("user_id", user.id)
    .single();

  if (!member) throw new Error("Membre non trouvé");

  const orgName = (member.organizations as unknown as { name: string } | null)?.name ?? "Amicale";
  return { supabase, user, orgId: member.org_id as string, orgName };
}

function buildInvitationUrl(code: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${base}/invitation/${code}`;
}

export async function getMembers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .order("last_name", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getMember(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function getMemberStats() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("members")
    .select("id, role, status, is_bureau");

  if (error) throw error;

  const total = data.length;
  const actifs = data.filter((m) => m.status === "actif").length;
  const bureau = data.filter((m) => m.is_bureau).length;
  const invites = data.filter((m) => m.status === "invite").length;

  return { total, actifs, bureau, invites };
}

export async function createMember(formData: FormData) {
  const { supabase, orgId, orgName } = await getCurrentMemberOrg();

  const firstName = formData.get("first_name") as string;
  const memberEmail = (formData.get("email") as string) || null;
  const suffix = Math.floor(1000 + Math.random() * 9000);
  const invitationCode = `INV-${firstName.toUpperCase()}-${suffix}`;

  const { error } = await supabase.from("members").insert({
    org_id: orgId,
    first_name: firstName,
    last_name: formData.get("last_name") as string,
    email: memberEmail,
    phone: (formData.get("phone") as string) || null,
    role: (formData.get("role") as string) || "membre",
    grade: (formData.get("grade") as string) || null,
    centre: (formData.get("centre") as string) || null,
    invitation_code: invitationCode,
    status: "invite",
  });

  if (error) throw error;

  if (memberEmail) {
    const { subject, html } = buildInvitationEmail({
      firstName,
      orgName,
      invitationUrl: buildInvitationUrl(invitationCode),
    });
    await sendEmail({ to: memberEmail, subject, html });
  }

  revalidatePath("/bureau/membres");
  return { invitationCode };
}

export async function updateMember(id: string, formData: FormData) {
  const supabase = await createClient();

  const updates: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (value !== "") updates[key] = value;
  }

  const { error } = await supabase
    .from("members")
    .update(updates)
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/bureau/membres");
}

export async function deleteMember(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("members").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/bureau/membres");
}

export async function updateMemberRole(
  id: string,
  data: { role?: string; is_bureau?: boolean; bureau_role?: string | null }
) {
  const supabase = await createClient();

  const updates: Record<string, unknown> = {};
  if (data.role !== undefined) updates.role = data.role;
  if (data.is_bureau !== undefined) updates.is_bureau = data.is_bureau;
  if (data.bureau_role !== undefined) updates.bureau_role = data.bureau_role;

  const { error } = await supabase
    .from("members")
    .update(updates)
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/bureau/membres");
  revalidatePath(`/bureau/membres/${id}`);
}

export async function updateMemberStatus(id: string, status: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("members")
    .update({ status })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/bureau/membres");
  revalidatePath(`/bureau/membres/${id}`);
}

export async function inviteMember(email: string) {
  const { supabase, orgId, orgName } = await getCurrentMemberOrg();

  const { data: existing } = await supabase
    .from("members")
    .select("id")
    .eq("email", email)
    .eq("org_id", orgId)
    .maybeSingle();

  if (existing) {
    throw new Error("Un membre avec cet email existe déjà");
  }

  const suffix = Math.floor(1000 + Math.random() * 9000);
  const invitationCode = `INV-${suffix}`;

  const { error } = await supabase.from("members").insert({
    org_id: orgId,
    first_name: "",
    last_name: "",
    email,
    role: "membre",
    invitation_code: invitationCode,
    status: "invite",
  });

  if (error) throw error;

  const { subject, html } = buildInvitationEmail({
    firstName: "",
    orgName,
    invitationUrl: buildInvitationUrl(invitationCode),
  });
  await sendEmail({ to: email, subject, html });

  revalidatePath("/bureau/membres");
  return { invitationCode };
}

export async function getMemberCommissions(memberId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("commission_members")
    .select("*, commissions:commission_id(id, name, icon, color)")
    .eq("member_id", memberId);

  if (error) throw error;
  return data;
}
