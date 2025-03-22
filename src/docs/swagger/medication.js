/**
 * @swagger
 * tags:
 *   name: Medications
 *   description: Gerenciamento de medicamentos
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Medication:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID do medicamento.
 *         name:
 *           type: string
 *           description: Nome do medicamento.
 *         hourFirstDose:
 *           type: string
 *           format: time
 *           description: Hora da primeira dose do medicamento.
 *         periodStart:
 *           type: string
 *           format: date
 *           description: Data de início do período de uso do medicamento.
 *         periodEnd:
 *           type: string
 *           format: date
 *           description: Data de término do período de uso do medicamento.
 *         userId:
 *           type: string
 *           description: ID do usuário ao qual o medicamento pertence.
 *         doseIntervalId:
 *           type: number
 *           description: ID do intervalo de dose associado ao medicamento.
 *         intervalInHours:
 *           type: number
 *           description: Intervalo de horas entre as doses.
 *       example:
 *         id: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 *         name: "Paracetamol"
 *         hourFirstDose: "08:00"
 *         periodStart: "2023-10-01"
 *         periodEnd: "2023-10-10"
 *         userId: "f45bb13c-55cc-4219-a457-0e12b2c3d477"
 *         doseIntervalId: 1
 *         intervalInHours: 8
 */

/**
 * @swagger
 * /medications/{userId}:
 *   get:
 *     summary: Obtém todos os medicamentos de um usuário, filtrados por nome ou intervalo de dose.
 *     tags: [Medications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário.
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Nome do medicamento ou intervalo de dose (em horas) para filtrar os resultados. Pode ser utilizado para buscar pelo nome do medicamento ou pelo intervalo de dose, se um número for fornecido.
 *     responses:
 *       200:
 *         description: Lista de medicamentos retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Medication'
 *       401:
 *         description: Usuário não autenticado.
 *       404:
 *         description: Medicamento não encontrado.
 *       500:
 *         description: Erro ao buscar medicamentos.
 */

/**
 * @swagger
 * /medications/{userId}/{medicationId}:
 *   get:
 *     summary: Obtém um único medicamento pelo ID.
 *     tags: [Medications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário.
 *       - in: path
 *         name: medicationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do medicamento.
 *     responses:
 *       200:
 *         description: Medicamento retornado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Medication'
 *       401:
 *         description: Usuário não autenticado.
 *       404:
 *         description: Medicamento não encontrado.
 *       500:
 *         description: Erro ao buscar o medicamento.
 */

/**
 * @swagger
 * /medications/{userId}:
 *   post:
 *     summary: Cria um novo medicamento.
 *     tags: [Medications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               hourFirstDose:
 *                 type: string
 *                 format: time
 *               periodStart:
 *                 type: string
 *                 format: date
 *               periodEnd:
 *                 type: string
 *                 format: date
 *               intervalInHours:
 *                 type: number
 *             required:
 *               - name
 *               - hourFirstDose
 *               - periodStart
 *               - periodEnd
 *               - intervalInHours
 *     responses:
 *       201:
 *         description: Medicamento criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Medication'
 *       401:
 *         description: Usuário não autenticado.
 *       500:
 *         description: Erro ao criar o medicamento.
 */

/**
 * @swagger
 * /medications/{userId}/{medicationId}:
 *   put:
 *     summary: Atualiza um medicamento existente.
 *     tags: [Medications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário.
 *       - in: path
 *         name: medicationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do medicamento.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               hourNextDose:
 *                 type: string
 *                 format: time
 *               periodStart:
 *                 type: string
 *                 format: date
 *               periodEnd:
 *                 type: string
 *                 format: date
 *               intervalInHours:
 *                 type: number
 *     responses:
 *       200:
 *         description: Medicamento atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Medication'
 *       401:
 *         description: Usuário não autenticado.
 *       404:
 *         description: Medicamento não encontrado.
 *       500:
 *         description: Erro ao atualizar o medicamento.
 */

/**
 * @swagger
 * /medications/{userId}/{medicationId}:
 *   delete:
 *     summary: Deleta um medicamento.
 *     tags: [Medications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário.
 *       - in: path
 *         name: medicationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do medicamento.
 *     responses:
 *       200:
 *         description: Medicamento deletado com sucesso.
 *       401:
 *         description: Usuário não autenticado.
 *       404:
 *         description: Medicamento não encontrado.
 *       500:
 *         description: Erro ao deletar o medicamento.
 */
