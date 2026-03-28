import nodemailer from 'nodemailer';

class EmailService {
    constructor() {
        this.transporter = null;
    }

    getTransporter() {
        if (!this.transporter) {
            this.transporter = nodemailer.createTransport({
                service: 'gmail',
                secure: false,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });
        }
        return this.transporter;
    }

    async sendPasswordResetEmail(to, resetURL) {
        const transporter = this.getTransporter();

        const mailOptions = {
            from: `"LembraMed" <${process.env.EMAIL_USER}>`,
            to,
            subject: 'Redefinição de Senha - LembraMed',
            html: `
                <h1>LembraMed</h1>
                <p>Para redefinir sua senha, clique no link abaixo:</p>
                <a href="${resetURL}">${resetURL}</a>
                <p>Se não foi você que solicitou, ignore este e-mail.</p>
            `,
            text: `Redefinir senha: ${resetURL}`,
        };

        await transporter.sendMail(mailOptions);
    }
}

export default new EmailService();
