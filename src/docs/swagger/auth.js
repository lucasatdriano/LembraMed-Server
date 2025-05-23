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
 *         refreshtoken:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       required:
 *         - refreshtoken
 */

/**
 * @swagger
 * /auth/forgotPassword:
 *   post:
 *     summary: Solicitar redefinição de senha
 *     description: Envia um e-mail com um link para redefinir a senha do usuário.
 *     tags: [Auth]
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
 * /auth/refreshtoken:
 *   post:
 *     summary: Atualiza o accesstoken usando um refreshtoken válido
 *     description: Gera um novo accesstoken usando o refreshtoken fornecido.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshToken'
 *     responses:
 *       200:
 *         description: Novo accesstoken gerado com sucesso
 *       401:
 *         description: Refresh token não fornecido ou inválido
 *       403:
 *         description: Refresh token não encontrado no banco de dados
 *       500:
 *         description: Erro ao gerar novo token
 */
