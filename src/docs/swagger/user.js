/**
 * @swagger
 * tags:
 *   name: User
 *   description: Gerenciamento de usuários
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
 *         refreshToken:
 *           type: string
 *           description: Token de refresh para autenticação.
 *       example:
 *         id: "12345"
 *         name: "João Silva"
 *         username: "joaosilva1"
 *         password: "senha123"
 *         refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *
 *     LoginRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Nome do usuário.
 *         password:
 *           type: string
 *           description: Senha do usuário.
 *       required:
 *         - name
 *         - password
 *
 *     LoginResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID do usuário.
 *         accessToken:
 *           type: string
 *           description: Token de acesso JWT.
 *         refreshToken:
 *           type: string
 *           description: Token de refresh JWT.
 *       example:
 *         id: "12345"
 *         accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 */

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Registra um novo usuário
 *     description: Cria um novo usuário com nome e senha.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *       500:
 *         description: Erro ao cadastrar usuário
 */

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Realiza login do usuário
 *     description: Autentica o usuário e retorna tokens JWT (accessToken e refreshToken).
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Usuário não encontrado ou senha incorreta
 *       500:
 *         description: Erro ao realizar login
 */

/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     summary: Obtém os detalhes de um usuário
 *     description: Retorna informações do usuário com base no ID fornecido.
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID do usuário
 *         schema:
 *           type: string
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
 * /users/{userId}/logout:
 *   post:
 *     summary: Realiza logout do usuário
 *     description: Remove o refreshToken do usuário, efetivando o logout.
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID do usuário
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuário deslogado com sucesso
 *       500:
 *         description: Erro ao deslogar usuário
 */
