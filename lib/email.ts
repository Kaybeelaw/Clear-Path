export async function sendPasswordResetEmail(to: string, token: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const base = process.env.NEXT_PUBLIC_APP_URL ?? `http://localhost:3000`;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set in the environment");
  }
  if (!from) {
    throw new Error("RESEND_FROM is not set in the environment (e.g. 'no-reply@example.com')");
  }

  const resetUrl = `${base}/login?token=${encodeURIComponent(token)}`;

  const html = `
    <p>We received a request to reset your password. Click the link below to set a new password. This link expires in 1 hour.</p>
    <p><a href="${resetUrl}">Reset your password</a></p>
    <p>If you did not request this, you can ignore this email.</p>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from,
      to,
      subject: "Reset your ClearPath password",
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to send reset email: ${res.status} ${body}`);
  }

  return true;
}
