import "server-only";

type MailInput = { to: string; subject: string; text: string };

const FROM = process.env.MAIL_FROM || "Contromano <noreply@contromano.it>";

export function mailerConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendMail({ to, subject, text }: MailInput): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    // No provider configured: log so the operator can act (dev convenience).
    console.info(`[mail:not-configured] to=${to} subject="${subject}"\n${text}`);
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to,
        subject,
        text,
      }),
    });
    return res.ok;
  } catch {
    console.error("[mail:error] send failed");
    return false;
  }
}
