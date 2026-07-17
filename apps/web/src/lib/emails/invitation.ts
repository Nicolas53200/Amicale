interface InvitationEmailParams {
  firstName: string;
  orgName: string;
  invitationUrl: string;
}

export function buildInvitationEmail({
  firstName,
  orgName,
  invitationUrl,
}: InvitationEmailParams): { subject: string; html: string } {
  const displayName = firstName || "Futur membre";

  return {
    subject: `${orgName} — Vous êtes invité(e) à rejoindre l'amicale`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#FF6B35,#e55a28);padding:32px 24px;text-align:center">
            <div style="font-size:36px;margin-bottom:8px">🔥</div>
            <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700">${orgName}</h1>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px 24px">
            <p style="margin:0 0 16px;color:#18181b;font-size:16px;font-weight:600">
              Bonjour ${displayName},
            </p>
            <p style="margin:0 0 24px;color:#52525b;font-size:14px;line-height:1.6">
              Vous avez été invité(e) à rejoindre l'amicale <strong>${orgName}</strong>.
              Cliquez sur le bouton ci-dessous pour créer votre compte et compléter votre profil.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="${invitationUrl}"
                   style="display:inline-block;background:#FF6B35;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 32px;border-radius:10px">
                  Rejoindre l'amicale
                </a>
              </td></tr>
            </table>
            <p style="margin:24px 0 0;color:#a1a1aa;font-size:12px;line-height:1.5;word-break:break-all">
              Ou copiez ce lien : ${invitationUrl}
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:16px 24px;border-top:1px solid #f4f4f5;text-align:center">
            <p style="margin:0;color:#a1a1aa;font-size:11px">
              Cet email a été envoyé automatiquement. Si vous n'êtes pas concerné(e), ignorez ce message.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  };
}
