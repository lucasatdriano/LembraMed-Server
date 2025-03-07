import jwt from 'jsonwebtoken';

export function authMiddleware(req, res, next) {
    const jwtToken = req.header('Authorization')?.replace('Bearer ', '');

    if (!jwtToken) {
        return res
            .status(401)
            .json({ erro: 'Token não encontrado ou inválido.' });
    }

    try {
        const decodedData = jwt.verify(jwtToken, process.env.JWT_SECRET);

        req.authenticatedUser = decodedData;
        next();
    } catch (error) {
        res.status(401).json({ erro: 'Token inválido.' });
    }
}
