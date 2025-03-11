/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Gerenciamento de autenticação e recuperação de senha.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Email:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: usuario@example.com
 *       required:
 *         - email
 *
 *     Token:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       required:
 *         - token
 *
 *     Password:
 *       type: object
 *       properties:
 *         newPassword:
 *           type: string
 *           format: password
 *           example: "NovaSenha123!"
 *       required:
 *         - newPassword
 *
 *     RefreshToken:
 *       type: object
 *       properties:
 *         refreshToken:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       required:
 *         - refreshToken
 */

/**
 * @swagger
 * /auth/forgotPassword:
 *   post:
 *     summary: Solicitar redefinição de senha
 *     description: Envia um e-mail com um link para redefinir a senha do usuário.
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Email'
 *     responses:
 *       200:
 *         description: E-mail enviado com sucesso
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro ao enviar e-mail
 */

/**
 * @swagger
 * /auth/resetPassword:
 *   put:
 *     summary: Redefinir senha
 *     description: Permite ao usuário redefinir sua senha usando um token válido.
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 $ref: '#/components/schemas/Token/properties/token'
 *               newPassword:
 *                 $ref: '#/components/schemas/Password/properties/newPassword'
 *             required:
 *               - token
 *               - newPassword
 *     responses:
 *       200:
 *         description: Senha redefinida com sucesso
 *       400:
 *         description: Token não fornecido
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro ao redefinir senha
 */

/**
 * @swagger
 * /auth/refreshToken:
 *   post:
 *     summary: Atualiza o accessToken usando um refreshToken válido
 *     description: Gera um novo accessToken usando o refreshToken fornecido.
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshToken'
 *     responses:
 *       200:
 *         description: Novo accessToken gerado com sucesso
 *       401:
 *         description: Refresh token não fornecido ou inválido
 *       403:
 *         description: Refresh token não encontrado no banco de dados
 *       500:
 *         description: Erro ao gerar novo token
 */
