import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { models } from '../models/index.js';
import { TokenService } from '../services/tokenService.js';

export async function refreshMultiAccountToken(req, res) {
    try {
        const { refreshToken, deviceId } = req.body;

        if (!refreshToken || !deviceId) {
            return res.status(400).json({
                error: 'Refresh token e deviceId são obrigatórios',
            });
        }

        const {
            accessToken,
            refreshToken: newRefreshToken,
            userId,
        } = await TokenService.refreshTokens(refreshToken, deviceId);

        await models.AccountDevice.update(
            {
                accesstoken: accessToken,
                lastused: new Date(),
            },
            {
                where: {
                    userid: userId,
                    deviceid: deviceId,
                },
            },
        );

        res.json({
            success: true,
            accessToken,
            refreshToken: newRefreshToken,
        });
    } catch (error) {
        console.error('Erro no refresh token multi-conta:', error);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Token inválido' });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expirado' });
        }

        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

export async function tokenStatus(req, res) {
    try {
        const { refreshToken, deviceId } = req.query;

        if (!refreshToken || !deviceId) {
            return res.status(400).json({
                error: 'Parâmetros necessários: refreshToken e deviceId',
            });
        }

        const isValid = await TokenService.isValidRefreshToken(
            refreshToken,
            deviceId,
        );

        res.json({
            isValid,
            message: isValid ? 'Token válido' : 'Token inválido ou expirado',
        });
    } catch (error) {
        console.error('Erro ao verificar token:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

export async function forgotPassword(req, res) {
    const { email } = req.body;

    try {
        const user = await models.User.findOne({ where: { email: email } });

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
        );

        const resetURL =
            process.env.NODE_ENV === 'production'
                ? `https://lembraMed.vercel.app/resetPassword/${token}`
                : `http://localhost:3000/resetPassword/${token}`;

        // const transporter = nodemailer.createTransport({
        //     service: 'gmail',
        //     auth: {
        //         user: process.env.EMAIL_USER,
        //         pass: process.env.EMAIL_PASS,
        //     },
        // });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Redefinição de Senha',
            html: `<h1>LembraMed</h1>
            <p>Para redefinir sua senha, clique no link abaixo:</p>
            <a href="${resetURL}">${resetURL}</a>
            <p>Se não foi você que solicitou a recuperação de senha, ignore este e-mail.</p>`,
        };

        await transporter.sendMail(mailOptions);

        res.json({ message: 'E-mail enviado com sucesso' });
    } catch (error) {
        res.status(500).json({
            error: 'Erro ao enviar e-mail',
            details: error.message,
        });
    }
}

export async function resetPassword(req, res) {
    const { token, newPassword } = req.body;

    if (!token) {
        return res.status(400).json({ message: 'Token não fornecido.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await models.User.findByPk(decoded.id);

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        await TokenService.revokeAllUserTokens(user.id);

        res.json({ message: 'Senha redefinida com sucesso!' });
    } catch (error) {
        res.status(500).json({
            error: 'Erro ao redefinir senha',
            details: error.message,
        });
    }
}
