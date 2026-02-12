/**
 * @swagger
 * tags:
 *   name: Contacts
 *   description: Gerenciamento de contatos
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Contact:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID do contato.
 *         name:
 *           type: string
 *           description: Nome do contato.
 *         numberphone:
 *           type: string
 *           description: Número de telefone do contato.
 *         userid:
 *           type: string
 *           description: ID do usuário ao qual o contato pertence.
 *       example:
 *         id: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 *         name: "João Silva"
 *         numberphone: "11987654321"
 *         userid: "f45bb13c-55cc-4219-a457-0e12b2c3d477"
 *
 *     ContactPagination:
 *       type: object
 *       properties:
 *         contacts:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Contact'
 *         pagination:
 *           type: object
 *           properties:
 *             currentPage:
 *               type: integer
 *             totalPages:
 *               type: integer
 *             totalRecords:
 *               type: integer
 *             hasNext:
 *               type: boolean
 *             hasPrev:
 *               type: boolean
 */

/**
 * @swagger
 * /contacts:
 *   get:
 *     summary: Obtém todos os contatos do usuário autenticado
 *     tags: [Contacts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Número de itens por página
 *     responses:
 *       200:
 *         description: Lista de contatos retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContactPagination'
 *       401:
 *         description: Usuário não autenticado.
 *       500:
 *         description: Erro ao buscar contatos.
 */

/**
 * @swagger
 * /contacts/search:
 *   get:
 *     summary: Busca contatos por nome ou número de telefone
 *     tags: [Contacts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Nome do contato ou número de telefone para filtrar os resultados.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Número de itens por página
 *     responses:
 *       200:
 *         description: Lista de contatos filtrada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContactPagination'
 *       401:
 *         description: Usuário não autenticado.
 *       404:
 *         description: Nenhum contato encontrado.
 *       500:
 *         description: Erro ao buscar contatos.
 */

/**
 * @swagger
 * /contacts/{contactid}:
 *   get:
 *     summary: Obtém um único contato pelo ID
 *     tags: [Contacts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contactid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do contato
 *     responses:
 *       200:
 *         description: Contato retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contact'
 *       401:
 *         description: Usuário não autenticado.
 *       404:
 *         description: Contato não encontrado
 *       500:
 *         description: Erro ao buscar o contato
 */

/**
 * @swagger
 * /contacts:
 *   post:
 *     summary: Cria um novo contato
 *     tags: [Contacts]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - numberphone
 *             properties:
 *               name:
 *                 type: string
 *               numberphone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Contato criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contact'
 *       400:
 *         description: Dados inválidos fornecidos
 *       401:
 *         description: Usuário não autenticado.
 *       500:
 *         description: Erro ao criar o contato
 */

/**
 * @swagger
 * /contacts/{contactid}:
 *   put:
 *     summary: Atualiza um contato existente
 *     tags: [Contacts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contactid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do contato
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               numberphone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contato atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contact'
 *       400:
 *         description: Dados inválidos fornecidos
 *       401:
 *         description: Usuário não autenticado.
 *       404:
 *         description: Contato não encontrado
 *       500:
 *         description: Erro ao atualizar o contato
 */

/**
 * @swagger
 * /contacts/{contactid}:
 *   delete:
 *     summary: Deleta um contato
 *     tags: [Contacts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contactid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do contato
 *     responses:
 *       200:
 *         description: Contato deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Usuário não autenticado.
 *       404:
 *         description: Contato não encontrado
 *       500:
 *         description: Erro ao deletar o contato
 */
