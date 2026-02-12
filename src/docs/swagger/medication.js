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
 *           format: date-time
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
 *         createdat: "2025-10-01T10:00:00.000Z"
 *         userid: "f45bb13c-55cc-4219-a457-0e12b2c3d477"
 *         doseintervalid: 1
 *         intervalinhours: 8
 *
 *     CreateMedicationRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         hourfirstdose:
 *           type: string
 *           format: time
 *         periodstart:
 *           type: string
 *           format: date
 *         periodend:
 *           type: string
 *           format: date
 *         intervalinhours:
 *           type: number
 *       required:
 *         - name
 *         - hourfirstdose
 *         - periodstart
 *         - periodend
 *         - intervalinhours
 *
 *     UpdateMedicationRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         hournextdose:
 *           type: string
 *           format: time
 *         periodstart:
 *           type: string
 *           format: date
 *         periodend:
 *           type: string
 *           format: date
 *         intervalinhours:
 *           type: number
 *         status:
 *           type: boolean
 *
 *     MedicationResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         medication:
 *           $ref: '#/components/schemas/Medication'
 *
 *     MedicationsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         medications:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Medication'
 *
 *     MedicationPagination:
 *       type: object
 *       properties:
 *         medications:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Medication'
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
 * /medications:
 *   get:
 *     summary: Obtém todos os medicamentos do usuário autenticado
 *     tags: [Medications]
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
 *         description: Medicamentos encontrados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MedicationPagination'
 *       500:
 *         description: Erro ao buscar medicamentos
 */

/**
 * @swagger
 * /medications/search:
 *   get:
 *     summary: Busca medicamentos por nome ou intervalo
 *     tags: [Medications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Nome do medicamento ou intervalo de horas para filtrar
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
 *         description: Medicamentos encontrados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MedicationPagination'
 *       404:
 *         description: Nenhum medicamento encontrado
 *       500:
 *         description: Erro ao buscar medicamentos
 */

/**
 * @swagger
 * /medications/{medicationid}:
 *   get:
 *     summary: Obtém um medicamento específico pelo ID
 *     tags: [Medications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: medicationid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do medicamento
 *     responses:
 *       200:
 *         description: Medicamento encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MedicationResponse'
 *       404:
 *         description: Medicamento não encontrado
 *       500:
 *         description: Erro ao buscar medicamento
 */

/**
 * @swagger
 * /medications/{medicationid}/history:
 *   get:
 *     summary: Obtém o histórico de doses de um medicamento
 *     tags: [Medications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: medicationid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do medicamento
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de início para filtrar o histórico
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de término para filtrar o histórico
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [taken, missed, all]
 *         description: Status das doses (tomadas, não tomadas ou todas)
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
 *         description: Histórico retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 history:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       medicationid:
 *                         type: string
 *                       takendate:
 *                         type: string
 *                         format: date-time
 *                       taken:
 *                         type: boolean
 *                       createdat:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalRecords:
 *                       type: integer
 *                     hasNext:
 *                       type: boolean
 *                     hasPrev:
 *                       type: boolean
 *       404:
 *         description: Medicamento não encontrado
 *       500:
 *         description: Erro ao buscar histórico
 */

/**
 * @swagger
 * /medications:
 *   post:
 *     summary: Cria um novo medicamento
 *     tags: [Medications]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMedicationRequest'
 *     responses:
 *       201:
 *         description: Medicamento criado com sucesso
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
 *                   example: "Medicamento criado com sucesso"
 *                 medication:
 *                   $ref: '#/components/schemas/Medication'
 *       500:
 *         description: Erro ao criar medicamento
 */

/**
 * @swagger
 * /medications/{medicationid}/taken:
 *   post:
 *     summary: Marca um medicamento como tomado
 *     tags: [Medications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: medicationid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do medicamento
 *     responses:
 *       200:
 *         description: Medicamento marcado como tomado com sucesso
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
 *                   example: "Medicamento marcado como tomado"
 *                 medication:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     status:
 *                       type: boolean
 *                     hournextdose:
 *                       type: string
 *                     nextDose:
 *                       type: string
 *       404:
 *         description: Medicamento não encontrado
 *       500:
 *         description: Erro ao marcar como tomado
 */

/**
 * @swagger
 * /medications/{medicationid}/missed:
 *   post:
 *     summary: Registra uma dose não tomada
 *     tags: [Medications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: medicationid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do medicamento
 *     responses:
 *       200:
 *         description: Dose não tomada registrada com sucesso
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
 *                   example: "Dose não tomada registrada no histórico"
 *       404:
 *         description: Medicamento não encontrado
 *       500:
 *         description: Erro ao registrar dose não tomada
 */

/**
 * @swagger
 * /medications/{medicationid}:
 *   put:
 *     summary: Atualiza um medicamento existente
 *     tags: [Medications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: medicationid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do medicamento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMedicationRequest'
 *     responses:
 *       200:
 *         description: Medicamento atualizado com sucesso
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
 *                   example: "Medicamento atualizado com sucesso"
 *                 medication:
 *                   $ref: '#/components/schemas/Medication'
 *       404:
 *         description: Medicamento não encontrado
 *       500:
 *         description: Erro ao atualizar medicamento
 */

/**
 * @swagger
 * /medications/{medicationid}:
 *   delete:
 *     summary: Deleta um medicamento
 *     tags: [Medications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: medicationid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do medicamento
 *     responses:
 *       200:
 *         description: Medicamento deletado com sucesso
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
 *                   example: "Medicamento Paracetamol deletado com sucesso."
 *       404:
 *         description: Medicamento não encontrado
 *       500:
 *         description: Erro ao deletar medicamento
 */
