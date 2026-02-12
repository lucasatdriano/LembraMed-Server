/**
 * @swagger
 * tags:
 *   name: User
 *   description: Gerenciamento de usuários e autenticação multi-conta
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único do usuário.
 *         name:
 *           type: string
 *           description: Nome do usuário.
 *         username:
 *           type: string
 *           description: Username único do usuário.
 *         password:
 *           type: string
 *           description: Senha do usuário.
 *         createdat:
 *           type: string
 *           format: date-time
 *           description: Data de criação do usuário.
 *       example:
 *         id: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 *         name: "João Silva"
 *         username: "joaosilva1"
 *         password: "senha123"
 *         createdat: "2024-01-15T10:30:00.000Z"
 *
 *     LoginMultiAccountRequest:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           description: Username do usuário.
 *         password:
 *           type: string
 *           description: Senha do usuário.
 *         deviceId:
 *           type: string
 *           format: uuid
 *           description: ID único do dispositivo.
 *         deviceName:
 *           type: string
 *           description: Nome amigável do dispositivo (opcional).
 *       required:
 *         - username
 *         - password
 *         - deviceId
 *
 *     LoginMultiAccountResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             name:
 *               type: string
 *             username:
 *               type: string
 *         tokens:
 *           type: object
 *           properties:
 *             accessToken:
 *               type: string
 *               description: Token de acesso JWT (1 hora de validade)
 *             refreshToken:
 *               type: string
 *               description: Token de refresh JWT (60 dias de validade)
 *         deviceId:
 *           type: string
 *           format: uuid
 *
 *     LogoutRequest:
 *       type: object
 *       properties:
 *         deviceId:
 *           type: string
 *           format: uuid
 *       required:
 *         - deviceId
 */

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Registra um novo usuário
 *     description: Cria um novo usuário com nome e senha, gerando um username único automaticamente.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - name
 *               - password
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       500:
 *         description: Erro ao cadastrar usuário
 */

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Realiza login multi-conta em um dispositivo
 *     description: Autentica o usuário em um dispositivo específico e retorna tokens JWT com sistema de refresh token rotation.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginMultiAccountRequest'
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginMultiAccountResponse'
 *       400:
 *         description: Campos obrigatórios não fornecidos
 *       401:
 *         description: Credenciais inválidas
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Obtém os detalhes do usuário autenticado
 *     description: Retorna informações do usuário autenticado com base no token JWT.
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Detalhes do usuário encontrados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Usuário não autenticado
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro ao buscar usuário
 */

/**
 * @swagger
 * /users/logout:
 *   post:
 *     summary: Realiza logout da conta do dispositivo
 *     description: Remove a conta autenticada do dispositivo, revogando todos os tokens associados.
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LogoutRequest'
 *     responses:
 *       200:
 *         description: Conta removida do dispositivo com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Conta removida do dispositivo"
 *       400:
 *         description: DeviceId é obrigatório
 *       500:
 *         description: Erro interno do servidor
 */
