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
 *         numberPhone:
 *           type: string
 *           description: Número de telefone do contato.
 *         userId:
 *           type: string
 *           description: ID do usuário ao qual o contato pertence.
 *       example:
 *         id: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 *         name: "João Silva"
 *         numberPhone: "11987654321"
 *         userId: "f45bb13c-55cc-4219-a457-0e12b2c3d477"
 */

/**
 * @swagger
 * /contacts/{userId}:
 *   get:
 *     summary: Obtém contatos de um usuário, filtrados por nome ou número de telefone.
 *     tags: [Contacts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Nome do contato para filtrar os resultados (opcional).
 *       - in: query
 *         name: numberPhone
 *         schema:
 *           type: string
 *         description: Número de telefone do contato para filtrar os resultados (opcional).
 *     responses:
 *       200:
 *         description: Lista de contatos retornada com sucesso
 *       401:
 *         description: Usuário não autenticado
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro ao criar o contato
 */

/**
 * @swagger
 * /contacts/{userId}/{contactId}:
 *   get:
 *     summary: Obtém um único contato pelo ID
 *     tags: [Contacts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do contato
 *     responses:
 *       200:
 *         description: Contato retornado com sucesso
 *       401:
 *         description: Usuário não autenticado.
 *       404:
 *         description: Contato não encontrado
 *       500:
 *         description: Erro ao buscar o contato
 */

/**
 * @swagger
 * /contacts/{userId}:
 *   post:
 *     summary: Cria um novo contato
 *     tags: [Contacts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               numberPhone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Contato criado com sucesso
 *       401:
 *         description: Usuário não autenticado.
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro ao criar o contato
 */

/**
 * @swagger
 * /contacts/{userId}/{contactId}:
 *   put:
 *     summary: Atualiza um contato existente
 *     tags: [Contacts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *       - in: path
 *         name: contactId
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
 *               numberPhone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contato atualizado com sucesso
 *       401:
 *         description: Usuário não autenticado.
 *       404:
 *         description: Contato não encontrado
 *       500:
 *         description: Erro ao atualizar o contato
 */

/**
 * @swagger
 * /contacts/{userId}/{contactId}:
 *   delete:
 *     summary: Deleta um contato
 *     tags: [Contacts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do contato
 *     responses:
 *       200:
 *         description: Contato deletado com sucesso
 *       401:
 *         description: Usuário não autenticado.
 *       404:
 *         description: Contato não encontrado
 *       500:
 *         description: Erro ao deletar o contato
 */
