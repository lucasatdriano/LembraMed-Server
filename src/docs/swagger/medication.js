/**
 * @swagger
 * tags:
 *   name: Medications
 *   description: Gerenciamento de medicamentos
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
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
 *         hourfirstdose:
 *           type: string
 *           format: time
 *           description: Hora da primeira dose do medicamento.
 *         hournextdose:
 *           type: string
 *           format: time
 *           description: Hora da próxima dose do medicamento.
 *         periodstart:
 *           type: string
 *           format: date
 *           description: Data de início do período de uso do medicamento.
 *         periodend:
 *           type: string
 *           format: date
 *           description: Data de término do período de uso do medicamento.
 *         status:
 *           type: boolean
 *           description: Status para saber se o remédio foi tomado
 *         createdat:
 *           type: string
 *           format: date
 *           description: Data de criação do medicamento.
 *         userid:
 *           type: string
 *           description: ID do usuário ao qual o medicamento pertence.
 *         doseintervalid:
 *           type: number
 *           description: ID do intervalo de dose associado ao medicamento.
 *         intervalinhours:
 *           type: number
 *           description: Intervalo de horas entre as doses.
 *       example:
 *         id: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 *         name: "Paracetamol"
 *         hourfirstdose: "08:00"
 *         hournextdose: "16:00"
 *         periodstart: "2025-10-01"
 *         periodend: "2025-10-10"
 *         status: false
 *         createdat: "2025-10-01"
 *         userid: "f45bb13c-55cc-4219-a457-0e12b2c3d477"
 *         doseintervalid: 1
 *         intervalinhours: 8
 */

/**
 * @swagger
 * /medications/{userid}:
 *   get:
 *     summary: Obtém todos os medicamentos de um usuário, filtrados por nome ou intervalo de dose.
 *     tags: [Medications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userid
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
 * /medications/{userid}/{medicationId}:
 *   get:
 *     summary: Obtém um único medicamento pelo ID.
 *     tags: [Medications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userid
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
 * /medications/{userid}:
 *   post:
 *     summary: Cria um novo medicamento.
 *     tags: [Medications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userid
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
 *               hourfirstdose:
 *                 type: string
 *                 format: time
 *               periodstart:
 *                 type: string
 *                 format: date
 *               periodend:
 *                 type: string
 *                 format: date
 *               intervalinhours:
 *                 type: number
 *             required:
 *               - name
 *               - hourfirstdose
 *               - periodstart
 *               - periodend
 *               - intervalinhours
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
 * /medications/{userid}/{medicationId}:
 *   put:
 *     summary: Atualiza um medicamento existente.
 *     tags: [Medications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userid
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
 *               hournextdose:
 *                 type: string
 *                 format: time
 *               periodstart:
 *                 type: string
 *                 format: date
 *               periodend:
 *                 type: string
 *                 format: date
 *               intervalinhours:
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
 * /medications/{userid}/{medicationId}/status:
 *   patch:
 *     summary: Marca o medicamento como tomado, registra o histórico e agenda o reset do status.
 *     tags: [Medications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userid
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
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Medicamento marcado como tomado com sucesso. Histórico registrado e reset programado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 nextReset:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Usuário não autenticado.
 *       404:
 *         description: Medicamento não encontrado.
 *       500:
 *         description: Erro ao marcar o medicamento como tomado.
 */

/**
 * @swagger
 * /medications/{userid}/{medicationId}:
 *   delete:
 *     summary: Deleta um medicamento.
 *     tags: [Medications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userid
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
