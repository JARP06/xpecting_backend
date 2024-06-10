/**
 * Filename: 		email.js
 * Description:    
 * Developed By: 	Toni-Ann Neil
 * Date: 			2024-06-03
 */

import nodemailer from 'nodemailer';

export class Email {
  constructor(userEmail) {
    this.to = userEmail;
    this.from = `xpecting <reminder@xpecting.com>`;
  }

  createMailTransport() {
    if (process.env.NODE_ENV !== "production") {
      return nodemailer.createTransport({
        host: 'smtp.mailtrap.io',
        port: 2525,
        auth: {
          user: process.env.MAILTRAP_USER,
          pass: process.env.MAILTRAP_PASS,
        },
      });
    } else {
      return nodemailer.createTransport({
        host: "mail.somedomain.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    }
  }

  async sendMail(htmlContent, subject) {
    const transport = this.createMailTransport();

    try {
      const mailOptions = {
        to: this.to,
        from: this.from,
        subject: subject,
        html: htmlContent,
        text: htmlContent.replace(/<\/?[^>]+(>|$)/g, ""), // Convert HTML to plain text
      };

      const result = await transport.sendMail(mailOptions);
      return result;
    } catch (error) {
      console.error(`Error sending email: ${error.message}`);
      throw new Error(`Error sending email: ${error.message}`);
    }
  }
}
