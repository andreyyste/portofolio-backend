import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export interface ContactDto {
  name: string;
  email: string;
  message: string;
}

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && port && user && pass) {
      this.logger.log('Initializing Nodemailer SMTP transporter...');
      this.transporter = nodemailer.createTransport({
        host,
        port: parseInt(port, 10),
        secure: parseInt(port, 10) === 465, // true for port 465, false for other ports
        auth: {
          user,
          pass,
        },
      });
    } else {
      this.logger.warn(
        'SMTP credentials not fully configured in env vars. Contact form will run in MOCK mode.',
      );
    }
  }

  async sendContactMessage(dto: ContactDto): Promise<{ success: boolean; message: string }> {
    const { name, email, message } = dto;
    const receiver = process.env.SMTP_RECEIVER || process.env.SMTP_USER || 'admin@neo-gruv.com';

    const mailOptions = {
      from: `"${name}" <${email}>`, // or use SMTP_USER if the SMTP provider overrides the envelope from
      to: receiver,
      replyTo: email,
      subject: `New Portfolio Message from ${name}`,
      text: `You have received a new message from your portfolio contact form.

Name: ${name}
Email: ${email}
Message:
----------------------------------------
${message}
----------------------------------------`,
      html: `
        <h3>New Portfolio Message</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <div style="border-left: 3px solid #ccc; padding-left: 10px; margin-left: 10px; white-space: pre-wrap;">
          ${message}
        </div>
      `,
    };

    if (this.transporter) {
      try {
        this.logger.log(`Sending email to ${receiver}...`);
        await this.transporter.sendMail(mailOptions);
        this.logger.log(`Email successfully sent to ${receiver}`);
        return { success: true, message: 'Message sent successfully.' };
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        this.logger.error(`Failed to send email via SMTP: ${errorMsg}`, err instanceof Error ? err.stack : undefined);
        throw new InternalServerErrorException('Failed to send email. Please try again later.');
      }
    } else {
      // Mock mode
      this.logger.log(`[MOCK EMAIL] to: ${receiver}`);
      this.logger.log(`[MOCK EMAIL] from: ${email}`);
      this.logger.log(`[MOCK EMAIL] subject: ${mailOptions.subject}`);
      this.logger.log(`[MOCK EMAIL] text:\n${mailOptions.text}`);
      return { success: true, message: 'Message simulated successfully (mock mode).' };
    }
  }
}
