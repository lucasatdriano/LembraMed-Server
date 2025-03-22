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

        res.status(201).json(newUser);
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

        const userid = user.id;
        const accesstoken = jwt.sign({ id: userid, name: user.name }, secret, {
            expiresIn: '24h',
        });
        const refreshtoken = jwt.sign({ id: userid, name: user.name }, secret, {
            expiresIn: '30d',
        });

        user.refreshtoken = refreshtoken;
        await user.save();

        res.json({ id: userid, accesstoken, refreshtoken });
    } catch (error) {
        res.status(500).json({
            error: 'Erro ao fazer login.',
            details: error.message,
        });
    }
}

export async function getUserById(req, res) {
    const { userid } = req.params;

    try {
        const user = await models.User.findByPk(userid, {
            attributes: [
                'id',
                'name',
                'username',
                'password',
                'createdat',
                'refreshtoken',
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
    const { userid } = req.params;

    try {
        await models.User.update(
            { refreshtoken: null },
            { where: { id: userid } },
        );

        res.json({ message: 'Usuário deslogado com sucesso' });
    } catch (error) {
        res.status(500).json({
            error: 'Erro ao deslogar usuário.',
            details: error.message,
        });
    }
}
