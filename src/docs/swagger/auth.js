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
 *     RefreshTokenRequest:
 *       type: object
 *       properties:
 *         refreshToken:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         deviceId:
 *           type: string
 *           format: uuid
 *           example: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 *       required:
 *         - refreshToken
 *         - deviceId
 *
 *     RefreshTokenResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         accessToken:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         refreshToken:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 */

/**
 * @swagger
 * /auth/forgotpassword:
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
 * /auth/resetpassword:
 *   put:
 *     summary: Redefinir senha
 *     description: Permite ao usuário redefinir sua senha usando um token válido. Revoga todos os tokens existentes do usuário por segurança.
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
 * /auth/token-status:
 *   get:
 *     summary: Verifica o status de um refresh token
 *     description: Verifica se um refresh token é válido e ainda não expirou.
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: refreshToken
 *         required: true
 *         schema:
 *           type: string
 *         description: O refresh token a ser verificado
 *       - in: query
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: O ID do dispositivo associado ao token
 *     responses:
 *       200:
 *         description: Status do token verificado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenStatusResponse'
 *       400:
 *         description: Parâmetros necessários não fornecidos
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /auth/refreshtoken:
 *   post:
 *     summary: Atualiza os tokens de acesso usando refresh token (Token Rotation)
 *     description: Gera um novo access token E um novo refresh token usando o refresh token fornecido. O refresh token antigo é revogado automaticamente.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       200:
 *         description: Tokens atualizados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RefreshTokenResponse'
 *       400:
 *         description: Refresh token ou deviceId não fornecidos
 *       401:
 *         description: Refresh token inválido ou expirado
 *       500:
 *         description: Erro interno do servidor
 */
