import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { models } from '../models/index.js';
import { TokenService } from './token.service.js';

export class AuthService {
    static async sendPasswordResetEmail(email) {
        const user = await models.User.findOne({ where: { email } });

        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        const token = this.generateResetToken(user);
        const resetURL = this.buildResetUrl(token);

        await this.sendEmail(email, resetURL);

        return { message: 'E-mail enviado com sucesso' };
    }

    static generateResetToken(user) {
        return jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
        );
    }

    static buildResetUrl(token) {
        return process.env.NODE_ENV === 'production'
            ? `https://lembraMed.vercel.app/resetPassword/${token}`
            : `http://localhost:3000/resetPassword/${token}`;
    }

    static async sendEmail(to, resetURL) {
        // const transporter = nodemailer.createTransport({
        //     service: 'gmail',
        //     auth: {
        //         user: process.env.EMAIL_USER,
        //         pass: process.env.EMAIL_PASS,
        //     },
        // });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject: 'Redefinição de Senha',
            html: `<h1>LembraMed</h1>
            <p>Para redefinir sua senha, clique no link abaixo:</p>
            <a href="${resetURL}">${resetURL}</a>
            <p>Se não foi você que solicitou a recuperação de senha, ignore este e-mail.</p>`,
        };

        await transporter.sendMail(mailOptions);
    }

    static async resetPassword(token, newPassword) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await models.User.findByPk(decoded.id);

        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        await TokenService.revokeAllUserTokens(user.id);

        return { message: 'Senha redefinida com sucesso!' };
    }
}
