"use server";

export async function verifySetupCode(code: string): Promise<boolean> {
  const setupPassword = process.env.SETUP_PASSWORD;
  if (!setupPassword) return false;
  return code === setupPassword;
}
