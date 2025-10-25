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
 *         userid:
 *           type: string
 *           format: uuid
 *         deviceId:
 *           type: string
 *           format: uuid
 *       required:
 *         - userid
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
 * /users/{userid}:
 *   get:
 *     summary: Obtém os detalhes de um usuário
 *     description: Retorna informações do usuário com base no ID fornecido.
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userid
 *         required: true
 *         description: ID do usuário
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Detalhes do usuário encontrados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro ao buscar usuário
 */

/**
 * @swagger
 * /users/logout:
 *   post:
 *     summary: Realiza logout de uma conta específica do dispositivo
 *     description: Remove uma conta específica do dispositivo, revogando todos os tokens associados a essa conta no dispositivo.
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
 *         description: UserID e deviceId são obrigatórios
 *       500:
 *         description: Erro interno do servidor
 */
