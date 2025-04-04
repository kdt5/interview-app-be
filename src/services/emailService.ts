import { createTransport, Transporter } from "nodemailer";
import { AuthError } from "../constants/errors/authError.js";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail({ to, subject, html }: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject,
        html,
      });
    } catch (error) {
      console.error("이메일 전송 실패:", error);
      throw new AuthError("EMAIL_SEND_FAILED");
    }
  }

  async sendPasswordResetEmail(
    email: string,
    resetLink: string
  ): Promise<void> {
    const subject = "🔒 인터뷰잇 비밀번호 재설정 안내";
    const html = `
      <h1>비밀번호 재설정</h1>
      <p>안녕하세요, 인터뷰잇 팀입니다.</p>
      <p>비밀번호 재설정을 요청하셨습니다. 아래 링크를 클릭하여 비밀번호를 재설정하세요.</p>
      <p><a href="${resetLink}">비밀번호 재설정하기</a></p>
      <p>이 링크는 1시간 동안만 유효합니다.</p>
      <p>만약 비밀번호 재설정을 요청하지 않으셨다면, 이 이메일을 무시하셔도 됩니다.</p>
      <br>
      <p>감사합니다.</p>
      <p>인터뷰잇 팀 드림</p>
    `;

    await this.sendEmail({ to: email, subject, html });
  }
}

export const emailService = new EmailService();
