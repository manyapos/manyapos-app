import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
  await resend.emails.send({
    from: process.env.RESEND_FROM || "Manya POS <noreply@manyapos.com>",
    to,
    subject: "Reset Password - Manya POS",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#0d9488">Reset Password</h2>
        <p>Halo ${name},</p>
        <p>Kami menerima permintaan reset password untuk akun Anda.</p>
        <p>Klik tombol di bawah untuk membuat password baru. Link ini berlaku selama <strong>1 jam</strong>.</p>
        <a href="${resetUrl}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#0d9488;color:#fff;border-radius:6px;text-decoration:none;font-weight:600">
          Reset Password
        </a>
        <p style="color:#6b7280;font-size:14px">Jika Anda tidak meminta reset password, abaikan email ini.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
        <p style="color:#9ca3af;font-size:12px">Manya POS &mdash; Sistem Kasir</p>
      </div>
    `,
  })
}
