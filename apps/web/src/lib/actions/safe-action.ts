"use server";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function safeAction<T>(
  fn: () => Promise<T>
): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Une erreur est survenue";
    console.error("[action error]", message);
    return { success: false, error: message };
  }
}
