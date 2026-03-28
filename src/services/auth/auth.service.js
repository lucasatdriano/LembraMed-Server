import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserRepository } from '../../repositories/user.repository.js';
import { TokenService } from './token.service.js';
import { AppError } from '../../utils/errors/app.error.js';
import emailService from './email.service.js';

export class AuthService {
    static async sendPasswordResetEmail(email) {
        const user = await UserRepository.findByEmail(email);

        if (!user) {
            throw new AppError('Usuário não encontrado', 404);
        }

        const token = this.generateResetToken(user);
        const resetURL = `${process.env.FRONTEND_URL}/resetPassword/${token}`;

        await this.sendEmail(email, resetURL);

        return {
            message: 'E-mail enviado com sucesso',
        };
    }

    static generateResetToken(user) {
        return jwt.sign(
            {
                id: user.id,
                email: user.email,
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
        );
    }

    static async sendEmail(to, resetURL) {
        await emailService.sendPasswordResetEmail(to, resetURL);
    }

    static async resetPassword(token, newPassword) {
        let decoded;

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            throw new AppError('Token inválido ou expirado', 401, error);
        }

        const user = await UserRepository.findById(decoded.id);

        if (!user) {
            throw new AppError('Usuário não encontrado', 404);
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;

        await user.save();

        await TokenService.revokeAllUserTokens(user.id);

        return {
            message: 'Senha redefinida com sucesso!',
        };
    }
}
