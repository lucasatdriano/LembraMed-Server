import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { models } from '../models/index.js';
import { generateUniqueUsername } from '../utils/generateUsername.js';

export async function register(req, res) {
    const { name, password } = req.body;

    try {
        const username = await generateUniqueUsername(name);

        const newUser = await models.User.create({
            id: uuidv4(),
            name,
            username: username,
            password,
        });

        res.status(201).json(newUser.toJson());
    } catch (error) {
        res.status(500).json({
            error: 'Erro ao cadastrar usuário.',
            details: error.message,
        });
    }
}

export async function login(req, res) {
    const { name, password } = req.body;

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error('JWT_SECRET não definido');

        const users = await models.User.findAll({ where: { name } });

        if (users.length === 0) {
            return res.status(401).json({ error: 'Usuário não encontrado!' });
        }

        const user = users.find((user) => user.password === password);

        if (!user) {
            return res.status(401).json({ error: 'Senha incorreta!' });
        }

        const userId = user.id;
        const accessToken = jwt.sign({ id: userId, name: user.name }, secret, {
            expiresIn: '1h',
        });
        const refreshToken = jwt.sign({ id: userId, name: user.name }, secret, {
            expiresIn: '30d',
        });

        user.refreshToken = refreshToken;
        await user.save();

        res.json({ id: userId, accessToken, refreshToken });
    } catch (error) {
        res.status(500).json({
            error: 'Erro ao fazer login.',
            details: error.message,
        });
    }
}

export async function getUserById(req, res) {
    const { userId } = req.params;

    try {
        const user = await models.User.findByPk(userId, {
            attributes: [
                'id',
                'name',
                'username',
                'password',
                'createdAt',
                'refreshToken',
            ],
        });

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar usuário.' });
    }
}

export async function logoutUser(req, res) {
    const { userId } = req.params;

    try {
        await models.User.update(
            { refreshToken: null },
            { where: { id: userId } },
        );

        res.json({ message: 'Usuário deslogado com sucesso' });
    } catch (error) {
        res.status(500).json({
            error: 'Erro ao deslogar usuário.',
            details: error.message,
        });
    }
}
